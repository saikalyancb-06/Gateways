export type KnowledgeType =
  | 'RESEARCH'
  | 'CLAIM'
  | 'SOURCE'
  | 'EVIDENCE'
  | 'ENTITY'
  | 'AGENT'
  | 'ASSUMPTION'
  | 'CONCLUSION'
  | 'CONTRADICTION'
  | 'QUESTION'
  | 'FINDING'
  | 'METHODOLOGY';

export type FreshnessState =
  | 'FRESH'
  | 'AGING'
  | 'NEEDS_REVIEW'
  | 'STALE'
  | 'HISTORICAL'
  | 'UNKNOWN';

export type CrossRelationshipType =
  | 'SAME_ENTITY'
  | 'SUPPORTS'
  | 'CONTRADICTS'
  | 'REFINES'
  | 'UPDATES'
  | 'SUPERSEDES'
  | 'DERIVED_FROM'
  | 'RELATED_TO'
  | 'DEPENDS_ON'
  | 'MENTIONS'
  | 'EVIDENCES'
  | 'CHALLENGES'
  | 'APPLIES_TO';

export interface CanonicalEntity {
  id: string;
  name: string;
  category: 'REGULATOR' | 'ORGANIZATION' | 'PRODUCT' | 'TECHNOLOGY' | 'MARKET' | 'GEOGRAPHY';
  canonical_name: string;
  aliases: string[];
  mentioned_in_research_ids: string[];
  related_claims_count: number;
  sources_count: number;
  regulations_count: number;
  contradictions_count: number;
  last_researched_at: string;
  confidence: number;
  description: string;
}

export interface StoredClaim {
  id: string;
  claim_id: string;
  statement: string;
  status: 'SUPPORTED' | 'VERIFIED' | 'CONTESTED' | 'PARTIALLY_SUPPORTED' | 'ORPHANED' | 'SUPERSEDED';
  confidence: number;
  freshness: FreshnessState;
  applicability_score: number;
  research_appearances: number;
  first_observed_research_id: string;
  last_verified_at: string;
  supporting_sources: string[];
  contradicting_sources: string[];
  related_claims: string[];
  entities: string[];
  evolution_history: {
    year: string;
    research_id: string;
    stage: string;
    statement: string;
    evidence_note: string;
  }[];
}

export interface StoredSource {
  id: string;
  source_id: string;
  title: string;
  publisher: string;
  url: string;
  publication_date: string;
  last_verified_at: string;
  used_in_research_ids: string[];
  claims_supported_count: number;
  claims_contradicted_count: number;
  independence_rating: 'INDEPENDENT' | 'CORRELATED' | 'VENDOR_AFFILIATED';
  derived_from_source_id?: string;
  is_excessive_dependency: boolean;
}

export interface PersistentUnresolvedQuestion {
  id: string;
  question_id: string;
  question: string;
  origin_research_id: string;
  affected_claims: string[];
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED_IN_SUBSEQUENT';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  expected_information_gain: 'HIGH' | 'MEDIUM' | 'LOW';
  recommended_next_agent: string;
}

export interface PersistentContradiction {
  id: string;
  claim_a_id: string;
  claim_a_text: string;
  claim_a_research: string;
  claim_b_id: string;
  claim_b_text: string;
  claim_b_research: string;
  discrepancy_type: 'TEMPORAL_SHIFT' | 'GEOGRAPHIC_VARIANCE' | 'DEFINITION_DIVERGENCE' | 'METHODOLOGY_DISPUTE';
  explanation: string;
  resolution_status: 'UNDER_REVIEW' | 'RECONCILED' | 'CONFIRMED_PARADOX';
  reconciled_synthesis?: string;
}

export interface CrossResearchProject {
  id: string;
  research_code: string;
  title: string;
  question: string;
  scope: string;
  geography: string;
  timeframe: string;
  industry: string;
  created_at: string;
  updated_at: string;
  status: 'COMPLETED' | 'SYNTHESIZED' | 'VERIFIED';
  agents_used: string[];
  claims_count: number;
  sources_count: number;
  verdict: string;
  confidence: number;
  shared_entities: string[];
  relevance_to_current?: number;
  relevance_reason?: string;
}

export interface MemoryHealthDashboard {
  total_investigations: number;
  stored_claims: number;
  verified_claims: number;
  stored_sources: number;
  stored_entities: number;
  relationships_count: number;
  contradictions_count: number;
  unresolved_questions_count: number;
  fresh_count: number;
  aging_count: number;
  needs_review_count: number;
  stale_count: number;
  orphaned_claims_count: number;
  sources_with_excessive_dependency: number;
}

export interface ResearchMemoryPayload {
  health: MemoryHealthDashboard;
  recent_projects: CrossResearchProject[];
  claims: StoredClaim[];
  sources: StoredSource[];
  entities: CanonicalEntity[];
  unresolved_questions: PersistentUnresolvedQuestion[];
  contradictions: PersistentContradiction[];
  insights: string[];
}
