export type TaskStatus = 'draft' | 'capture' | 'editing' | 'review' | 'done';
export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  note: string;
  accountId: string;
  topicId: string | null;
  priority: Priority;
  status: TaskStatus;
  /** Local calendar day, YYYY-MM-DD. */
  plannedDate: string;
  /** Local time, HH:mm, optional. */
  plannedTime: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface Account {
  id: string;
  name: string;
  platform: string;
  color: string;
  active: boolean;
}

export interface Topic {
  id: string;
  name: string;
}

export type ExperimentStatus = 'idea' | 'running' | 'done';

export interface Experiment {
  id: string;
  title: string;
  hypothesis: string;
  metric: string;
  status: ExperimentStatus;
  conclusion: string;
}

export interface HistoryRecord {
  id: string;
  title: string;
  accountId: string;
  /** Local calendar day, YYYY-MM-DD. */
  completedOn: string;
  outcome: 'published' | 'completed';
}

export interface Settings {
  displayName: string;
  motto: string;
  dailyGoal: number;
  weeklyGoal: number;
  weekStartsOn: 0 | 1;
  compact: boolean;
}

export interface WorkbenchDoc {
  schemaVersion: 1;
  tasks: Task[];
  accounts: Account[];
  topics: Topic[];
  experiments: Experiment[];
  history: HistoryRecord[];
  settings: Settings;
  /** Local day key (YYYY-MM-DD) of the last plan confirmation, null when unconfirmed. */
  planConfirmedOn: string | null;
}

export const TASK_STATUSES: TaskStatus[] = ['draft', 'capture', 'editing', 'review', 'done'];

export const STATUS_LABEL: Record<TaskStatus, string> = {
  draft: '待撰稿',
  capture: '待拍摄',
  editing: '剪辑中',
  review: '待发布',
  done: '已完成',
};

/** Label of the one-click forward action for each status; null when no forward step exists. */
export const NEXT_ACTION_LABEL: Record<TaskStatus, string | null> = {
  draft: '完成撰稿',
  capture: '完成拍摄',
  editing: '完成剪辑',
  review: '标记已发布',
  done: null,
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '普',
};

export const EXPERIMENT_STATUSES: ExperimentStatus[] = ['idea', 'running', 'done'];

export const EXPERIMENT_STATUS_LABEL: Record<ExperimentStatus, string> = {
  idea: '想法',
  running: '进行中',
  done: '已完成',
};

/** One-click forward action per experiment status; null when finished. */
export const EXPERIMENT_NEXT_LABEL: Record<ExperimentStatus, string | null> = {
  idea: '开始实验',
  running: '标记完成',
  done: null,
};
