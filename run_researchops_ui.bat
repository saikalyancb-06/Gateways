@echo off
echo ===================================================
echo Starting ResearchOps: Autonomous Research Agent UI
echo Domain 1 - Enterprise and Business Operations
echo ===================================================
cd /d "D:\webman_researchops"
"C:\Users\cbsai\AppData\Local\Programs\Python\Python313\python.exe" -m streamlit run researchops/app.py --server.port 8501
pause
