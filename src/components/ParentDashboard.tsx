import React, { useState } from 'react';
import { 
  Users, 
  Trophy, 
  Flame, 
  Star, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  TrendingUp, 
  Award, 
  Trash2, 
  Edit3,
  Calendar,
  AlertTriangle,
  Mic,
  UserCheck
} from 'lucide-react';
import { FamilyMember, Task, TaskLog, TaskUpdate, getTaskAssigneeIds, isTaskAssignedTo } from '../types';
import { TaskUpdateThread } from './TaskUpdateThread';

interface ParentDashboardProps {
  members: FamilyMember[];
  tasks: Task[];
  taskLogs: TaskLog[];
  taskUpdates: TaskUpdate[];
  currentMember: FamilyMember;
  onAddTaskUpdate: (taskId: string, update: { type: 'text' | 'voice'; text?: string; audioBlob?: Blob; durationSeconds?: number }) => Promise<void> | void;
  onOpenTaskModal: () => void;
  onOpenVoiceModal: () => void;
  onToggleTaskStatus: (taskId: string, memberId?: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onAwardBonus: (memberId: string, bonusPoints: number) => void;
  onSelectMember: (memberId: string) => void;
  onOpenMemberModal: (memberId?: string) => void;
  onDeleteMember: (memberId: string) => void;
  isParentLoggedIn?: boolean;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  members,
  tasks,
  taskLogs,
  taskUpdates,
  currentMember,
  onAddTaskUpdate,
  onOpenTaskModal,
  onOpenVoiceModal,
  onToggleTaskStatus,
  onDeleteTask,
  onEditTask,
  onAwardBonus,
  onSelectMember,
  onOpenMemberModal,
  onDeleteMember,
  isParentLoggedIn = false
}) => {
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate total assignments & completions across all family members
  let totalAssignments = 0;
  let completedAssignments = 0;

  members.forEach((m) => {
    const memberTasks = tasks.filter((t) => isTaskAssignedTo(t, m.id));
    totalAssignments += memberTasks.length;
    completedAssignments += memberTasks.filter((t) =>
      taskLogs.some((l) => l.task_id === t.id && l.user_id === m.id && l.completed_at.startsWith(todayStr))
    ).length;
  });

  const familyCompletionPct = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  // Filtered members
  const displayMembers = selectedMemberFilter === 'all' 
    ? members 
    : members.filter((m) => m.id === selectedMemberFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & KPI Stat Bento Grid Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Family Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Family Completion</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">{familyCompletionPct}%</span>
              <span className="text-xs text-slate-500 font-medium">{completedAssignments} of {totalAssignments} assignments done</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${familyCompletionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Active Family Members */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Members</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">{members.length}</span>
            <p className="text-xs text-slate-500 mt-1">Parents & children collaborating</p>
          </div>
        </div>

        {/* Card 3: Total Star Points Awarded */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Family Star Bank</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-amber-600">
              {members.reduce((acc, m) => acc + m.points, 0)} ⭐
            </span>
            <p className="text-xs text-slate-500 mt-1">Total stars earned so far</p>
          </div>
        </div>

        {/* Card 4: Top Habit Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Best Progress</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-rose-600">
              🔥 {Math.max(...members.map((m) => m.streak), 0)} Days
            </span>
            <p className="text-xs text-slate-500 mt-1">Consistent daily performance</p>
          </div>
        </div>

      </div>

      {/* Member Filter Tabs & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 overflow-x-auto py-1">
          <span className="text-xs font-bold text-slate-400 uppercase mr-1">Filter:</span>
          <button
            onClick={() => setSelectedMemberFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition ${
              selectedMemberFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Family ({members.length})
          </button>
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMemberFilter(m.id)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                selectedMemberFilter === m.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{m.full_name}</span>
              <span className="text-[10px] opacity-80">({tasks.filter((t) => isTaskAssignedTo(t, m.id)).length})</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          {isParentLoggedIn ? (
            <button
              onClick={() => onOpenMemberModal()}
              className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold transition"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add Member</span>
            </button>
          ) : (
            <div className="text-xs text-slate-500 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
              🔒 Login required to manage members
            </div>
          )}
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-bold transition"
          >
            <Mic className="w-3.5 h-3.5 text-indigo-600" />
            <span>Voice Command</span>
          </button>
          <button
            onClick={onOpenTaskModal}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Assign Task</span>
          </button>
        </div>
      </div>

      {/* Individual Family Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayMembers.map((member) => {
          const memberTasks = tasks.filter((t) => isTaskAssignedTo(t, member.id));
          const memberCompletedCount = memberTasks.filter((t) =>
            taskLogs.some((l) => l.task_id === t.id && l.user_id === member.id && l.completed_at.startsWith(todayStr))
          ).length;
          const memberPct = memberTasks.length > 0 ? Math.round((memberCompletedCount / memberTasks.length) * 100) : 0;

          return (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition space-y-4"
            >
              {/* Member Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-11 h-11 rounded-2xl ${
                      member.color || 'bg-indigo-600'
                    } text-white font-extrabold text-base flex items-center justify-center shadow-xs`}
                  >
                    {member.full_name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{member.full_name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-100 text-slate-600">
                      {member.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                      ⭐ {member.points} pts
                    </span>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">🔥 {member.streak}d progress</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => onOpenMemberModal(member.id)}
                      className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded-lg transition"
                      title="Edit member"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteMember(member.id)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Bar for Today */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Today's Progress</span>
                  <span className="text-indigo-700 font-bold">
                    {memberPct}% ({memberCompletedCount}/{memberTasks.length})
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${memberPct}%` }}
                  />
                </div>
              </div>

              {/* Assigned Tasks Mini List */}
              <div className="space-y-2 pt-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Assigned Tasks ({memberTasks.length})
                  </span>
                  <button
                    onClick={() => onAwardBonus(member.id, 10)}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline flex items-center space-x-1"
                    title="Award +10 Star Points Bonus"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>+10 Bonus ⭐</span>
                  </button>
                </div>

                {memberTasks.length === 0 ? (
                  <div className="p-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 italic">No tasks assigned today.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {memberTasks.map((task) => {
                      const isDone = taskLogs.some(
                        (l) => l.task_id === task.id && l.user_id === member.id && l.completed_at.startsWith(todayStr)
                      );
                      const isMulti = getTaskAssigneeIds(task).length > 1;

                      return (
                        <div
                          key={task.id}
                          className={`p-2.5 rounded-xl border text-xs transition ${
                            isDone
                              ? 'bg-emerald-50/50 border-emerald-200 text-slate-400'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 min-w-0 pr-2">
                              <button
                                onClick={() => onToggleTaskStatus(task.id, member.id)}
                                className="shrink-0"
                                title={isDone ? 'Mark as pending' : 'Mark as complete'}
                              >
                                <CheckCircle2
                                  className={`w-4 h-4 transition ${
                                    isDone ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300 hover:text-emerald-500'
                                  }`}
                                />
                              </button>
                              <div className="min-w-0 truncate">
                                <span className={`font-semibold ${isDone ? 'line-through' : ''}`}>
                                  {task.title}
                                </span>
                                {isMulti && (
                                  <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                                    👥 Multi-Child
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5 shrink-0">
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                +{task.points_reward}⭐
                              </span>
                              <button
                                onClick={() => onEditTask(task)}
                                className="text-slate-300 hover:text-indigo-600 p-1 transition"
                                title="Edit task (change assignee, title, points, etc.)"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteTask(task.id)}
                                className="text-slate-300 hover:text-rose-600 p-1 transition"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <TaskUpdateThread
                            taskId={task.id}
                            currentMember={currentMember}
                            updates={taskUpdates}
                            onAddUpdate={onAddTaskUpdate}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Card Footer: Switch to View as this member */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => onSelectMember(member.id)}
                  className="w-full text-center text-xs font-bold text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 py-1.5 rounded-xl transition"
                >
                  Switch View as {member.full_name} →
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
