/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseApp } from './firebase';

// Notification types
export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, string>;
}

/**
 * Initialize FCM (Firebase Cloud Messaging)
 * Call this once when app starts
 */
export async function initializeFCM(): Promise<string | void> {
  try {
    const messaging = getMessaging(firebaseApp);
    
    // Request notification permission
    const permission = Notification.permission;
    
    if (permission === 'default') {
      // Ask for permission
      const result = await Notification.requestPermission();
      if (result !== 'granted') {
        console.log('📵 Notifications denied by user');
        return;
      }
    }
    
    if (permission === 'granted') {
      console.log('✅ Notifications permission granted');
      
      // Get FCM token
      try {
        const token = await getToken(messaging, {
          vapidKey: 'BD8j4jxBYwIRglmPLG6AKLj7ZBPiX7sEshC_r7Q1wqBjh4lsJ8vF5KPv5nqT1HqzC0qJjqT1HqzC0qJjqT1HqzC0qJjq'
          // This is a public VAPID key - safe to expose
        });
        
        console.log('🔑 FCM Token:', token.substring(0, 20) + '...');
        localStorage.setItem('fcm_token', token);
        return token;
      } catch (error) {
        console.log('⚠️ Could not get FCM token:', error);
      }
    }
  } catch (error) {
    console.log('⚠️ FCM initialization error:', error);
  }
}

/**
 * Subscribe to notifications for a specific family member
 * Example: notifications_ali, notifications_sara, etc.
 */
export async function subscribeToMemberNotifications(
  memberId: string,
  memberName: string
): Promise<void> {
  try {
    const messaging = getMessaging(firebaseApp);
    const topic = `notifications_${memberId}`;
    
    // Note: Topic subscription requires backend implementation
    // For now, we'll use localStorage to track subscriptions
    const subscriptions = JSON.parse(
      localStorage.getItem('fcm_subscriptions') || '[]'
    );
    
    if (!subscriptions.includes(topic)) {
      subscriptions.push(topic);
      localStorage.setItem('fcm_subscriptions', JSON.stringify(subscriptions));
      console.log(`✅ Subscribed to ${memberName} notifications`);
    }
  } catch (error) {
    console.log('⚠️ Subscription error:', error);
  }
}

/**
 * Listen for incoming messages
 * Call this once when app starts
 */
export function listenForMessages(): void {
  try {
    const messaging = getMessaging(firebaseApp);
    
    // Handle foreground messages
    onMessage(messaging, (payload) => {
      console.log('📬 Message received:', payload);
      
      if (payload.notification) {
        const { title, body } = payload.notification;
        
        // Show browser notification
        showNotification(
          title || 'Family Task Manager',
          body || 'You have a new notification',
          payload.data
        );
        
        // Play sound
        playNotificationSound();
      }
    });
    
    console.log('✅ Message listener set up');
  } catch (error) {
    console.log('⚠️ Message listener error:', error);
  }
}

/**
 * Show browser notification
 */
export function showNotification(
  title: string,
  body: string,
  data?: Record<string, string>
): Notification | null {
  if (!('Notification' in window)) {
    console.log('📵 Notifications not supported');
    return null;
  }
  
  if (Notification.permission !== 'granted') {
    console.log('📵 Notification permission not granted');
    return null;
  }
  
  const notification = new Notification(title, {
    body,
    icon: '/family-icon.png',
    badge: '/family-badge.png',
    tag: 'family-task-notification',
    requireInteraction: false,
    ...data
  });
  
  // Auto close after 5 seconds
  setTimeout(() => notification.close(), 5000);
  
  return notification;
}

/**
 * Play notification sound
 */
export function playNotificationSound(): void {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log('⚠️ Could not play notification sound:', error);
  }
}

/**
 * Create a task completion notification
 */
export function notifyTaskCompletion(
  memberName: string,
  taskTitle: string,
  pointsAwarded: number
): void {
  const title = `🎉 Task Complete!`;
  const body = `${memberName} ne "${taskTitle}" complete kiya! +${pointsAwarded} points`;
  
  showNotification(title, body, {
    action: 'task-complete',
    memberName,
    taskTitle,
    pointsAwarded: pointsAwarded.toString()
  });
  
  playNotificationSound();
}

/**
 * Create a task assignment notification
 */
