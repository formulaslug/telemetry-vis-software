import asyncio
from http_server import http_main
from websocket_server import ws_main


async def main():
    # We take the asyncio coroutines for the websocket server and the http
    # server and combine then together to run in one asyncio event loop.
    await asyncio.gather(
        http_main(port=9000),
        ws_main(port=8000),
    )


if __name__ == "__main__":
    asyncio.run(main())
