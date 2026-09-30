"""
CLI test runner for ResearchOps Agent.
Demonstrates live run on Bengaluru EV Scooter Subscription problem statement.
"""

import sys
import os
import json

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from researchops.agent import ResearchOpsAgent

def main():
    print("="*80)
    print("DOMAIN 1: ENTERPRISE & BUSINESS OPERATIONS - RESEARCH OPS AGENT")
    print("="*80)
    
    query = (
        "A company wants to know whether it should launch an electric scooter subscription service in Bengaluru. "
        "The agent researches existing competitors (such as Yulu, Bounce, Ather, Ola, Zypp), their prices, available services, "
        "customer segments, battery swapping infrastructure, and relevant market information. "
        "It then compares the collected information and prepares a report showing the market situation, competitors, "
        "possible opportunities, and risks, with supporting sources so key claims can be verified."
    )
    
    print(f"\n[Problem Statement Input]\n{query}\n")
    agent = ResearchOpsAgent(model_name="qwen/qwen3.8-27b")
    
    def log_progress(msg):
        print(f" -> {msg}")
        
    result = agent.run_full_pipeline(query, progress_callback=log_progress)
    
    print("\n" + "="*80)
    print("TASK DECOMPOSITION:")
    print("="*80)
    for task in result["plan"].get("subtasks", []):
        print(f"[{task['task_id']}] {task['category']}: {task['description']}")
        print(f"  Queries: {', '.join(task['search_queries'])}")
        
    print("\n" + "="*80)
    print(f"SOURCES AUDITED: {len(result['data_bundle']['sources'])}")
    print("="*80)
    for url, meta in list(result["data_bundle"]["sources"].items())[:6]:
        print(f"[{meta['tag']}] {meta['title']} -> {url}")
        
    print("\n" + "="*80)
    print("EXECUTIVE RESEARCH REPORT (PREVIEW):")
    print("="*80)
    print(result["report"][:1500] + "\n\n...[Full report saved to reports/demo_run_report.md]...")
    
    os.makedirs("D:/webman_researchops/reports", exist_ok=True)
    report_path = "D:/webman_researchops/reports/demo_run_report.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(result["report"])
        
    print(f"\n[SUCCESS] Full report written to: {report_path}")

if __name__ == "__main__":
    main()
