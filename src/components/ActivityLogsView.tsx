import React from 'react';
import { History, Award, CheckCircle2, RefreshCw } from 'lucide-react';
import { TaskLog, FamilyMember } from '../types';

interface ActivityLogsViewProps {
  logs: TaskLog[];
  members: FamilyMember[];
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ logs, members }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in duration-300">
      
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Task Completion & Reward Audit Logs</h3>
            <p className="text-xs text-slate-500">Live timestamped history of tasks checked off and stars awarded</p>
          </div>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs italic">
          No task logs recorded yet. Mark a task as completed to see entries appear here!
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {logs.map((log) => {
            const member = members.find((m) => m.id === log.user_id);
            const dateDisplay = new Date(log.completed_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              month: 'short',
              day: 'numeric'
            });

            return (
              <div
                key={log.id}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 transition"
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div
                    className={`w-9 h-9 rounded-xl ${
                      member?.color || 'bg-emerald-600'
                    } text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}
                  >
                    {log.user_name ? log.user_name[0] : 'U'}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {log.user_name || member?.full_name || 'Family Member'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">completed</span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-700">
                        "{log.task_title || 'Family Task'}"
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Completed on {dateDisplay}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold text-amber-600 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>+{log.points_awarded} ⭐</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
