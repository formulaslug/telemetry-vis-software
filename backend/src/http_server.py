import os
from aiohttp import web
import aiohttp_cors
import cantools

data_dir = os.environ.get("DATA_DIR", "")
parquet_files = set()
if not os.path.isdir(data_dir):
    raise ValueError("Invalid data dir: ", data_dir)


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


# The fs-data repo is structured such that differen't Parquet recordings are
# "associated" with different DBC files, where the "closest" .dbc files are
# correct and if the current directory doesn't have any we keep checking its
# parents. So basically just walk up the directory tree until we find a .dbc
@routes.get("/api/get-dbc-for-recording/{recording:.*}")
async def get_dbc(request: web.Request):
    recording = request.match_info.get("recording")
    if not recording:
        return web.HTTPBadRequest(reason="Invalid recording parameter!")

    dbc_path_dir = os.path.dirname(os.path.join(data_dir, recording))
    if not os.path.isdir(dbc_path_dir):
        return web.HTTPNotFound(reason="Recording path invalid!")

    db = cantools.db.Database()

    dir_has_dbc = False
    while not dir_has_dbc:
        dbc_path_dir_items = os.listdir(dbc_path_dir)
        dbcs = [f for f in dbc_path_dir_items if os.path.splitext(f)[1] == ".dbc"]
        if len(dbcs) > 0:
            dir_has_dbc = True
            for dbc in dbcs:
                db.add_dbc_file(os.path.join(dbc_path_dir, dbc))
                # print(os.path.join(dbc_path_dir, dbc)) # debug
        else:
            dbc_path_dir = os.path.dirname(dbc_path_dir)

    if not dir_has_dbc:
        return web.HTTPNotFound(reason="DBC file not found!")

    return web.json_response(
        [
            (s.name, s.unit, (s.minimum, s.maximum))
            for m in db.messages
            for s in m.signals # m.signal_tree ??
        ]
    )


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
