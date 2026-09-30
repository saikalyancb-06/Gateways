from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class PlannerTaskModel(BaseModel):
    task_id: str
    title: str
    description: str
    objective: str
    research_question: str
    parent_task_id: Optional[str] = None
    phase: str
    assigned_agent: str
    required_evidence: str
    dependencies: List[str] = []
    priority: str  # CRITICAL, VERY HIGH, HIGH, MEDIUM, LOW
    status: str    # PLANNED, READY, RUNNING, COMPLETED, BLOCKED, CANCELLED, FAILED, REOPENED
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    expected_information_gain: str
    estimated_cost: str
    estimated_time: str
    blocking_uncertainties: List[str] = []
    related_claims: List[str] = []
    related_assumptions: List[str] = []
    related_sources: List[str] = []
    success_criteria: str
    reason_for_creation: str
    reason_for_cancellation: Optional[str] = None
    reason_for_blocking: Optional[str] = None

class UncertaintyModel(BaseModel):
    uncertainty_id: str
    question: str
    severity: str
    confidence_gap: float
    affected_claims: List[str] = []
    affected_conclusion: str
    expected_information_gain: str
    status: str = "OPEN"
    resolution_task_id: Optional[str] = None

class PlanFeedEventModel(BaseModel):
    id: str
    timestamp: str
    type: str
    title: str
    detail: str
    task_id: Optional[str] = None
    reason: Optional[str] = None

class PlanVersionModel(BaseModel):
    version: str
    timestamp: str
    name: str
    summary: str
    tasks_added: List[str] = []
    tasks_removed: List[str] = []
    tasks_blocked: List[str] = []
    priorities_changed: List[str] = []
    active_tasks_count: int

class BudgetModel(BaseModel):
    token_usage: int = 142000
    token_budget: int = 500000
    agent_calls: int = 28
    max_agent_calls: int = 100
    time_elapsed_seconds: int = 245
    max_time_seconds: int = 600
    current_round: int = 2
    max_rounds: int = 6
    source_discoveries: int = 19
    max_source_discoveries: int = 50

class PlannerSessionModel(BaseModel):
    session_id: str
    question: str
    mode: str = "AUTONOMOUS"
    current_round: int = 2
    round_name: str = "ROUND 2 — EVIDENCE STRENGTHENING & GAP FILLING"
    is_running: bool = True
    is_paused: bool = False
    is_saturated: bool = False
    saturation_reason: Optional[str] = None
    tasks: List[PlannerTaskModel]
    uncertainties: List[UncertaintyModel]
    feed_events: List[PlanFeedEventModel]
    versions: List[PlanVersionModel]
    current_version: str = "PLAN v2"
    budget: BudgetModel
    coverage_percentage: int = 68
    confidence_score: int = 74
