'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  SkipBack,
  SkipForward,
  Trash2,
  Volume2,
  VolumeX,
  Vibrate,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  buildTimeline,
  normalizeConfig,
  PHASE_LABELS,
  PHASE_TONE,
  resolveState,
  seekPhase,
  TABATA_DEFAULT,
  totalDuration,
  type TimerConfig,
} from '@/lib/domain/timer';
import { playCue, requestWakeLock, unlockAudio, vibrate } from '@/lib/timer-feedback';
import { deleteTimerPresetAction, saveTimerPresetAction } from '@/app/actions/timer';
import { formatClock } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { TimerPreset } from '@/lib/domain/types';

const SETTINGS = [
  { key: 'prepareSeconds', label: 'זמן הכנה', unit: 'שניות' },
  { key: 'workSeconds', label: 'זמן עבודה', unit: 'שניות' },
  { key: 'restSeconds', label: 'זמן מנוחה', unit: 'שניות' },
  { key: 'rounds', label: 'מספר סבבים', unit: 'סבבים' },
  { key: 'sets', label: 'מספר סטים', unit: 'סטים' },
  { key: 'restBetweenSetsSeconds', label: 'מנוחה בין סטים', unit: 'שניות' },
  { key: 'cooldownSeconds', label: 'שחרור בסיום', unit: 'שניות' },
] as const;

const LOCAL_KEY = 'glow:timer-config';
const PREFS_KEY = 'glow:timer-prefs';

function presetToConfig(preset: TimerPreset): TimerConfig {
  return {
    prepareSeconds: preset.prepare_seconds,
    workSeconds: preset.work_seconds,
    restSeconds: preset.rest_seconds,
    rounds: preset.rounds,
    sets: preset.sets,
    restBetweenSetsSeconds: preset.rest_between_sets_seconds,
    cooldownSeconds: preset.cooldown_seconds,
  };
}

