import asyncio
import io
import signal
import websockets as ws
import polars as pl
import pyarrow as pa
import math
import datetime
import random
import sim

'''
def get_rows(total_rows: int = 10_000):
    t0 = datetime.datetime.now()
    x = 0
    for _ in range(total_rows):
        yield (
            math.floor((datetime.datetime.now() - t0).total_seconds() * 1000),
            math.sin(x),
            math.cos(x),
            math.sin(x),
            math.cos(x),
        )
        x += 1
'''

async def websocket_serve(websocket: ws.WebSocketServerProtocol, path):
    # for rows in get_rows():
    #     a, b, c, d, e = zip(rows)
    #     data = {
    #         "timestamp": a,
    #         "voltage": b,
    #         "temperature": c,
    #         "speed": d,
    #         "blibblog": e,
    #     }
        df = pl.sim.createdf()
        arrow_data = df.to_arrow()
        byte_stream = io.BytesIO()
        with pa.ipc.new_stream(byte_stream, arrow_data.schema) as writer:
            writer.write_table(arrow_data)

        ipc_data = byte_stream.getvalue()

        await websocket.send(ipc_data)
        # await websocket.send(df.write_ndjson())
        await asyncio.sleep(1 + random.uniform(-0.5, 0.5))


# Start the WebSocket server
async def main():
    stop = asyncio.Event()
    # Add signal handler for SIGTERM
    loop = asyncio.get_running_loop()
    loop.add_signal_handler(signal.SIGTERM, lambda: stop.set())

    async with ws.serve(websocket_serve, "0.0.0.0", 8000):
        await stop.wait()  # Run until stop "event" has been triggered


asyncio.run(main())
