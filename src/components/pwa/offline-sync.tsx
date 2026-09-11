'use client';

import { useCallback, useEffect, useState } from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';
import {
  bumpAttempts,
  readQueue,
  removeFromQueue,
  subscribeQueue,
  type QueueEntry,
} from '@/lib/offline/queue';
import { finishWorkoutAction, logSetAction, updateSessionExercisesAction } from '@/app/actions/workout';
import type { WorkoutSessionExercise } from '@/lib/domain/types';

async function runEntry(entry: QueueEntry): Promise<boolean> {
  const { operation } = entry;
  try {
    if (operation.kind === 'add_set') {
      const result = await logSetAction(operation.payload);
      // A validation failure will never succeed on retry - drop it.
      return result.ok || result.message.includes('אינם תקינים');
    }
    if (operation.kind === 'update_session') {
      const result = await updateSessionExercisesAction(
        operation.sessionId,
        (operation.payload.exercises ?? []) as WorkoutSessionExercise[],
      );
      return result.ok;
    }
    const result = await finishWorkoutAction(
      operation.sessionId,
      String(operation.payload.notes ?? ''),
    );
    return result.ok;
  } catch {
    return false;
  }
}

/**
 * Flushes the pending workout queue whenever the connection returns, the tab
 * regains focus, or the service worker asks for a background sync.
 */
export function OfflineSync() {
  const [pending, setPending] = useState(0);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const flush = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    const entries = readQueue();
    if (entries.length === 0) return;
    setSyncing(true);
    for (const entry of entries) {
      const done = await runEntry(entry);
      if (done) removeFromQueue(entry.id);
      else {
        bumpAttempts(entry.id);
        // Give up after repeated failures so the queue cannot grow forever.
        if (entry.attempts >= 6) removeFromQueue(entry.id);
        break;
      }
    }
    setSyncing(false);
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    const unsubscribe = subscribeQueue((entries) => setPending(entries.length));

    const handleOnline = () => {
      setOnline(true);
      void flush();
    };
    const handleOffline = () => setOnline(false);
    const handleFocus = () => void flush();
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'glow:flush-queue') void flush();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', handleFocus);
    navigator.serviceWorker?.addEventListener('message', handleMessage);
    void flush();

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleFocus);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [flush]);

  if (online && pending === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom,0px))] z-40 mx-auto w-[calc(100%-2rem)] max-w-md"
    >
      <div className="flex items-center gap-2 rounded-md border border-warning/40 bg-warning/12 px-3 py-2 text-xs font-semibold text-warning">
        {syncing ? (
          <RefreshCw className="size-4 animate-spin" aria-hidden />
        ) : (
          <CloudOff className="size-4" aria-hidden />
        )}
        <span>
          {!online
            ? 'אין חיבור לאינטרנט. האימון והטיימר ממשיכים לעבוד.'
            : `מסנכרן ${pending} רשומות אימון שנשמרו במכשיר...`}
        </span>
      </div>
    </div>
  );
}
