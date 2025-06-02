import asyncio
import io
from websockets import ConnectionClosed
import websockets.asyncio.server as ws
import pyarrow as pa
import random
import websockets
import util.sim as sim

# List of WebSocket connections with their corresponding Arrow Stream (IPC)
# Writers and BytesIO buffers
connections: list[
    tuple[ws.ServerConnection, pa.RecordBatchStreamWriter, io.BytesIO]
] = []

server_data: pa.Table | None = None

async def get_server_data(port: int):
    uri = f"ws://localhost:{port}"
    
    global server_data
    async with websockets.connect(uri) as websocket:
        try:
            while True:
                message = await websocket.recv()
                new_buffer = io.BytesIO(message)

                reader = pa.ipc.open_stream(new_buffer)

                server_data = reader.read_all()
                print(f"Received data from server: {server_data}")
        except websockets.ConnectionClosed:
            print("Client disconnected")
        except Exception as e:
            print(f"Error: {e}")

# Todo: this will come from the radio module eventually!
def get_arrow_data():
    current_df = sim.createdf()
    arrow_data = current_df.to_arrow()
    assert arrow_data.schema.equals(sim.get_schema()), "get_schema() != df's schema!"
    return arrow_data


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
async def ws_main_loop(freq_hertz: int):
    global server_data

    while True:
        if server_data is None:
            print("No data received from server, skipping iteration.")
            await asyncio.sleep(1 / freq_hertz)
            continue

        disconnected_idxs = []
        for idx, (ws_connection, rb_writer, buffer) in enumerate(connections):
            try:
                rb_writer.write_table(server_data)

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

        await asyncio.sleep(
            1 / freq_hertz + random.uniform(-0.4 / freq_hertz, 0.4 / freq_hertz)
        )


# Handler function for each incoming connection
async def websocket_handler(websocket: ws.ServerConnection):
    buffer = io.BytesIO()
    rb_writer = pa.ipc.new_stream(buffer, sim.get_schema())

    connections.append((websocket, rb_writer, buffer))
    print(f"Client connected! Current connections: {len(connections)}")

    try:
        await websocket.wait_closed()
    finally:
        if (websocket, rb_writer, buffer) in connections:
            idx = connections.index((websocket, rb_writer, buffer))
            clean_connection(idx)
        print(f"Client disconnected. Remaining connections: {len(connections)}")


async def ws_main(port: int = 8000, reciever_port: int = 8001):
    ws_server = await ws.serve(websocket_handler, "0.0.0.0", port)

    await asyncio.gather(ws_main_loop(100), ws_server.serve_forever(), get_server_data(reciever_port))


# asyncio.run(ws_main()) # handled by main.py now
