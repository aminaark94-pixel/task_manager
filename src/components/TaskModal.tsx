import React, { useState } from 'react';
import { X, Check, Mic, Sparkles, Calendar, Repeat, Award, Tag, AlertCircle, Users, UserCheck } from 'lucide-react';
import { FamilyMember, Task, TaskCategory, TaskPriority, RecurrenceType, getTaskAssigneeIds } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  onSaveTask: (task: Partial<Task>) => void;
  initialTask?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  members,
  onSaveTask,
  initialTask
}) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  
  // Multiple assignees support
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(() => {
    if (initialTask) {
      return getTaskAssigneeIds(initialTask);
    }
    const defaultChild = members.find((m) => m.role === 'child');
    return defaultChild ? [defaultChild.id] : [members[0]?.id || ''];
  });

  const [category, setCategory] = useState<TaskCategory>(initialTask?.category || 'general');
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority || 'medium');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(initialTask?.recurrence_type || 'daily');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>(initialTask?.recurrence_days || [1, 2, 3, 4, 5]);
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(initialTask?.recurrence_interval || 2);
  const [pointsReward, setPointsReward] = useState<number>(initialTask?.points_reward || 15);
  const [dueDate, setDueDate] = useState(initialTask?.due_date || new Date().toISOString().split('T')[0]);

  const [isDictatingField, setIsDictatingField] = useState<'title' | 'description' | null>(null);

  if (!isOpen) return null;

  const childrenMembers = members.filter((m) => m.role === 'child');

  const toggleAssignee = (memberId: string) => {
    if (selectedAssignees.includes(memberId)) {
      if (selectedAssignees.length > 1) {
        setSelectedAssignees(selectedAssignees.filter((id) => id !== memberId));
      }
    } else {
      setSelectedAssignees([...selectedAssignees, memberId]);
    }
  };

  const selectAllChildren = () => {
    const childIds = childrenMembers.map((c) => c.id);
    setSelectedAssignees(childIds.length > 0 ? childIds : members.map((m) => m.id));
  };

  const selectAllFamily = () => {
    setSelectedAssignees(members.map((m) => m.id));
  };

  const handleStartDictation = (field: 'title' | 'description') => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Web Speech API is not supported in this browser. Please use Chrome, Edge or Safari.');
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      setIsDictatingField(field);

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (field === 'title') {
          setTitle((prev) => (prev ? `${prev} ${transcript}` : transcript));
        } else {
          setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      rec.onerror = () => {
        setIsDictatingField(null);
      };

      rec.onend = () => {
        setIsDictatingField(null);
      };

      rec.start();
    } catch (e) {
      console.warn('Dictation start failed', e);
      setIsDictatingField(null);
    }
  };

  const toggleWeekDay = (day: number) => {
    if (recurrenceDays.includes(day)) {
      setRecurrenceDays(recurrenceDays.filter((d) => d !== day));
    } else {
      setRecurrenceDays([...recurrenceDays, day].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (selectedAssignees.length === 0) return;

    onSaveTask({
      id: initialTask?.id,
      title: title.trim(),
      description: description.trim(),
      assigned_to: selectedAssignees.length === 1 ? selectedAssignees[0] : selectedAssignees,
      category,
      priority,
      recurrence_type: recurrenceType,
      recurrence_days: recurrenceType === 'weekly' ? recurrenceDays : undefined,
      recurrence_interval: recurrenceType === 'custom' ? recurrenceInterval : undefined,
      points_reward: pointsReward,
      is_active: true,
      due_date: dueDate
    });

    onClose();
  };

  const weekDayNames = [
    { label: 'Sun', val: 0 },
    { label: 'Mon', val: 1 },
    { label: 'Tue', val: 2 },
    { label: 'Wed', val: 3 },
    { label: 'Thu', val: 4 },
    { label: 'Fri', val: 5 },
    { label: 'Sat', val: 6 }
  ];

  const selectedMemberNames = members
    .filter((m) => selectedAssignees.includes(m.id))
    .map((m) => m.full_name)
    .join(', ');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialTask ? 'Edit Task' : 'Create New Family Task'}
              </h3>
              <p className="text-xs text-slate-500">Assign to one or multiple children with star rewards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          
          {/* Title & Inline Voice Dictation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Clean Study Desk, Complete Math Ch 4, Recite Surah Mulk"
                className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 pr-11 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleStartDictation('title')}
                title="Speak Title (Voice to text)"
                className={`absolute right-2 top-2 p-1.5 rounded-lg transition ${
                  isDictatingField === 'title'
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description & Inline Voice Dictation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description / Instructions (Optional)
            </label>
            <div className="relative">
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Put books in the top shelf and wipe the table surface."
                className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2 pr-11 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleStartDictation('description')}
                title="Speak Description"
                className={`absolute right-2 top-2 p-1.5 rounded-lg transition ${
                  isDictatingField === 'description'
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Multi-Child Assignment Section */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Assign To (Multiple Children / Members)</span>
                <span className="text-rose-500">*</span>
              </label>

              {/* Quick Select Buttons */}
              <div className="flex items-center space-x-1.5">
                {childrenMembers.length > 1 && (
                  <button
                    type="button"
                    onClick={selectAllChildren}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                  >
                    🧒 All Children
                  </button>
                )}
                <button
                  type="button"
                  onClick={selectAllFamily}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
                >
                  All Family
                </button>
              </div>
            </div>

            {/* Member Selection Chips / Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {members.map((member) => {
                const isSelected = selectedAssignees.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleAssignee(member.id)}
                    className={`flex items-center space-x-2 p-2 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : member.color || 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : member.full_name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate leading-tight">{member.full_name}</p>
                      <span className={`text-[9px] uppercase font-semibold ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {member.role}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Summary Info */}
            <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-200/60">
              <span className="font-semibold">
                👥 Selected ({selectedAssignees.length}): <strong className="text-indigo-700">{selectedMemberNames}</strong>
              </span>
              {selectedAssignees.length > 1 && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  Shared Multi-Child Task
                </span>
              )}
            </div>
          </div>

          {/* Category & Recurrence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="chores">🧹 Chores & Cleaning</option>
                <option value="homework">📚 Homework & Study</option>
                <option value="deen">🕌 Prayer / Deen / Quran</option>
                <option value="health">🥗 Health & Fitness</option>
                <option value="reading">📖 Book Reading</option>
                <option value="general">✨ General Habit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High / Urgent</option>
              </select>
            </div>
          </div>

          {/* Recurrence Selector (Daily, Weekly, Custom Duration, One-Time) */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Recurrence Schedule
              </label>
              <select
                value={recurrenceType}
                onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="daily">🔄 Daily (Every Day Habit)</option>
                <option value="weekly">📅 Weekly (Selected Days of Week)</option>
                <option value="custom">⏳ Custom Duration (Every N Days)</option>
                <option value="none">🎯 One-Time Task (Single Deadline)</option>
              </select>
            </div>

            {/* Weekly Days Picker */}
            {recurrenceType === 'weekly' && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-semibold text-slate-600 block">Repeat on Days:</span>
                <div className="flex flex-wrap gap-1.5">
                  {weekDayNames.map((d) => {
                    const isSelected = recurrenceDays.includes(d.val);
                    return (
                      <button
                        type="button"
                        key={d.val}
                        onClick={() => toggleWeekDay(d.val)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Interval (Every N Days) */}
            {recurrenceType === 'custom' && (
              <div className="flex items-center space-x-2 pt-1 text-xs">
                <span className="text-slate-600 font-medium">Repeat task every:</span>
                <input
                  type="number"
                  min={2}
                  max={60}
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(parseInt(e.target.value, 10) || 2)}
                  className="w-20 rounded-lg border border-slate-300 px-2.5 py-1 text-center font-bold bg-white"
                />
                <span className="text-slate-600 font-medium">days</span>
              </div>
            )}

            {/* One-Time Due Date */}
            {recurrenceType === 'none' && (
              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Completion Date:</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
                />
              </div>
            )}
          </div>

          {/* Reward Points */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Reward Stars / Points (Per Child)
            </label>
            <div className="relative">
              <input
                type="number"
                min={5}
                max={100}
                step={5}
                value={pointsReward}
                onChange={(e) => setPointsReward(parseInt(e.target.value, 10) || 10)}
                className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2 font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-amber-500">⭐ pts</span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-task"
              className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialTask ? 'Update Task' : `Create Task (${selectedAssignees.length} ${selectedAssignees.length === 1 ? 'Assignee' : 'Assignees'})`}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
