FROM python:3.12.2-alpine3.19
LABEL org.opencontainers.image.authors="abdullahmujahidali1@gmail.com"

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apk add --update --no-cache \
    postgresql-client \
    jpeg-dev \
    libffi-dev \
    && apk add --update --no-cache --virtual .tmp-build-deps \
        build-base \
        postgresql-dev \
        musl-dev \
        linux-headers \
        bash

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && apk del .tmp-build-deps

RUN adduser --disabled-password --no-create-home django-user

COPY . .

RUN chown -R django-user:django-user /app

USER django-user

EXPOSE 8000