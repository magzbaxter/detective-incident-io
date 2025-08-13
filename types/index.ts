export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  isOnline: boolean;
  cursor?: { x: number; y: number };
}

export type PlayerRole = 
  | 'lead_detective'
  | 'timeline_specialist' 
  | 'technical_analyst'
  | 'witness_interviewer'
  | 'evidence_coordinator';

export interface GameRoom {
  id: string;
  code: string;
  incidentId: string;
  incidentData?: IncidentData;
  aiAnalysis?: AIAnalysis;
  players: Player[];
  gameState: GameState;
  evidence: Evidence[];
  theories: Theory[];
  currentPhase: GamePhase;
  createdAt: Date;
  completedAt?: Date;
}

export type GamePhase = 
  | 'briefing'
  | 'evidence_review'
  | 'theory_development'
  | 'investigation'
  | 'conclusion'
  | 'postmortem';

export interface GameState {
  phase: GamePhase;
  timeRemaining?: number;
  votingInProgress?: boolean;
  consensus?: Theory;
}

export interface Evidence {
  id: string;
  type: EvidenceType;
  title: string;
  content: string;
  timestamp: Date;
  source: string;
  category: string;
  isReviewed: boolean;
  assignedTo?: string;
  tags: string[];
  significance?: number; // AI-scored 1-10
}

export type EvidenceType = 
  | 'log_entry'
  | 'metric_alert'
  | 'slack_message'
  | 'timeline_event'
  | 'system_change'
  | 'witness_statement';

export interface Theory {
  id: string;
  title: string;
  description: string;
  rootCause: string;
  supportingEvidence: string[];
  confidence: number;
  proposedBy: string;
  votes: string[]; // player IDs
  aiValidation?: AIValidation;
}

export interface AIValidation {
  score: number; // 0-100
  reasoning: string;
  supportingPatterns: string[];
  contradictions: string[];
}

export interface IncidentData {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  createdAt: Date;
  resolvedAt: Date;
  responders: Responder[];
  timeline: TimelineEvent[];
  services: string[];
  runbooks: string[];
  slackChannel: string;
  slackMessages: SlackMessage[];
}

export interface Responder {
  id: string;
  name: string;
  role: string;
  actions: string[];
  joinedAt: Date;
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  type: string;
  actor?: string;
}

export interface SlackMessage {
  id: string;
  timestamp: Date;
  user: string;
  text: string;
  thread_ts?: string;
  type: 'message' | 'alert' | 'command';
}

export interface AIAnalysis {
  briefing: string;
  evidenceCategories: EvidenceCategory[];
  suggestedTheories: Theory[];
  timelineGaps: string[];
  witnessProfiles: WitnessProfile[];
  postMortemDraft: PostMortemDraft;
}

export interface EvidenceCategory {
  name: string;
  description: string;
  items: string[];
  significance: number;
}

export interface WitnessProfile {
  responderId: string;
  name: string;
  role: string;
  keyActions: string[];
  personality: string;
  availability: boolean;
}

export interface PostMortemDraft {
  title: string;
  summary: string;
  timeline: string;
  rootCause: string;
  impact: string;
  resolution: string;
  actionItems: ActionItem[];
  lessons: string[];
  savedToIncidentIo?: boolean;
}

export interface ActionItem {
  id: string;
  description: string;
  owner: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  status: 'open' | 'in_progress' | 'completed';
}