'use client';

/**
 * Offline queue for workout records.
 *
 * Every set logged during an active workout is written to localStorage first and
 * then pushed to the server. If the push fails (offline, server error) the entry
 * stays queued and is retried when the connection returns, when the tab regains
 * focus, or when the service worker fires a background sync.
 */

export type QueueOperation =
  | { kind: 'add_set'; sessionId: string; payload: Record<string, unknown> }
  | { kind: 'update_session'; sessionId: string; payload: Record<string, unknown> }
  | { kind: 'finish_session'; sessionId: string; payload: Record<string, unknown> };

export interface QueueEntry {
  id: string;
  createdAt: number;
  attempts: number;
  operation: QueueOperation;
}

const QUEUE_KEY = 'glow:pending-workout-queue';
const LISTENERS = new Set<(entries: QueueEntry[]) => void>();

function safeRead(): QueueEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueueEntry[]) : [];
  } catch {
    return [];
  }
}

function safeWrite(entries: QueueEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or blocked: the in-memory flow still works.
  }
  LISTENERS.forEach((listener) => listener(entries));
}

export function readQueue(): QueueEntry[] {
  return safeRead();
}

export function enqueue(operation: QueueOperation): QueueEntry {
  const entry: QueueEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    attempts: 0,
    operation,
  };
  safeWrite([...safeRead(), entry]);
  requestBackgroundSync();
  return entry;
}

export function removeFromQueue(id: string): void {
  safeWrite(safeRead().filter((entry) => entry.id !== id));
}

export function bumpAttempts(id: string): void {
  safeWrite(
    safeRead().map((entry) =>
      entry.id === id ? { ...entry, attempts: entry.attempts + 1 } : entry,
    ),
  );
}

export function clearQueue(): void {
  safeWrite([]);
}

export function subscribeQueue(listener: (entries: QueueEntry[]) => void): () => void {
  LISTENERS.add(listener);
  listener(safeRead());
  return () => {
    LISTENERS.delete(listener);
  };
}

function requestBackgroundSync(): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready
    .then((registration) => {
      const sync = (registration as ServiceWorkerRegistration & {
        sync?: { register: (tag: string) => Promise<void> };
      }).sync;
      return sync?.register('glow-sync-workouts');
    })
    .catch(() => undefined);
}
