import pyarrow as pa
import pyarrow.ipc as ipc
import websockets
import io
import asyncio

async def main():
    async with websockets.connect("ws://localhost:8000/recv") as conn:
        buf = io.BytesIO()

        print("1")
        msg = await conn.recv(decode=False)
        print("2")
        buf.write(msg)
        reader = pa.RecordBatchStreamReader(buf)
        print(reader.schema)

        async for msg in conn.recv_streaming(decode=False):
            print("3")
            buf.write(msg)

            for batch in reader.read_all().to_batches():
                print(batch)

            buf.seek(0)
            buf.truncate()

if __name__ == "__main__":
    asyncio.run(main())
