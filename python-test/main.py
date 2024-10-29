import asyncio
import io
from asyncio.runners import signal
import websockets as ws
import polars as pl
import pyarrow as pa
import math
import datetime
import random


def get_rows(n_rows: int = 1, total_rows: int = 10_000):
    t0 = datetime.datetime.now()
    x = 0
    for _ in range(total_rows):
        rows = []
        for _ in range(n_rows):
            rows.append(
                (
                    math.floor((datetime.datetime.now() - t0).total_seconds() * 1000),
                    math.sin(x / 100),
                    x,
                )
            )
            x += 1
        yield rows


async def websocket_serve(websocket: ws.WebSocketServerProtocol, path):
    for rows in get_rows(n_rows=random.randint(1, 10)):
        print(rows)
        ts, xs, ys = zip(*rows)
        data = {"timestamp": ts, "x": xs, "y": ys}
        df = pl.DataFrame(data)
        # arrow_data = df.to_arrow()
        # with pa.ipc.new_stream(io.BytesIO(), arrow_data.schema) as writer:
        #     writer.write_table(arrow_data)
        # ipc_data = io.BytesIO().getvalue()
        #
        # await websocket.send(ipc_data)
        await websocket.send(df.write_ndjson())
        await asyncio.sleep(1 + random.uniform(-0.3, 0.3))

# Start the WebSocket server
async def main():
    stop = asyncio.Event()
    # Add signal handler for SIGTERM
    loop = asyncio.get_running_loop()
    loop.add_signal_handler(signal.SIGTERM, lambda: stop.set())

    async with ws.serve(websocket_serve, "0.0.0.0", 8000):
        await stop.wait() # Run until stop "event" has been triggered


asyncio.run(main())
