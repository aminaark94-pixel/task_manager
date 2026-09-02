/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface NotificationSettings {
  hour: number;
  minute: number;
  message: string;
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  soundEnabled: boolean;
}

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: NotificationSettings) => void;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_SETTINGS: NotificationSettings = {
  hour: 19,
  minute: 0,
  message: 'Aaj ke tasks khatam karne ka waqt! 📋',
  days: [1, 2, 3, 4, 5], // Mon-Fri
  soundEnabled: true
};

export function NotificationSettingsModal({ isOpen, onClose, onSave }: NotificationSettingsModalProps) {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notification_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.log('Could not load settings:', error);
      }
    }
  }, [isOpen]);

  const handleTimeChange = (newHour: number) => {
    setSettings({ ...settings, hour: newHour });
  };

  const handleMinuteChange = (newMinute: number) => {
    setSettings({ ...settings, minute: newMinute });
  };

  const handleMessageChange = (newMessage: string) => {
    setSettings({ ...settings, message: newMessage });
  };

  const handleDayToggle = (dayIndex: number) => {
    setSettings(prev => {
      const newDays = prev.days.includes(dayIndex)
        ? prev.days.filter(d => d !== dayIndex)
        : [...prev.days, dayIndex].sort();
      return { ...prev, days: newDays };
    });
  };

  const handleSoundToggle = () => {
    setSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const handleSave = () => {
    localStorage.setItem('notification_settings', JSON.stringify(settings));
    onSave(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSelectAllDays = () => {
    setSettings({ ...settings, days: [0, 1, 2, 3, 4, 5, 6] });
  };

  const handleSelectWeekdays = () => {
    setSettings({ ...settings, days: [1, 2, 3, 4, 5] });
  };

  const handleSelectWeekends = () => {
    setSettings({ ...settings, days: [0, 6] });
  };

  if (!isOpen) return null;

  const timeString = `${settings.hour.toString().padStart(2, '0')}:${settings.minute.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-slate-900">🔔 Notification Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Time Picker */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              ⏰ Notification Time
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Hour:</label>
                <select
                  value={settings.hour}
                  onChange={(e) => handleTimeChange(Number(e.target.value))}
                  className="px-3 py-2 border-2 border-slate-300 rounded-lg font-semibold text-lg focus:outline-none focus:border-indigo-500"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-2xl font-bold text-slate-400">:</span>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Minute:</label>
                <select
                  value={settings.minute}
                  onChange={(e) => handleMinuteChange(Number(e.target.value))}
                  className="px-3 py-2 border-2 border-slate-300 rounded-lg font-semibold text-lg focus:outline-none focus:border-indigo-500"
                >
                  {[0, 15, 30, 45].map(m => (
                    <option key={m} value={m}>
                      {m.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ml-auto">
                <div className="text-3xl font-bold text-indigo-600">{timeString}</div>
                <p className="text-xs text-slate-500 mt-1">Karachi Time (UTC+5)</p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              📝 Notification Message
            </label>
            <textarea
              value={settings.message}
              onChange={(e) => handleMessageChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 resize-none"
              rows={3}
              placeholder="Enter custom notification message..."
            />
            <p className="text-xs text-slate-500 mt-1">
              💡 Tip: Use emojis! 📋 🎯 ⚡ 🔥 💪
            </p>
          </div>

          {/* Days Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              📅 Notify On These Days
            </label>

            {/* Quick Select Buttons */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={handleSelectAllDays}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
              >
                All Days
              </button>
              <button
                onClick={handleSelectWeekdays}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
              >
                Weekdays (Mon-Fri)
              </button>
              <button
                onClick={handleSelectWeekends}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
              >
                Weekends
              </button>
            </div>

            {/* Day Checkboxes */}
            <div className="grid grid-cols-4 gap-2">
              {DAYS_OF_WEEK.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDayToggle(index)}
                  className={`py-2 px-3 rounded-lg font-bold text-sm transition ${
                    settings.days.includes(index)
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Toggle */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              🔊 Notification Sound
            </label>
            <button
              onClick={handleSoundToggle}
              className={`w-full py-3 rounded-lg font-bold text-lg transition flex items-center justify-center gap-2 ${
                settings.soundEnabled
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {settings.soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
            </button>
          </div>

          {/* Summary */}
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-indigo-900">
              📌 Summary: You'll get a notification every{' '}
              {settings.days.length === 7 ? 'day' : settings.days.length === 5 ? 'weekday' : 'selected day'} at{' '}
              <span className="font-bold text-lg">{timeString}</span> (Karachi Time)
            </p>
          </div>

          {/* Save Status */}
          {saved && (
            <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg font-bold text-center">
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
    </div>
  );
}
