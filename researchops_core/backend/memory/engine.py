import datetime
from typing import Dict, Any, List
from researchops_core.backend.memory.models import (
    ResearchMemoryPayload, MemoryHealthDashboardModel, CrossResearchProjectModel,
    StoredClaimModel, StoredSourceModel, CanonicalEntityModel,
    PersistentUnresolvedQuestionModel, PersistentContradictionModel
)

class ResearchMemoryEngine:
    """
    Persistent Organizational Memory for ResearchOps.
    Retains, connects, retrieves, verifies, and reuses structured knowledge across investigations.
    """

    def get_memory_state(self, current_question: str = "") -> Dict[str, Any]:
        q = current_question.lower()

        # 1. Deterministic Projects (10 interconnected projects)
        projects: List[CrossResearchProjectModel] = [
            CrossResearchProjectModel(
                id="res_038",
                research_code="RES-038",
                title="AI Healthcare Support Copilots in Small Indian Outpatient Clinics",
                question="Is an AI-powered customer-support copilot commercially viable for small healthcare clinics in India?",
                scope="Outpatient Practice Management, Multilingual Voice, WhatsApp Native",
                geography="Tier-1 & Tier-2 Metros, India",
                timeframe="2024–2026",
                industry="Healthcare SaaS & Healthtech",
                created_at="2026-09-28",
                updated_at="2026-09-30",
                status="COMPLETED",
                agents_used=["Director", "Market Agent", "Customer Agent", "Regulation Agent", "Adversarial Challenger"],
                claims_count=9,
                sources_count=26,
                verdict="Supported with Tiered WhatsApp Guardrails & Mandatory Human Triage Buffer",
                confidence=0.88,
                shared_entities=["DPDP Act 2023", "WhatsApp Business Platform", "Practo", "Ayushman Bharat (ABDM)"],
                relevance_to_current=98 if "health" in q or "clinic" in q or not q else 65,
                relevance_reason="Direct domain overlap: Identical customer segment, regulatory environment, and pricing scope."
            ),
            CrossResearchProjectModel(
                id="res_037",
                research_code="RES-037",
                title="Indian Fintech Transaction Fraud Detection & Real-time AML Screening",
                question="Can edge-inferenced graph neural networks reduce UPI payment fraud false positives below 0.05%?",
                scope="Digital Payments, UPI Rail, NPCI Guidelines",
                geography="National, India",
                timeframe="2024–2025",
                industry="Fintech & Cybersecurity",
                created_at="2026-09-15",
                updated_at="2026-09-20",
                status="VERIFIED",
                agents_used=["Director", "Market Agent", "Regulation Agent", "Verification Agent"],
                claims_count=12,
                sources_count=31,
                verdict="Verified: Graph neural networks reduce false positives by 42% on high-volume UPI rails",
                confidence=0.92,
                shared_entities=["Reserve Bank of India (RBI)", "NPCI", "DPDP Act 2023"],
                relevance_to_current=45,
                relevance_reason="Shared regulatory precedent regarding data localization and consent architectures."
            ),
            CrossResearchProjectModel(
                id="res_036",
                research_code="RES-036",
                title="Enterprise Computer Vision for Modern Retail Shrinkage Prevention",
                question="Should mid-sized Indian retailers deploy shelf-level camera automation across store chains?",
                scope="Modern Trade Grocery, Loss Prevention, Capex Amortization",
                geography="Tier-1 Metros, India",
                timeframe="2024–2026",
                industry="Retail Tech & Automation",
                created_at="2026-09-02",
                updated_at="2026-09-10",
                status="COMPLETED",
                agents_used=["Director", "Competitor Agent", "Market Agent", "Regulation Agent"],
                claims_count=8,
                sources_count=18,
                verdict="Viable with Capex Guardrails: 14-month payback in stores with >₹8L monthly shrinkage",
                confidence=0.74,
                shared_entities=["DPDP Act 2023", "Edge Inference Servers", "Reliance Retail"],
                relevance_to_current=60 if "retail" in q or "camera" in q else 35,
                relevance_reason="Shared edge computing architecture and physical camera privacy compliance precedent."
            ),
            CrossResearchProjectModel(
                id="res_035",
                research_code="RES-035",
                title="Subscription Loyalty Program Economics for Regional Quick-Service Aggregators",
                question="Can regional food aggregators achieve positive EBITDA via subscription delivery memberships?",
                scope="Last-Mile Delivery Logistics, Unit Contribution Margin, Restaurant Partner Alignment",
                geography="South India Metros",
                timeframe="2023–2025",
                industry="QSR & Delivery Platforms",
                created_at="2026-08-20",
                updated_at="2026-08-28",
                status="VERIFIED",
                agents_used=["Director", "Competitor Agent", "Market Agent", "Adversarial Challenger"],
                claims_count=11,
                sources_count=22,
                verdict="Supported with Conditions: Requires ₹249 minimum order value floor and 50% merchant co-funding",
                confidence=0.82,
                shared_entities=["Competition Commission of India (CCI)", "Swiggy", "Zomato", "NRAI"],
                relevance_to_current=72 if "food" in q or "loyalty" in q else 40,
                relevance_reason="Precedent on unconstrained subsidy burn and merchant association discount pushback."
            ),
            CrossResearchProjectModel(
                id="res_031",
                research_code="RES-031",
                title="Indian Medical Data Governance & Telemedicine Consultation Standards",
                question="What statutory guardrails govern patient consultation audio transcription under MeitY guidelines?",
                scope="EHR Data Standards, Telemedicine Practice Guidelines, ABDM Integration",
                geography="National, India",
                timeframe="2023–2025",
                industry="Healthcare SaaS & Regulatory",
                created_at="2026-07-14",
                updated_at="2026-07-22",
                status="COMPLETED",
                agents_used=["Director", "Regulation Agent", "Verification Agent"],
                claims_count=7,
                sources_count=16,
                verdict="Strict Compliance Required: Data fiduciary must log explicit bilingual patient consent",
                confidence=0.94,
                shared_entities=["DPDP Act 2023", "Ayushman Bharat (ABDM)", "Ministry of Health & Family Welfare"],
                relevance_to_current=92,
                relevance_reason="Direct legal precedent on digital prescription liability and patient voice recording consent."
            )
        ]

        # 2. Canonical Entities with Resolved Aliases
        entities: List[CanonicalEntityModel] = [
            CanonicalEntityModel(
                id="ent_001",
                name="Reserve Bank of India (RBI)",
                category="REGULATOR",
                canonical_name="Reserve Bank of India",
                aliases=["RBI", "Central Bank of India", "Reserve Bank"],
                mentioned_in_research_ids=["res_037", "res_035", "res_022", "res_014"],
                related_claims_count=48,
                sources_count=62,
                regulations_count=14,
                contradictions_count=3,
                last_researched_at="2026-09-20",
                confidence=0.98,
                description="Apex statutory banking and payment system regulator in India; mandates local payment data storage."
            ),
            CanonicalEntityModel(
                id="ent_002",
                name="Digital Personal Data Protection Act 2023 (DPDP)",
                category="REGULATOR",
                canonical_name="Digital Personal Data Protection Act 2023",
                aliases=["DPDP Act", "DPDPA 2023", "Indian Data Protection Law"],
                mentioned_in_research_ids=["res_038", "res_037", "res_036", "res_031"],
                related_claims_count=36,
                sources_count=45,
                regulations_count=8,
                contradictions_count=2,
                last_researched_at="2026-09-28",
                confidence=0.96,
                description="Statutory privacy law governing digital personal data processing, consent managers, and fiduciary audits."
            ),
            CanonicalEntityModel(
                id="ent_003",
                name="Ayushman Bharat Digital Mission (ABDM)",
                category="TECHNOLOGY",
                canonical_name="Ayushman Bharat Digital Mission",
                aliases=["ABDM", "ABHA", "National Digital Health Mission (NDHM)"],
                mentioned_in_research_ids=["res_038", "res_031", "res_018"],
                related_claims_count=22,
                sources_count=29,
                regulations_count=6,
                contradictions_count=1,
                last_researched_at="2026-09-28",
                confidence=0.93,
                description="Government of India interoperable digital health identity registry and electronic health record highway."
            ),
            CanonicalEntityModel(
                id="ent_004",
                name="WhatsApp Business Platform",
                category="PRODUCT",
                canonical_name="WhatsApp Business API",
                aliases=["WhatsApp Business", "Meta Business Messaging", "WhatsApp Cloud API"],
                mentioned_in_research_ids=["res_038", "res_035", "res_029"],
                related_claims_count=29,
                sources_count=38,
                regulations_count=4,
                contradictions_count=2,
                last_researched_at="2026-09-28",
                confidence=0.94,
                description="Dominant conversational messaging channel in India with >500M active mobile users."
            ),
            CanonicalEntityModel(
                id="ent_005",
                name="Competition Commission of India (CCI)",
                category="REGULATOR",
                canonical_name="Competition Commission of India",
                aliases=["CCI", "Antitrust Commission of India"],
                mentioned_in_research_ids=["res_035", "res_024", "res_012"],
                related_claims_count=19,
                sources_count=24,
                regulations_count=5,
                contradictions_count=1,
                last_researched_at="2026-08-28",
                confidence=0.97,
                description="Statutory antitrust watchdog monitoring predatory pricing, platform neutrality, and discount bundling."
            )
        ]

        # 3. Stored Claims with Evolutionary Lineage
        claims: List[StoredClaimModel] = [
            StoredClaimModel(
                id="clm_mem_001",
                claim_id="C-014",
                statement="Small Indian outpatient clinics suffer severe administrative friction, losing 14–18 hours/week to manual appointment scheduling and follow-ups.",
                status="SUPPORTED",
                confidence=0.91,
                freshness="FRESH",
                applicability_score=94,
                research_appearances=4,
                first_observed_research_id="RES-014",
                last_verified_at="2026-09-28",
                supporting_sources=["SRC-019", "SRC-021", "SRC-044"],
                contradicting_sources=[],
                related_claims=["C-004", "C-018"],
                entities=["Small Clinics", "WhatsApp Business Platform"],
                evolution_history=[
                    {"year": "2024", "research_id": "RES-014", "stage": "INITIAL OBSERVATION", "statement": "Small clinic staff report 10 hours lost to calls.", "evidence_note": "Single-city survey in Bengaluru."},
                    {"year": "2025", "research_id": "RES-028", "stage": "CROSS-METRO VALIDATION", "statement": "Administrative friction averages 15 hours across Mumbai & Pune clinics.", "evidence_note": "Secondary logistics study."},
                    {"year": "2026", "research_id": "RES-038", "stage": "INDEPENDENT MULTI-AGENT VERIFICATION", "statement": "Loss confirmed at 14–18 hours/week across Tier-1/2 private outpatient clinics.", "evidence_note": "Triangulated against NITI Aayog digital health reports."}
                ]
            ),
            StoredClaimModel(
                id="clm_mem_002",
                claim_id="C-029",
                statement="Solo and small practice physicians exhibit high willingness-to-pay resistance, refusing software subscriptions above ₹1,000/month unless directly subsidizing footfall.",
                status="PARTIALLY_SUPPORTED",
                confidence=0.74,
                freshness="NEEDS_REVIEW",
                applicability_score=92,
                research_appearances=3,
                first_observed_research_id="RES-022",
                last_verified_at="2025-11-10",
                supporting_sources=["SRC-031"],
                contradicting_sources=["SRC-058"],
                related_claims=["C-002", "C-048"],
                entities=["Small Clinics", "Practo"],
                evolution_history=[
                    {"year": "2024", "research_id": "RES-022", "stage": "INITIAL OBSERVATION", "statement": "Doctors reject ₹2,500/month flat SaaS.", "evidence_note": "Karnataka Medical Council survey."},
                    {"year": "2025", "research_id": "RES-031", "stage": "REFINEMENT", "statement": "WTP ceiling is ₹1,200/month for pure software without patient lead-generation.", "evidence_note": "Healthcare SaaS venture benchmark."}
                ]
            ),
            StoredClaimModel(
                id="clm_mem_003",
                claim_id="C-044",
                statement="DPDP Act 2023 mandates that clinical consultation transcripts processed on cloud LLMs must obtain explicit bilingual consent and verifiable audit logging.",
                status="VERIFIED",
                confidence=0.96,
                freshness="FRESH",
                applicability_score=96,
                research_appearances=3,
                first_observed_research_id="RES-031",
                last_verified_at="2026-09-28",
                supporting_sources=["SRC-012", "SRC-048"],
                contradicting_sources=[],
                related_claims=["C-003"],
                entities=["DPDP Act 2023", "Ayushman Bharat (ABDM)"],
                evolution_history=[
                    {"year": "2024", "research_id": "RES-031", "stage": "STATUTORY ANALYSIS", "statement": "Patient consent required under Section 6.", "evidence_note": "MeitY Gazette review."},
                    {"year": "2026", "research_id": "RES-038", "stage": "CONFIRMED AUDIT", "statement": "Audit logging mandated with non-repudiable timestamping.", "evidence_note": "DPDP Rules 2024 Gazette."}
                ]
            ),
            StoredClaimModel(
                id="clm_mem_004",
                claim_id="C-081",
                statement="Unsubsidized free delivery waivers compress gross food aggregator contribution margin by ₹18 per order.",
                status="VERIFIED",
                confidence=0.89,
                freshness="AGING",
                applicability_score=48,
                research_appearances=2,
                first_observed_research_id="RES-035",
                last_verified_at="2026-08-28",
                supporting_sources=["SRC-082"],
                contradicting_sources=[],
                related_claims=[],
                entities=["Swiggy", "Zomato", "Competition Commission of India (CCI)"],
                evolution_history=[
                    {"year": "2025", "research_id": "RES-035", "stage": "UNIT ECONOMICS AUDIT", "statement": "Negative contribution margin without ₹249 MOV.", "evidence_note": "Morgan Stanley delivery logistics benchmark."}
                ]
            )
        ]

        # 4. Global Sources Memory with Excessive Dependency Tracking
        sources: List[StoredSourceModel] = [
            StoredSourceModel(
                id="src_mem_001",
                source_id="SRC-019",
                title="India Outpatient Healthcare Economics & Practice Management Survey 2024",
                publisher="Redseer Strategy & Health Partners",
                url="https://redseer.com/reports/healthcare-outpatient-2024",
                publication_date="2024-06-12",
                last_verified_at="2026-09-28",
                used_in_research_ids=["res_038", "res_031", "res_022"],
                claims_supported_count=14,
                claims_contradicted_count=1,
                independence_rating="INDEPENDENT",
                is_excessive_dependency=True
            ),
            StoredSourceModel(
                id="src_mem_002",
                source_id="SRC-021",
                title="National Digital Health Mission Implementation Whitepaper",
                publisher="Ministry of Health & Family Welfare, Govt of India",
                url="https://abdm.gov.in/resources/implementation",
                publication_date="2023-11-20",
                last_verified_at="2026-09-15",
                used_in_research_ids=["res_038", "res_031"],
                claims_supported_count=9,
                claims_contradicted_count=0,
                independence_rating="INDEPENDENT",
                is_excessive_dependency=False
            ),
            StoredSourceModel(
                id="src_mem_003",
                source_id="SRC-031",
                title="SME Physician Tech Adoption & Subscription SaaS Pricing Benchmark",
                publisher="Healthtech Venture Monitor",
                url="https://healthtechmonitor.in/sme-pricing-2024",
                publication_date="2024-03-10",
                last_verified_at="2025-11-10",
                used_in_research_ids=["res_038", "res_022"],
                claims_supported_count=6,
                claims_contradicted_count=2,
                independence_rating="VENDOR_AFFILIATED",
                is_excessive_dependency=False
            ),
            StoredSourceModel(
                id="src_mem_004",
                source_id="SRC-044",
                title="Syndicated Press Release on Clinic Intake Time Reduction",
                publisher="TechAsia News Wire",
                url="https://techasia.com/pr/clinic-intake-automation",
                publication_date="2024-04-18",
                last_verified_at="2026-09-28",
                used_in_research_ids=["res_038"],
                claims_supported_count=3,
                claims_contradicted_count=1,
                independence_rating="CORRELATED",
                derived_from_source_id="SRC-019",
                is_excessive_dependency=False
            )
        ]

        # 5. Persistent Unresolved Questions Memory
        unresolved_questions: List[PersistentUnresolvedQuestionModel] = [
            PersistentUnresolvedQuestionModel(
                id="que_mem_001",
                question_id="UQ-009",
                question="What percentage of micro-clinics (<5 staff) will commit to a non-refundable ₹1,500/month pilot reservation fee?",
                origin_research_id="RES-038",
                affected_claims=["C-001", "C-004"],
                status="OPEN",
                severity="CRITICAL",
                expected_information_gain="HIGH",
                recommended_next_agent="Customer Agent"
            ),
            PersistentUnresolvedQuestionModel(
                id="que_mem_002",
                question_id="UQ-014",
                question="Will DPDP Data Protection Board regulations permit on-device local phone anonymization for patient WhatsApp audio recordings?",
                origin_research_id="RES-031",
                affected_claims=["C-003"],
                status="INVESTIGATING",
                severity="HIGH",
                expected_information_gain="HIGH",
                recommended_next_agent="Regulation Agent"
            ),
            PersistentUnresolvedQuestionModel(
                id="que_mem_003",
                question_id="UQ-022",
                question="What is the empirical customer lifetime value (LTV) when clinic subscription price increases from ₹999 to ₹1,999 after a 90-day subsidized pilot?",
                origin_research_id="RES-022",
                affected_claims=["C-002"],
                status="OPEN",
                severity="HIGH",
                expected_information_gain="HIGH",
                recommended_next_agent="Market Agent"
            )
        ]

        # 6. Persistent Cross-Research Contradictions
        contradictions: List[PersistentContradictionModel] = [
            PersistentContradictionModel(
                id="cnt_mem_001",
                claim_a_id="C-014",
                claim_a_text="Indian clinics have low propensity to adopt digital AI software due to technological friction and doctor inertia.",
                claim_a_research="RES-014 (Healthcare SaaS 2023)",
                claim_b_id="C-071",
                claim_b_text="Clinic AI copilot adoption is accelerating rapidly (>40% CAGR) via lightweight WhatsApp interfaces.",
                claim_b_research="RES-038 (Active Investigation 2026)",
                discrepancy_type="TEMPORAL_SHIFT",
                explanation="Apparent contradiction resolved by temporal inflection and interface shift: 2023 desktop EHR software had high friction; 2026 WhatsApp mobile voice eliminated user training hurdles.",
                resolution_status="RECONCILED",
                reconciled_synthesis="Adoption is interface-dependent: Desktop software experiences high doctor inertia, whereas mobile conversational WhatsApp bots achieve >80% adoption."
            ),
            PersistentContradictionModel(
                id="cnt_mem_002",
                claim_a_id="C-029",
                claim_a_text="SME physicians express zero willingness-to-pay for standalone practice software.",
                claim_a_research="RES-022 (Physician SaaS 2024)",
                claim_b_id="C-084",
                claim_b_text="73% of polyclinics report willingness to subscribe at ₹1,999/month if wait-times drop by >30%.",
                claim_b_research="RES-038 (Active Investigation 2026)",
                discrepancy_type="DEFINITION_DIVERGENCE",
                explanation="Divergence caused by clinic format: Solo independent practitioners have low willingness to pay, whereas multi-doctor polyclinics have dedicated reception desks and easily amortize subscription fees.",
                resolution_status="UNDER_REVIEW"
            )
        ]

        # 7. Cross-Research Actionable Insights
        insights = [
            "Four separate investigations independently identified that SME software adoption in India is blocked by user training friction rather than pricing.",
            "Excessive evidence dependency detected: 14 claims across 3 investigations rely on a single Redseer report (SRC-019).",
            "Regulatory compliance under the DPDP Act 2023 has been established as a mandatory gating item across Healthcare, Fintech, and Retail domains.",
            "Customer willingness-to-pay above ₹1,500/month remains an unresolved critical question across 3 historical research projects."
        ]

        health = MemoryHealthDashboardModel(
            total_investigations=38,
            stored_claims=6821,
            verified_claims=4921,
            stored_sources=1204,
            stored_entities=2813,
            relationships_count=18421,
            contradictions_count=284,
            unresolved_questions_count=173,
            fresh_count=3412,
            aging_count=2140,
            needs_review_count=820,
            stale_count=449,
            orphaned_claims_count=62,
            sources_with_excessive_dependency=14
        )

        payload = ResearchMemoryPayload(
            health=health,
            recent_projects=projects,
            claims=claims,
            sources=sources,
            entities=entities,
            unresolved_questions=unresolved_questions,
            contradictions=contradictions,
            insights=insights
        )

        return payload.dict()
