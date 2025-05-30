import asyncio
import websockets
from websockets import ConnectionClosed
import pyarrow as pa
import io
import random
import datetime

async def radio_main(port: int):
    async def handler(websocket):
        while True:
            testData = [
                timestamp := pa.array([datetime.datetime.now().isoformat()] + [None] * 5, type=pa.string()),
                pa.array([12, 2, 3, 4, 5, 6], type=pa.int8()),
                pa.array([random.random() * 20, 2.0, 3.0, 4.0, 5.0, 6.0], type=pa.float32())
            ]

            batch = pa.record_batch(testData, names=["time", "r1", "r2"])

            buffer = io.BytesIO()

            writer = pa.ipc.new_stream(buffer, batch.schema)

            writer.write_table(pa.Table.from_batches([batch]))

            
            ipc_data = buffer.getvalue()
            buffer.seek(0)
            buffer.truncate() 

        
            
            try:
                await websocket.send(ipc_data)   
            except ConnectionClosed as e:
                try:
                    writer.close()
                except Exception as writer_err:
                    print("Writer close error:", writer_err)
                try:
                    buffer.close()
                except Exception as buffer_err:
                    print("Buffer close error:", buffer_err)
                return

            await asyncio.sleep(1/100)  # Send every second

    async with websockets.serve(handler, "localhost", 8001):
        print("WebSocket server started on ws://localhost:8001")
        await asyncio.Future()  # run forever

    