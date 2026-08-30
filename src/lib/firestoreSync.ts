/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import { FamilyMember, Task, TaskLog } from '../types';

// We use a single-family model: one document per data type inside the
// "familyData" collection. This keeps reads/writes simple and free-tier
// friendly (well within Firestore's Spark plan quotas for a household app).
const MEMBERS_DOC = doc(db, 'familyData', 'members');
const TASKS_DOC = doc(db, 'familyData', 'tasks');
const LOGS_DOC = doc(db, 'familyData', 'taskLogs');

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

export async function saveMembersToCloud(members: FamilyMember[]): Promise<void> {
  await setDoc(MEMBERS_DOC, { list: members, updated_at: new Date().toISOString() });
}

export async function saveTasksToCloud(tasks: Task[]): Promise<void> {
  await setDoc(TASKS_DOC, { list: tasks, updated_at: new Date().toISOString() });
}

export async function saveTaskLogsToCloud(logs: TaskLog[]): Promise<void> {
  await setDoc(LOGS_DOC, { list: logs, updated_at: new Date().toISOString() });
}
