#!/usr/bin/env bash
cd "$(dirname "$0")/backend"
echo "Starting UniWell Backend..."
./venv/Scripts/python -m uvicorn main:app --reload --port 8000
