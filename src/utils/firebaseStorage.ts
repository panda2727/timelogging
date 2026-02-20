import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { TimeLog } from './storage';

function userLogsRef(uid: string) {
  return collection(db, 'users', uid, 'time-logs');
}

export async function getLogsFromFirebase(uid: string): Promise<TimeLog[]> {
  const snapshot = await getDocs(userLogsRef(uid));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as TimeLog[];
}

export async function addLogToFirebase(uid: string, log: Omit<TimeLog, 'id'>): Promise<TimeLog> {
  const docRef = await addDoc(userLogsRef(uid), log);
  return { id: docRef.id, ...log };
}

export async function updateLogInFirebase(uid: string, id: string, data: Omit<TimeLog, 'id'>): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'time-logs', id), data as Record<string, unknown>);
}

export async function deleteLogFromFirebase(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'time-logs', id));
}

export function subscribeToLogsByDate(
  uid: string,
  date: string,
  callback: (logs: TimeLog[]) => void
): () => void {
  const q = query(userLogsRef(uid), where('date', '==', date));
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as TimeLog[];
    callback(logs);
  });
}

export async function clearAllLogs(uid: string): Promise<void> {
  const snapshot = await getDocs(userLogsRef(uid));
  await Promise.all(snapshot.docs.map((d) => deleteDoc(doc(db, 'users', uid, 'time-logs', d.id))));
}

export { getTodayString } from './storage';
