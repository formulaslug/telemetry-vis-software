import asyncio
import io
from typing import AsyncIterator
import websockets.asyncio.server as ws
from websockets.exceptions import ConnectionClosed, ConnectionClosedOK
from websockets.asyncio.connection import Connection
import pyarrow as pa
from util.async_ipc_message_reader import AsyncMessageReader

# websockets.Connection already defines an __aiter__() method, but the problem
# is that it calls self.recv() with no `decode` param, causing the returned
# iterator to supply Data() instances rather than bytes instances. So this is
# mostly for typechecking purposes, since at runtime Data should just bytes for
# our usecase anyways.
async def ws_connection_aiter_bytes(self: Connection) -> AsyncIterator[bytes]:
    try:
        while True:
            yield await self.recv(decode=False)
    except ConnectionClosedOK:
        return


# List of WebSocket connections with their corresponding Arrow Stream (IPC)
# Writers and BytesIO buffers
connections: list[
    tuple[ws.ServerConnection, pa.RecordBatchStreamWriter | None, io.BytesIO]
] = []


# TODO: use IDs and not indexes (race condition here I think)
async def finish_client_ipc_stream(idx: int):
    if idx < len(connections):
        ws_connection, rb_writer, buffer = connections[idx]
        if rb_writer:
            rb_writer.close()

            ipc_data = buffer.getvalue()
            await ws_connection.send(ipc_data)
            buffer.seek(0)
            buffer.truncate()

            connections[idx] = (ws_connection, None, buffer)


async def close_all_clients(code: int, reason: str):
    for idx in reversed(range(len(connections))):
        ws_connection, _, _ = connections[idx]

        await ws_connection.close(code, reason)
        del connections[idx]


async def send_batch_to_clients(batch: pa.RecordBatch):
    disconnected_idxs = []
    for idx, (ws_connection, rb_writer, buffer) in enumerate(connections):
        try:
            if rb_writer is None:
                rb_writer = pa.RecordBatchStreamWriter(buffer, batch.schema)
                connections[idx] = (ws_connection, rb_writer, buffer)

            rb_writer.write_batch(batch)

            ipc_data = buffer.getvalue()
            await ws_connection.send(ipc_data)

            # Reset client connection's output buffer
            buffer.seek(0)
            buffer.truncate()
        except ConnectionClosed as e:
            print("ConnectionClosed while writing:", e)
            disconnected_idxs.append(idx)
    # Remove any disconnected websockets (whether ClosedOK or ClosedError)
    for idx in reversed(sorted(disconnected_idxs)):
        if idx < len(connections):
            connections.pop(idx)


# "client_connection" as in the connection that wants to receive data from us
async def client_connection_handler(conn: ws.ServerConnection):
    # The client connection gets its own personalized RecordBatchStreamWriter
    # (which is None for now) and io byte buffer
    buffer = io.BytesIO()
    rb_writer = None

    connections.append((conn, rb_writer, buffer))
    print(f"Client connected! Current connections: {len(connections)}")

    await conn.wait_closed()

    if (conn, rb_writer, buffer) in connections:
        idx = connections.index((conn, rb_writer, buffer))
        connections.pop(idx)
    print(f"Client disconnected. Remaining connections: {len(connections)}")


# "server_connection" as in the most literal sense of the word: the connection
# that is "serving" us data (this python process is by definition also a server,
# but more of a middle-man)
has_sender = False
async def server_connection_handler(conn: ws.ServerConnection):
    global has_sender
    if has_sender:
        await conn.close(
            3000, "Server already has a connection to a sender (data source)!"
        )
    has_sender = True

    message_reader = AsyncMessageReader(ws_connection_aiter_bytes(conn))

    first_ipc_msg = await message_reader.read_next_message()
    if first_ipc_msg.type != "schema":
        await conn.close(3001, "First IPC message was not a schema!")
    schema = pa.ipc.read_schema(first_ipc_msg)

    async for msg in message_reader:
        if msg.type != "record batch":
            await conn.close(
                3001, "IPC message was not a record batch; not sure how to handle!"
            )
        batch = pa.ipc.read_record_batch(msg, schema)

        await send_batch_to_clients(batch)

    for idx in range(len(connections)):
        await finish_client_ipc_stream(idx)

    await conn.wait_closed()

    has_sender = False


# Handler function for each incoming connection, whether the incoming source of
# data or a client that wants to read the data
async def connection_handler(conn: ws.ServerConnection):
    if conn.request is None:
        raise ValueError("websocket.request is None.. ???")
    match conn.request.path:
        case "/send":
            await server_connection_handler(conn)
        case "/recv" | "":
            await client_connection_handler(conn)


async def ws_main(port: int):
    try:
        ws_server = await ws.serve(connection_handler, "0.0.0.0", port)

        await asyncio.gather(ws_server.serve_forever())

    finally:
        await close_all_clients(1001, "Server closing")
