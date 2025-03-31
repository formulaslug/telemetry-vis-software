import os
from aiohttp import web
import aiohttp_cors
import cantools

data_dir = os.environ.get("DATA_DIR", "")
parquet_files = set()
if not os.path.isdir(data_dir):
    raise ValueError("Invalid recording dir: ", data_dir)


def check_subdir(d):
    for f in os.listdir(d):
        path = os.path.join(d, f)
        if os.path.isdir(path):
            check_subdir(path)
        elif f.endswith(".pq") or f.endswith(".parquet"):
            parquet_files.add(os.path.relpath(path, data_dir))


check_subdir(data_dir)


routes = web.RouteTableDef()


@routes.get("/api/available-recordings")
async def available_recordings(request):
    return web.json_response(list(parquet_files))


# This serves the parquet data directly as static files
routes.static("/api/get-recording", data_dir, show_index=True)


@routes.get("/api/get-dbc/{car}")
async def get_dbc(request: web.Request):
    car = request.match_info.get("car")
    db = cantools.db.database.Database()
    
    return web.json_response(response_obj)


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
