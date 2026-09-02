import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Mic, Square, Send, Play, Pause, Loader2, X } from 'lucide-react';
import { Task, FamilyMember, TaskUpdate } from '../types';
import { uploadTaskVoiceNote } from '../lib/firestoreSync';

interface TaskUpdateComposerProps {
  task: Task;
  currentMember: FamilyMember;
  updates: TaskUpdate[]; // already filtered to this task, any order
  onSubmit: (update: Omit<TaskUpdate, 'id' | 'created_at'>) => void;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const AudioBubble: React.FC<{ src: string; durationSeconds?: number }> = ({ src, durationSeconds }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          if (!audioRef.current) return;
          if (isPlaying) {
            audioRef.current.pause();
          } else {
            audioRef.current.play();
          }
        }}
        className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 cursor-pointer"
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <span className="text-[10px] text-slate-400 font-mono">
        🎤 Voice note{durationSeconds ? ` · ${durationSeconds}s` : ''}
      </span>
    </div>
  );
};

export const TaskUpdateComposer: React.FC<TaskUpdateComposerProps> = ({
  task,
  currentMember,
  updates,
  onSubmit,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const sortedUpdates = [...updates].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const handleSendText = () => {
    if (!textValue.trim()) return;
    onSubmit({
      task_id: task.id,
      task_title: task.title,
      member_id: currentMember.id,
      member_name: currentMember.full_name,
      text: textValue.trim(),
    });
    setTextValue('');
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const duration = recordSeconds;
        setIsUploading(true);
        try {
          const url = await uploadTaskVoiceNote(blob, task.id, currentMember.id);
          onSubmit({
            task_id: task.id,
            task_title: task.title,
            member_id: currentMember.id,
            member_name: currentMember.full_name,
            audio_url: url,
            audio_duration_seconds: duration,
          });
        } catch (e) {
          setError('Could not upload voice note — please try again.');
        } finally {
          setIsUploading(false);
          setRecordSeconds(0);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } catch (e) {
      setError('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="mt-1.5">
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition cursor-pointer"
      >
        <MessageCircle className="w-3 h-3" />
        <span>
          {sortedUpdates.length > 0 ? `${sortedUpdates.length} update${sortedUpdates.length > 1 ? 's' : ''}` : 'Add update'}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-2 p-2.5 rounded-xl bg-white border border-slate-200 space-y-2">
          {sortedUpdates.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {sortedUpdates.map((u) => (
                <div key={u.id} className="text-xs">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-bold text-slate-700">{u.member_name || 'Member'}</span>
                    <span className="text-[10px] text-slate-400">{timeAgo(u.created_at)}</span>
                  </div>
                  {u.text && <p className="text-slate-600">{u.text}</p>}
                  {u.audio_url && <AudioBubble src={u.audio_url} durationSeconds={u.audio_duration_seconds} />}
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-[10px] text-rose-600">{error}</p>}

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              placeholder="Type a quick update..."
              disabled={isRecording || isUploading}
              className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />

            {textValue.trim() ? (
              <button
                onClick={handleSendText}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shrink-0"
                title="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            ) : isUploading ? (
              <div className="p-1.5 shrink-0">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              </div>
            ) : isRecording ? (
              <button
                onClick={stopRecording}
                className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shrink-0 flex items-center gap-1"
                title="Stop recording"
              >
                <Square className="w-3 h-3" />
                <span className="text-[10px] font-mono">{recordSeconds}s</span>
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 cursor-pointer shrink-0"
                title="Record voice update"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
