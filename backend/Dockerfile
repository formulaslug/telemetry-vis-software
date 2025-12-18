FROM python:3.12-slim-bookworm
COPY --from=docker.io/astral/uv:latest /uv /uvx /bin/

COPY ./src /app
COPY ./uv.lock ./pyproject.toml /app

WORKDIR /app

ENV UV_NO_DEV=1
RUN uv sync --locked

EXPOSE 8000
EXPOSE 9000
CMD ["uv", "run", "main.py"]
