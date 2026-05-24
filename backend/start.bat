@echo off
set PYTHONPATH=%~dp0
python -m uvicorn main:app --reload