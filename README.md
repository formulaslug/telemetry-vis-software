## Telemetry Visualization Software

More information soon

## How to Run:

This is all you need to run the stack via docker compose:

```console
$ git clone https://github.com/formulaslug/telemetry-vis-software
$ docker compose up -d
```

Optionally, replace `git clone` with `git clone --recursive` to make it also
clone the formulaslug/fs-3-data repo as a submodule in the root folder. This
will allow the backend to search for Parquet files to serve to the frontend
(along with the live data functionality). Be warned, it's an added ~2Gb. If you
don't do this and haven't modified the http API, it may still work automatically
using the fallback URL.

Now check out https://localhost, and it should be running! (you will have to
click through the security warning. Caddy uses self-signed certificates, that's
just how it works)

frontend/ and backend/ also both provide instructions on how to setup and run
each respective part _without_ using docker, which can be nicer for local
development.

---

## Notes to self:

### How to reload Caddy after making changes to Caddyfile:

`docker compose exec -w /etc/caddy caddy caddy reload`

### How to create multi-arch images from separate images

build :latest-arm64, :latest-amd64 tags and push separately. eg. for amd64:

```sh
# in vis-backend
docker buildx build -t registry.bvngee.com/python-test:latest-amd64 --push ./python-test
```

```sh
# in live-vis-example
docker buildx build -t registry.bvngee.com/live-vis-example:latest-amd64 --push .
```

```sh
docker buildx imagetools create -t registry.bvngee.com/live-vis-example:latest \
    registry.bvngee.com/live-vis-example:latest-arm64 \
    registry.bvngee.com/live-vis-example:latest-amd64

docker buildx imagetools create -t registry.bvngee.com/python-test:latest \
    registry.bvngee.com/python-test:latest-arm64 \
    registry.bvngee.com/python-test:latest-amd64
```

Done! ([ref](https://andrewlock.net/combining-multiple-docker-images-into-a-multi-arch-image/))
