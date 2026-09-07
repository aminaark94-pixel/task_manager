/**test
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, CalendarCheck, LayoutDashboard, History, Mic, CirclePlus as PlusCircle, Database, Award, Flame, Star, CircleCheck as CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { MemberDashboard } from './components/MemberDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { ActivityLogsView } from './components/ActivityLogsView';
import { TaskModal } from './components/TaskModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { ExportDownloadModal } from './components/ExportDownloadModal';
import { MemberFormModal } from './components/MemberFormModal';
import { ParentLoginModal } from './components/ParentLoginModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import {
  subscribeToMembers,
  subscribeToTasks,
  subscribeToTaskLogs,
  subscribeToTaskUpdates,
  saveMembersToCloud,
  saveTasksToCloud,
  saveTaskLogsToCloud,
  saveTaskUpdatesToCloud
} from './lib/firestoreSync';
import {
  initializeFCM,
  listenForMessages,
  notifyTaskCompletion,
  subscribeToMemberNotifications,
  startScheduledNotificationChecker,
  stopScheduledNotificationChecker
} from './lib/notificationService';
import { FamilyMember, Task, TaskLog, TaskUpdate, isTaskAssignedTo, getTaskAssigneeIds } from './types';

// Default Family Roster
// Seed data used ONLY if Firestore genuinely has no data yet for this
// family (see the onMissing callbacks below). This mirrors the real
// family's current data as of 2026-09-07 — but Dad's streak is deliberately
// set to 32 here (his real streak is 12) purely as a canary: if this seed
// data is ever what's showing on screen instead of your real data, the
// "Family Best Streak" badge will read 32 instead of 12, and you'll know
// instantly that something reverted — the actual latest data always lives
// in Firestore, and the "Backup"/"Restore" buttons are the reliable way to
// recover it if that ever happens.
const INITIAL_MEMBERS: FamilyMember[] = [
  { id: 'parent-1', full_name: 'Dad', role: 'parent', email: 'dad@family.com', points: 280, streak: 32, color: 'bg-blue-600' },
  { id: 'member-1788220686024', full_name: 'Amna', role: 'parent', email: 'amna@family.com', points: 0, streak: 0, color: 'bg-purple-600' },
  { id: 'member-1788220702002', full_name: 'Hijab', role: 'child', email: 'hijab@family.com', points: 30, streak: 3, color: 'bg-emerald-600' },
  { id: 'member-1788220713131', full_name: 'Nooh', role: 'child', email: 'nooh@family.com', points: 30, streak: 3, color: 'bg-orange-600' },
  { id: 'member-1788220721009', full_name: 'Hud', role: 'child', email: 'hud@family.com', points: 20, streak: 2, color: 'bg-rose-600' }
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1788750466278',
    title: '30 min Hud ko English Tenses seekhao.',
    description: 'is me sikhana hai Nooh ko Hud ko Tenses 1 by 1 all 12 bht pyar se or smjha kr daantna bilkul nahi hai.',
    category: 'homework',
    priority: 'high',
    recurrence_type: 'daily',
    assigned_to: ['child-1', 'member-1788220713131'],
    created_by: 'member-1788220702002',
    points_reward: 10,
    is_active: true,
    due_date: '2026-09-07',
    created_at: '2026-09-07T03:07:46.278Z'
  },
  {
    id: 'task-1788750415759',
    title: '30 min Nooh se English Tenses seekho.',
    description: '30 min conversation alag hai Hud is me tm Nooh se Tenses seekho gey 30 min k liye daily.',
    category: 'homework',
    priority: 'high',
    recurrence_type: 'daily',
    assigned_to: ['child-1', 'member-1788220721009'],
    created_by: 'member-1788220702002',
    points_reward: 10,
    is_active: true,
    due_date: '2026-09-07',
    created_at: '2026-09-07T03:06:55.759Z'
  },
  {
    id: 'task-1788281446161',
    title: 'Sipara class',
    description: '',
    category: 'homework',
    priority: 'high',
    recurrence_type: 'daily',
    assigned_to: 'member-1788220721009',
    created_by: 'parent-1',
    points_reward: 10,
    is_active: true,
    due_date: '2026-09-01',
    created_at: '2026-09-01T16:50:46.161Z'
  },
  {
    id: 'task-1788281362144',
    title: 'samaan laani',
    description: '',
    category: 'homework',
    priority: 'high',
    recurrence_type: 'daily',
    assigned_to: 'member-1788220713131',
    created_by: 'parent-1',
    points_reward: 10,
    is_active: true,
    due_date: '2026-09-01',
    created_at: '2026-09-01T16:49:22.144Z'
  },
  {
    id: 'task-1788281342169',
    title: 'coding / english',
    description: '',
    category: 'homework',
    priority: 'high',
    recurrence_type: 'daily',
    assigned_to: 'member-1788220713131',
    created_by: 'parent-1',
    points_reward: 10,
    is_active: true,
    due_date: '2026-09-01',
    created_at: '2026-09-01T16:49:02.169Z'
  },
  {
    id: 'task-1788281297261',
    title: '2 hours test',
    description: '',
    category: 'chores',
    priority: 'high',
    recurrence_type: 'daily',
    assigned_to: 'member-1788220702002',
    created_by: 'parent-1',
    points_reward: 10,
    is_active: true,
    due_date: '2026-09-01',
    created_at: '2026-09-01T16:48:17.261Z'
  },
  {
    id: 'task-1788281285897',
    title: '5 hours Study',
    description: '',
    category: 'chores',
    priority: 'high',
    recurrence_type: 'daily',
    assigned_to: 'member-1788220702002',
    created_by: 'parent-1',
    points_reward: 10,
    is_active: true,
    due_date: '2026-09-01',
    created_at: '2026-09-01T16:48:05.897Z'
  },
  {
    id: 'task-1788281260458',
    title: 'dusting',
    description: '',
    category: 'chores',
    priority: 'high',
    recurrence_type: 'custom',
    recurrence_interval: 2,
    assigned_to: 'member-1788220702002',
    created_by: 'parent-1',
    points_reward: 10,
    is_active: true,
    due_date: '2026-09-01',
    created_at: '2026-09-01T16:47:40.458Z'
  },
  {
    id: 'task-1788281253195',
    title: 'Sweep the floor',
    description: '',
    category: 'chores',
    priority: 'high',
    recurrence_type: 'custom',
    recurrence_interval: 2,
    assigned_to: 'member-1788220702002',
    created_by: 'parent-1',
    points_reward: 10,
    is_active: true,
    due_date: '2026-09-01',
    created_at: '2026-09-01T16:47:33.195Z'
  },
  {
    id: 'task-1788280881925',
    title: 'Blender 2 hours class',
    description: '',
    category: 'homework',
    priority: 'high',
    recurrence_type: 'daily',
    assigned_to: 'member-1788220721009',
    created_by: 'parent-1',
    points_reward: 10,
    is_active: true,
    due_date: '2026-09-01',
    created_at: '2026-09-01T16:41:21.925Z'
  },
  {
    id: 'task-1788220777065',
    title: 'English Coversation 30 min',
    description: '',
    category: 'general',
    priority: 'high',
    recurrence_type: 'daily',
    assigned_to: ['child-1', 'member-1788220702002', 'member-1788220721009', 'member-1788220713131'],
    created_by: 'parent-1',
    points_reward: 10,
    is_active: true,
    due_date: '2026-08-31',
    created_at: '2026-08-31T23:59:37.065Z'
  },
  {
    id: 'task-1788220758156',
    title: 'Exercise',
    description: '',
    category: 'health',
    priority: 'high',
    recurrence_type: 'daily',
    assigned_to: ['child-1', 'member-1788220702002', 'member-1788220721009', 'member-1788220713131'],
    created_by: 'parent-1',
    points_reward: 10,
    is_active: true,
    due_date: '2026-08-31',
    created_at: '2026-08-31T23:59:18.156Z'
  },
  {
    id: 'task-1788220740798',
    title: 'Quran Class',
    description: '',
    category: 'deen',
    priority: 'medium',
    recurrence_type: 'daily',
    assigned_to: ['child-1', 'member-1788220702002', 'member-1788220721009', 'member-1788220713131'],
    created_by: 'parent-1',
    points_reward: 10,
    is_active: true,
    due_date: '2026-08-31',
    created_at: '2026-08-31T23:59:00.798Z'
  }
];

const INITIAL_LOGS: TaskLog[] = [
  {
    id: 'log-1788280999016',
    task_id: 'task-1788220740798',
    task_title: 'Quran Class',
    user_id: 'member-1788220721009',
    user_name: 'Hud',
    completed_at: '2026-09-01T16:43:19.016Z',
    status: 'completed',
    points_awarded: 10
  },
  {
    id: 'log-1788263406013',
    task_id: 'task-1788220740798',
    task_title: 'Quran Class',
    user_id: 'member-1788220713131',
    user_name: 'Nooh',
    completed_at: '2026-09-01T11:50:06.013Z',
    status: 'completed',
    points_awarded: 10
  },
  {
    id: 'log-1788263399740',
    task_id: 'task-1788220777065',
    task_title: 'English Coversation 30 min',
    user_id: 'member-1788220713131',
    user_name: 'Nooh',
    completed_at: '2026-09-01T11:49:59.740Z',
    status: 'completed',
    points_awarded: 10
  },
  {
    id: 'log-1788263389036',
    task_id: 'task-1788220777065',
    task_title: 'English Coversation 30 min',
    user_id: 'member-1788220702002',
    user_name: 'Hijab',
    completed_at: '2026-09-01T11:49:49.036Z',
    status: 'completed',
    points_awarded: 10
  },
  {
    id: 'log-1788256866673',
    task_id: 'task-1788220740798',
    task_title: 'Quran Class',
    user_id: 'member-1788220702002',
    user_name: 'Hijab',
    completed_at: '2026-09-01T10:01:06.673Z',
    status: 'completed',
    points_awarded: 10
  },
  {
    id: 'log-1788250660040',
    task_id: 'task-1788220758156',
    task_title: 'Exercise',
    user_id: 'member-1788220721009',
    user_name: 'Hud',
    completed_at: '2026-09-01T08:17:40.040Z',
    status: 'completed',
    points_awarded: 10
  },
  {
    id: 'log-1788250653833',
    task_id: 'task-1788220758156',
    task_title: 'Exercise',
    user_id: 'member-1788220713131',
    user_name: 'Nooh',
    completed_at: '2026-09-01T08:17:33.833Z',
    status: 'completed',
    points_awarded: 10
  },
  {
    id: 'log-1788250612845',
    task_id: 'task-1788220758156',
    task_title: 'Exercise',
    user_id: 'member-1788220702002',
    user_name: 'Hijab',
    completed_at: '2026-09-01T08:16:52.845Z',
    status: 'completed',
    points_awarded: 10
  }
];

export default function App() {
  // State — starts from the local cache if present, otherwise EMPTY (never
  // the hardcoded demo data). Demo data is only ever introduced inside the
  // Firestore "onMissing" callback below, confirming it's truly the very
  // first run — this is what prevents demo data from ever silently
  // overwriting real cloud data again.
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('family_members_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentMemberId, setCurrentMemberId] = useState<string>(() => {
    const saved = localStorage.getItem('family_active_member');
    return saved || 'parent-1';
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('family_tasks_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [taskLogs, setTaskLogs] = useState<TaskLog[]>(() => {
    const saved = localStorage.getItem('family_task_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [taskUpdates, setTaskUpdates] = useState<TaskUpdate[]>(() => {
    const saved = localStorage.getItem('family_task_updates');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'today' | 'parent' | 'logs'>('today');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalTab, setExportModalTab] = useState<'html' | 'sql' | 'guide'>('html');
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  
  // Parent login state
  const [isParentLoginModalOpen, setIsParentLoginModalOpen] = useState(false);
  const [isParentLoggedIn, setIsParentLoggedIn] = useState(() => {
    return localStorage.getItem('parent_logged_in') === 'true';
  });

  // Notification settings state
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);

  // Refs to skip writing straight back to Firestore when a state update
  // originated FROM a Firestore snapshot (avoids redundant round-trips).
  const skipCloudWrite = useRef({ members: false, tasks: false, taskLogs: false, taskUpdates: false });

  // Tracks whether we've heard from Firestore at least once for each data
  // type (either real data, or confirmation the doc doesn't exist yet).
  // The "push local changes to cloud" effects below MUST wait for this —
  // otherwise, on a fresh device (empty localStorage → default demo data),
  // the push effect fires on mount BEFORE the real cloud data has loaded,
  // silently overwriting every other device's saved members/tasks with
  // local defaults. This was the root cause of data "disappearing".
  const hasSyncedFromCloud = useRef({ members: false, tasks: false, taskLogs: false, taskUpdates: false });

  // Tracks the last count we know the cloud legitimately had, so the guard
  // above can tell "real deletion down to zero" apart from "empty by glitch".
  const lastKnownCloudMemberCount = useRef(0);
  const lastKnownCloudTaskCount = useRef(0);

  const currentMember = members.find((m) => m.id === currentMemberId) || members[0];

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
    localStorage.setItem('family_task_updates', JSON.stringify(taskUpdates));
  }, [taskUpdates]);

  useEffect(() => {
    localStorage.setItem('family_active_member', currentMemberId);
  }, [currentMemberId]);

  // Firestore real-time sync: pulls live updates from the cloud so every
  // family device stays in sync, and seeds the cloud on first run.
  useEffect(() => {
    const unsubMembers = subscribeToMembers(
      (cloudMembers) => {
        skipCloudWrite.current.members = true;
        hasSyncedFromCloud.current.members = true;
        lastKnownCloudMemberCount.current = cloudMembers.length;
        setMembers(cloudMembers);
        setCloudStatus('connected');
      },
      () => setCloudStatus('error'),
      () => {
        // Firestore confirms the doc genuinely doesn't exist — this really
        // is the first run ever, so (and only so) seed with the demo set.
        hasSyncedFromCloud.current.members = true;
        lastKnownCloudMemberCount.current = INITIAL_MEMBERS.length;
        skipCloudWrite.current.members = true;
        setMembers(INITIAL_MEMBERS);
        saveMembersToCloud(INITIAL_MEMBERS).catch(() => setCloudStatus('error'));
        setCloudStatus('connected');
      }
    );

    const unsubTasks = subscribeToTasks(
      (cloudTasks) => {
        skipCloudWrite.current.tasks = true;
        hasSyncedFromCloud.current.tasks = true;
        lastKnownCloudTaskCount.current = cloudTasks.length;
        setTasks(cloudTasks);
        setCloudStatus('connected');
      },
      () => setCloudStatus('error'),
      () => {
        hasSyncedFromCloud.current.tasks = true;
        lastKnownCloudTaskCount.current = INITIAL_TASKS.length;
        skipCloudWrite.current.tasks = true;
        setTasks(INITIAL_TASKS);
        saveTasksToCloud(INITIAL_TASKS).catch(() => setCloudStatus('error'));
      }
    );

    const unsubLogs = subscribeToTaskLogs(
      (cloudLogs) => {
        skipCloudWrite.current.taskLogs = true;
        hasSyncedFromCloud.current.taskLogs = true;
        setTaskLogs(cloudLogs);
        setCloudStatus('connected');
      },
      () => setCloudStatus('error'),
      () => {
        hasSyncedFromCloud.current.taskLogs = true;
        skipCloudWrite.current.taskLogs = true;
        setTaskLogs(INITIAL_LOGS);
        saveTaskLogsToCloud(INITIAL_LOGS).catch(() => setCloudStatus('error'));
      }
    );

    const unsubTaskUpdates = subscribeToTaskUpdates(
      (cloudUpdates) => {
        skipCloudWrite.current.taskUpdates = true;
        hasSyncedFromCloud.current.taskUpdates = true;
        setTaskUpdates(cloudUpdates);
        setCloudStatus('connected');
      },
      () => setCloudStatus('error'),
      () => {
        // No updates yet ever — that's a normal, valid empty state (not demo data).
        hasSyncedFromCloud.current.taskUpdates = true;
        skipCloudWrite.current.taskUpdates = true;
        setTaskUpdates([]);
        saveTaskUpdatesToCloud([]).catch(() => setCloudStatus('error'));
      }
    );

    return () => {
      unsubMembers();
      unsubTasks();
      unsubLogs();
      unsubTaskUpdates();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize Firebase Cloud Messaging (FCM) for notifications
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Register service worker for background notifications
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('✅ Service Worker registered:', registration);
          } catch (error) {
            console.log('⚠️ Service Worker registration failed:', error);
          }
        }
        
        await initializeFCM();
        listenForMessages();
        startScheduledNotificationChecker();
        
        // Subscribe current member to their notifications
        if (currentMember) {
          await subscribeToMemberNotifications(currentMember.id, currentMember.full_name);
        }
      } catch (error) {
        console.log('⚠️ Notification setup skipped:', error);
      }
    };
    
    setupNotifications();
  }, [currentMember]);

  // Push local changes up to Firestore (skipped when the change just came
  // FROM Firestore, to avoid an unnecessary write-back loop — and skipped
  // entirely until we've synced from the cloud at least once, so a fresh
  // device never wipes other devices' data with local demo defaults).
  useEffect(() => {
    if (skipCloudWrite.current.members) {
      skipCloudWrite.current.members = false;
      return;
    }
    if (!hasSyncedFromCloud.current.members) return;
    // Extra safety net: never let an empty array silently wipe previously
    // saved data (e.g. a transient render glitch) — only an explicit
    // Restore or a real deletion down to zero members should do that.
    if (members.length === 0 && lastKnownCloudMemberCount.current > 0) {
      console.warn('Refused to push an empty members list over existing cloud data.');
      return;
    }
    lastKnownCloudMemberCount.current = members.length;
    saveMembersToCloud(members).catch(() => setCloudStatus('error'));
  }, [members]);

  useEffect(() => {
    if (skipCloudWrite.current.tasks) {
      skipCloudWrite.current.tasks = false;
      return;
    }
    if (!hasSyncedFromCloud.current.tasks) return;
    if (tasks.length === 0 && lastKnownCloudTaskCount.current > 0) {
      console.warn('Refused to push an empty tasks list over existing cloud data.');
      return;
    }
    lastKnownCloudTaskCount.current = tasks.length;
    saveTasksToCloud(tasks).catch(() => setCloudStatus('error'));
  }, [tasks]);

  useEffect(() => {
    if (skipCloudWrite.current.taskLogs) {
      skipCloudWrite.current.taskLogs = false;
      return;
    }
    if (!hasSyncedFromCloud.current.taskLogs) return;
    saveTaskLogsToCloud(taskLogs).catch(() => setCloudStatus('error'));
  }, [taskLogs]);

  useEffect(() => {
    if (skipCloudWrite.current.taskUpdates) {
      skipCloudWrite.current.taskUpdates = false;
      return;
    }
    if (!hasSyncedFromCloud.current.taskUpdates) return;
    saveTaskUpdatesToCloud(taskUpdates).catch(() => setCloudStatus('error'));
  }, [taskUpdates]);

  // Handlers

  // Downloads a full JSON snapshot of members/tasks/logs — a one-click
  // safety backup the user can restore from if data ever disappears.
  const handleBackupNow = () => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      members,
      tasks,
      taskLogs,
      taskUpdates,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family-task-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Restores members/tasks/logs from a previously downloaded backup file.
  const handleRestoreFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed.members) || !Array.isArray(parsed.tasks)) {
          alert('This file doesn\'t look like a valid backup.');
          return;
        }
        const confirmed = window.confirm(
          `Restore ${parsed.members.length} members and ${parsed.tasks.length} tasks from this backup? This will replace what's currently loaded (and sync to the cloud for every device).`
        );
        if (!confirmed) return;

        setMembers(parsed.members);
        setTasks(parsed.tasks);
        if (Array.isArray(parsed.taskLogs)) setTaskLogs(parsed.taskLogs);
        if (Array.isArray(parsed.taskUpdates)) setTaskUpdates(parsed.taskUpdates);

        // Make sure the restored data is treated as a real user change (not
        // skipped as an echo) so it actually pushes back up to the cloud.
        hasSyncedFromCloud.current.members = true;
        hasSyncedFromCloud.current.tasks = true;
        hasSyncedFromCloud.current.taskLogs = true;
        hasSyncedFromCloud.current.taskUpdates = true;
      } catch (e) {
        alert('Could not read this file — make sure it\'s an unmodified backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Adds a text or voice reply/update on a task, from whichever member is
  // currently viewing it. Voice notes are uploaded to Storage first, then
  // the resulting URL is what actually gets saved on the update record.
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

      // Send notification to the member who completed the task
      notifyTaskCompletion(
        targetUser.full_name,
        targetTask.title,
        targetTask.points_reward
      );

      // Trigger celebration confetti
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.5 }
      });
    }
  };

  const handleAddTaskUpdate = (update: Omit<TaskUpdate, 'id' | 'created_at'>) => {
    const newUpdate: TaskUpdate = {
      ...update,
      id: 'update-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    setTaskUpdates((prev) => [newUpdate, ...prev]);
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

      // Send notifications to assigned members
      const assigneeIds = typeof newTask.assigned_to === 'string'
        ? [newTask.assigned_to]
        : newTask.assigned_to;

      assigneeIds.forEach((memberId) => {
        const assignee = members.find((m) => m.id === memberId);
        if (assignee && assignee.id !== currentMember.id) {
          // Import and use notifyTaskAssignment when available
          // For now, we'll use the basic notification
          const title = '📋 New Task Assigned!';
          const body = `${currentMember.full_name} ne tum ko "${newTask.title}" assign kiya`;
          
          // Create a simple notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body });
          }
        }
      });

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

  const handleOpenMemberModal = (memberId?: string) => {
    const member = memberId ? members.find((m) => m.id === memberId) || null : null;
    setEditingMember(member);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (memberData: Partial<FamilyMember>) => {
    if (memberData.id) {
      // Update existing member
      setMembers((prev) =>
        prev.map((m) => (m.id === memberData.id ? ({ ...m, ...memberData } as FamilyMember) : m))
      );
    } else {
      // Create new member
      const newMember: FamilyMember = {
        id: 'member-' + Date.now(),
        full_name: memberData.full_name || 'New Member',
        role: memberData.role || 'child',
        email: memberData.email || '',
        color: memberData.color || 'bg-indigo-600',
        points: 0,
        streak: 0
      };
      setMembers((prev) => [...prev, newMember]);
    }
  };

  const handleDeleteMember = (memberId: string) => {
    if (members.length <= 1) {
      alert('At least one family member is required.');
      return;
    }
    if (!confirm('Delete this family member? Their task history will be kept in logs, but they will be removed from the roster.')) {
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    // Reassign current viewer if the deleted member was active
    if (currentMemberId === memberId) {
      const fallback = members.find((m) => m.id !== memberId);
      if (fallback) setCurrentMemberId(fallback.id);
    }
  };

  const handleOpenExport = (tab: 'html' | 'sql' | 'guide' = 'html') => {
    setExportModalTab(tab);
    setIsExportModalOpen(true);
  };

  const handleParentLoginSuccess = () => {
    setIsParentLoggedIn(true);
    localStorage.setItem('parent_logged_in', 'true');
  };

  const handleParentLogout = () => {
    setIsParentLoggedIn(false);
    localStorage.removeItem('parent_logged_in');
  };

  const handleNotificationSettingsSave = (notifications: any[]) => {
    // Notifications are saved to localStorage in the modal
    // Here we could update the scheduler if needed
    console.log('Notification settings updated:', notifications);
    setIsNotificationSettingsOpen(false);
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

  // Show a lightweight loading screen until we've heard from Firestore at
  // least once — this guarantees the demo data (or a stale local cache)
  // is never what the user sees or works with before the real cloud state
  // has loaded, closing the last gap that could cause data loss.
  const isFullySynced =
    hasSyncedFromCloud.current.members &&
    hasSyncedFromCloud.current.tasks &&
    hasSyncedFromCloud.current.taskLogs &&
    hasSyncedFromCloud.current.taskUpdates;

  if (!isFullySynced && cloudStatus !== 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-semibold">Syncing with your family's data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      
      {/* Top Navbar */}
      <Navbar
        currentMember={currentMember}
        members={members}
        onSelectMember={setCurrentMemberId}
        onOpenTaskModal={() => setIsTaskModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        cloudStatus={cloudStatus}
        isParentLoggedIn={isParentLoggedIn}
        onOpenParentLogin={() => setIsParentLoginModalOpen(true)}
        onLogoutParent={handleParentLogout}
        onOpenNotificationSettings={() => setIsNotificationSettingsOpen(true)}
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

              {/* Status Indicator Chip + Backup/Restore */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 font-semibold px-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${cloudStatus === 'connected' ? 'bg-emerald-500' : cloudStatus === 'error' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  <span>{cloudStatus === 'connected' ? 'Live Sync Active' : cloudStatus === 'error' ? 'Sync Error' : 'Connecting...'}</span>
                </div>

                <button
                  onClick={handleBackupNow}
                  title="Download a backup of all members, tasks & logs"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Backup</span>
                </button>

                <label
                  title="Restore members, tasks & logs from a backup file"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Restore</span>
                  <input
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleRestoreFile(e.target.files[0]);
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Tab Views */}
            {activeTab === 'today' && (
              <MemberDashboard
                currentMember={currentMember}
                members={members}
                tasks={tasks}
                taskLogs={taskLogs}
                taskUpdates={taskUpdates}
                onAddTaskUpdate={handleAddTaskUpdate}
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
                taskUpdates={taskUpdates}
                currentMember={currentMember}
                onAddTaskUpdate={handleAddTaskUpdate}
                onOpenTaskModal={() => setIsTaskModalOpen(true)}
                onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                onToggleTaskStatus={handleToggleTaskStatus}
                onDeleteTask={handleDeleteTask}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setIsTaskModalOpen(true);
                }}
                onAwardBonus={handleAwardBonus}
                onSelectMember={(id) => {
                  setCurrentMemberId(id);
                  setActiveTab('today');
                }}
                onOpenMemberModal={handleOpenMemberModal}
                onDeleteMember={handleDeleteMember}
                isParentLoggedIn={isParentLoggedIn}
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

          </div>

        </div>

      </main>

      {/* Bento Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">Family HQ Task Manager</span>
            <span>• Bento Grid Theme, Firebase Cloud Sync & Web Speech API</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        members={members}
        onSaveTask={(taskData) => {
          handleSaveTask(taskData);
          setEditingTask(null);
        }}
        initialTask={editingTask}
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

      <MemberFormModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSave={handleSaveMember}
        editingMember={editingMember}
      />

      <ParentLoginModal
        isOpen={isParentLoginModalOpen}
        onClose={() => setIsParentLoginModalOpen(false)}
        onLoginSuccess={handleParentLoginSuccess}
      />

      <NotificationSettingsModal
        isOpen={isNotificationSettingsOpen}
        onClose={() => setIsNotificationSettingsOpen(false)}
        onSave={handleNotificationSettingsSave}
      />

    </div>
  );
}