export function notifyTaskAssignment(
  childName: string,
  taskTitle: string,
  assignedBy: string
): void {
  const title = `📋 New Task Assigned!`;
  const body = `${assignedBy} ne ${childName} ko "${taskTitle}" assign kiya`;
  
  showNotification(title, body, {
    action: 'task-assigned',
    childName,
    taskTitle,
    assignedBy
  });
  
  playNotificationSound();
}

/**
 * Create a streak milestone notification
 */
export function notifyStreakMilestone(
  memberName: string,
  streakDays: number
): void {
  const title = `🔥 Progress Milestone!`;
  const body = `${memberName} ka ${streakDays}-day progress! Badhiya! 🎯`;
  
  showNotification(title, body, {
    action: 'streak-milestone',
    memberName,
    streakDays: streakDays.toString()
  });
  
  playNotificationSound();
}

/**
 * Create an achievement notification
 */
export function notifyAchievement(
  memberName: string,
  achievementName: string,
  pointsEarned: number
): void {
  const title = `🏆 Achievement Unlocked!`;
  const body = `${memberName} ne "${achievementName}" achieve kiya! +${pointsEarned} points`;
  
  showNotification(title, body, {
    action: 'achievement',
    memberName,
    achievementName,
    pointsEarned: pointsEarned.toString()
  });
  
  playNotificationSound();
}

/**
 * Get all active FCM subscriptions
 */
export function getSubscriptions(): string[] {
  try {
    return JSON.parse(localStorage.getItem('fcm_subscriptions') || '[]');
  } catch {
    return [];
  }
}

/**
 * Clear all subscriptions
 */
export function clearSubscriptions(): void {
  localStorage.removeItem('fcm_subscriptions');
  localStorage.removeItem('fcm_token');
}

// ─────────────────────────────────────────────────────────────
// Scheduled Reminder Notifications
// ─────────────────────────────────────────────────────────────
// The settings modal only ever SAVED the schedule to localStorage — nothing
// ever read it back and actually fired a notification. This is the missing
// piece: call startScheduledNotificationChecker() once when the app mounts,
// and it polls every 20s, comparing the current local time/day against each
// saved schedule, firing a real Notification (+ sound) when they match.
const FIRED_TODAY_KEY = 'notifications_fired_today';

function getFiredTodayMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(FIRED_TODAY_KEY) || '{}');
  } catch {
    return {};
  }
}

function markFiredToday(notificationId: string, dateStr: string): void {
  const map = getFiredTodayMap();
  map[notificationId] = dateStr;
  localStorage.setItem(FIRED_TODAY_KEY, JSON.stringify(map));
}

function alreadyFiredToday(notificationId: string, dateStr: string): boolean {
  const map = getFiredTodayMap();
  return map[notificationId] === dateStr;
}

/**
 * Checks every scheduled notification against the current time and fires
 * any that match (and haven't already fired today). Call this on an
 * interval — see startScheduledNotificationChecker below.
 */
export function checkAndFireScheduledNotifications(): void {
  let list: Array<{
    id: string;
    hour: number;
    minute: number;
    message: string;
    days: number[];
    soundEnabled: boolean;
  }> = [];

  try {
    list = JSON.parse(localStorage.getItem('notifications_list') || '[]');
  } catch {
    return;
  }

  if (list.length === 0) return;

  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun..6=Sat
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const todayStr = now.toISOString().split('T')[0];

  list.forEach((notif) => {
    if (!notif.days.includes(currentDay)) return;
    if (notif.hour !== currentHour || notif.minute !== currentMinute) return;
    if (alreadyFiredToday(notif.id, todayStr)) return;

    markFiredToday(notif.id, todayStr);
    showNotification('📋 Family Task Manager', notif.message);
    if (notif.soundEnabled) {
      playNotificationSound();
    }
  });
}

let schedulerIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Starts the background poller that checks scheduled notifications every
 * 20 seconds. Safe to call multiple times — only ever runs one interval.
 * Call once when the app mounts (e.g. in App.tsx's init effect).
 */
export function startScheduledNotificationChecker(): void {
  if (schedulerIntervalId) return; // already running
  checkAndFireScheduledNotifications(); // check immediately on start too
  schedulerIntervalId = setInterval(checkAndFireScheduledNotifications, 20000);
}

export function stopScheduledNotificationChecker(): void {
  if (schedulerIntervalId) {
    clearInterval(schedulerIntervalId);
    schedulerIntervalId = null;
  }
}