export function IntervalTimer({
  presets,
  profileId,
  canPublish,
}: {
  presets: TimerPreset[];
  profileId: string;
  canPublish: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [, startTransition] = useTransition();

  const [config, setConfig] = useState<TimerConfig>(TABATA_DEFAULT);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [haptics, setHaptics] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [publish, setPublish] = useState(false);
  const [saving, setSaving] = useState(false);

  // Timestamps: the single source of truth for elapsed time.
  const startedAtRef = useRef<number | null>(null);
  const baseRef = useRef(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const lastPhaseRef = useRef<number>(-1);
  const lastSecondRef = useRef<number>(-1);

  const timeline = useMemo(() => buildTimeline(config), [config]);
  const total = useMemo(() => totalDuration(config), [config]);
  const state = useMemo(() => resolveState(timeline, elapsed, config), [timeline, elapsed, config]);

  // Restore the last configuration and sound preferences.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LOCAL_KEY);
      if (raw) setConfig(normalizeConfig({ ...TABATA_DEFAULT, ...JSON.parse(raw) }));
      const prefs = window.localStorage.getItem(PREFS_KEY);
      if (prefs) {
        const parsed = JSON.parse(prefs) as { muted?: boolean; haptics?: boolean };
        setMuted(Boolean(parsed.muted));
        setHaptics(parsed.haptics !== false);
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_KEY, JSON.stringify(config));
    } catch {
      /* ignore */
    }
  }, [config]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify({ muted, haptics }));
    } catch {
      /* ignore */
    }
  }, [muted, haptics]);

  // Ticking loop. Elapsed is always recomputed from Date.now(), so throttled
  // timers in a background tab cannot make the timer drift.
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const tick = () => {
      if (startedAtRef.current !== null) {
        const value = baseRef.current + (Date.now() - startedAtRef.current) / 1000;
        setElapsed(Math.min(value, total));
        if (value >= total) {
          setRunning(false);
          startedAtRef.current = null;
          baseRef.current = total;
        }
      }
      frame = window.setTimeout(tick, 100);
    };
    tick();
    return () => window.clearTimeout(frame);
  }, [running, total]);

  // Screen wake lock while running.
  useEffect(() => {
    let cancelled = false;
    const acquire = async () => {
      if (!running) return;
      const lock = await requestWakeLock();
      if (cancelled) {
        void lock?.release().catch(() => undefined);
        return;
      }
      wakeLockRef.current = lock;
    };
    void acquire();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && running) void acquire();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      void wakeLockRef.current?.release().catch(() => undefined);
      wakeLockRef.current = null;
    };
  }, [running]);

  // Phase change and countdown cues.
  useEffect(() => {
    if (!running) return;
    const phaseIndex = state.phase?.index ?? -1;
    if (phaseIndex !== lastPhaseRef.current) {
      lastPhaseRef.current = phaseIndex;
      if (state.finished) {
        playCue('complete', muted);
        vibrate([200, 80, 200, 80, 300], haptics);
      } else if (state.phase?.kind === 'work') {
        playCue('work', muted);
        vibrate(180, haptics);
      } else if (state.phase) {
        playCue('rest', muted);
        vibrate(90, haptics);
      }
    }
    const remaining = state.remainingInPhase;
    if (remaining <= 3 && remaining > 0 && remaining !== lastSecondRef.current) {
      lastSecondRef.current = remaining;
      playCue('countdown', muted);
      vibrate(40, haptics);
    }
    if (remaining > 3) lastSecondRef.current = -1;
  }, [state, running, muted, haptics]);

  const setElapsedTo = useCallback(
    (value: number) => {
      const clamped = Math.max(0, Math.min(value, total));
      baseRef.current = clamped;
      if (running) startedAtRef.current = Date.now();
      setElapsed(clamped);
      lastPhaseRef.current = -1;
    },
    [running, total],
  );

  const start = () => {
    unlockAudio();
    if (state.finished) {
      baseRef.current = 0;
      setElapsed(0);
    }
    startedAtRef.current = Date.now();
    setRunning(true);
    lastPhaseRef.current = -1;
  };

  const pause = () => {
    if (startedAtRef.current !== null) {
      baseRef.current += (Date.now() - startedAtRef.current) / 1000;
      startedAtRef.current = null;
    }
    setRunning(false);
  };

  const restart = () => {
    baseRef.current = 0;
    startedAtRef.current = running ? Date.now() : null;
    setElapsed(0);
    lastPhaseRef.current = -1;
  };

  const skip = (direction: 'next' | 'previous') => {
    setElapsedTo(seekPhase(timeline, elapsed, direction));
  };

  const applyPreset = (preset: TimerPreset) => {
    pause();
    setConfig(normalizeConfig(presetToConfig(preset)));
    baseRef.current = 0;
    setElapsed(0);
    toast({ title: `נטענה התבנית "${preset.name}"`, tone: 'success' });
  };

  const savePreset = () => {
    if (!presetName.trim()) {
      toast({ title: 'נדרש שם לתבנית', tone: 'warning' });
      return;
    }
    setSaving(true);
    startTransition(async () => {
      const result = await saveTimerPresetAction({
        name: presetName.trim(),
        prepare_seconds: config.prepareSeconds,
        work_seconds: config.workSeconds,
        rest_seconds: config.restSeconds,
        rounds: config.rounds,
        sets: config.sets,
        rest_between_sets_seconds: config.restBetweenSetsSeconds,
        cooldown_seconds: config.cooldownSeconds,
        is_public: publish,
      });
      setSaving(false);
      if (!result.ok) {
        toast({ title: result.message, tone: 'error' });
        return;
      }
      toast({ title: 'התבנית נשמרה', tone: 'success' });
      setSaveOpen(false);
      setPresetName('');
      router.refresh();
    });
  };

  const deletePreset = (presetId: string) => {
    startTransition(async () => {
      const result = await deleteTimerPresetAction(presetId);
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) router.refresh();
    });
  };

  const tone = PHASE_TONE[state.finished ? 'done' : (state.phase?.kind ?? 'prepare')];
  const phaseLabel = state.finished ? PHASE_LABELS.done : PHASE_LABELS[state.phase?.kind ?? 'prepare'];
  const nextLabel = state.nextPhase ? PHASE_LABELS[state.nextPhase.kind] : 'סיום';
  const phaseProgress =
    state.phase && !state.finished
      ? ((state.phase.seconds - state.remainingInPhase) / state.phase.seconds) * 100
      : 100;

  return (
    <div className="space-y-4">
      <PageHeader
        title="טיימר אינטרוולים"
        subtitle="עובד גם ללא חיבור לאינטרנט"
        backHref="/workout"
        action={
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={muted ? 'הפעלת צליל' : 'השתקה'}
              aria-pressed={muted}
              onClick={() => setMuted((m) => !m)}
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={haptics ? 'כיבוי רטט' : 'הפעלת רטט'}
              aria-pressed={haptics}
              onClick={() => setHaptics((h) => !h)}
              className={cn(!haptics && 'opacity-45')}
            >
              <Vibrate className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="הגדרות הטיימר"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 className="size-4" />
            </Button>
          </div>
        }
      />

      {/* Main display */}
      <section
        className={cn(
          'relative overflow-hidden rounded-lg border p-6 text-center transition-all',
          running && !state.finished ? 'animate-pulse-glow' : '',
        )}
        style={{
          borderColor: tone.ring,
          background: `radial-gradient(120% 90% at 50% 0%, ${tone.ring.replace('0.4', '0.10').replace('0.45', '0.10').replace('0.5', '0.12').replace('0.55', '0.12').replace('0.35', '0.08')}, #151A17 62%)`,
        }}
        aria-live="polite"
      >
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: tone.color }}>
          {phaseLabel}
        </p>
        <p
          className="num mt-1 text-[68px] font-extrabold leading-none tabular-nums"
          style={{ color: tone.color }}
        >
          {formatClock(state.finished ? 0 : state.remainingInPhase)}
        </p>
        <p className="num mt-2 text-xs text-muted">
          {state.finished ? 'האימון הושלם' : `הבא: ${nextLabel}`}
        </p>

        <div className="mt-4 flex items-center justify-center gap-3">
          <Metric label="סבב" value={state.round ? `${state.round}/${state.totalRounds}` : '—'} />
          <Metric label="סט" value={`${state.set}/${state.totalSets}`} />
          <Metric label="נותר" value={formatClock(state.remainingTotal)} />
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-bg/60">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{ width: `${phaseProgress}%`, background: tone.color }}
          />
        </div>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-bg/60">
          <div
            className="h-full rounded-full bg-muted/50 transition-all"
            style={{ width: `${state.progress * 100}%` }}
          />
        </div>
      </section>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="secondary" size="icon" aria-label="הפאזה הקודמת" onClick={() => skip('previous')}>
          <SkipBack className="size-5" />
        </Button>
        <Button
          size="lg"
          className="h-14 min-w-[132px] text-base"
          onClick={running ? pause : start}
          aria-label={running ? 'השהיה' : state.elapsed > 0 ? 'המשך' : 'התחלה'}
        >
          {running ? (
            <>
              <Pause className="size-5" aria-hidden />
              השהיה
            </>
          ) : (
            <>
              <Play className="size-5" aria-hidden />
              {state.elapsed > 0 && !state.finished ? 'המשך' : 'התחלה'}
            </>
          )}
        </Button>
        <Button variant="secondary" size="icon" aria-label="הפאזה הבאה" onClick={() => skip('next')}>
          <SkipForward className="size-5" />
        </Button>
        <Button variant="secondary" size="icon" aria-label="אתחול" onClick={restart}>
          <RotateCcw className="size-5" />
        </Button>
      </div>

      <p className="num text-center text-xs text-muted">
        סה״כ {formatClock(total)} · {config.rounds} סבבים × {config.sets} סטים
      </p>

      {/* Presets */}
      <section aria-labelledby="presets-title" className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 id="presets-title" className="text-sm font-bold">
            תבניות
          </h2>
          <Button variant="secondary" size="sm" onClick={() => setSaveOpen(true)}>
            <Plus className="size-4" aria-hidden />
            שמירת התבנית הנוכחית
          </Button>
        </div>
        <ul className="space-y-2">
          {presets.map((preset) => (
            <li
              key={preset.id}
              className="flex items-center justify-between gap-2 rounded-md border border-line bg-surface px-3 py-2.5"
            >
              <button
                type="button"
                onClick={() => applyPreset(preset)}
                className="min-w-0 flex-1 text-start"
              >
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-bold">{preset.name}</span>
                  {preset.is_public && <Badge tone="accent">של המועדון</Badge>}
                </span>
                <span className="num mt-0.5 block text-[11px] text-muted">
                  {preset.work_seconds}׳׳ עבודה · {preset.rest_seconds}׳׳ מנוחה · {preset.rounds} סבבים
                  {preset.sets > 1 && ` · ${preset.sets} סטים`}
                </span>
              </button>
              {(!preset.is_public && preset.profile_id === profileId) ||
              (preset.is_public && canPublish) ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label={`מחיקת ${preset.name}`}>
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>למחוק את התבנית?</AlertDialogTitle>
                      <AlertDialogDescription>
                        התבנית &quot;{preset.name}&quot; תימחק לצמיתות.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction onClick={() => deletePreset(preset.id)}>
                        כן, מחקו
                      </AlertDialogAction>
                      <AlertDialogCancel>ביטול</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Bookmark className="size-4 shrink-0 text-muted" aria-hidden />
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Settings dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הגדרות הטיימר</DialogTitle>
            <DialogDescription>
              ברירת המחדל היא טבאטה קלאסי: 20 שניות עבודה, 10 שניות מנוחה, 8 סבבים.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {SETTINGS.map((setting) => (
              <div key={setting.key} className="space-y-1">
                <Label htmlFor={setting.key} className="text-xs font-semibold text-muted">
                  {setting.label}
                </Label>
                <Input
                  id={setting.key}
                  type="number"
                  inputMode="numeric"
                  min={setting.key === 'workSeconds' || setting.key === 'rounds' || setting.key === 'sets' ? 1 : 0}
                  dir="ltr"
                  className="num text-center text-base font-bold"
                  value={config[setting.key]}
                  onChange={(event) =>
                    setConfig((current) =>
                      normalizeConfig({ ...current, [setting.key]: Number(event.target.value) }),
                    )
                  }
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="secondary"
              block
              onClick={() => {
                setConfig(TABATA_DEFAULT);
                restart();
              }}
            >
              איפוס לטבאטה
            </Button>
            <Button
              block
              onClick={() => {
                restart();
                setSettingsOpen(false);
              }}
            >
              שמירה
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save preset dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>שמירת תבנית</DialogTitle>
            <DialogDescription>
              {config.workSeconds}׳׳ עבודה · {config.restSeconds}׳׳ מנוחה · {config.rounds} סבבים ·{' '}
              {config.sets} סטים
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="preset-name">שם התבנית</Label>
            <Input
              id="preset-name"
              value={presetName}
              maxLength={40}
              placeholder="למשל: טבאטה רגליים"
              onChange={(event) => setPresetName(event.target.value)}
            />
          </div>
          {canPublish && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-line bg-raised p-3">
              <div>
                <p className="text-sm font-semibold">פרסום לכל המתאמנים</p>
                <p className="text-xs text-muted">התבנית תופיע אצל כל חברי GLoW.</p>
              </div>
              <Switch checked={publish} onCheckedChange={setPublish} aria-label="פרסום לכל המתאמנים" />
            </div>
          )}
          <Button block className="mt-4" onClick={savePreset} loading={saving}>
            שמירה
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line/60 bg-bg/40 px-3 py-1.5">
      <p className="label-muted">{label}</p>
      <p className="num text-sm font-extrabold">{value}</p>
    </div>
  );
}
