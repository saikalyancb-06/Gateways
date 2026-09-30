export type FindingCategory =
  | 'ASSUMPTION'
  | 'EVIDENCE'
  | 'SOURCE'
  | 'CONTRADICTION'
  | 'LOGIC'
  | 'BIAS'
  | 'COMPLETENESS'
  | 'TEMPORAL'
  | 'DATA_QUALITY'
  | 'METHODOLOGY'
  | 'CONCLUSION'
  | 'OTHER';

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type FindingStatus = 'OPEN' | 'INVESTIGATING' | 'CONFIRMED' | 'DISMISSED' | 'RESOLVED';

export type ResearchSurvivalStatus =
  | 'SURVIVED AUTOPSY'
  | 'SURVIVED WITH MATERIAL CAVEATS'
  | 'REQUIRES FURTHER RESEARCH'
  | 'FAILED KEY ASSUMPTION'
  | 'CRITICAL EVIDENCE GAP';

export type AutopsyMode =
  | 'FULL AUTOPSY'
  | 'QUICK AUTOPSY'
  | 'RED TEAM'
  | 'EVIDENCE AUDIT'
  | 'METHODOLOGY AUDIT'
  | 'CUSTOM';

export interface AuditorSpecialist {
  id: string;
  name: string;
  role: string;
  focus: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FLAGGED';
  findingsCount: number;
  currentTask?: string;
}

export interface AutopsyFinding {
  finding_id: string;
  title: string;
  category: FindingCategory;
  severity: FindingSeverity;
  confidence: number;
  auditor_id: string;
  auditor_name: string;
  description: string;
  why_it_matters: string;
  affected_claims: string[];
  affected_sources: string[];
  affected_agents: string[];
  affected_assumptions: string[];
  affected_conclusion?: string;
  supporting_evidence: string[];
  contradicting_evidence: string[];
  recommended_action: string;
  requires_followup_research: boolean;
  severity_reasoning: string;
  status: FindingStatus;
  created_at: string;
  // Specific audit trail metadata
  trace_target_claim?: string;
  trace_challenge_id?: string;
  trace_verification_id?: string;
}

export interface AuditorDisagreement {
  id: string;
  topic: string;
  target_claim_id: string;
  auditor_positions: {
    auditor_name: string;
    verdict: string;
    rationale: string;
  }[];
  director_resolution: string;
  reconciled_severity: FindingSeverity;
}

export interface FollowupResearchTask {
  task_id: string;
  question: string;
  reason: string;
  affected_claims: string[];
  affected_conclusion: string;
  expected_information_gain: 'HIGH' | 'MEDIUM' | 'LOW';
  expected_uncertainty_reduction: 'HIGH' | 'MEDIUM' | 'LOW';
  priority: 1 | 2 | 3 | 4 | 5;
  suggested_agent: string;
  suggested_sources: string[];
  status: 'QUEUED' | 'LAUNCHED' | 'COMPLETED';
}

export interface AutopsyReplayStep {
  step: number;
  time: string;
  auditor: string;
  action: string;
  detail: string;
  finding_id?: string;
  severity?: FindingSeverity;
}

export interface ResearchAutopsySession {
  autopsy_id: string;
  version: string; // e.g. "AUTOPSY-001"
  research_id: string;
  status: 'INITIALIZING' | 'RUNNING' | 'COMPLETED' | 'RECONCILED';
  started_at: string;
  completed_at?: string;
  mode: AutopsyMode;
  auditors: AuditorSpecialist[];
  findings: AutopsyFinding[];
  disagreements: AuditorDisagreement[];
  research_survival_status: ResearchSurvivalStatus;
  survival_reasoning: string;
  integrity_metrics: {
    evidence_completeness: number; // e.g. 82
    source_independence: number;   // e.g. 68
    claim_verification: number;    // e.g. 76
    conclusion_support: number;    // e.g. 69
  };
  what_would_change_conclusion: {
    conclusion: string;
    falsification_conditions: {
      condition: string;
      linked_claim_or_assumption: string;
      criticality: 'FATAL' | 'MAJOR' | 'MODERATE';
    }[];
  }[];
  followup_tasks: FollowupResearchTask[];
  replay_events: AutopsyReplayStep[];
  audited_claims_count: number;
  audited_sources_count: number;
  assumptions_identified_count: number;
  contradictions_count: number;
  evidence_gaps_count: number;
  conclusion_risks_count: number;
}
