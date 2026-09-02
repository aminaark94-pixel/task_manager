import React from 'react';
import { 
  CheckCheck, 
  Database, 
  Mic, 
  PlusCircle, 
  Sparkles,
  LayoutGrid,
  Lock,
  LogOut,
  Settings
} from 'lucide-react';
import { FamilyMember } from '../types';

interface NavbarProps {
  currentMember: FamilyMember;
  members: FamilyMember[];
  onSelectMember: (memberId: string) => void;
  onOpenTaskModal: () => void;
  onOpenVoiceModal: () => void;
  cloudStatus: 'connecting' | 'connected' | 'error';
  isParentLoggedIn?: boolean;
  onOpenParentLogin?: () => void;
  onLogoutParent?: () => void;
  onOpenNotificationSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMember,
  members,
  onSelectMember,
  onOpenTaskModal,
  onOpenVoiceModal,
  cloudStatus,
  isParentLoggedIn = false,
  onOpenParentLogin,
  onLogoutParent,
  onOpenNotificationSettings
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  Family HQ <span className="text-slate-400 font-normal">| Task Manager</span>
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <LayoutGrid className="w-2.5 h-2.5 mr-1" />
                  Bento Grid
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">Firebase Cloud Sync & Voice AI Powered</p>
            </div>
          </div>

          {/* Action Tools & Role Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Firebase Cloud Status */}
            <div
              className="hidden lg:flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-medium"
              title="Firebase Cloud Sync Status"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {cloudStatus === 'connected' && 'Cloud Synced'}
                {cloudStatus === 'connecting' && 'Connecting...'}
                {cloudStatus === 'error' && 'Offline (Local Only)'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  cloudStatus === 'connected'
                    ? 'bg-emerald-500'
                    : cloudStatus === 'connecting'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
            </div>

            {/* Voice Command Button */}
            <button
              onClick={onOpenVoiceModal}
              id="btn-nav-voice"
              className="flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-bold transition"
            >
              <Mic className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Voice Task</span>
            </button>

            {/* Create Task Button */}
            <button
              onClick={onOpenTaskModal}
              id="btn-nav-create-task"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-sm transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden md:inline">Add Task</span>
            </button>

            {/* Parent Login/Logout & Settings Buttons */}
            {isParentLoggedIn ? (
              <>
                <button
                  onClick={onOpenNotificationSettings}
                  id="btn-nav-settings"
                  className="flex items-center space-x-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                  title="Notification settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Settings</span>
                </button>
                <button
                  onClick={onLogoutParent}
                  id="btn-nav-logout-parent"
                  className="flex items-center space-x-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={onOpenParentLogin}
                id="btn-nav-login-parent"
                className="flex items-center space-x-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {/* Member Profile Badge & Selector */}
            <div className="flex items-center pl-2 border-l border-slate-200 space-x-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">{currentMember.full_name}</p>
                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                  {currentMember.role === 'parent' ? 'Admin (Parent)' : 'Member (Child)'}
                </p>
              </div>

              <div className="relative flex items-center">
                <select
                  value={currentMember.id}
                  onChange={(e) => onSelectMember(e.target.value)}
                  id="select-active-member"
                  className="text-xs bg-slate-100 border border-slate-300 text-slate-800 font-bold rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  title="Switch family member profile"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.role === 'parent' ? '👨‍👩‍👧 ' : '🧒 '}
                      {m.full_name} ({m.role.toUpperCase()})
                    </option>
                  ))}
                </select>
                <div className="w-8 h-8 ml-2 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-xs shrink-0">
                  {getInitials(currentMember.full_name)}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
