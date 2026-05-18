import type { Edge, Node } from 'reactflow';

export type UserRole = 'employee' | 'manager' | 'admin';
export type GoalStatus = 'draft' | 'submitted' | 'approved' | 'returned' | 'completed' | 'at_risk' | 'on_track' | 'not_started';
export type AchievementStatus = 'Not Started' | 'On Track' | 'Completed';
export type UomType = 'Min (Higher is better)' | 'Max (Lower is better)' | 'Timeline' | 'Zero-based';
export type NotificationChannel = 'email' | 'teams';
export type NotificationStatus = 'queued' | 'sent' | 'failed';
export type EscalationStatus = 'open' | 'resolved';

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  job_title: string;
  department: string;
  manager_id: string | null;
};

export type GoalRecord = {
  id: string;
  owner_id: string;
  parent_goal_id: string | null;
  shared_goal_id: string | null;
  primary_owner_id: string | null;
  title: string;
  description: string;
  category: string;
  uom_type: UomType;
  target_value: string;
  baseline_value: number | null;
  weightage: number;
  status: GoalStatus;
  progress: number;
  position_x: number;
  position_y: number;
  is_hub: boolean;
  is_shared: boolean;
  locked: boolean;
  created_at?: string;
  updated_at?: string;
  owner?: Profile;
  latest_update?: QuarterlyUpdate | null;
};

export type QuarterlyUpdate = {
  id: string;
  goal_id: string;
  quarter: string;
  actual_value: string;
  achievement_status: AchievementStatus;
  computed_score: number;
  comment: string | null;
  created_at?: string;
};

export type CheckIn = {
  id: string;
  employee_id: string;
  manager_id: string;
  comment: string;
  created_at: string;
};

export type AuditLog = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type NotificationLog = {
  id: string;
  recipient_id: string | null;
  channel: NotificationChannel;
  event_type: string;
  title: string;
  message: string;
  deep_link: string;
  status: NotificationStatus;
  created_at: string;
};

export type EscalationRule = {
  id: string;
  name: string;
  trigger_type: 'goal_submission_overdue' | 'manager_approval_overdue' | 'checkin_overdue';
  threshold_days: number;
  first_notify_role: UserRole;
  second_notify_role: UserRole;
  final_notify_role: UserRole;
  active: boolean;
};

export type EscalationLog = {
  id: string;
  rule_id: string;
  employee_id: string | null;
  manager_id: string | null;
  level: number;
  message: string;
  status: EscalationStatus;
  created_at: string;
};

export function statusForNode(status: GoalStatus): 'completed' | 'onTrack' | 'atRisk' {
  if (status === 'approved' || status === 'completed') return 'completed';
  if (status === 'returned' || status === 'at_risk') return 'atRisk';
  return 'onTrack';
}

export function goalToNode(goal: GoalRecord): Node {
  return {
    id: goal.id,
    type: 'goalNode',
    position: { x: goal.position_x, y: goal.position_y },
    data: {
      dbId: goal.id,
      title: goal.title,
      description: goal.description,
      category: goal.category,
      weightage: goal.weightage,
      status: statusForNode(goal.status),
      rawStatus: goal.status,
      targetValue: goal.target_value,
      uom: goal.uom_type,
      progress: goal.progress,
      latestUpdate: goal.latest_update,
      isHub: goal.is_hub,
      isShared: goal.is_shared,
      locked: goal.locked || goal.status === 'approved',
    },
  };
}

export function goalsToEdges(goals: GoalRecord[]): Edge[] {
  return goals
    .filter((goal) => goal.parent_goal_id)
    .map((goal) => ({
      id: `edge-${goal.parent_goal_id}-${goal.id}`,
      source: goal.parent_goal_id!,
      target: goal.id,
      animated: true,
      style: { stroke: goal.status === 'approved' ? '#10b981' : '#a855f7', strokeWidth: 3, opacity: 0.8 },
    }));
}
