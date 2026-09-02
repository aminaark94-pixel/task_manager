import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Star, 
  CheckCircle, 
  Circle, 
  Calendar, 
  Repeat, 
  Clock, 
  Sparkles, 
  PartyPopper, 
  Filter, 
  Check, 
  Users 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FamilyMember, Task, TaskCategory, TaskLog, TaskUpdate, getTaskAssigneeIds, isTaskAssignedTo } from '../types';
import { TaskUpdateComposer } from './TaskUpdateComposer';

interface MemberDashboardProps {
  currentMember: FamilyMember;
  members: FamilyMember[];
  tasks: Task[];
  taskLogs: TaskLog[];
  taskUpdates: TaskUpdate[];
  onAddTaskUpdate: (update: Omit<TaskUpdate, 'id' | 'created_at'>) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onOpenTaskModal: () => void;
  onOpenVoiceModal: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  currentMember,
  members,
  tasks,
  taskLogs,
  taskUpdates,
  onAddTaskUpdate,
  onToggleTaskStatus,
  onOpenTaskModal,
  onOpenVoiceModal
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Tasks assigned to this current member (supports single and multiple assignees)
  const myTasks = tasks.filter((t) => isTaskAssignedTo(t, currentMember.id));

  // Check completion for this specific member for today
  const isTaskCompletedToday = (taskId: string) => {
    return taskLogs.some((l) => l.task_id === taskId && l.user_id === currentMember.id && l.completed_at.startsWith(todayStr));
  };

  const completedCount = myTasks.filter((t) => isTaskCompletedToday(t.id)).length;
  const pendingCount = myTasks.length - completedCount;
  const progressPct = myTasks.length > 0 ? Math.round((completedCount / myTasks.length) * 100) : 0;

  // Filter tasks
  let filteredTasks = myTasks;
  if (activeFilter === 'pending') {
    filteredTasks = filteredTasks.filter((t) => !isTaskCompletedToday(t.id));
  } else if (activeFilter === 'completed') {
    filteredTasks = filteredTasks.filter((t) => isTaskCompletedToday(t.id));
  }

  if (selectedCategory !== 'all') {
    filteredTasks = filteredTasks.filter((t) => t.category === selectedCategory);
  }

  const handleTaskClick = (taskId: string) => {
    const isCurrentlyDone = isTaskCompletedToday(taskId);
    onToggleTaskStatus(taskId);

    // If completing now, fire confetti celebration!
    if (!isCurrentlyDone) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const getCategoryColor = (cat: TaskCategory) => {
    switch (cat) {
      case 'deen':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'homework':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'chores':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'health':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'reading':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRecurrenceLabel = (task: Task) => {
    if (task.recurrence_type === 'daily') return '🔄 Daily';
    if (task.recurrence_type === 'weekly') return '📅 Weekly';
    if (task.recurrence_type === 'custom') return `⏳ Every ${task.recurrence_interval || 2}d`;
    return '🎯 One-Time';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Profile & Motivation Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1: Today's Completion */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Progress</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <h3 className="text-3xl font-extrabold text-slate-900">{progressPct}%</h3>
              <span className="text-xs text-slate-500 font-semibold">({completedCount}/{myTasks.length})</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {pendingCount === 0 && myTasks.length > 0 ? '🎉 All tasks done for today!' : `${pendingCount} tasks remaining`}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Habit Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Progress</p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">🔥 {currentMember.streak} Days</h3>
            <p className="text-xs text-slate-500 mt-0.5">Consistency unlocks bonus stars</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Earned Stars */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Reward Stars</p>
            <h3 className="text-3xl font-extrabold text-indigo-600 mt-1">⭐ {currentMember.points} pts</h3>
            <p className="text-xs text-slate-500 mt-0.5">Family points leaderboard</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Filter and Category Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Status Filters */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({myTasks.length})
          </button>

          <button
            onClick={() => setActiveFilter('pending')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition ${
              activeFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending ({pendingCount})
          </button>

          <button
            onClick={() => setActiveFilter('completed')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition ${
              activeFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-bold uppercase">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="chores">🧹 Chores</option>
            <option value="homework">📚 Homework</option>
            <option value="deen">🕌 Prayer / Deen</option>
            <option value="health">🥗 Health</option>
            <option value="reading">📖 Reading</option>
            <option value="general">✨ General</option>
          </select>
        </div>

      </div>

      {/* Task Cards Grid */}
      {filteredTasks.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <PartyPopper className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            {myTasks.length === 0
              ? 'No tasks assigned yet!'
              : 'You have caught up with all tasks in this view!'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {myTasks.length === 0
              ? 'Ask Dad or Mom to assign a new task or click Voice Task to add one.'
              : 'Enjoy your free time or add a new goal using voice commands.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const isDone = isTaskCompletedToday(task.id);

            return (
              <div
                key={task.id}
                className={`rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                  isDone
                    ? 'bg-emerald-50/40 border-emerald-200/80 shadow-inner'
                    : 'bg-white border-slate-200 hover:shadow-md hover:border-slate-300'
                }`}
              >
                {/* Header: Category Tag & Points */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryColor(task.category)}`}>
                      {task.category.toUpperCase()}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] font-medium text-slate-500 px-2 py-0.5 rounded-md bg-slate-100">
                        {getRecurrenceLabel(task)}
                      </span>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                        +{task.points_reward} ⭐
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className={`text-base font-bold leading-snug ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className={`text-xs mt-1.5 leading-relaxed ${isDone ? 'line-through text-slate-400' : 'text-slate-500'}`}>
                        {task.description}
                      </p>
                    )}

                    {/* Multi-Child Assignment Badge */}
                    {getTaskAssigneeIds(task).length > 1 && (
                      <div className="mt-2.5 flex items-center space-x-1.5 text-[11px] bg-slate-100/90 text-slate-700 px-2.5 py-1 rounded-xl w-fit">
                        <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>
                          Shared with:{' '}
                          <strong className="text-slate-900">
                            {members
                              .filter((m) => getTaskAssigneeIds(task).includes(m.id))
                              .map((m) => (m.id === currentMember.id ? `${m.full_name} (You)` : m.full_name))
                              .join(', ')}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Checkbox Toggle */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-[11px] text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due: Today</span>
                  </div>

                  <button
                    onClick={() => handleTaskClick(task.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 shadow-xs ${
                      isDone
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Completed!</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" />
                        <span>Mark Complete</span>
                      </>
                    )}
                  </button>
                </div>

                <TaskUpdateComposer
                  task={task}
                  currentMember={currentMember}
                  updates={taskUpdates.filter((u) => u.task_id === task.id)}
                  onSubmit={onAddTaskUpdate}
                />

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
