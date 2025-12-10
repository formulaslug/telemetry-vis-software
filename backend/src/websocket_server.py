import asyncio
import io
from websockets import ConnectionClosed, ConnectionClosedOK
import websockets.asyncio.server as ws
import polars as pl
import pyarrow as pa
import random

# import util.sim as sim

# List of WebSocket connections with their corresponding Arrow Stream (IPC)
# Writers and BytesIO buffers
connections: list[
    tuple[ws.ServerConnection, pa.RecordBatchStreamWriter, io.BytesIO]
] = []

data_buffer = io.BytesIO()
data_batch_reader: pa.RecordBatchStreamReader | None

# # Todo: this will come from the radio module eventually!
# def get_arrow_data():
#     current_df = sim.createdf()
#     arrow_data = current_df.to_arrow()
#     assert arrow_data.schema.equals(sim.get_schema()), "get_schema() != df's schema!"
#     return arrow_data


# TODO: use IDs and not indexes (race condition here I think)
def clean_connection(idx: int):
    rb_writer: pa.RecordBatchStreamWriter
    buffer: io.BytesIO
    if idx < len(connections):
        _, rb_writer, buffer = connections[idx]
        rb_writer.close()
        buffer.close()
        del connections[idx]


# The main loop that sends Arrow record batches to all connected clients
async def data_main_loop():
    while True:
        if data_batch_reader is None:
            await asyncio.sleep(1)
            continue

        arrow_data = data_batch_reader.read_all()

        disconnected_idxs = []
        for idx, (ws_connection, rb_writer, buffer) in enumerate(connections):
            try:
                rb_writer.write_table(arrow_data)

                ipc_data = buffer.getvalue()
                buffer.seek(0)
                buffer.truncate()

                await ws_connection.send(ipc_data)
            except ConnectionClosed as e:
                print("ConnectionClosed:", e)
                disconnected_idxs.append(idx)

        # Clean any disconnected websockets
        for idx in reversed(disconnected_idxs):
            clean_connection(idx)

        # await asyncio.sleep(
        #     1 / freq_hertz + random.uniform(-0.4 / freq_hertz, 0.4 / freq_hertz)
        # )

async def recv_connection_handler(conn: ws.ServerConnection):
    if data_batch_reader is None:
        await conn.close(500, "No data source available")
        return

    # The recv connection gets its own personalized RecordBatchStreamWriter and
    # io byte buffer
    buffer = io.BytesIO()
    rb_writer = pa.ipc.new_stream(buffer, data_batch_reader.schema)

    connections.append((conn, rb_writer, buffer))
    print(f"Client connected! Current connections: {len(connections)}")

    try:
        await conn.wait_closed()
    finally:
        if (conn, rb_writer, buffer) in connections:
            idx = connections.index((conn, rb_writer, buffer))
            clean_connection(idx)
        print(f"Client disconnected. Remaining connections: {len(connections)}")

async def send_connection_handler(conn: ws.ServerConnection):
    try:
        global data_batch_reader
        data_batch_reader = pa.RecordBatchStreamReader(data_buffer)
        async for msg in conn:
            buf = pa.BufferReader(msg)
            data_buffer.write(buf.readall())
    except ConnectionClosedOK:
        print("Data source connection closed normally.")
    except Exception as e:
        print(f"Data connection error: {e}")
    await conn.wait_closed()

# Handler function for each incoming connection, whether the incoming source of
# data or a client that wants to read the data
async def connection_handler(conn: ws.ServerConnection):
    if conn.request is None:
        raise ValueError("websocket.request is None.. why?")
    match conn.request.path:
        case "/send":
            await send_connection_handler(conn)
        case "/recv" | "":
            await recv_connection_handler(conn)



async def ws_main(port: int):
    ws_server = await ws.serve(connection_handler, "0.0.0.0", port)

    await asyncio.gather(data_main_loop(), ws_server.serve_forever())


# asyncio.run(ws_main()) # handled by main.py now
