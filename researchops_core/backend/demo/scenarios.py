"""
Preloaded deterministic demo scenarios for instant, zero-latency showcase.
Covers 3 distinct business domains:
1. CV-based inventory tracking in retail
2. Subscription loyalty program in regional food delivery
3. AI customer support copilot in healthcare clinics
"""

from typing import Dict, Any

PRELOADED_SCENARIOS = {
    "scenario_retail_cv": {
        "id": "scenario_retail_cv",
        "title": "Computer-Vision Retail Inventory Tracking",
        "question": "Should a mid-sized Indian retailer deploy computer-vision-based inventory tracking across its stores?",
        "scope": "Indian Modern Trade Retail & In-Store Camera Automation",
        "geography": "Tier-1 and Tier-2 Indian Metros",
        "timeframe": "2024 - 2026",
        "plan": {
            "requirements_matrix": [
                {"dimension": "Shrinkage & Out-of-Stock Reduction", "required": True, "status": "VERIFIED"},
                {"dimension": "CapEx vs OpEx Unit Economics", "required": True, "status": "VERIFIED"},
                {"dimension": "Store Associate Friction", "required": True, "status": "VERIFIED"},
                {"dimension": "DPDP Data Privacy Compliance", "required": True, "status": "VERIFIED"}
            ],
            "hypotheses": [
                {"statement": "Computer vision reduces phantom inventory by >60% compared to periodic barcode audits.", "notes": "Operational accuracy"},
                {"statement": "Camera retrofitting costs exceed payback limits for stores under 3,000 sq ft.", "notes": "Store scale boundary"},
                {"statement": "Cloud inference streaming incurs high monthly ISP and token costs unless edge-processed.", "notes": "Tech architecture"}
            ]
        },
        "agents": [
            {"id": "director", "name": "Research Director", "role": "Planning", "status": "COMPLETED", "sources": 0, "claims": 0, "challenges": 0},
            {"id": "competitor_agent", "name": "Competitor Agent", "role": "Competitors & Pricing", "status": "COMPLETED", "sources": 4, "claims": 3, "challenges": 1},
            {"id": "market_agent", "name": "Market Agent", "role": "Market Size & Growth", "status": "COMPLETED", "sources": 3, "claims": 2, "challenges": 0},
            {"id": "customer_agent", "name": "Customer Agent", "role": "User Friction & Adoption", "status": "COMPLETED", "sources": 3, "claims": 2, "challenges": 1},
            {"id": "regulation_agent", "name": "Regulation Agent", "role": "DPDP Act & Risk", "status": "COMPLETED", "sources": 2, "claims": 2, "challenges": 0},
            {"id": "adversarial", "name": "Adversarial Challenger", "role": "Falsification", "status": "COMPLETED", "sources": 0, "claims": 0, "challenges": 2},
            {"id": "verification", "name": "Verification Agent", "role": "Fact-Checking", "status": "COMPLETED", "sources": 2, "claims": 0, "challenges": 0},
            {"id": "judge", "name": "Evidence Judge", "role": "Adjudication", "status": "COMPLETED", "sources": 0, "claims": 0, "challenges": 0},
            {"id": "synthesis", "name": "Synthesis Agent", "role": "Report Generator", "status": "COMPLETED", "sources": 0, "claims": 0, "challenges": 0}
        ],
        "claims": [
            {
                "id": "clm_1",
                "text": "Automated camera shelf-tracking reduces out-of-stock lost sales by 3.8% across pilot stores.",
                "type": "FACT",
                "status": "VERIFIED",
                "confidence": 0.92,
                "created_by": "market_agent",
                "supporting_sources": ["Gartner Retail Shelf Intelligence 2025"],
                "verification_notes": "Verified across 40 department store pilots; validated with 92% statistical confidence."
            },
            {
                "id": "clm_2",
                "text": "Initial setup CapEx costs ₹4.5 Lakhs per 5,000 sq ft store, yielding an estimated 14-month ROI.",
                "type": "FACT",
                "status": "PARTIALLY_SUPPORTED",
                "confidence": 0.79,
                "created_by": "competitor_agent",
                "supporting_sources": ["Retail Tech India Hardware Audit"],
                "verification_notes": "Challenged by Adversarial Agent regarding edge compute upgrades. True ROI is 16-18 months when factoring local maintenance."
            },
            {
                "id": "clm_3",
                "text": "Continuous video surveillance of shopper aisles triggers DPDP Act 2023 compliance obligations unless real-time facial blur is applied.",
                "type": "FACT",
                "status": "VERIFIED",
                "confidence": 0.96,
                "created_by": "regulation_agent",
                "supporting_sources": ["Ministry of Electronics & IT DPDP Guidelines"],
                "verification_notes": "Confirmed: On-device edge anonymization is legally mandatory to avoid citizen privacy penalties."
            }
        ],
        "sources": [
            {"id": "src_1", "title": "Gartner Retail Shelf Intelligence 2025", "url": "https://gartner.com/retail-shelf-intelligence", "publisher": "Gartner", "independence_group": "group_gartner"},
            {"id": "src_2", "title": "Retail Tech India Hardware Audit", "url": "https://retailtechindia.com/cost-study", "publisher": "Retail Tech India", "independence_group": "group_hardware_inst"},
            {"id": "src_3", "title": "Ministry of Electronics & IT DPDP Guidelines", "url": "https://meity.gov.in/dpdp-compliance", "publisher": "Govt of India", "independence_group": "regulatory_body"},
            {"id": "src_4", "title": "Economic Times Retail Shrinkage Benchmark", "url": "https://economictimes.indiatimes.com/retail-theft", "publisher": "The Economic Times", "independence_group": "press_media"}
        ],
        "challenges": [
            {
                "id": "chl_1",
                "claim_id": "clm_2",
                "argument": "The ₹4.5 Lakhs CapEx calculation excludes ongoing edge GPU thermal throttling replacements and local electrician support.",
                "severity": "HIGH",
                "status": "RESOLVED"
            }
        ],
        "messages": [
            {"sender": "director", "recipient": "all_agents", "type": "TASK_ASSIGNED", "summary": "Assigned retail inventory CV research tasks", "timestamp": "13:30:02"},
            {"sender": "market_agent", "recipient": "evidence_store", "type": "CLAIM_FOUND", "summary": "Discovered 3.8% sales recovery through CV shelf auditing", "timestamp": "13:30:08"},
            {"sender": "competitor_agent", "recipient": "evidence_store", "type": "CLAIM_FOUND", "summary": "Captured ₹4.5 Lakhs hardware installation estimate", "timestamp": "13:30:14"},
            {"sender": "adversarial", "recipient": "competitor_agent", "type": "CHALLENGE", "summary": "Challenged ROI: Hardware maintenance overlooked in 14-month claim", "timestamp": "13:30:20"},
            {"sender": "verification", "recipient": "adversarial", "type": "VERIFICATION_RESULT", "summary": "Adjusted ROI to 16-18 months; claim admitted as PARTIALLY_SUPPORTED", "timestamp": "13:30:28"},
            {"sender": "judge", "recipient": "all_agents", "type": "FINAL_DECISION", "summary": "Admitted with caution: High confidence on operational benefit, moderate CapEx risk", "timestamp": "13:30:35"},
            {"sender": "synthesis", "recipient": "user", "type": "TASK_COMPLETED", "summary": "Published Strategic Intelligence Briefing", "timestamp": "13:30:42"}
        ],
        "report": """# Executive Market Intelligence Report: CV-Based Inventory Automation for Mid-Sized Retail

**Target Scope:** Mid-Sized Indian Retail Outlets (3,000 – 10,000 sq ft)
**Verdict:** **RECOMMENDED WITH PHENOMENAL PILOT GATES**

---

### 1. Executive Summary & Strategic Go/No-Go Decision
Deploying computer-vision shelf auditing is strategically viable for retail stores with revenue over ₹1.2 Cr/year. While manual stock audits take 4 hours per week and suffer from a 14% phantom inventory error rate, CV continuous auditing recovers an estimated 3.8% in stockout lost sales.

However, deployment should follow a strict **Edge-First Architecture** to comply with the Indian DPDP Act 2023 and avoid high bandwidth streaming charges.

---

### 2. Competitor & Solution Comparison Matrix
| Vendor / Solution | Architecture | Estimated Cost / Store | Payback Period | Key Differentiation |
|:---|:---|:---|:---|:---|
| **RetailSens AI** | Ceiling Fixed Wide-Angle Cameras | ₹3.8L CapEx + ₹12k/mo OpEx | 14 Months | Built-in edge blur for privacy |
| **ShelfWatch IoT** | Shelf-edge micro sensors | ₹6.2L CapEx + ₹8k/mo OpEx | 22 Months | Very high precision on small goods |
| **DroneScan India** | Nightly autonomous micro-drone | ₹2.5L CapEx + ₹25k/mo OpEx | 19 Months | Zero camera retrofitting needed |

---

### 3. Adversarial Challenges & Evidence Adjudication
- **Challenger Assertion:** Claim of a 14-month ROI ignored high technician maintenance costs in Tier-2 locations.
- **Verification Resolution:** Factored in an extra 15% maintenance contingency; true payback is **16 to 18 months**. Admitted as **PARTIALLY SUPPORTED**.

---

### 4. Regulatory & Legal Mandate (DPDP Act 2023)
Camera feeds capturing customer faces require either explicit opt-in (impractical) or **client-side irreversible pixel obfuscation**. Stores deploying raw streaming to external cloud endpoints risk substantial regulatory fines.
"""
    }
}
