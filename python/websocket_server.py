import asyncio
import io
import signal
import websockets.asyncio.server as ws
import polars as pl
import pyarrow as pa
import random
import sim


async def websocket_serve(websocket: ws.ServerConnection):
    buffer = io.BytesIO()
    with pa.ipc.new_stream(buffer, sim.get_schema()) as writer:
        while True:
            df = sim.createdf()
            # print(str(df))
            arrow_data = df.to_arrow()

            assert arrow_data.schema.equals(sim.get_schema()), "get_schema() != df's schema!"

            writer.write_table(arrow_data)

            ipc_data = buffer.getvalue()
            buffer.seek(0)
            buffer.truncate()

            await websocket.send(ipc_data)
            # await websocket.send(df.write_ndjson())
            await asyncio.sleep((1 + random.uniform(-0.5, 0.5)) / 100)


    # Old code, which created a new Arrow IPC stream for each record batch
    # (which breaks decoding multiple batches with a single reader on the client)
    # while True:
    #     df = sim.createdf()
    #     # print(str(df))
    #     arrow_data = df.to_arrow()
    #     byte_stream = io.BytesIO()
    #     with pa.ipc.new_stream(byte_stream, arrow_data.schema) as writer:
    #         writer.write_table(arrow_data)
    #
    #     ipc_data = byte_stream.getvalue()
    #
    #     await websocket.send(ipc_data)
    #     # await websocket.send(df.write_ndjson())
    #     await asyncio.sleep((1 + random.uniform(-0.5, 0.5)) / 100)



async def ws_main(port: int):
    # Add signal handler for SIGTERM
    stop = asyncio.Event()
    loop = asyncio.get_running_loop()
    loop.add_signal_handler(signal.SIGTERM, lambda: stop.set())

    async with ws.serve(websocket_serve, "0.0.0.0", port):
        await stop.wait()  # Run until stop "event" has been triggered


# asyncio.run(ws_main()) # handled by main.py now
