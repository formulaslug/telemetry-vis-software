import asyncio
import io
from websockets import ConnectionClosed, ConnectionClosedOK
import websockets.asyncio.server as ws
import pyarrow as pa

# import util.sim as sim

# List of WebSocket connections with their corresponding Arrow Stream (IPC)
# Writers and BytesIO buffers
connections: list[
    tuple[ws.ServerConnection, pa.RecordBatchStreamWriter | None, io.BytesIO]
] = []

has_sender = False


# # Todo: this will come from the radio module eventually!
# def get_arrow_data():
#     current_df = sim.createdf()
#     arrow_data = current_df.to_arrow()
#     assert arrow_data.schema.equals(sim.get_schema()), "get_schema() != df's schema!"
#     return arrow_data


# TODO: use IDs and not indexes (race condition here I think)
def clean_connection(idx: int):
    rb_writer: pa.RecordBatchStreamWriter | None
    buffer: io.BytesIO
    if idx < len(connections):
        _, rb_writer, buffer = connections[idx]
        if rb_writer:
            rb_writer.close()
        buffer.close()
        del connections[idx]


# The main loop that sends Arrow record batches to all connected clients
async def data_main_loop():
    global data_batch_reader, data_buffer

    # while True:

        # await asyncio.sleep(
        #     1 / freq_hertz + random.uniform(-0.4 / freq_hertz, 0.4 / freq_hertz)
        # )

async def send_batch_to_recv_clients(batch: pa.RecordBatch):
    disconnected_idxs = []
    for idx, (ws_connection, rb_writer, buffer) in enumerate(connections):
        print(f"Connection {idx}: writing")
        try:
            if rb_writer is None:
                rb_writer = pa.RecordBatchStreamWriter(buffer, batch.schema)
            rb_writer.write_batch(batch)

            ipc_data = buffer.getvalue()
            buffer.seek(0)
            buffer.truncate()

            print("sending...")
            await ws_connection.send(ipc_data)
            print("sent")
        except ConnectionClosed as e:
            print("ConnectionClosed:", e)
            disconnected_idxs.append(idx)
    # Clean any disconnected websockets
    for idx in reversed(disconnected_idxs):
        clean_connection(idx)


async def recv_connection_handler(conn: ws.ServerConnection):
    # if data_batch_reader is None:
    #     await conn.close(500, "No data source available")
    #     return

    # The recv connection gets its own personalized RecordBatchStreamWriter
    # (which is None for now) and io byte buffer
    buffer = io.BytesIO()
    rb_writer = None

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
    global has_sender
    if has_sender:
        await conn.close(3000, "Server already has a connection to a sender (data source)!")
    has_sender = True

    try:
        first_msg = await conn.recv(decode=False)
        msg_reader = pa.MessageReader.open_stream(first_msg)
        # print(msg_reader.read_next_message().type)
        # print(msg_reader.read_next_message().type)
        pa.ipc.read

        data_buffer = io.BytesIO()
        data_buffer.write(first_msg)
        data_batch_reader = pa.RecordBatchStreamReader(data_buffer.getvalue())
        pa.ipc.read_record_batch
        
        batch0 = data_batch_reader.read_next_batch()
        print("rows:", batch0.num_rows, ", data_buffer size:", len(data_buffer.getbuffer()))

        while True:
            async for msg in conn.recv_streaming(decode=False):
                print("got message!")
                data_buffer.write(msg)
                try:
                    print(len(data_buffer.getvalue()))
                    for batch in data_batch_reader:
                        print("rows:", batch.num_rows, ", data_buffer size:", len(data_buffer.getbuffer()))
                        await send_batch_to_recv_clients(batch)

                    data_buffer.seek(0)
                    data_buffer.truncate()
                except StopIteration:
                    print("Data source stream ended.")
                    break
                except Exception as e:
                    print("Data processing exception:", e)
    except ConnectionClosedOK:
        print("Data source connection closed normally.")
    except Exception as e:
        print(f"Data connection error: {e}")
    await conn.wait_closed()
    has_sender = False


# Handler function for each incoming connection, whether the incoming source of
# data or a client that wants to read the data
async def connection_handler(conn: ws.ServerConnection):
    if conn.request is None:
        raise ValueError("websocket.request is None.. why?")
    match conn.request.path:
        case "/send":
            print("send_connection_handler")
            await send_connection_handler(conn)
        case "/recv" | "":
            print("recv_connection_handler")
            await recv_connection_handler(conn)



async def ws_main(port: int):
    ws_server = await ws.serve(connection_handler, "0.0.0.0", port)

    await asyncio.gather(data_main_loop(), ws_server.serve_forever())


# asyncio.run(ws_main()) # handled by main.py now
