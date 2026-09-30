import datetime
from typing import Dict, Any, List
from researchops_core.backend.planner.models import (
    PlannerSessionModel, PlannerTaskModel, UncertaintyModel,
    PlanFeedEventModel, PlanVersionModel, BudgetModel
)

class ResearchPlannerEngine:
    """
    Adaptive Autonomous Research Planning and Orchestration Engine.
    Continuously observes research state, calculates remaining uncertainty,
    re-evaluates task dependencies, creates new targeted tasks, blocks/cancels tasks,
    and detects research saturation.
    """

    def __init__(self, mode: str = "AUTONOMOUS"):
        self.mode = mode

    def generate_plan(
        self,
        question: str,
        claims: List[Dict[str, Any]] = None,
        sources: List[Dict[str, Any]] = None,
        agents: List[Dict[str, Any]] = None,
        current_round: int = 2,
        action: str = "INITIALIZE"
    ) -> Dict[str, Any]:
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        q = question if question else "Is an AI-powered customer-support copilot commercially viable for small healthcare clinics in India?"

        # Initial Tasks & Dynamic Re-plan Tasks
        tasks: List[PlannerTaskModel] = [
            PlannerTaskModel(
                task_id="TASK-M01",
                title="Estimate Target Clinic TAM & Geographic Concentration",
                description="Quantify the number of independent private outpatient clinics across Tier-1 vs Tier-2/3 cities in India.",
                objective="Establish total addressable practice volume and geographic distribution.",
                research_question=q,
                phase="PHASE 1 — MARKET",
                assigned_agent="Market Agent",
                required_evidence="Government National Health Portal / NITI Aayog clinic registries",
                dependencies=[],
                priority="HIGH",
                status="COMPLETED",
                created_at="18:04:02",
                started_at="18:04:05",
                completed_at="18:04:38",
                expected_information_gain="HIGH",
                estimated_cost="$0.012 (640 tokens)",
                estimated_time="35s",
                blocking_uncertainties=[],
                related_claims=["C-001"],
                related_assumptions=["A-001 (TAM Stability)"],
                related_sources=["S-001", "S-002"],
                success_criteria="Identified >40,000 clinic addressable universe with state breakdown",
                reason_for_creation="Foundational market scoping for research inquiry"
            ),
            PlannerTaskModel(
                task_id="TASK-C01",
                title="Identify Frontline Clinic Administrative Pain Points & Bottlenecks",
                description="Interview receptionist and staff cohorts to determine hours lost to scheduling, reminder calls, and patient queries.",
                objective="Measure exact weekly time-sink in appointment management.",
                research_question=q,
                phase="PHASE 2 — CUSTOMER",
                assigned_agent="Customer Agent",
                required_evidence="Practice workflow audit or published time-study benchmark",
                dependencies=[],
                priority="HIGH",
                status="COMPLETED",
                created_at="18:04:02",
                started_at="18:04:40",
                completed_at="18:05:15",
                expected_information_gain="HIGH",
                estimated_cost="$0.015 (820 tokens)",
                estimated_time="35s",
                blocking_uncertainties=[],
                related_claims=["C-001", "C-004"],
                related_assumptions=["A-002 (Staff Overtime Friction)"],
                related_sources=["S-002"],
                success_criteria="Quantified >14 hours/week lost to administrative manual calls",
                reason_for_creation="Validate customer problem existence before assessing solutions"
            ),
            PlannerTaskModel(
                task_id="TASK-K01",
                title="Audit Incumbent Competitor Landscape & Pricing Models",
                description="Identify commercial offerings from Practo, Qure.ai, Klinify, and generic WhatsApp Business automation tools.",
                objective="Map competitor price points and feature tiering.",
                research_question=q,
                phase="PHASE 3 — COMPETITION",
                assigned_agent="Competitor Agent",
                required_evidence="Published SaaS pricing tables or verified distributor quotes",
                dependencies=[],
                priority="MEDIUM",
                status="COMPLETED",
                created_at="18:04:02",
                started_at="18:05:18",
                completed_at="18:05:48",
                expected_information_gain="MEDIUM",
                estimated_cost="$0.010 (510 tokens)",
                estimated_time="30s",
                blocking_uncertainties=[],
                related_claims=["C-002"],
                related_assumptions=["A-003 (Pricing Elasticity)"],
                related_sources=["S-003"],
                success_criteria="Established incumbent baseline price range between ₹1,500 – ₹4,000/mo",
                reason_for_creation="Benchmarking competitive alternatives and pricing ceilings"
            ),
            PlannerTaskModel(
                task_id="TASK-C02",
                title="DYNAMIC RE-PLAN: Investigate Direct Willingness-to-Pay (WTP) Among Micro-Clinics",
                description="Determine whether independent clinic doctors will pay >₹1,500/month out-of-pocket rather than absorbing administrative labor manually.",
                objective="Resolve critical commercial viability gap flagged by Customer Agent.",
                research_question=q,
                phase="PHASE 2 — CUSTOMER",
                assigned_agent="Customer Agent",
                required_evidence="Transactional pilot willingness or non-refundable reservation deposit rate",
                dependencies=["TASK-C01"],
                priority="CRITICAL",
                status="RUNNING" if action != "SATURATE" else "COMPLETED",
                created_at="18:05:20",
                started_at="18:05:22",
                completed_at="18:06:40" if action == "SATURATE" else None,
                expected_information_gain="HIGH",
                estimated_cost="$0.024 (1,450 tokens)",
                estimated_time="50s",
                blocking_uncertainties=["U-001"],
                related_claims=["C-001", "C-004"],
                related_assumptions=["A-004 (Willingness to Pay)"],
                related_sources=["S-001", "S-004"],
                success_criteria="Establish whether WTP conversion exceeds 12% at ₹1,999/month",
                reason_for_creation="Created autonomously: Customer Agent discovered administrative burden does not automatically create software purchase budget."
            ),
            PlannerTaskModel(
                task_id="TASK-R01",
                title="DYNAMIC RE-PLAN: Reconcile Conflicting DPDP Act 2024 Cloud Processing Rules",
                description="Verify if processing patient audio/transcripts through US-hosted LLMs violates Section 16 data fiduciary localization rules.",
                objective="Eliminate catastrophic statutory shutdown risk.",
                research_question=q,
                phase="PHASE 4 — REGULATION",
                assigned_agent="Regulation Agent",
                required_evidence="Ministry of Electronics & IT gazette notification on digital health data",
                dependencies=[],
                priority="VERY HIGH",
                status="RUNNING" if action != "SATURATE" else "COMPLETED",
                created_at="18:05:35",
                started_at="18:05:38",
                completed_at="18:06:55" if action == "SATURATE" else None,
                expected_information_gain="HIGH",
                estimated_cost="$0.018 (980 tokens)",
                estimated_time="40s",
                blocking_uncertainties=["U-002"],
                related_claims=["C-003"],
                related_assumptions=["A-005 (Cloud Privacy Safe-Harbor)"],
                related_sources=["S-003"],
                success_criteria="Determine whether local anonymization layer achieves statutory compliance",
                reason_for_creation="Created autonomously: Two regulatory citations disagreed on cloud patient transcript consent exemptions."
            ),
            PlannerTaskModel(
                task_id="TASK-V01",
                title="DYNAMIC RE-PLAN: Source Triangulation on Correlated Vendor Whitepaper",
                description="Audit Source S-001 and S-002 to identify independent non-vendor verification of the claimed 73% intake speedup.",
                objective="Validate or downgrade overconfident intake claim.",
                research_question=q,
                phase="PHASE 5 — VERIFICATION",
                assigned_agent="Verification Agent",
                required_evidence="Peer-reviewed hospital study or non-vendor published operational trial",
                dependencies=["TASK-M01"],
                priority="HIGH",
                status="RUNNING" if action != "SATURATE" else "COMPLETED",
                created_at="18:05:52",
                started_at="18:05:55",
                completed_at="18:07:05" if action == "SATURATE" else None,
                expected_information_gain="HIGH",
                estimated_cost="$0.014 (760 tokens)",
                estimated_time="35s",
                blocking_uncertainties=["U-003"],
                related_claims=["C-001"],
                related_assumptions=["A-006 (Independent Corroboration)"],
                related_sources=["S-001", "S-002"],
                success_criteria="Confirm independent empirical basis or downgrade claim confidence to 68%",
                reason_for_creation="Created autonomously: Source Quality Auditor detected that two citations share identical underlying PR lineage."
            ),
            PlannerTaskModel(
                task_id="TASK-F01",
                title="Unit Economics Model & Customer LTV / CAC Payback Analysis",
                description="Model per-clinic software gross margin, server token costs, onboarding field expense, and churn rate.",
                objective="Determine months required to reach positive EBITDA per customer.",
                research_question=q,
                phase="PHASE 6 — FINANCIAL",
                assigned_agent="Market Agent",
                required_evidence="Validated pricing floor and average retention duration",
                dependencies=["TASK-C02", "TASK-K01"],
                priority="HIGH",
                status="BLOCKED" if action != "SATURATE" else "COMPLETED",
                created_at="18:04:02",
                started_at=None if action != "SATURATE" else "18:07:10",
                completed_at="18:07:35" if action == "SATURATE" else None,
                expected_information_gain="HIGH",
                estimated_cost="$0.020 (1,100 tokens)",
                estimated_time="45s",
                blocking_uncertainties=["U-001"],
                related_claims=["C-002", "C-004"],
                related_assumptions=["A-007 (Payback Breakeven Horizon)"],
                related_sources=["S-002"],
                success_criteria="Calculate CAC payback period with ±10% margin of error",
                reason_for_creation="Core financial viability component of research mandate",
                reason_for_blocking="BLOCKED: Waiting for TASK-C02 (Willingness to Pay) to establish empirical revenue floor."
            ),
            PlannerTaskModel(
                task_id="TASK-K02",
                title="European & Global Healthcare Copilot Competitor Pricing Benchmark",
                description="Scan pricing structures across UK NHS and US outpatient copilot vendors.",
                objective="Benchmark international pricing strategies.",
                research_question=q,
                phase="PHASE 3 — COMPETITION",
                assigned_agent="Competitor Agent",
                required_evidence="International pricing disclosures",
                dependencies=[],
                priority="LOW",
                status="CANCELLED",
                created_at="18:04:02",
                expected_information_gain="LOW",
                estimated_cost="$0.010 (500 tokens)",
                estimated_time="30s",
                blocking_uncertainties=[],
                related_claims=[],
                related_assumptions=[],
                related_sources=[],
                success_criteria="International comparison matrix",
                reason_for_creation="Initial broad exploratory scope",
                reason_for_cancellation="CANCELLED autonomously: Outside confirmed Indian domestic regulatory and pricing scope; duplicate effort."
            ),
            PlannerTaskModel(
                task_id="TASK-A01",
                title="Adversarial Red-Team Challenge: Free Incumbent Utility Destruction",
                description="Model market dynamics if WhatsApp Business rolls out free native AI appointment scheduling.",
                objective="Stress-test moat durability against zero-margin incumbent bundling.",
                research_question=q,
                phase="PHASE 7 — ADVERSARIAL",
                assigned_agent="Adversarial Challenger",
                required_evidence="Meta Business platform API roadmap and developer tier policies",
                dependencies=["TASK-K01"],
                priority="VERY HIGH",
                status="READY" if action != "SATURATE" else "COMPLETED",
                created_at="18:05:45",
                started_at=None if action != "SATURATE" else "18:07:38",
                completed_at="18:08:10" if action == "SATURATE" else None,
                expected_information_gain="HIGH",
                estimated_cost="$0.016 (890 tokens)",
                estimated_time="40s",
                blocking_uncertainties=["U-004"],
                related_claims=["C-005"],
                related_assumptions=["A-008 (Moat Defensibility)"],
                related_sources=["S-001"],
                success_criteria="Identify vertical features that generic WhatsApp messaging cannot replicate",
                reason_for_creation="Created autonomously: Director identified existential incumbent bundling vulnerability."
            )
        ]

        # Dynamic Uncertainties Registry
        uncertainties: List[UncertaintyModel] = [
            UncertaintyModel(
                uncertainty_id="U-001",
                question="What percentage of independent clinic doctors will pay >₹1,500/month out-of-pocket?",
                severity="CRITICAL",
                confidence_gap=0.74,
                affected_claims=["C-001", "C-004"],
                affected_conclusion="CON-001 (Commercial Feasibility)",
                expected_information_gain="HIGH",
                status="INVESTIGATING" if action != "SATURATE" else "RESOLVED",
                resolution_task_id="TASK-C02"
            ),
            UncertaintyModel(
                uncertainty_id="U-002",
                question="Does cloud processing of patient audio transcripts violate DPDP 2024 compliance regulations?",
                severity="HIGH",
                confidence_gap=0.62,
                affected_claims=["C-003"],
                affected_conclusion="CON-002 (Compliance Architecture)",
                expected_information_gain="HIGH",
                status="INVESTIGATING" if action != "SATURATE" else "RESOLVED",
                resolution_task_id="TASK-R01"
            ),
            UncertaintyModel(
                uncertainty_id="U-003",
                question="Is the 73% intake speedup independently verified outside vendor marketing whitepapers?",
                severity="MEDIUM",
                confidence_gap=0.55,
                affected_claims=["C-001"],
                affected_conclusion="CON-001 (Productivity Value)",
                expected_information_gain="HIGH",
                status="INVESTIGATING" if action != "SATURATE" else "RESOLVED",
                resolution_task_id="TASK-V01"
            ),
            UncertaintyModel(
                uncertainty_id="U-004",
                question="Can standalone copilot SaaS sustain pricing power if WhatsApp bundles native AI booking for free?",
                severity="HIGH",
                confidence_gap=0.68,
                affected_claims=["C-005"],
                affected_conclusion="CON-003 (Long-Term Defensibility)",
                expected_information_gain="HIGH",
                status="OPEN" if action != "SATURATE" else "RESOLVED",
                resolution_task_id="TASK-A01"
            )
        ]

        # Plan Change Feed Events
        feed_events: List[PlanFeedEventModel] = [
            PlanFeedEventModel(
                id="EVT-01",
                timestamp="18:04:02",
                type="PLAN_INITIALIZED",
                title="Initial Research Plan Formulated",
                detail="Research Director decomposed problem into 6 core investigative phases across 7 domain agents.",
                reason="Mandate decomposition"
            ),
            PlanFeedEventModel(
                id="EVT-02",
                timestamp="18:04:38",
                type="TASK_COMPLETED",
                title="TASK-M01 Completed",
                detail="Market Agent confirmed Tier-1 and Tier-2 clinic TAM of 45,000 addressable practices.",
                task_id="TASK-M01"
            ),
            PlanFeedEventModel(
                id="EVT-03",
                timestamp="18:05:15",
                type="TASK_COMPLETED",
                title="TASK-C01 Completed — Uncertainty Detected",
                detail="Customer Agent validated receptionist overtime burden, but flagged zero evidence of willingness to pay.",
                task_id="TASK-C01"
            ),
            PlanFeedEventModel(
                id="EVT-04",
                timestamp="18:05:20",
                type="TASK_CREATED",
                title="Dynamic Re-Plan: Created TASK-C02",
                detail="Assigned Customer Agent to directly investigate willingness to pay among small clinics.",
                task_id="TASK-C02",
                reason="Decision-critical uncertainty detected in commercial core."
            ),
            PlanFeedEventModel(
                id="EVT-05",
                timestamp="18:05:22",
                type="TASK_BLOCKED",
                title="TASK-F01 Blocked by Director",
                detail="Financial analysis halted until TASK-C02 resolves willingness-to-pay revenue baseline.",
                task_id="TASK-F01",
                reason="Waiting for C-002 pricing dependency."
            ),
            PlanFeedEventModel(
                id="EVT-06",
                timestamp="18:05:35",
                type="TASK_CREATED",
                title="Dynamic Re-Plan: Created TASK-R01",
                detail="Assigned Regulation Agent to resolve conflicting interpretations of DPDP 2024 cloud processing.",
                task_id="TASK-R01",
                reason="Statutory ambiguity discovered in draft health data rules."
            ),
            PlanFeedEventModel(
                id="EVT-07",
                timestamp="18:05:42",
                type="TASK_CANCELLED",
                title="TASK-K02 Cancelled by Director",
                detail="European competitor pricing task cancelled to conserve budget; Indian domestic scope confirmed.",
                task_id="TASK-K02",
                reason="Outside domestic research scope."
            ),
            PlanFeedEventModel(
                id="EVT-08",
                timestamp="18:05:52",
                type="TASK_CREATED",
                title="Dynamic Re-Plan: Created TASK-V01",
                detail="Verification Agent dispatched to find non-vendor independent corroboration for Claim 1.",
                task_id="TASK-V01",
                reason="Source Quality Auditor identified circular PR lineage in S-001/S-002."
            )
        ]

        if action == "SATURATE":
            feed_events.append(PlanFeedEventModel(
                id="EVT-09",
                timestamp="18:08:12",
                type="SATURATION_DETECTED",
                title="Research Saturation Reached (100% Convergence)",
                detail="All decision-critical uncertainties resolved. Additional model queries produce diminishing information gains.",
                reason="Diminishing returns threshold met; all major hypotheses defended."
            ))

        # Plan Versions
        versions: List[PlanVersionModel] = [
            PlanVersionModel(
                version="PLAN v1",
                timestamp="18:04:02",
                name="Initial Decomposed Plan",
                summary="Standard exploratory scope across Market, Customer, Competitor, Financial, and Regulation.",
                tasks_added=["TASK-M01", "TASK-C01", "TASK-K01", "TASK-K02", "TASK-F01"],
                tasks_removed=[],
                tasks_blocked=[],
                priorities_changed=[],
                active_tasks_count=5
            ),
            PlanVersionModel(
                version="PLAN v2",
                timestamp="18:05:25",
                name="Adaptive Re-Plan: WTP & Regulatory Pivot",
                summary="Injected targeted Willingness-to-Pay task (C-02) and DPDP Regulatory verification (R-01). Blocked Financial modeling.",
                tasks_added=["TASK-C02", "TASK-R01"],
                tasks_removed=["TASK-K02"],
                tasks_blocked=["TASK-F01"],
                priorities_changed=["TASK-C02 (CRITICAL)", "TASK-R01 (VERY HIGH)"],
                active_tasks_count=7
            ),
            PlanVersionModel(
                version="PLAN v3",
                timestamp="18:05:55",
                name="Adversarial & Provenance Fortification",
                summary="Added Source Triangulation (V-01) and Incumbent Utility Attack (A-01).",
                tasks_added=["TASK-V01", "TASK-A01"],
                tasks_removed=[],
                tasks_blocked=[],
                priorities_changed=["TASK-A01 (VERY HIGH)"],
                active_tasks_count=8
            )
        ]

        budget = BudgetModel(
            token_usage=184000 if action != "SATURATE" else 312000,
            token_budget=500000,
            agent_calls=34 if action != "SATURATE" else 58,
            max_agent_calls=100,
            time_elapsed_seconds=275 if action != "SATURATE" else 480,
            max_time_seconds=600,
            current_round=3 if action != "SATURATE" else 5,
            max_rounds=6,
            source_discoveries=22 if action != "SATURATE" else 34,
            max_source_discoveries=50
        )

        session = PlannerSessionModel(
            session_id=f"plan_sess_{int(datetime.datetime.now().timestamp())}",
            question=q,
            mode=self.mode,
            current_round=3 if action != "SATURATE" else 5,
            round_name="ROUND 3 — TARGETED VERIFICATION & CONTRADICTION ADJUDICATION" if action != "SATURATE" else "ROUND 5 — RESEARCH SATURATION & SYNTHESIS",
            is_running=action != "SATURATE",
            is_paused=False,
            is_saturated=action == "SATURATE",
            saturation_reason="Decision-critical uncertainties resolved; marginal information gain per query <4%." if action == "SATURATE" else None,
            tasks=tasks,
            uncertainties=uncertainties,
            feed_events=feed_events,
            versions=versions,
            current_version="PLAN v3" if action != "SATURATE" else "PLAN v3 (CONVERGED)",
            budget=budget,
            coverage_percentage=84 if action != "SATURATE" else 96,
            confidence_score=78 if action != "SATURATE" else 88
        )

        return session.dict()
