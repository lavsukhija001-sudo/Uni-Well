@echo off
cd /d "%~dp0backend"
echo Starting UniWell Backend...
venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
pause
