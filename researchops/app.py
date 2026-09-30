"""
ResearchOps Interactive Dashboard
Domain 1 - Enterprise & Business Operations
Autonomous Research Agent Demonstration
"""

import streamlit as st
import json
import os
import sys
from datetime import datetime

# Add root directory to python path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from researchops.agent import ResearchOpsAgent

st.set_page_config(
    page_title="ResearchOps - Autonomous Enterprise Research Agent",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1E293B;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #64748B;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
    }
    .source-box {
        background-color: #F1F5F9;
        border-left: 4px solid #3B82F6;
        padding: 10px 14px;
        margin: 6px 0;
        border-radius: 0 6px 6px 0;
    }
</style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-header">🔍 ResearchOps: Autonomous Research Agent</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Domain 1: Enterprise & Business Operations | Deconstruct • Gather Multi-Source Data • Cross-Compare • Cite & Report</div>', unsafe_allow_html=True)

# Sidebar Configuration
with st.sidebar:
    st.header("⚙️ Agent Settings")
    st.info("System cloned from `D:\\webman` into `D:\\webman_researchops`. Original `D:\\webman` remains pristine.")
    
    model_option = st.selectbox(
        "Reasoning Model Engine",
        ["qwen/qwen3.8-27b", "openai/gpt-oss-120b"],
        index=0
    )
    
    st.markdown("---")
    st.markdown("### 📋 Preset Scenarios")
    preset = st.radio(
        "Select Problem Scenario:",
        [
            "Bengaluru Electric Scooter Subscription Service",
            "B2B SaaS Cloud Cost Optimization Market in India",
            "Quick-Commerce Dark Store Unit Economics in Tier-2 Cities",
            "Custom Inquiry"
        ]
    )
    
    preset_scenarios = {
        "Bengaluru Electric Scooter Subscription Service": (
            "A company wants to know whether it should launch an electric scooter subscription service in Bengaluru. "
            "The agent researches existing competitors (e.g. Yulu, Bounce, Ather, Ola, Zypp), their prices, available services, "
            "customer segments, battery swapping infrastructure, and relevant market information. "
            "It then compares the collected information and prepares a report showing the market situation, competitors, "
            "unit economics, possible opportunities, and operational risks, providing verifiable sources."
        ),
        "B2B SaaS Cloud Cost Optimization Market in India": (
            "Research whether a startup should build an autonomous FinOps & Cloud Cost Optimization platform for mid-market Indian enterprises. Analyze competitors, pricing models, market size, and customer segments."
        ),
        "Quick-Commerce Dark Store Unit Economics in Tier-2 Cities": (
            "Investigate the market viability, competitor landscape (Blinkit, Zepto, Swiggy Instamart), and unit economics of establishing quick-commerce dark stores in Indian Tier-2 cities."
        ),
        "Custom Inquiry": ""
    }

# Input Section
default_prompt = preset_scenarios[preset]
user_query = st.text_area(
    "Enter Business Research Question:",
    value=default_prompt,
    height=120,
    placeholder="Enter an open-ended strategic market, product, or competitor research question..."
)

col_run, col_clear = st.columns([1, 5])
with col_run:
    run_btn = st.button("🚀 Start Autonomous Research", type="primary", use_container_width=True)

if run_btn:
    if not user_query.strip():
        st.warning("Please enter a research question first.")
    else:
        status_container = st.status("🤖 Autonomous Agent Running...", expanded=True)
        agent = ResearchOpsAgent(model_name=model_option)
        
        # Step 1: Decompose
        status_container.write("📋 **Step 1:** Decomposing research question into structured subtasks...")
        plan = agent.decompose_question(user_query)
        st.session_state["plan"] = plan
        status_container.write(f"✅ Generated {len(plan.get('subtasks', []))} targeted research subtasks with automated search queries.")
        
        # Step 2: Multi-Source Gathering
        status_container.write("🌐 **Step 2:** Executing multi-source search across DuckDuckGo, Wikipedia & live web sources...")
        data_bundle = agent.collect_multi_source_data(
            plan, 
            progress_callback=lambda msg: status_container.write(f"  • {msg}")
        )
        st.session_state["data_bundle"] = data_bundle
        status_container.write(f"✅ Retrieved evidence from {len(data_bundle.get('sources', {}))} distinct verified sources.")
        
        # Step 3: Synthesis & Report
        status_container.write("🧠 **Step 3:** Cross-comparing findings, benchmarking competitors, and synthesizing executive report...")
        report = agent.synthesize_report(user_query, plan, data_bundle)
        st.session_state["report"] = report
        
        status_container.update(label="🎯 Research Completed Successfully!", state="complete", expanded=False)
        st.success("Autonomous Market Research Report is ready!")

# Render Results
if "report" in st.session_state and "plan" in st.session_state:
    tab1, tab2, tab3 = st.tabs(["📑 Strategic Intelligence Report", "🧩 Task Decomposition", "🔗 Verified Multi-Source Evidence"])
    
    with tab1:
        st.markdown(st.session_state["report"])
        
        # Download buttons
        col_d1, col_d2 = st.columns(2)
        with col_d1:
            st.download_button(
                label="📥 Download Report (.md)",
                data=st.session_state["report"],
                file_name=f"ResearchOps_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md",
                mime="text/markdown"
            )
        with col_d2:
            export_payload = {
                "plan": st.session_state.get("plan"),
                "sources": st.session_state.get("data_bundle", {}).get("sources", {}),
                "report": st.session_state.get("report")
            }
            st.download_button(
                label="📥 Export Full Audit Data (.json)",
                data=json.dumps(export_payload, indent=2),
                file_name=f"ResearchOps_Audit_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                mime="application/json"
            )
            
    with tab2:
        st.subheader("Automated Task Decomposition & Search Strategy")
        plan = st.session_state["plan"]
        st.write(f"**Objective:** {plan.get('research_objective')}")
        st.write(f"**Target Market:** {plan.get('target_market')}")
        
        for task in plan.get("subtasks", []):
            with st.expander(f"{task.get('task_id')}: {task.get('category')}"):
                st.write(f"**Goal:** {task.get('description')}")
                st.write("**Dispatched Search Queries:**")
                for q in task.get("search_queries", []):
                    st.code(q, language="text")
                    
    with tab3:
        st.subheader("Audited Multi-Source Information Matrix")
        data_bundle = st.session_state.get("data_bundle", {})
        sources = data_bundle.get("sources", {})
        
        st.write(f"**Total Distinct Sources Captured:** {len(sources)}")
        for url, meta in sources.items():
            st.markdown(f"""
            <div class="source-box">
                <strong>[{meta['tag']}] <a href="{url}" target="_blank">{meta['title']}</a></strong><br/>
                <span style="color: #475569; font-size: 0.9rem;">{meta['snippet']}</span><br/>
                <small style="color: #0284C7;">Source URL: {url}</small>
            </div>
            """, unsafe_allow_html=True)
