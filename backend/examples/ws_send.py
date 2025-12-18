import pyarrow as pa
import websockets
import io
import asyncio

batch = pa.RecordBatch.from_pydict({"a": [1,2,3], "b": [2,3,4], "f": [0.0, 0.0, 0.0]})

async def main():
    async with websockets.connect("ws://localhost:8000/send") as conn:
        buf = io.BytesIO()

        writer = pa.RecordBatchStreamWriter(buf, batch.schema)

        # Send record batch 5 times
        for _ in range(5):
            # Add batch to stream
            writer.write_batch(batch)

            # Get stream output as bytes
            out = buf.getvalue()
            # Send bytes to websocket
            await conn.send(out)
            # Reset bytes
            buf.seek(0)
            buf.truncate()

            await asyncio.sleep(0.5)

        # Finish IPC stream (and send stream footer)
        writer.close()
        out = buf.getvalue()
        await conn.send(out)

        
if __name__ == "__main__":
    asyncio.run(main())
