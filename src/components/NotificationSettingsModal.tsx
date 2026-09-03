/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';

export interface ScheduledNotification {
  id: string;
  hour: number;
  minute: number;
  message: string;
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  soundEnabled: boolean;
}

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notifications: ScheduledNotification[]) => void;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_NOTIFICATION: ScheduledNotification = {
  id: 'notif-' + Date.now(),
  hour: 19,
  minute: 0,
  message: 'Aaj ke tasks khatam karne ka waqt! 📋',
  days: [1, 2, 3, 4, 5], // Mon-Fri
  soundEnabled: true
};

export function NotificationSettingsModal({ isOpen, onClose, onSave }: NotificationSettingsModalProps) {
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notifications_list');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (error) {
        console.log('Could not load notifications:', error);
        setNotifications([DEFAULT_NOTIFICATION]);
      }
    } else {
      setNotifications([DEFAULT_NOTIFICATION]);
    }
  }, [isOpen]);

  const handleAddNotification = () => {
    const newNotif: ScheduledNotification = {
      ...DEFAULT_NOTIFICATION,
      id: 'notif-' + Date.now()
    };
    setNotifications([...notifications, newNotif]);
  };

  const handleDeleteNotification = (id: string) => {
    if (notifications.length > 1) {
      setNotifications(notifications.filter(n => n.id !== id));
    } else {
      alert('You must have at least one notification!');
    }
  };

  const handleUpdateNotification = (id: string, updates: Partial<ScheduledNotification>) => {
    setNotifications(
      notifications.map(n => (n.id === id ? { ...n, ...updates } : n))
    );
  };

  const handleDayToggle = (notifId: string, dayIndex: number) => {
    setNotifications(
      notifications.map(n => {
        if (n.id === notifId) {
          const newDays = n.days.includes(dayIndex)
            ? n.days.filter(d => d !== dayIndex)
            : [...n.days, dayIndex].sort();
          return { ...n, days: newDays };
        }
        return n;
      })
    );
  };

  const handleSelectAllDays = (notifId: string) => {
    handleUpdateNotification(notifId, { days: [0, 1, 2, 3, 4, 5, 6] });
  };

  const handleSelectWeekdays = (notifId: string) => {
    handleUpdateNotification(notifId, { days: [1, 2, 3, 4, 5] });
  };

  const handleSelectWeekends = (notifId: string) => {
    handleUpdateNotification(notifId, { days: [0, 6] });
  };

  const handleSave = () => {
    localStorage.setItem('notifications_list', JSON.stringify(notifications));
    onSave(notifications);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-slate-900">🔔 Notification Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-6 mb-6">
          {notifications.map((notif, index) => (
            <div key={notif.id} className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50">
              {/* Notification Number */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-700">Notification #{index + 1}</h3>
                <button
                  onClick={() => handleDeleteNotification(notif.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Time */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Time:</label>
                <input
                  type="time"
                  value={`${notif.hour.toString().padStart(2, '0')}:${notif.minute.toString().padStart(2, '0')}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    if (!isNaN(h) && !isNaN(m)) {
                      handleUpdateNotification(notif.id, { hour: h, minute: m });
                    }
                  }}
                  className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-lg font-semibold text-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Time Display */}
              <div className="mb-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {notif.hour.toString().padStart(2, '0')}:{notif.minute.toString().padStart(2, '0')}
                </div>
                <p className="text-xs text-slate-500">Karachi Time (UTC+5)</p>
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-2">Message:</label>
                <input
                  type="text"
                  value={notif.message}
                  onChange={(e) => handleUpdateNotification(notif.id, { message: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="Notification message..."
                />
              </div>

              {/* Days */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-2">Days:</label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => handleSelectAllDays(notif.id)}
                    className="px-2 py-1 text-xs font-bold rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleSelectWeekdays(notif.id)}
                    className="px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                  >
                    Mon-Fri
                  </button>
                  <button
                    onClick={() => handleSelectWeekends(notif.id)}
                    className="px-2 py-1 text-xs font-bold rounded bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
                  >
                    Weekends
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS_OF_WEEK.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDayToggle(notif.id, idx)}
                      className={`py-1 px-1 rounded text-xs font-bold transition ${
                        notif.days.includes(idx)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Toggle */}
              <div>
                <button
                  onClick={() => handleUpdateNotification(notif.id, { soundEnabled: !notif.soundEnabled })}
                  className={`w-full py-2 rounded font-bold text-sm transition ${
                    notif.soundEnabled
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {notif.soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Notification Button */}
        <button
          onClick={handleAddNotification}
          className="w-full mb-6 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded-lg transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Another Notification
        </button>

        {/* Summary */}
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-indigo-900">
            📌 You have <span className="text-lg font-bold">{notifications.length}</span> notification(s) scheduled
          </p>
        </div>

        {/* Save Status */}
        {saved && (
          <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg font-bold text-center mb-4">
            ✅ Settings saved successfully!
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
