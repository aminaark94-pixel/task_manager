import React, { useState, useRef } from 'react';
import { Send, Mic, Square, Play, Pause, MessageCircle, Loader2 } from 'lucide-react';
import { FamilyMember, TaskUpdate } from '../types';

interface TaskUpdateThreadProps {
  taskId: string;
  currentMember: FamilyMember;
  updates: TaskUpdate[];
  onAddUpdate: (taskId: string, update: { type: 'text' | 'voice'; text?: string; audioBlob?: Blob; durationSeconds?: number }) => Promise<void> | void;
}

// A small audio player used for voice-note updates in the thread list.
const VoiceNotePlayer: React.FC<{ src: string; duration?: number }> = ({ src, duration }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
      <button
        onClick={toggle}
        className="w-7 h-7 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition"
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>
      <span className="text-xs font-medium text-indigo-700">
        Voice note{duration ? ` · ${Math.round(duration)}s` : ''}
      </span>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
};

export const TaskUpdateThread: React.FC<TaskUpdateThreadProps> = ({
  taskId,
  currentMember,
  updates,
  onAddUpdate
}) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef<number>(0);

  const taskUpdates = updates
    .filter((u) => u.task_id === taskId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const handleSendText = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);
    try {
      await onAddUpdate(taskId, { type: 'text', text: trimmed });
      setText('');
    } finally {
      setIsSending(false);
    }
  };

  const startRecording = async () => {
    setRecordError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recordStartRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const durationSeconds = (Date.now() - recordStartRef.current) / 1000;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setIsSending(true);
        try {
          await onAddUpdate(taskId, { type: 'voice', audioBlob: blob, durationSeconds });
        } finally {
          setIsSending(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setRecordError('Could not access the microphone. Check your browser permissions.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
      {taskUpdates.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {taskUpdates.map((update) => (
            <div key={update.id} className="flex items-start space-x-2">
              <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {(update.user_name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-[11px] font-bold text-slate-700">{update.user_name || 'Family member'}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(update.created_at).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                {update.type === 'text' ? (
                  <p className="text-xs text-slate-600 mt-0.5 break-words">{update.text}</p>
                ) : update.audio_url ? (
                  <div className="mt-1">
                    <VoiceNotePlayer src={update.audio_url} duration={update.audio_duration_seconds} />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic mt-0.5">Voice note uploading…</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {recordError && <p className="text-[11px] text-rose-500">{recordError}</p>}

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 shrink-0">
          <MessageCircle className="w-3.5 h-3.5 text-slate-300" />
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendText();
          }}
          placeholder="Add an update…"
          disabled={isSending || isRecording}
          className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50"
        />
        <button
          onClick={handleSendText}
          disabled={!text.trim() || isSending || isRecording}
          className="w-8 h-8 shrink-0 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 transition"
          title="Send text update"
        >
          {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isSending}
          className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition ${
            isRecording
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600'
          } disabled:opacity-40`}
          title={isRecording ? 'Stop recording' : 'Record a voice note'}
        >
          {isRecording ? <Square className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
