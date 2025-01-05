FROM python:3.12-slim

WORKDIR /app

COPY ./requirements.txt /app
RUN pip install --no-cache-dir -r requirements.txt

COPY ./**.py /app

EXPOSE 8000
EXPOSE 9000
CMD ["python", "main.py"]
