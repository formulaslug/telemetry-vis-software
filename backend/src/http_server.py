import os
import io
import json
from aiohttp import web
import aiohttp_cors
import cantools
import polars as pl

data_dir = os.environ.get("DATA_DIR", "")
layouts_dir = os.environ.get("LAYOUTS_DIR", "")

VALID_TIME_COLUMN = "Time_ms"

parquet_files = set()
layout_files = set()
if not os.path.isdir(data_dir):
    raise ValueError("Invalid data dir: ", data_dir)
if not os.path.isdir(layouts_dir):
    raise ValueError("Invalid layouts dir: ", layouts_dir)

def find_config_files(config_dir):
    for f in os.listdir(config_dir):
        if f.endswith(".json"):
            try:
                with open(os.path.join(config_dir, f), 'r') as f:
                    data = json.load(f)
                    returnData = {
                        "name": data.get("name", ""),
                        "team": data.get("team", ""),
                        "fileName": f
                    }
                    layout_files.add(returnData)
            except (json.JSONDecodeError, IOError) as e:
                print(f"Error reading config file {f}: {e}")

find_config_files(layouts_dir)

def find_data_files_recursively(d):
    for f in os.listdir(d):
        path = os.path.join(d, f)
        if os.path.isdir(path):
            find_data_files_recursively(path)
        elif f.endswith(".pq") or f.endswith(".parquet"):
            relpath = os.path.relpath(path, data_dir)
            df = pl.scan_parquet(path)
            if df.collect_schema().get(VALID_TIME_COLUMN) is not None:
                parquet_files.add(relpath)

find_data_files_recursively(data_dir)

print(f"config_files: {layout_files}")
print(f"data_dir: {data_dir}")
print(f"config_dir: {layouts_dir}")


routes = web.RouteTableDef()


@routes.get("/api/available-recordings")
async def available_recordings(request):
    return web.json_response(list(parquet_files))


@routes.get("/api/available-configs")
async def available_configs(request):
    return web.json_response(list(layout_files))

# This serves the parquet data directly as static files
@routes.get("/api/get-recording/{recording:.*}")
async def get_recording(request):
    recording = request.match_info.get("recording")
    if not recording:
        return web.HTTPBadRequest(reason="Invalid recording parameter!")

    # Load the parquet into memory, replace nulls with near values, and write
    # back out into buffer which is the HTTP response body
    parquet = os.path.join(data_dir, recording)
    df = pl.read_parquet(parquet)
    df_filled = df.select(pl.all().forward_fill().backward_fill())
    buffer = io.BytesIO()
    df_filled.write_parquet(buffer)
    # TODO: Instead of doing that ^, we could just refactor the visualization
    # frontend to handle null rows better (do manual null filtering for each column),
    # and store each column with its own timestamp (use DataSet API for each).
    
    return web.HTTPOk(body=buffer.getvalue(), content_type="application/octet-stream")
# routes.static("/api/get-recording", data_dir, show_index=True)

routes.static("/api/get-config", layouts_dir, show_index=True)


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
