from typing import AsyncIterator
import pyarrow as pa
import websockets
from websockets.asyncio.connection import Connection
from websockets.exceptions import ConnectionClosedOK
from async_ipc_message_reader import AsyncMessageReader
import asyncio


# websockets.Connection already defines an __aiter__() method, but the problem
# is that it calls self.recv() with no `decode` param, causing the returned
# iterator to supply Data() instances rather than bytes instances. So this is
# mostly for typechecking purposes, since at runtime Data should just bytes for
# our usecase anyways.
async def ws_connection_aiter_bytes(self: Connection) -> AsyncIterator[bytes]:
    try:
        while True:
            yield await self.recv(decode=False)
    except ConnectionClosedOK:
        return


async def main():
    async with websockets.connect("ws://localhost:8000/recv") as conn:
        reader = AsyncMessageReader(ws_connection_aiter_bytes(conn))

        first_msg = await reader.read_next_message()
        assert first_msg.type == "schema"

        schema = pa.ipc.read_schema(first_msg)
        print(schema)

        async for msg in reader:
            assert msg.type == "record batch"

            record_batch = pa.ipc.read_record_batch(msg, schema)
            print(record_batch)


if __name__ == "__main__":
    asyncio.run(main())
