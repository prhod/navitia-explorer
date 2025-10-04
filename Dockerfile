FROM python:3.10-alpine 

WORKDIR /app
EXPOSE 8000

COPY requirements.txt /app
RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install -r requirements.txt

COPY app.py /app/

COPY ./navitia-explorer /app/navitia-explorer

# ENTRYPOINT ["python3"]
# CMD ["app.py"]

ENTRYPOINT ["flask"]
CMD ["run", "--port=8000", "--host=0.0.0.0"]
