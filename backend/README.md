## Visualization Software Backend

There's two parts to this (at the time of writing):

1. Websocket server
2. HTTP server

Both are written in python and share the same asyncio event loop. 

> [!NOTE]
> The frontend UI is hosted separately, using a nodejs process. These are
completely separate!

The websocket server serves the actual live telemetry data. The http server is
specifically for retrieving past data in the form of Parquet files.


### How to develop locally (i.e. outside of Docker):

`cd` into this directory and run (for bash):
```console
$ python -m venv .venv
$ source .venv/bin/activate
$ pip install -r requirements.txt
$ python main.py
# http and websocket servers are now running, yay!
```



---

Notes about Arrow IPC:
- streaming format: https://arrow.apache.org/docs/format/Columnar.html#ipc-streaming-format
- the problem I had when trying to read multiple record batches with one reader in the frontend: https://github.com/apache/arrow/issues/32593#issuecomment-1378117262
