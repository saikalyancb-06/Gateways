from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CanonicalEntityModel(BaseModel):
    id: str
    name: str
    category: str
    canonical_name: str
    aliases: List[str] = []
    mentioned_in_research_ids: List[str] = []
    related_claims_count: int
    sources_count: int
    regulations_count: int
    contradictions_count: int
    last_researched_at: str
    confidence: float
    description: str

class StoredClaimModel(BaseModel):
    id: str
    claim_id: str
    statement: str
    status: str
    confidence: float
    freshness: str
    applicability_score: int
    research_appearances: int
    first_observed_research_id: str
    last_verified_at: str
    supporting_sources: List[str] = []
    contradicting_sources: List[str] = []
    related_claims: List[str] = []
    entities: List[str] = []
    evolution_history: List[Dict[str, str]] = []

class StoredSourceModel(BaseModel):
    id: str
    source_id: str
    title: str
    publisher: str
    url: str
    publication_date: str
    last_verified_at: str
    used_in_research_ids: List[str] = []
    claims_supported_count: int
    claims_contradicted_count: int
    independence_rating: str
    derived_from_source_id: Optional[str] = None
    is_excessive_dependency: bool = False

class PersistentUnresolvedQuestionModel(BaseModel):
    id: str
    question_id: str
    question: str
    origin_research_id: str
    affected_claims: List[str] = []
    status: str = "OPEN"
    severity: str
    expected_information_gain: str
    recommended_next_agent: str

class PersistentContradictionModel(BaseModel):
    id: str
    claim_a_id: str
    claim_a_text: str
    claim_a_research: str
    claim_b_id: str
    claim_b_text: str
    claim_b_research: str
    discrepancy_type: str
    explanation: str
    resolution_status: str
    reconciled_synthesis: Optional[str] = None

class CrossResearchProjectModel(BaseModel):
    id: str
    research_code: str
    title: str
    question: str
    scope: str
    geography: str
    timeframe: str
    industry: str
    created_at: str
    updated_at: str
    status: str
    agents_used: List[str] = []
    claims_count: int
    sources_count: int
    verdict: str
    confidence: float
    shared_entities: List[str] = []
    relevance_to_current: Optional[int] = None
    relevance_reason: Optional[str] = None

class MemoryHealthDashboardModel(BaseModel):
    total_investigations: int
    stored_claims: int
    verified_claims: int
    stored_sources: int
    stored_entities: int
    relationships_count: int
    contradictions_count: int
    unresolved_questions_count: int
    fresh_count: int
    aging_count: int
    needs_review_count: int
    stale_count: int
    orphaned_claims_count: int
    sources_with_excessive_dependency: int

class ResearchMemoryPayload(BaseModel):
    health: MemoryHealthDashboardModel
    recent_projects: List[CrossResearchProjectModel]
    claims: List[StoredClaimModel]
    sources: List[StoredSourceModel]
    entities: List[CanonicalEntityModel]
    unresolved_questions: List[PersistentUnresolvedQuestionModel]
    contradictions: List[PersistentContradictionModel]
    insights: List[str]
