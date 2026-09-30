@echo off
echo =========================================================
echo Launching ResearchOps Full Multi-Agent Suite
echo Domain 1: Enterprise and Business Operations
echo =========================================================

echo [1/3] Verifying Ollama local engine...
start "Ollama Engine" /B "ollama" serve

echo [2/3] Starting ResearchOps Multi-Agent Backend Server...
cd /d "D:\webman_researchops"
start "ResearchOps Backend" "C:\Users\cbsai\AppData\Local\Programs\Python\Python313\python.exe" -m uvicorn researchops_core.backend.main:app --host 127.0.0.1 --port 8000

echo [3/3] Starting ResearchOps React Application...
cd /d "D:\webman_researchops\researchops_core\frontend"
start "ResearchOps Frontend" cmd /c "npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo =========================================================
echo ResearchOps is online!
echo Frontend UI: http://127.0.0.1:5173
echo Backend API: http://127.0.0.1:8000
echo =========================================================
pause
