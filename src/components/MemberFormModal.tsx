/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, User, Save } from 'lucide-react';
import { FamilyMember, UserRole } from '../types';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Partial<FamilyMember>) => void;
  editingMember: FamilyMember | null;
}

const COLOR_OPTIONS = [
  'bg-blue-600',
  'bg-purple-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
  'bg-fuchsia-600',
  'bg-orange-600'
];

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMember
}) => {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('child');
  const [email, setEmail] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  useEffect(() => {
    if (editingMember) {
      setFullName(editingMember.full_name);
      setRole(editingMember.role);
      setEmail(editingMember.email || '');
      setColor(editingMember.color || COLOR_OPTIONS[0]);
    } else {
      setFullName('');
      setRole('child');
      setEmail('');
      setColor(COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]);
    }
  }, [editingMember, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    onSave({
      id: editingMember?.id,
      full_name: fullName.trim(),
      role,
      email: email.trim() || `${fullName.trim().toLowerCase().replace(/\s+/g, '.')}@family.com`,
      color,
      points: editingMember?.points ?? 0,
      streak: editingMember?.streak ?? 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingMember ? 'Edit Family Member' : 'Add Family Member'}
              </h3>
              <p className="text-xs text-slate-500">
                {editingMember ? 'Update their name or role' : 'Add a new parent or child'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ayesha"
              className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Role</label>
            <div className="flex gap-2">
              {(['parent', 'child', 'spouse'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 text-xs font-bold py-2 rounded-xl border transition capitalize ${
                    role === r
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="auto-generated if left blank"
              className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-xl ${c} transition ${
                    color === c ? 'ring-2 ring-offset-2 ring-slate-900' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition"
          >
            <Save className="w-4 h-4" />
            <span>{editingMember ? 'Save Changes' : 'Add Member'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
