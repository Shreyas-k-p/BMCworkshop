export type Department = 'AI' | 'CSE' | 'CY' | 'ME' | 'CE' | 'ECE' | 'EEE' | 'IC';

export const DEPARTMENTS: Department[] = ['AI', 'CSE', 'CY', 'ME', 'CE', 'ECE', 'EEE', 'IC'];

export type UIState =
  | 'NO_SESSION'
  | 'JOINING'
  | 'GROUPING'
  | 'GROUPS_READY'
  | 'CAPTAIN_SELECTION'
  | 'PRODUCT_REVEAL'
  | 'PREPARATION'
  | 'STUDY_TIME'
  | 'PRESENTATION_ORDER'
  | 'PRESENTATION'
  | 'SCORING'
  | 'LEADERBOARD'
  | 'COMPLETED';

export interface Participant {
  uid: string;
  name: string;
  department: Department;
  status: 'active' | 'disconnected';
  joinedAt: number;
  lastSeenAt: number;
  groupId: string | null;
  isCaptain: boolean;
  isDemo?: boolean;
}

export interface TimerState {
  startedAt: number | null;
  pausedAt: number | null;
  durationSeconds: number;
  remainingSeconds: number;
  totalPausedSeconds: number;
}

export interface Product {
  id: string;
  name: string;
  company: string;
  type: 'failed' | 'successful';
}

export interface Group {
  id: string;
  groupNumber: number;
  groupName: string;
  captainId: string | null;
  captainName: string | null;
  productId: string | null;
  product: Product | null;
  presentationOrder: number | null;
  finalScore: number | null;
  members: Record<string, Participant>;
}

export interface ScoreSubmission {
  evaluatorUid: string;
  evaluatorTeamId: string;
  presentingTeamId: string;
  score: number;
  submittedAt: number;
}

export interface Session {
  id: string;
  code: string;
  hostUid: string;
  hasActiveSession: boolean;
  uiState: UIState;
  createdAt: number;
  updatedAt: number;
  stateVersion: number;
  currentTeamNumber: number | null;
  currentPresentingTeamId: string | null;
  presentationIndex: number;
  presentationOrder: string[];
  leaderboardRevealed: boolean;
  preparation: TimerState;
  study: TimerState;
  presentation: TimerState;
  isDemoMode?: boolean;
}
