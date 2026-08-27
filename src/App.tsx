/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CalendarCheck, 
  LayoutDashboard, 
  History, 
  Mic, 
  PlusCircle, 
  Download, 
  FileCode, 
  BookOpen, 
  Database,
  Award,
  Flame,
  Star,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { MemberDashboard } from './components/MemberDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { ActivityLogsView } from './components/ActivityLogsView';
import { TaskModal } from './components/TaskModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { ExportDownloadModal } from './components/ExportDownloadModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { FamilyMember, Task, TaskLog, SupabaseConfig, isTaskAssignedTo, getTaskAssigneeIds } from './types';

// Default Family Roster
const INITIAL_MEMBERS: FamilyMember[] = [
  { id: 'parent-1', full_name: 'Dad', role: 'parent', email: 'dad@family.com', points: 280, streak: 12, color: 'bg-blue-600' },
  { id: 'parent-2', full_name: 'Mom', role: 'parent', email: 'mom@family.com', points: 310, streak: 15, color: 'bg-purple-600' },
  { id: 'child-1', full_name: 'Ali', role: 'child', email: 'ali@family.com', points: 140, streak: 5, color: 'bg-emerald-600' },
  { id: 'child-2', full_name: 'Sara', role: 'child', email: 'sara@family.com', points: 195, streak: 8, color: 'bg-amber-600' },
  { id: 'child-3', full_name: 'Hamza', role: 'child', email: 'hamza@family.com', points: 80, streak: 3, color: 'bg-rose-600' }
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Morning Fajr Prayer & Quran Recitation',
    description: 'Read 2 pages of Surah Yaseen after morning Fajr.',
    category: 'deen',
    priority: 'high',
    recurrence_type: 'daily',
    assigned_to: ['child-1', 'child-2'], // Shared multi-child task for Ali & Sara
    created_by: 'parent-1',
    points_reward: 15,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'task-2',
    title: 'Complete Mathematics Homework (Algebra Ch 4)',
    description: 'Solve exercises 4.1 to 4.3 and double-check formulas.',
    category: 'homework',
    priority: 'high',
    recurrence_type: 'none',
    assigned_to: 'child-1',
    created_by: 'parent-1',
    points_reward: 20,
    is_active: true,
    due_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  },
  {
    id: 'task-3',
    title: 'Clean Room & Organize Bookshelf',
    description: 'Tidy up the study desk and put clean clothes in closet.',
    category: 'chores',
    priority: 'medium',
    recurrence_type: 'daily',
    assigned_to: ['child-1', 'child-2', 'child-3'], // Multi-child chore for all kids
    created_by: 'parent-2',
    points_reward: 10,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'task-4',
    title: 'Science Project Solar System Model',
    description: 'Prepare planets chart and paint Styrofoam spheres.',
    category: 'homework',
    priority: 'high',
    recurrence_type: 'weekly',
    recurrence_days: [1, 3, 5], // Mon, Wed, Fri
    assigned_to: 'child-2',
    created_by: 'parent-1',
    points_reward: 25,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'task-5',
    title: 'Drink 6 Glasses of Water & 20 min Jog',
    description: 'Stay hydrated through the day and do evening garden jog.',
    category: 'health',
    priority: 'medium',
    recurrence_type: 'daily',
    assigned_to: ['child-2', 'child-3'],
    created_by: 'parent-2',
    points_reward: 15,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'task-6',
    title: 'Read 20 Minutes of English Storybook',
    description: 'Read Chapter 3 of Treasure Island and write 3 new vocabulary words.',
    category: 'reading',
    priority: 'low',
    recurrence_type: 'daily',
    assigned_to: 'child-3',
    created_by: 'parent-1',
    points_reward: 10,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

const INITIAL_LOGS: TaskLog[] = [
  {
    id: 'log-1',
    task_id: 'task-3',
    task_title: 'Clean Room & Organize Bookshelf',
    user_id: 'child-1',
    user_name: 'Ali',
    completed_at: new Date(Date.now() - 3600000).toISOString(),
    status: 'completed',
    points_awarded: 10
  },
  {
    id: 'log-2',
    task_id: 'task-4',
    task_title: 'Science Project Solar System Model',
    user_id: 'child-2',
    user_name: 'Sara',
    completed_at: new Date(Date.now() - 7200000).toISOString(),
    status: 'completed',
    points_awarded: 25
  }
];

export default function App() {
  // State
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('family_members_data');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [currentMemberId, setCurrentMemberId] = useState<string>(() => {
    const saved = localStorage.getItem('family_active_member');
    return saved || 'parent-1';
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('family_tasks_data');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [taskLogs, setTaskLogs] = useState<TaskLog[]>(() => {
    const saved = localStorage.getItem('family_task_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [activeTab, setActiveTab] = useState<'today' | 'parent' | 'logs'>('today');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalTab, setExportModalTab] = useState<'html' | 'sql' | 'guide'>('html');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    const url = localStorage.getItem('family_supa_url') || '';
    const anonKey = localStorage.getItem('family_supa_key') || '';
    return {
      url,
      anonKey,
      isConnected: Boolean(url && anonKey)
    };
  });

  // Local storage persistence sync
  useEffect(() => {
    localStorage.setItem('family_members_data', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('family_tasks_data', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('family_task_logs', JSON.stringify(taskLogs));
  }, [taskLogs]);

  useEffect(() => {
    localStorage.setItem('family_active_member', currentMemberId);
  }, [currentMemberId]);

  const currentMember = members.find((m) => m.id === currentMemberId) || members[0];

  // Handlers
  const handleToggleTaskStatus = (taskId: string, memberId?: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const targetUserId = memberId || currentMember.id;
    const targetUser = members.find((m) => m.id === targetUserId) || currentMember;

    const todayStr = new Date().toISOString().split('T')[0];
    const existingLogIndex = taskLogs.findIndex(
      (l) => l.task_id === taskId && l.user_id === targetUserId && l.completed_at.startsWith(todayStr)
    );

    if (existingLogIndex >= 0) {
      // Mark incomplete (remove log and revert points)
      const removedLog = taskLogs[existingLogIndex];
      setTaskLogs(taskLogs.filter((_, idx) => idx !== existingLogIndex));
      setMembers((prev) =>
        prev.map((m) =>
          m.id === targetUserId
            ? { ...m, points: Math.max(0, m.points - removedLog.points_awarded) }
            : m
        )
      );
    } else {
      // Mark completed (create log and award points)
      const newLog: TaskLog = {
        id: 'log-' + Date.now(),
        task_id: targetTask.id,
        task_title: targetTask.title,
        user_id: targetUserId,
        user_name: targetUser.full_name,
        completed_at: new Date().toISOString(),
        status: 'completed',
        points_awarded: targetTask.points_reward
      };

      setTaskLogs([newLog, ...taskLogs]);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === targetUserId
            ? { ...m, points: m.points + targetTask.points_reward, streak: m.streak + 1 }
            : m
        )
      );
    }
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (taskData.id) {
      // Update existing
      setTasks((prev) =>
        prev.map((t) => (t.id === taskData.id ? ({ ...t, ...taskData } as Task) : t))
      );
    } else {
      // Create new
      const newTask: Task = {
        id: 'task-' + Date.now(),
        title: taskData.title || 'Untitled Task',
        description: taskData.description,
        category: taskData.category || 'general',
        priority: taskData.priority || 'medium',
        recurrence_type: taskData.recurrence_type || 'daily',
        recurrence_days: taskData.recurrence_days,
        recurrence_interval: taskData.recurrence_interval,
        assigned_to: taskData.assigned_to || currentMember.id,
        created_by: currentMember.id,
        points_reward: taskData.points_reward || 15,
        is_active: true,
        due_date: taskData.due_date,
        created_at: new Date().toISOString()
      };

      setTasks([newTask, ...tasks]);

      // Trigger celebratory mini confetti for adding task
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 }
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter((t) => t.id !== taskId));
    }
  };

  const handleAwardBonus = (memberId: string, bonus: number) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, points: m.points + bonus } : m))
    );

    const bonusLog: TaskLog = {
      id: 'log-bonus-' + Date.now(),
      task_id: 'bonus',
      task_title: `Parent Star Award to ${member.full_name}`,
      user_id: member.id,
      user_name: member.full_name,
      completed_at: new Date().toISOString(),
      status: 'approved',
      points_awarded: bonus
    };

    setTaskLogs([bonusLog, ...taskLogs]);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.5 }
    });
  };

  const handleSaveSupabaseConfig = (url: string, anonKey: string) => {
    localStorage.setItem('family_supa_url', url);
    localStorage.setItem('family_supa_key', anonKey);
    setSupabaseConfig({
      url,
      anonKey,
      isConnected: Boolean(url && anonKey)
    });
  };

  const handleResetToDemo = () => {
    localStorage.removeItem('family_supa_url');
    localStorage.removeItem('family_supa_key');
    setSupabaseConfig({
      url: '',
      anonKey: '',
      isConnected: false
    });
  };

  const handleOpenExport = (tab: 'html' | 'sql' | 'guide' = 'html') => {
    setExportModalTab(tab);
    setIsExportModalOpen(true);
  };

  const [quickInputTitle, setQuickInputTitle] = useState('');

  const handleQuickAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickInputTitle.trim()) {
      setIsTaskModalOpen(true);
      return;
    }

    handleSaveTask({
      title: quickInputTitle.trim(),
      assigned_to: currentMember.id,
      category: 'general',
      priority: 'medium',
      recurrence_type: 'daily',
      points_reward: 15
    });

    setQuickInputTitle('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      
      {/* Top Navbar */}
      <Navbar
        currentMember={currentMember}
        members={members}
        onSelectMember={setCurrentMemberId}
        onOpenTaskModal={() => setIsTaskModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenExportModal={handleOpenExport}
        supabaseConfig={supabaseConfig}
      />

      {/* Main Bento Grid App Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        
        {/* Bento Quick Task Bar */}
        <section className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4">
          <form onSubmit={handleQuickAddTask} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full relative">
              <input
                type="text"
                value={quickInputTitle}
                onChange={(e) => setQuickInputTitle(e.target.value)}
                placeholder="Naya task likhen... (e.g. Complete Biology Notes, Sabzi lani hai, Recite Quran)"
                className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 font-medium text-xs sm:text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                title="Voice Dictation (Microphone)"
                className="absolute right-2 top-2 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-1 sm:flex-none bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-indigo-700 transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Task</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="sm:hidden bg-indigo-50 text-indigo-700 px-3 py-3 rounded-xl border border-indigo-200"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </form>
        </section>

        {/* Bento Grid Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Column (8 cols on large) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* View Navigation Segmented Control */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('today')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition ${
                    activeTab === 'today'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Aaj ke Tasks (My Tasks)</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                    activeTab === 'today' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {tasks.filter((t) => t.assigned_to === currentMember.id).length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('parent')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition ${
                    activeTab === 'parent'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Parent Admin</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                    activeTab === 'parent' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    All
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('logs')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition ${
                    activeTab === 'logs'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Audit Logs</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                    activeTab === 'logs' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {taskLogs.length}
                  </span>
                </button>
              </div>

              {/* Status Indicator Chip */}
              <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 font-semibold px-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Sync Active</span>
              </div>
            </div>

            {/* Tab Views */}
            {activeTab === 'today' && (
              <MemberDashboard
                currentMember={currentMember}
                members={members}
                tasks={tasks}
                taskLogs={taskLogs}
                onToggleTaskStatus={handleToggleTaskStatus}
                onOpenTaskModal={() => setIsTaskModalOpen(true)}
                onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              />
            )}

            {activeTab === 'parent' && (
              <ParentDashboard
                members={members}
                tasks={tasks}
                taskLogs={taskLogs}
                onOpenTaskModal={() => setIsTaskModalOpen(true)}
                onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                onToggleTaskStatus={handleToggleTaskStatus}
                onDeleteTask={handleDeleteTask}
                onAwardBonus={handleAwardBonus}
                onSelectMember={(id) => {
                  setCurrentMemberId(id);
                  setActiveTab('today');
                }}
              />
            )}

            {activeTab === 'logs' && (
              <ActivityLogsView logs={taskLogs} members={members} />
            )}

          </div>

          {/* Right Bento Column (4 cols on large) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Dark Bento Card: Family Tracking */}
            <section className="bg-indigo-950 rounded-2xl shadow-md border border-indigo-900 p-5 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Family Tracking</span>
                </h2>
                <span className="text-[11px] font-bold bg-indigo-900 text-indigo-200 px-2 py-0.5 rounded-full">
                  Today's Pulse
                </span>
              </div>

              <div className="space-y-4">
                {members.map((m, idx) => {
                  const memberTasks = tasks.filter((t) => isTaskAssignedTo(t, m.id));
                  const todayStr = new Date().toISOString().split('T')[0];
                  const completed = memberTasks.filter((t) =>
                    taskLogs.some((l) => l.task_id === t.id && l.user_id === m.id && l.completed_at.startsWith(todayStr))
                  ).length;
                  const pct = memberTasks.length > 0 ? Math.round((completed / memberTasks.length) * 100) : 0;

                  const colorVariants = [
                    'bg-emerald-400',
                    'bg-amber-400',
                    'bg-rose-400',
                    'bg-cyan-400',
                    'bg-indigo-400'
                  ];
                  const barColor = colorVariants[idx % colorVariants.length];

                  return (
                    <div key={m.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full ${m.color || 'bg-indigo-600'} flex items-center justify-center text-[10px] font-bold text-white`}>
                            {m.full_name[0]}
                          </div>
                          <span className="font-semibold text-slate-200">{m.full_name}</span>
                          <span className="text-[10px] text-indigo-300 font-medium">({m.role})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] text-amber-300 font-bold">⭐ {m.points}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{pct}%</span>
                        </div>
                      </div>

                      <div className="w-full h-2 bg-indigo-900/80 rounded-full overflow-hidden">
                        <div
                          className={`${barColor} h-full transition-all duration-500 rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-indigo-900/60 flex items-center justify-between text-xs">
                <span className="text-indigo-300">Total Stars Earned:</span>
                <span className="font-extrabold text-amber-300 text-sm">
                  {members.reduce((acc, m) => acc + m.points, 0)} ⭐ Points
                </span>
              </div>
            </section>

            {/* Bento Card: Setup Instructions & Quick SQL Guide */}
            <section className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                  Setup Instructions (Urdu)
                </h2>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Supabase & Voice
                </span>
              </div>

              <div className="text-xs space-y-4 leading-relaxed text-slate-600">
                <div>
                  <p className="font-bold text-indigo-700 mb-1">1. Supabase Setup (Urdu)</p>
                  <p className="text-[11px]">
                    Supabase dashboard par naya project banayein aur SQL editor mein niche wala code paste karein table banane ke liye.
                  </p>
                </div>

                <div className="bg-slate-900 text-indigo-200 p-3 rounded-xl font-mono text-[10px] select-all leading-relaxed overflow-x-auto">
                  <code>
                    CREATE TABLE tasks ({"\n"}
                    &nbsp;&nbsp;id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,{"\n"}
                    &nbsp;&nbsp;user_id uuid REFERENCES auth.users,{"\n"}
                    &nbsp;&nbsp;title TEXT NOT NULL,{"\n"}
                    &nbsp;&nbsp;category TEXT DEFAULT 'general',{"\n"}
                    &nbsp;&nbsp;completed BOOLEAN DEFAULT false{"\n"}
                    );
                  </code>
                </div>

                <div>
                  <p className="font-bold text-indigo-700 mb-1">2. Voice-to-Text Setup</p>
                  <p className="text-[11px]">
                    Browser ke native <span className="font-bold text-slate-800">SpeechRecognition</span> API ko use karein. Microphone button par click karein aur seedha bolen.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-indigo-700 mb-1">3. Admin & Role Control</p>
                  <p className="text-[11px]">
                    Admin dashboard view sirf 'Parent' role wale users ke liye hai. Row Level Security (RLS) policies lazmi active karein.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => handleOpenExport('html')}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-800 border border-slate-200 transition text-xs flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Download Single-File Code (.html)</span>
                  </button>

                  <button
                    onClick={() => handleOpenExport('sql')}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl font-bold text-indigo-700 border border-indigo-200 transition text-xs flex items-center justify-center gap-1.5"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>View Full Supabase SQL</span>
                  </button>
                </div>
              </div>
            </section>

          </div>

        </div>

      </main>

      {/* Bento Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">Family HQ Task Manager</span>
            <span>• Bento Grid Theme, Supabase DB & Web Speech API</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleOpenExport('html')}
              className="font-bold text-indigo-600 hover:underline flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </button>

            <button
              onClick={() => handleOpenExport('sql')}
              className="font-bold text-indigo-600 hover:underline flex items-center space-x-1"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Supabase SQL</span>
            </button>

            <button
              onClick={() => handleOpenExport('guide')}
              className="font-bold text-amber-700 hover:underline flex items-center space-x-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Roman Urdu Guide</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        members={members}
        onSaveTask={handleSaveTask}
      />

      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        members={members}
        onAddTask={handleSaveTask}
      />

      <ExportDownloadModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        initialTab={exportModalTab}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        config={supabaseConfig}
        onSaveConfig={handleSaveSupabaseConfig}
        onResetToDemo={handleResetToDemo}
      />

    </div>
  );
}
