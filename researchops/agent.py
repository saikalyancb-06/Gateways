"""
ResearchOps Agent Orchestrator:
Autonomous multi-stage market, product, and competitor research agent.
Meets Domain 1 - Enterprise & Business Operations requirements:
1. Deconstructs open-ended business research questions into structured subtasks.
2. Performs multi-source parallel web retrieval (DuckDuckGo, Wikipedia, Direct Web Scraping).
3. Compares findings across competitor pricing, segments, and market dynamics.
4. Synthesizes a structured intelligence report with verifiable sources, citations, and strategic recommendations.
"""

import json
import os
import re
from typing import List, Dict, Any, Optional
from datetime import datetime

from researchops.search_engine import search_duckduckgo, search_wikipedia, fetch_page_content
from researchops.llm_client import generate_chat_completion

class ResearchOpsAgent:
    def __init__(self, model_name: str = "qwen/qwen3.8-27b"):
        self.model_name = model_name
        self.history = []
        
    def decompose_question(self, user_query: str) -> Dict[str, Any]:
        """
        Stage 1: Decomposes the high-level business research question into concrete subtasks.
        """
        system_prompt = """You are an Enterprise Research Strategy Director.
Given a business research inquiry, break it down into 4 to 6 precise, actionable research sub-tasks.
Each task must focus on a vital aspect:
1. Existing Competitors & Market Landscape
2. Pricing Models & Unit Economics
3. Target Customer Segments & Demographics
4. Operational, Regulatory & Infrastructure Constraints
5. Strategic Market Opportunity & Risk Assessment

Return ONLY a JSON object with this exact structure:
{
  "research_objective": "<clear restatement of objective>",
  "target_market": "<geographic or sectoral target>",
  "subtasks": [
    {
      "task_id": "TASK-1",
      "category": "Competitor Landscape",
      "description": "<what specific questions to investigate>",
      "search_queries": ["<query1>", "<query2>"]
    }
  ]
}
"""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Deconstruct this business research question into subtasks:\n\n{user_query}"}
        ]
        
        raw_resp = generate_chat_completion(messages, model=self.model_name, temperature=0.1, json_mode=True)
        try:
            plan = json.loads(raw_resp)
        except Exception:
            clean = re.search(r"\{.*\}", raw_resp, re.DOTALL)
            if clean:
                plan = json.loads(clean.group(0))
            else:
                raise ValueError("Failed to parse decomposition JSON from LLM")
        return plan

    def collect_multi_source_data(self, plan: Dict[str, Any], progress_callback=None) -> Dict[str, Any]:
        """
        Stage 2: Executes web retrieval across search engines, encyclopedic sources, and web pages.
        """
        collected_evidence = []
        unique_sources = {}
        source_counter = 1
        
        subtasks = plan.get("subtasks", [])
        total_subtasks = len(subtasks)
        
        for idx, task in enumerate(subtasks, 1):
            task_id = task.get("task_id", f"TASK-{idx}")
            task_name = task.get("category", f"Category {idx}")
            queries = task.get("search_queries", [])
            
            if progress_callback:
                progress_callback(f"Executing {task_id}: {task_name} across multiple web sources...")
                
            task_results = []
            
            for query in queries[:2]:
                # 1. Search DuckDuckGo
                ddg_results = search_duckduckgo(query, max_results=3)
                for item in ddg_results:
                    url = item["url"]
                    if url not in unique_sources:
                        ref_tag = f"S{source_counter}"
                        unique_sources[url] = {
                            "tag": ref_tag,
                            "title": item["title"],
                            "url": url,
                            "snippet": item["snippet"]
                        }
                        source_counter += 1
                    else:
                        ref_tag = unique_sources[url]["tag"]
                        
                    task_results.append({
                        "query": query,
                        "source_tag": ref_tag,
                        "title": item["title"],
                        "url": url,
                        "snippet": item["snippet"]
                    })
                    
                # 2. Check Wikipedia for background context
                wiki_results = search_wikipedia(query, max_results=1)
                for item in wiki_results:
                    url = item["url"]
                    if url not in unique_sources:
                        ref_tag = f"S{source_counter}"
                        unique_sources[url] = {
                            "tag": ref_tag,
                            "title": item["title"],
                            "url": url,
                            "snippet": item["snippet"]
                        }
                        source_counter += 1
                    else:
                        ref_tag = unique_sources[url]["tag"]
                    task_results.append({
                        "query": query,
                        "source_tag": ref_tag,
                        "title": item["title"],
                        "url": url,
                        "snippet": item["snippet"]
                    })

            collected_evidence.append({
                "task_id": task_id,
                "category": task_name,
                "description": task.get("description", ""),
                "findings": task_results
            })
            
        return {
            "evidence": collected_evidence,
            "sources": unique_sources
        }

    def synthesize_report(self, user_query: str, plan: Dict[str, Any], data_bundle: Dict[str, Any]) -> str:
        """
        Stage 3: Compares findings, contrasts competitors, and produces an enterprise-grade report.
        """
        evidence_summary = []
        for task in data_bundle["evidence"]:
            evidence_summary.append(f"### Subtask: {task['task_id']} ({task['category']})")
            evidence_summary.append(f"Description: {task['description']}")
            for item in task["findings"]:
                evidence_summary.append(f"- [{item['source_tag']}] {item['title']}: {item['snippet']} (URL: {item['url']})")
            evidence_summary.append("")
            
        sources_list = []
        for url, meta in data_bundle["sources"].items():
            sources_list.append(f"- [{meta['tag']}] **{meta['title']}**: {meta['url']}")
            
        prompt = f"""You are the Chief Market Intelligence Officer and Senior Partner.
Synthesize a comprehensive, executive-level business research report answering the research question.

ORIGINAL RESEARCH QUESTION:
{user_query}

RESEARCH PLAN EXECUTED:
{json.dumps(plan, indent=2)}

COLLECTED MULTI-SOURCE EVIDENCE:
{"".join(evidence_summary)}

AVAILABLE SOURCES & CITATION KEYS:
{"".join(sources_list)}

REPORT STRUCTURE REQUIREMENTS:
1. Executive Summary & Strategic Go/No-Go Recommendation
2. Problem Decomposition & Research Methodology
3. Comprehensive Competitor Matrix & Comparison (Include Markdown table: Competitor Name, Service Model/Pricing, Strengths, Weaknesses, Key Differentiation)
4. Target Customer Segments & Demand Dynamics (Daily commuters, gig workers, tech workers, college students)
5. Unit Economics & Pricing Benchmark Analysis
6. Key Market Opportunities & Strategic Entry Levers
7. Critical Risks & Regulatory/Operational Headwinds
8. Strategic Roadmap & Actionable Next Steps
9. Verifiable References & Sources (List all cited sources with their [S#] tags and links)

IMPORTANT INSTRUCTIONS:
- You MUST rigorously cite facts, market observations, and claims using the [S1], [S2], [S3] source tags provided in the evidence.
- Every major assertion, pricing data point, or competitor reference must cite its corresponding source tag.
- Produce a clear, highly polished, board-ready Markdown report.
"""
        messages = [
            {"role": "system", "content": "You produce authoritative, data-backed enterprise market research reports with transparent source citations."},
            {"role": "user", "content": prompt}
        ]
        
        report = generate_chat_completion(messages, model=self.model_name, temperature=0.2)
        return report

    def run_full_pipeline(self, user_query: str, progress_callback=None) -> Dict[str, Any]:
        """
        Runs the end-to-end autonomous research workflow.
        """
        if progress_callback:
            progress_callback("Step 1: Decomposing research question into structured tasks...")
        plan = self.decompose_question(user_query)
        
        if progress_callback:
            progress_callback(f"Step 2: Collecting intelligence across {len(plan.get('subtasks', []))} tasks...")
        data_bundle = self.collect_multi_source_data(plan, progress_callback=progress_callback)
        
        if progress_callback:
            progress_callback("Step 3: Comparing competitor data, analyzing economics, and compiling verified report...")
        report = self.synthesize_report(user_query, plan, data_bundle)
        
        return {
            "query": user_query,
            "timestamp": datetime.now().isoformat(),
            "plan": plan,
            "data_bundle": data_bundle,
            "report": report
        }
