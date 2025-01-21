import os
from os.path import isdir
from aiohttp import web
import aiohttp_cors

dirs = list(filter(None, os.environ.get("RECORDING_DIRS", "").split(":")))
parquet_files = set()
for toplevel_dir in dirs:
    if not os.path.isdir(toplevel_dir):
        print("Invalid recording dir: ", toplevel_dir)
        continue

    def check_subdir(d):
        for f in os.listdir(d):
            path = os.path.join(d, f)
            if os.path.isdir(path):
                check_subdir(path)
            elif f.endswith(".pq") or f.endswith(".parquet"):
                parquet_files.add(os.path.relpath(path, toplevel_dir))

    check_subdir(toplevel_dir)


routes = web.RouteTableDef()


@routes.get("/api/available-recordings")
async def available_recordings(request):
    return web.json_response(list(parquet_files))


@routes.get("/api/get-recording/{filename}")
async def get_recording(request: web.Request):
    f = request.match_info.get("filename")
    if not f:
        return web.Response(status=404, body="Unkown / incorrect recording filename!")
    # return web.Response(content_type="application/vnd.apache.arrow.stream", body=)
    return web.json_response({"you asked for": f})


app = web.Application()
app.router.add_routes(routes)

# Configure default CORS settings.
cors = aiohttp_cors.setup(
    app,
    defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
        )
    },
)
for route in list(app.router.routes()):
    cors.add(route)


async def http_main(port: int):
    await web._run_app(app, host="0.0.0.0", port=port, print=None)
