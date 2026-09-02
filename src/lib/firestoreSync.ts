/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { FamilyMember, Task, TaskLog, TaskUpdate } from '../types';

// We use a single-family model: one document per data type inside the
// "familyData" collection. This keeps reads/writes simple and free-tier
// friendly (well within Firestore's Spark plan quotas for a household app).
const MEMBERS_DOC = doc(db, 'familyData', 'members');
const TASKS_DOC = doc(db, 'familyData', 'tasks');
const LOGS_DOC = doc(db, 'familyData', 'taskLogs');
const UPDATES_DOC = doc(db, 'familyData', 'taskUpdates');

export function subscribeToMembers(
  onData: (members: FamilyMember[]) => void,
  onError: (err: Error) => void,
  onMissing?: () => void
): Unsubscribe {
  return onSnapshot(
    MEMBERS_DOC,
    (snap) => {
      if (snap.exists()) {
        onData((snap.data().list as FamilyMember[]) || []);
      } else if (onMissing) {
        onMissing();
      }
    },
    onError
  );
}

export function subscribeToTasks(
  onData: (tasks: Task[]) => void,
  onError: (err: Error) => void,
  onMissing?: () => void
): Unsubscribe {
  return onSnapshot(
    TASKS_DOC,
    (snap) => {
      if (snap.exists()) {
        onData((snap.data().list as Task[]) || []);
      } else if (onMissing) {
        onMissing();
      }
    },
    onError
  );
}

export function subscribeToTaskLogs(
  onData: (logs: TaskLog[]) => void,
  onError: (err: Error) => void,
  onMissing?: () => void
): Unsubscribe {
  return onSnapshot(
    LOGS_DOC,
    (snap) => {
      if (snap.exists()) {
        onData((snap.data().list as TaskLog[]) || []);
      } else if (onMissing) {
        onMissing();
      }
    },
    onError
  );
}

export function subscribeToTaskUpdates(
  onData: (updates: TaskUpdate[]) => void,
  onError: (err: Error) => void,
  onMissing?: () => void
): Unsubscribe {
  return onSnapshot(
    UPDATES_DOC,
    (snap) => {
      if (snap.exists()) {
        onData((snap.data().list as TaskUpdate[]) || []);
      } else if (onMissing) {
        onMissing();
      }
    },
    onError
  );
}

// Firestore rejects any field explicitly set to `undefined` — arrays of
// Task/FamilyMember/TaskLog objects commonly have optional fields (due_date,
// description, notes, etc.) left undefined, which would otherwise throw
// "Unsupported field value: undefined" and silently fail every cloud save.
function stripUndefinedDeep(value: any): any {
  if (Array.isArray(value)) {
    return value.map(stripUndefinedDeep);
  }
  if (value && typeof value === 'object') {
    const clean: Record<string, any> = {};
    Object.keys(value).forEach((key) => {
      if (value[key] !== undefined) {
        clean[key] = stripUndefinedDeep(value[key]);
      }
    });
    return clean;
  }
  return value;
}

export async function saveMembersToCloud(members: FamilyMember[]): Promise<void> {
  await setDoc(MEMBERS_DOC, { list: stripUndefinedDeep(members), updated_at: new Date().toISOString() });
}

export async function saveTasksToCloud(tasks: Task[]): Promise<void> {
  await setDoc(TASKS_DOC, { list: stripUndefinedDeep(tasks), updated_at: new Date().toISOString() });
}

export async function saveTaskLogsToCloud(logs: TaskLog[]): Promise<void> {
  await setDoc(LOGS_DOC, { list: stripUndefinedDeep(logs), updated_at: new Date().toISOString() });
}

export async function saveTaskUpdatesToCloud(updates: TaskUpdate[]): Promise<void> {
  await setDoc(UPDATES_DOC, { list: stripUndefinedDeep(updates), updated_at: new Date().toISOString() });
}

/**
 * Uploads a recorded voice note (audio Blob) to Firebase Storage and
 * returns its public download URL, to be stored on a TaskUpdate.
 */
export async function uploadTaskVoiceNote(
  audioBlob: Blob,
  taskId: string,
  memberId: string
): Promise<string> {
  const filename = `voice-notes/${taskId}/${memberId}-${Date.now()}.webm`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, audioBlob, { contentType: audioBlob.type || 'audio/webm' });
  return getDownloadURL(storageRef);
}
