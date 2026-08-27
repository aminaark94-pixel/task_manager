import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, X, Check, ArrowRight, AlertCircle } from 'lucide-react';
import { FamilyMember, Task, TaskCategory, TaskPriority, RecurrenceType } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  onAddTask: (task: Partial<Task>) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddTask
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en-US' | 'ur-PK' | 'hi-IN'>('en-US');
  const [parsedPreview, setParsedPreview] = useState<{
    title: string;
    assigneeNames: string;
    assigneeIds: string[];
    category: TaskCategory;
    priority: TaskPriority;
    recurrence: RecurrenceType;
    points: number;
  } | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setInterimTranscript('');
      setParsedPreview(null);
      setError(null);
      return;
    }

    // Auto-start listening on open
    startListening();

    return () => {
      stopListening();
    };
  }, [isOpen, language]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Web Speech API is not supported on this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let final = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript + ' ';
          } else {
            interim += item[0].transcript;
          }
        }

        if (final) {
          const fullText = (transcript + ' ' + final).trim();
          setTranscript(fullText);
          analyzeVoiceInput(fullText);
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission was denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          // keep waiting
        } else {
          setError(`Speech error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setError(err.message || 'Failed to initialize microphone');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const analyzeVoiceInput = (text: string) => {
    if (!text.trim()) return;

    const lower = text.toLowerCase();

    // 1. Detect Assignees (single, multiple, or all children)
    const detectedMembers: FamilyMember[] = [];
    
    if (
      lower.includes('all children') || 
      lower.includes('all kids') || 
      lower.includes('all family') || 
      lower.includes('everyone') || 
      lower.includes('everybody') ||
      lower.includes('sab bachy') ||
      lower.includes('sab bachon')
    ) {
      // Add all children
      const children = members.filter((m) => m.role === 'child');
      detectedMembers.push(...(children.length > 0 ? children : members));
    } else {
      members.forEach((m) => {
        if (lower.includes(m.full_name.toLowerCase()) || lower.includes(m.full_name.split(' ')[0].toLowerCase())) {
          if (!detectedMembers.some((dm) => dm.id === m.id)) {
            detectedMembers.push(m);
          }
        }
      });
    }

    // Default if none detected
    if (detectedMembers.length === 0) {
      const defaultChild = members.find((m) => m.role === 'child') || members[0];
      detectedMembers.push(defaultChild);
    }

    const assigneeIds = detectedMembers.map((m) => m.id);
    const assigneeNames = detectedMembers.map((m) => m.full_name).join(', ');

    // 2. Detect Category
    let category: TaskCategory = 'general';
    if (lower.includes('homework') || lower.includes('study') || lower.includes('school') || lower.includes('math') || lower.includes('science')) {
      category = 'homework';
    } else if (lower.includes('clean') || lower.includes('dishes') || lower.includes('room') || lower.includes('laundry') || lower.includes('bed') || lower.includes('trash')) {
      category = 'chores';
    } else if (lower.includes('fajr') || lower.includes('prayer') || lower.includes('namaz') || lower.includes('quran') || lower.includes('dua')) {
      category = 'deen';
    } else if (lower.includes('water') || lower.includes('exercise') || lower.includes('jog') || lower.includes('walk') || lower.includes('workout')) {
      category = 'health';
    } else if (lower.includes('read') || lower.includes('book') || lower.includes('story')) {
      category = 'reading';
    }

    // 3. Detect Recurrence
    let recurrence: RecurrenceType = 'daily';
    if (lower.includes('weekly') || lower.includes('every monday') || lower.includes('every week')) {
      recurrence = 'weekly';
    } else if (lower.includes('once') || lower.includes('today only') || lower.includes('one time') || lower.includes('urgent')) {
      recurrence = 'none';
    } else if (lower.includes('every') && (lower.includes('days') || lower.includes('hours'))) {
      recurrence = 'custom';
    }

    // 4. Clean Title
    let cleanedTitle = text
      .replace(/^add task|^create task|^new task|^please add|^remind|^assign/gi, '')
      .replace(/for all children|for all kids|to all children|to all kids|for everyone/gi, '')
      .replace(/daily|every day|weekly|one time|high priority/gi, '')
      .trim();

    detectedMembers.forEach((m) => {
      cleanedTitle = cleanedTitle.replace(new RegExp(`for ${m.full_name}|to ${m.full_name}|for ${m.full_name.split(' ')[0]}|to ${m.full_name.split(' ')[0]}`, 'gi'), '');
    });
    cleanedTitle = cleanedTitle.trim();

    if (!cleanedTitle) cleanedTitle = text;
    cleanedTitle = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);

    setParsedPreview({
      title: cleanedTitle,
      assigneeNames,
      assigneeIds,
      category,
      priority: lower.includes('urgent') || lower.includes('high') ? 'high' : 'medium',
      recurrence,
      points: 15
    });
  };

  const handleConfirmTask = () => {
    if (!parsedPreview) return;

    onAddTask({
      title: parsedPreview.title,
      assigned_to: parsedPreview.assigneeIds.length === 1 ? parsedPreview.assigneeIds[0] : parsedPreview.assigneeIds,
      category: parsedPreview.category,
      priority: parsedPreview.priority,
      recurrence_type: parsedPreview.recurrence,
      points_reward: parsedPreview.points,
      is_active: true,
      description: `Created via Web Speech Voice Recognition: "${transcript}"`
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Voice-to-Text Task Assistant</h3>
              <p className="text-xs text-slate-500">Native Web Speech API with Smart Intent Parsing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selector */}
        <div className="flex items-center justify-between mt-4 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <span className="font-semibold text-slate-600">Voice Recognition Language:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="en-US">English (US / Global)</option>
            <option value="ur-PK">Urdu (Pakistan)</option>
            <option value="hi-IN">Hindi (India)</option>
          </select>
        </div>

        {/* Microphone Pulse & Animation Visualizer */}
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30"></div>
                <div className="absolute -inset-3 rounded-full bg-emerald-200 animate-pulse opacity-40"></div>
              </>
            )}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${
                isListening
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-300 ring-offset-2'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isListening ? <Mic className="w-8 h-8 animate-bounce" /> : <MicOff className="w-8 h-8 text-slate-400" />}
            </button>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">
              {isListening ? 'Listening to your voice...' : 'Microphone Paused'}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {isListening
                ? 'Try saying: "Add task clean study table for Ali due daily with 15 points"'
                : 'Click the mic icon above to start speaking'}
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start space-x-2 mb-4">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Microphone Issue</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Live Transcript Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            <span>Speech Recognition Transcript</span>
            {isListening && <span className="text-emerald-600 flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1" /> Live</span>}
          </div>
          <p className="text-slate-800 font-medium min-h-[44px] text-sm leading-relaxed italic">
            {transcript || interimTranscript || 'No speech detected yet. Speak clearly into your microphone...'}
          </p>
        </div>

        {/* Parsed AI Task Card Preview */}
        {parsedPreview && (
          <div className="mt-4 p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase flex items-center">
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Parsed Task Ready to Add
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                ⭐ {parsedPreview.points} Star Points
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">{parsedPreview.title}</h4>
              <div className="flex flex-wrap gap-1.5 text-[11px] pt-1">
                <span className="px-2 py-0.5 bg-white rounded-md text-slate-700 font-medium border border-emerald-200">
                  👥 Assigned: <strong>{parsedPreview.assigneeNames}</strong>
                </span>
                <span className="px-2 py-0.5 bg-white rounded-md text-slate-700 font-medium border border-emerald-200">
                  📁 {parsedPreview.category.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 bg-white rounded-md text-slate-700 font-medium border border-emerald-200">
                  🔄 {parsedPreview.recurrence.toUpperCase()}
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirmTask}
              id="btn-confirm-voice-task"
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2"
            >
              <span>Add This Task to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
