"""
Data models and schemas for ResearchOps.
Implements ResearchSession, ResearchTask, Agent, Source, Claim, Evidence, Challenge,
AgentMessage, Hypothesis, ResearchEvent, CourtSimulation.
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import uuid
import time

class AgentStatus(str, Enum):
    IDLE = "IDLE"
    THINKING = "THINKING"
    RESEARCHING = "RESEARCHING"
    ANALYZING = "ANALYZING"
    WAITING = "WAITING"
    CHALLENGING = "CHALLENGING"
    VERIFYING = "VERIFYING"
    COMPLETED = "COMPLETED"
    BLOCKED = "BLOCKED"
    ERROR = "ERROR"

class TaskStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    FOLLOW_UP = "FOLLOW_UP_REQUIRED"
    COMPLETED = "COMPLETED"
    BLOCKED = "BLOCKED"
    CANCELLED = "CANCELLED"

class ClaimStatus(str, Enum):
    HYPOTHESIS = "HYPOTHESIS"
    DISCOVERED = "DISCOVERED"
    SUPPORTED = "SUPPORTED"
    CHALLENGED = "CHALLENGED"
    PARTIALLY_SUPPORTED = "PARTIALLY_SUPPORTED"
    CONTRADICTED = "CONTRADICTED"
    OUTDATED = "OUTDATED"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    UNRESOLVED = "UNRESOLVED"

class ClaimType(str, Enum):
    FACT = "FACT"
    INFERENCE = "INFERENCE"
    HYPOTHESIS = "HYPOTHESIS"
    UNKNOWN = "UNKNOWN"

class MessageType(str, Enum):
    TASK_ASSIGNED = "TASK_ASSIGNED"
    TASK_STARTED = "TASK_STARTED"
    TASK_COMPLETED = "TASK_COMPLETED"
    CLAIM_FOUND = "CLAIM_FOUND"
    SOURCE_FOUND = "SOURCE_FOUND"
    EVIDENCE_ADDED = "EVIDENCE_ADDED"
    QUESTION = "QUESTION"
    CHALLENGE = "CHALLENGE"
    COUNTER_ARGUMENT = "COUNTER_ARGUMENT"
    VERIFICATION_REQUEST = "VERIFICATION_REQUEST"
    VERIFICATION_RESULT = "VERIFICATION_RESULT"
    CONFLICT_DETECTED = "CONFLICT_DETECTED"
    FOLLOW_UP_REQUIRED = "FOLLOW_UP_REQUIRED"
    RESEARCH_SCOPE_UPDATED = "RESEARCH_SCOPE_UPDATED"
    HYPOTHESIS_CREATED = "HYPOTHESIS_CREATED"
    HYPOTHESIS_WEAKENED = "HYPOTHESIS_WEAKENED"
    HYPOTHESIS_SUPPORTED = "HYPOTHESIS_SUPPORTED"
    STOP_RESEARCH = "STOP_RESEARCH"
    FINAL_DECISION = "FINAL_DECISION"

class Source(BaseModel):
    id: str = Field(default_factory=lambda: f"src_{uuid.uuid4().hex[:8]}")
    url: str
    title: str
    publisher: str
    source_type: str = "Web"
    published_at: str = "2025/2026"
    retrieved_at: str = Field(default_factory=lambda: time.strftime("%Y-%m-%d %H:%M:%S"))
    content_hash: str = ""
    independence_group: str = "Group-1"
    raw_snippet: str = ""

class Evidence(BaseModel):
    id: str = Field(default_factory=lambda: f"evi_{uuid.uuid4().hex[:8]}")
    claim_id: str
    source_id: str
    support_type: str = "SUPPORTS"  # SUPPORTS, CONTRADICTS, QUALIFIES
    excerpt: str
    context: str = ""
    relevance: float = 0.95
    recency: str = "2025/2026"
    authority: str = "High"

class Challenge(BaseModel):
    id: str = Field(default_factory=lambda: f"chl_{uuid.uuid4().hex[:8]}")
    claim_id: str
    challenger_agent: str
    argument: str
    severity: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL
    requested_action: str = ""
    status: str = "OPEN"      # OPEN, RESOLVED, DISMISSED, ESCALATED

class Claim(BaseModel):
    id: str = Field(default_factory=lambda: f"clm_{uuid.uuid4().hex[:8]}")
    session_id: str
    text: str
    type: ClaimType = ClaimType.FACT
    status: ClaimStatus = ClaimStatus.DISCOVERED
    confidence: float = 0.85
    created_by: str
    supporting_source_ids: List[str] = Field(default_factory=list)
    contradicting_source_ids: List[str] = Field(default_factory=list)
    challenge_ids: List[str] = Field(default_factory=list)
    verification_notes: str = ""
    created_at: str = Field(default_factory=lambda: time.strftime("%H:%M:%S"))
    updated_at: str = Field(default_factory=lambda: time.strftime("%H:%M:%S"))

class Hypothesis(BaseModel):
    id: str = Field(default_factory=lambda: f"hyp_{uuid.uuid4().hex[:8]}")
    session_id: str
    statement: str
    supporting_evidence_count: int = 0
    contradicting_evidence_count: int = 0
    status: str = "ACTIVE" # ACTIVE, SUPPORTED, WEAKENED, REJECTED
    notes: str = ""

class AgentInfo(BaseModel):
    id: str
    name: str
    role: str
    status: AgentStatus = AgentStatus.IDLE
    current_task: Optional[str] = None
    source_count: int = 0
    claim_count: int = 0
    challenge_count: int = 0
    evidence_confidence: float = 0.9

class ResearchTask(BaseModel):
    id: str = Field(default_factory=lambda: f"tsk_{uuid.uuid4().hex[:6]}")
    session_id: str
    agent_id: str
    title: str
    description: str
    status: TaskStatus = TaskStatus.PENDING
    priority: str = "HIGH"
    dependencies: List[str] = Field(default_factory=list)
    budget: Dict[str, Any] = Field(default_factory=lambda: {"max_searches": 5, "searches_used": 0, "max_sources": 4})
    completion_condition: str = "Found at least 2 independent verified sources"
    created_at: str = Field(default_factory=lambda: time.strftime("%H:%M:%S"))
    completed_at: Optional[str] = None

class AgentMessage(BaseModel):
    id: str = Field(default_factory=lambda: f"msg_{uuid.uuid4().hex[:8]}")
    session_id: str
    timestamp: str = Field(default_factory=lambda: time.strftime("%H:%M:%S"))
    sender: str
    recipient: str
    type: MessageType
    summary: str
    content: str = ""
    related_task: Optional[str] = None
    related_claim: Optional[str] = None
    related_source: Optional[str] = None
    status: str = "DELIVERED"

class ResearchSession(BaseModel):
    id: str = Field(default_factory=lambda: f"sess_{uuid.uuid4().hex[:8]}")
    question: str
    scope: str = "Target Market & Technology Landscape"
    geography: str = "India / Regional"
    time_range: str = "2024 - 2026"
    research_depth: str = "Comprehensive (Multi-Agent Argued)"
    status: str = "INITIALIZED" # INITIALIZED, RUNNING, ARGUING, VERIFYING, COMPLETED, FAILED
    mode: str = "LIVE"          # LIVE or DEMO
    created_at: str = Field(default_factory=lambda: time.strftime("%Y-%m-%d %H:%M:%S"))
    updated_at: str = Field(default_factory=lambda: time.strftime("%Y-%m-%d %H:%M:%S"))

class CourtParticipant(BaseModel):
    name: str
    role: str # PROSECUTION, DEFENSE, CLERK, JUDGE
    avatar: str

class CourtDialogue(BaseModel):
    step: int
    speaker: str
    role: str
    statement: str
    cited_claim_id: Optional[str] = None
    cited_source_id: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: time.strftime("%H:%M:%S"))

class CourtSimulation(BaseModel):
    id: str = Field(default_factory=lambda: f"crt_{uuid.uuid4().hex[:8]}")
    session_id: str
    claim_id: str
    claim_text: str
    prosecution_case: str
    defense_case: str
    clerk_evidence: List[Dict[str, Any]]
    dialogue: List[CourtDialogue] = Field(default_factory=list)
    ruling: Optional[str] = None
    status: str = "PENDING"
