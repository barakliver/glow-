'use client';

import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastTone = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (input: { title: string; description?: string; tone?: ToastTone }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

/** Small hook used across the app for booking / workout feedback. */
export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}

const TONE_ICON: Record<ToastTone, React.ReactNode> = {
  success: <CheckCircle2 className="size-5 text-success" aria-hidden />,
  error: <XCircle className="size-5 text-danger" aria-hidden />,
  warning: <AlertTriangle className="size-5 text-warning" aria-hidden />,
  info: <Info className="size-5 text-accent-ink" aria-hidden />,
};

const TONE_BORDER: Record<ToastTone, string> = {
  success: 'border-success/40',
  error: 'border-danger/40',
  warning: 'border-warning/40',
  info: 'border-accent/40',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const counter = React.useRef(0);

  const toast = React.useCallback(
    (input: { title: string; description?: string; tone?: ToastTone }) => {
      counter.current += 1;
      const id = counter.current;
      setItems((current) => [...current, { id, tone: input.tone ?? 'info', ...input }]);
    },
    [],
  );

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right" duration={4200}>
        {children}
        {items.map((item) => (
          <ToastPrimitive.Root
            key={item.id}
            dir="rtl"
            onOpenChange={(open) => {
              if (!open) setItems((current) => current.filter((i) => i.id !== item.id));
            }}
            className={cn(
              'flex items-start gap-3 rounded-md border bg-surface p-3.5 shadow-card',
              'data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-80',
              TONE_BORDER[item.tone],
            )}
          >
            {TONE_ICON[item.tone]}
            <div className="flex-1 text-start">
              <ToastPrimitive.Title className="text-sm font-semibold">{item.title}</ToastPrimitive.Title>
              {item.description && (
                <ToastPrimitive.Description className="mt-0.5 text-xs text-muted">
                  {item.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close aria-label="סגירה" className="rounded p-1 text-muted hover:text-ink">
              <X className="size-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed inset-x-0 top-0 z-[100] mx-auto flex w-full max-w-md flex-col gap-2 p-3 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
