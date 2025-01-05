import os
from aiohttp import web

dirs = list(filter(None, os.environ.get("RECORDING_DIRS", "").split(":")))
files = set()
for d in dirs:
    if not os.path.isdir(d):
        print("Invalid recording dir: ", d)
        continue
    for f in os.listdir(d):
        if not (f.endswith(".pq") or f.endswith(".parquet")):
            print("Invalid recording file: ", f)
            continue
        files.add(f)

async def available_recordings(request):
    return web.json_response(list(files))


async def get_recording(request: web.Request):
    f = request.match_info.get("filename")
    if not f:
        return web.Response(status=404, body="Unkown / incorrect recording filename!")
    # return web.Response(content_type="application/vnd.apache.arrow.stream", body=)
    return web.json_response({"you asked for": f})


app = web.Application()
app.router.add_get("/available-recordings", available_recordings)
app.router.add_get("/get-recording/{filename}", get_recording)


async def http_main(port: int):
    await web._run_app(app, host="0.0.0.0", port=port, print=None)
