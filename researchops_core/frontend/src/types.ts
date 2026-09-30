export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  status: 'IDLE' | 'THINKING' | 'RESEARCHING' | 'ANALYZING' | 'WAITING' | 'CHALLENGING' | 'VERIFYING' | 'COMPLETED' | 'BLOCKED' | 'ERROR';
  current_task?: string;
  source_count: number;
  claim_count: number;
  challenge_count: number;
  evidence_confidence: number;
}

export interface ResearchTask {
  id: string;
  session_id: string;
  agent_id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'RUNNING' | 'FOLLOW_UP_REQUIRED' | 'COMPLETED' | 'BLOCKED';
  priority: string;
  dependencies: string[];
  completion_condition: string;
}

export interface AgentMessage {
  id: string;
  timestamp: string;
  sender: string;
  recipient: string;
  type: string;
  summary: string;
  content: string;
  related_claim?: string;
  related_source?: string;
}

export interface Claim {
  id: string;
  text: string;
  type: 'FACT' | 'INFERENCE' | 'HYPOTHESIS' | 'UNKNOWN';
  status: 'DISCOVERED' | 'SUPPORTED' | 'CHALLENGED' | 'PARTIALLY_SUPPORTED' | 'CONTRADICTED' | 'VERIFIED' | 'REJECTED';
  confidence: number;
  created_by: string;
  supporting_source_ids: string[];
  contradicting_source_ids: string[];
  verification_notes?: string;
}

export interface Source {
  id: string;
  url: string;
  title: string;
  publisher: string;
  published_at: string;
  retrieved_at: string;
  independence_group: string;
  raw_snippet?: string;
}

export interface GraphData {
  nodes: Array<{
    id: string;
    type: 'claim' | 'source' | 'challenge';
    label: string;
    full_text: string;
    status?: string;
    confidence?: number;
    url?: string;
    publisher?: string;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label: string;
    style: string;
    color: string;
  }>;
}

export interface CourtDialogue {
  step: number;
  speaker: string;
  role: 'PROSECUTION' | 'DEFENSE' | 'CLERK' | 'JUDGE';
  statement: string;
  timestamp: string;
}

export interface CourtSimulation {
  claim_id: string;
  claim_text: string;
  prosecution_case: string;
  defense_case: string;
  dialogue: CourtDialogue[];
  ruling?: string;
  status: string;
}

export type AppTab =
  | 'planner'
  | 'workflow'
  | 'report'
  | 'claims'
  | 'court'
  | 'graph'
  | 'replay'
  | 'lab'
  | 'autopsy'
  | 'memory';

