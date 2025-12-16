# All credit to github.com/gatesn:
# https://gist.github.com/gatesn/86462c33d765b0fc63d7bb88529204d0

from typing import AsyncIterator
import pyarrow as pa

class AsyncMessageReader(AsyncIterator[pa.Message]):
    """Wraps an async iterable of bytes into an async iterable of PyArrow IPC messages.
    
    From this it is possible to build an AsyncRecordBatchStreamReader.
    """

    def __init__(self, bytes_iter: AsyncIterator[bytes]):
        self._bytes_iter = bytes_iter

        self._buffer = bytearray()

    async def read_next_message(self) -> pa.Message:
        """Read the next message from the stream."""
        return await anext(self)

    async def __anext__(self):
        # First parse the IPC encapsulation header
        # See: https://arrow.apache.org/docs/format/Columnar.html#encapsulated-message-format
        await self._ensure_bytes(8)
        assert self._buffer[:4] == b"\xFF\xFF\xFF\xFF"  # Continuation bytes
        header_len = int.from_bytes(self._buffer[4:8], "little")

        # Check for end-of-stream marker
        if not header_len:
            raise StopAsyncIteration()
        
        # Fetch the Arrow FlatBuffers Message header
        await self._ensure_bytes(8 + header_len)

        # Parse the bodyLength out of the flatbuffers Message.
        body_len = self._parse_body_len(self._buffer[8:][:header_len])
        total_len = 8 + header_len + body_len
        await self._ensure_bytes(total_len)

        # Parse the IPC message and reset the buffer
        msg = pa.ipc.read_message(memoryview(self._buffer)[:total_len])
        self._buffer = bytearray(self._buffer[total_len:])
        return msg

    async def _ensure_bytes(self, n: int):
        while len(self._buffer) < n:
            self._buffer.extend(await anext(self._bytes_iter))

    @staticmethod
    def _parse_body_len(header: memoryview) -> int:
        """Extract the body length from a raw arrow flatbuffer Message.
        
        See: https://github.com/apache/arrow/blob/main/format/Message.fbs
        See: https://github.com/dvidelabs/flatcc/blob/master/doc/binary-format.md#internals
        """
        root_table = int.from_bytes(header[:4], "little", signed=True)

        vtable = root_table - int.from_bytes(header[root_table:][:4], "little", signed=True)
        vtable_len = int.from_bytes(header[vtable:][:2], "little")

        # We know bodyLength lives at offset 10 within the vtable (verified against generated FlatBuffers code).
        #   table Message {
        #     version: org.apache.arrow.flatbuf.MetadataVersion;
        #     header: MessageHeader;
        #     bodyLength: long;
        #     custom_metadata: [ KeyValue ];
        #   }
        #
        #   0 => table length
        #   4 => version
        #   6 => HeaderType
        #   8 => Header
        #   10 => BodyLength
        #   12 => CustomMetadata
        #
        body_len_vtable_offset = 10

        # If the vtable is too short, then the body hasn't been set.
        if vtable_len <= body_len_vtable_offset:
            return 0

        # Otherwise, extract the location of the body_length from the vtable, and then extract the body_len itself.
        body_len_offset = int.from_bytes(header[vtable + body_len_vtable_offset :][:2], "little")
        return int.from_bytes(header[root_table + body_len_offset :][:8], "little")

