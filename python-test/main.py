import asyncio
import io
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
        yield [
            (
                (datetime.datetime.now() - t0).total_seconds() * 1000,
                math.sin(x / 100),
                x,
            )
            for _ in range(n_rows)
        ]


async def websocket_serve(websocket: ws.WebSocketServerProtocol, path):
    for rows in get_rows(n_rows=random.randint(1, 10)):
        ts, xs, ys = zip(*rows)
        data = {"timestamps": ts, "x": xs, "y": ys}
        df = pl.DataFrame(data)
        # arrow_data = df.to_arrow()
        # with pa.ipc.new_stream(io.BytesIO(), arrow_data.schema) as writer:
        #     writer.write_table(arrow_data)
        # ipc_data = io.BytesIO().getvalue()
        #
        # await websocket.send(ipc_data)
        await websocket.send(df.write_json())
        await asyncio.sleep(1)


# Start the WebSocket server
async def main():
    async with ws.serve(websocket_serve, "localhost", 8000):
        await asyncio.Future()  # Run forever


asyncio.run(main())
