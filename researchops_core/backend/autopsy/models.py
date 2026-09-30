from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class FindingModel(BaseModel):
    finding_id: str
    title: str
    category: str  # ASSUMPTION, EVIDENCE, SOURCE, CONTRADICTION, LOGIC, BIAS, etc.
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW, INFORMATIONAL
    confidence: float
    auditor_id: str
    auditor_name: str
    description: str
    why_it_matters: str
    affected_claims: List[str] = []
    affected_sources: List[str] = []
    affected_agents: List[str] = []
    affected_assumptions: List[str] = []
    affected_conclusion: Optional[str] = None
    supporting_evidence: List[str] = []
    contradicting_evidence: List[str] = []
    recommended_action: str
    requires_followup_research: bool = True
    severity_reasoning: str
    status: str = "OPEN"
    created_at: str = ""
    trace_target_claim: Optional[str] = None

class DisagreementModel(BaseModel):
    id: str
    topic: str
    target_claim_id: str
    auditor_positions: List[Dict[str, str]]
    director_resolution: str
    reconciled_severity: str

class FollowupTaskModel(BaseModel):
    task_id: str
    question: str
    reason: str
    affected_claims: List[str]
    affected_conclusion: str
    expected_information_gain: str
    expected_uncertainty_reduction: str
    priority: int
    suggested_agent: str
    suggested_sources: List[str]
    status: str = "QUEUED"

class ReplayStepModel(BaseModel):
    step: int
    time: str
    auditor: str
    action: str
    detail: str
    finding_id: Optional[str] = None
    severity: Optional[str] = None

class AutopsySessionModel(BaseModel):
    autopsy_id: str
    version: str = "AUTOPSY-001"
    research_id: str
    status: str = "COMPLETED"
    started_at: str
    completed_at: str
    mode: str = "FULL AUTOPSY"
    auditors: List[Dict[str, Any]]
    findings: List[FindingModel]
    disagreements: List[DisagreementModel]
    research_survival_status: str
    survival_reasoning: str
    integrity_metrics: Dict[str, int]
    what_would_change_conclusion: List[Dict[str, Any]]
    followup_tasks: List[FollowupTaskModel]
    replay_events: List[ReplayStepModel]
    audited_claims_count: int
    audited_sources_count: int
    assumptions_identified_count: int
    contradictions_count: int
    evidence_gaps_count: int
    conclusion_risks_count: int
