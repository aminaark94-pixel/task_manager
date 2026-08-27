import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  Database, 
  BookOpen, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { STANDALONE_HTML_CODE } from '../data/standaloneHtmlCode';
import { SUPABASE_SQL_SCHEMA } from '../data/sqlSchema';
import { ROMAN_URDU_GUIDE } from '../data/romanUrduGuide';

interface ExportDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'html' | 'sql' | 'guide';
}

export const ExportDownloadModal: React.FC<ExportDownloadModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'html'
}) => {
  const [activeTab, setActiveTab] = useState<'html' | 'sql' | 'guide'>(initialTab);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Code Export, Supabase Schema & Roman Urdu Guide
              </h3>
              <p className="text-xs text-slate-500">
                Download ready-to-run files or copy SQL queries directly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center justify-between px-6 border-b border-slate-200 bg-white shrink-0">
          <div className="flex space-x-6">
            
            <button
              onClick={() => { setActiveTab('html'); setCopied(false); }}
              className={`py-3.5 text-xs font-bold border-b-2 flex items-center space-x-2 transition ${
                activeTab === 'html'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Single-File index.html</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">100% Self-Contained</span>
            </button>

            <button
              onClick={() => { setActiveTab('sql'); setCopied(false); }}
              className={`py-3.5 text-xs font-bold border-b-2 flex items-center space-x-2 transition ${
                activeTab === 'sql'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Supabase SQL Schema</span>
              <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-bold">RLS + Triggers</span>
            </button>

            <button
              onClick={() => { setActiveTab('guide'); setCopied(false); }}
              className={`py-3.5 text-xs font-bold border-b-2 flex items-center space-x-2 transition ${
                activeTab === 'guide'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Roman Urdu Guide</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Asaan Instructions</span>
            </button>

          </div>

          {/* Action Buttons for Active Tab */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (activeTab === 'html') handleCopy(STANDALONE_HTML_CODE);
                if (activeTab === 'sql') handleCopy(SUPABASE_SQL_SCHEMA);
                if (activeTab === 'guide') handleCopy(ROMAN_URDU_GUIDE);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={() => {
                if (activeTab === 'html') {
                  handleDownload('family-task-manager.html', STANDALONE_HTML_CODE, 'text/html');
                } else if (activeTab === 'sql') {
                  handleDownload('supabase-setup.sql', SUPABASE_SQL_SCHEMA, 'text/plain');
                } else {
                  handleDownload('README-roman-urdu.md', ROMAN_URDU_GUIDE, 'text/markdown');
                }
              }}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {activeTab === 'html' && 'Download index.html'}
                {activeTab === 'sql' && 'Download .sql File'}
                {activeTab === 'guide' && 'Download Guide .md'}
              </span>
            </button>
          </div>
        </div>

        {/* Content Viewer Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-900 text-slate-100 font-mono text-xs">
          {activeTab === 'html' && (
            <div>
              <div className="mb-3 text-[11px] text-emerald-400 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800 flex items-center justify-between">
                <span>💡 This single-file code contains full HTML5 + Tailwind CSS CDN + Vanilla JavaScript + Supabase JS Client CDN + Web Speech API. Ready to run locally or drag-and-drop onto Netlify!</span>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed select-all">
                {STANDALONE_HTML_CODE}
              </pre>
            </div>
          )}

          {activeTab === 'sql' && (
            <div>
              <div className="mb-3 text-[11px] text-indigo-300 bg-indigo-950/60 p-2.5 rounded-xl border border-indigo-800">
                <span>📋 Run this script in your <strong>Supabase Dashboard → SQL Editor</strong> to create the tables, Row Level Security (RLS) policies, and auto-registration triggers.</span>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed select-all text-indigo-100">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="font-sans text-slate-200 leading-relaxed text-sm bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                {ROMAN_URDU_GUIDE}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Ready for instant deployment on Netlify, Vercel, or local browser execution.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
