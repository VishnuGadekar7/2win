#!/bin/sh
. .venv/bin/activate
uvicorn main:app --port 8000 --host 0.0.0.0