Prerequisites: Docker, git

## To run locally - building containers locally

Clone this repo as well as the front-end repo.

```sh
$ # in live-vis-example
$ docker buildx build -t live-vis-example .
$ # in vis-backend
$ docker compose up -d # this will build python-test and start everything
```

Now it should be up at https://localhost!
warning: you will have to click through the security warning. Caddy uses self-signed certificates, that's just how it works.

You can also instead try using prebuilt images.
There are semi-regularly updated copies of the built docker images for Arm and
x64 in a private container registry (registry.bvngee.com), which allows people
to skip the slow build process.

```sh
$ docker login registry.bvngee.com # ask me for the username/password
$ # in vis-backend; this pulls all deps from the registry
$ REGISTRY_URL="registry.bvngee.com/" docker compose up -d
```

---

## Notes to self: 
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

### How to reload Caddy after making changes to Caddyfile:
`docker compose exec -w /etc/caddy caddy caddy reload`


---

Notes about Arrow IPC:
- streaming format: https://arrow.apache.org/docs/format/Columnar.html#ipc-streaming-format
- the problem I had when trying to read multiple record batches with one reader in the frontend: https://github.com/apache/arrow/issues/32593#issuecomment-1378117262
