export type TaskStatus =
  | 'PLANNED'
  | 'READY'
  | 'RUNNING'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'CANCELLED'
  | 'FAILED'
  | 'REOPENED';

export type TaskPriority = 'CRITICAL' | 'VERY HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';

export type PlannerMode = 'AUTONOMOUS' | 'ASSISTED' | 'MANUAL';

export interface PlannerTask {
  task_id: string;
  title: string;
  description: string;
  objective: string;
  research_question: string;
  parent_task_id?: string;
  phase: string;
  assigned_agent: string;
  required_evidence: string;
  dependencies: string[];
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  expected_information_gain: 'HIGH' | 'MEDIUM' | 'LOW';
  estimated_cost: string; // e.g. "$0.02" or "1.2k tokens"
  estimated_time: string; // e.g. "45s"
  blocking_uncertainties: string[];
  related_claims: string[];
  related_assumptions: string[];
  related_sources: string[];
  success_criteria: string;
  reason_for_creation: string;
  reason_for_cancellation?: string;
  reason_for_blocking?: string;
}

export interface ResearchUncertainty {
  uncertainty_id: string;
  question: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_gap: number; // e.g. 0.75
  affected_claims: string[];
  affected_conclusion: string;
  expected_information_gain: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  resolution_task_id?: string;
}

export interface PlanFeedEvent {
  id: string;
  timestamp: string;
  type: 'TASK_CREATED' | 'TASK_BLOCKED' | 'TASK_COMPLETED' | 'TASK_CANCELLED' | 'REPLAN_TRIGGERED' | 'SATURATION_DETECTED';
  title: string;
  detail: string;
  task_id?: string;
  reason?: string;
}

export interface PlanVersion {
  version: string; // e.g. "PLAN v1", "PLAN v2"
  timestamp: string;
  name: string;
  summary: string;
  tasks_added: string[];
  tasks_removed: string[];
  tasks_blocked: string[];
  priorities_changed: string[];
  active_tasks_count: number;
}

export interface ResearchBudgetState {
  token_usage: number;
  token_budget: number;
  agent_calls: number;
  max_agent_calls: number;
  time_elapsed_seconds: number;
  max_time_seconds: number;
  current_round: number;
  max_rounds: number;
  source_discoveries: number;
  max_source_discoveries: number;
}

export interface PlannerSessionState {
  session_id: string;
  question: string;
  mode: PlannerMode;
  current_round: number;
  round_name: string;
  is_running: boolean;
  is_paused: boolean;
  is_saturated: boolean;
  saturation_reason?: string;
  tasks: PlannerTask[];
  uncertainties: ResearchUncertainty[];
  feed_events: PlanFeedEvent[];
  versions: PlanVersion[];
  current_version: string;
  budget: ResearchBudgetState;
  coverage_percentage: number;
  confidence_score: number;
}
