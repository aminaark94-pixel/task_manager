export type UserRole = 'parent' | 'child' | 'spouse';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'custom';

export type TaskCategory = 'chores' | 'homework' | 'health' | 'deen' | 'reading' | 'general';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface FamilyMember {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  points: number;
  streak: number;
  color?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  recurrence_type: RecurrenceType;
  recurrence_days?: number[]; // 0 for Sun, 1 for Mon, ..., 6 for Sat
  recurrence_interval?: number; // every N days
  assigned_to: string | string[]; // member id or array of member ids
  created_by: string; // member id (admin/parent)
  points_reward: number;
  is_active: boolean;
  due_date?: string; // YYYY-MM-DD for one-time or next occurrence
  created_at: string;
}

export function getTaskAssigneeIds(task: Task): string[] {
  if (Array.isArray(task.assigned_to)) {
    return task.assigned_to;
  }
  if (typeof task.assigned_to === 'string' && task.assigned_to) {
    return [task.assigned_to];
  }
  return [];
}

export function isTaskAssignedTo(task: Task, memberId: string): boolean {
  const assignees = getTaskAssigneeIds(task);
  return assignees.includes(memberId);
}

export interface TaskLog {
  id: string;
  task_id: string;
  task_title?: string;
  user_id: string;
  user_name?: string;
  completed_at: string;
  status: 'completed' | 'skipped' | 'approved';
  notes?: string;
  points_awarded: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}
