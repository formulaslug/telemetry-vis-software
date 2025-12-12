import pyarrow as pa
import pyarrow.ipc as ipc
import websockets
import io
import asyncio

batch = pa.RecordBatch.from_pydict({"a": [1,2,3], "b": [2,3,4]})

async def main():
    async with websockets.connect("ws://localhost:8000/send") as conn:
        buf = io.BytesIO()

        writer = pa.RecordBatchStreamWriter(buf, batch.schema)

        while True:
            writer.write_batch(batch)

            out = buf.getvalue()
            await conn.send(out)
            print(len(buf.getbuffer()))
            buf.seek(0)
            buf.truncate()

            await asyncio.sleep(0.5)

        
if __name__ == "__main__":
    asyncio.run(main())
