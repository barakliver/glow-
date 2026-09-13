'use client';

import { useEffect, useState } from 'react';
import { Check, Download, Share, SquarePlus, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/** Chromium fires this before showing its own install UI; we defer it to a button. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'installable' | 'ios' | 'installed' | 'unsupported';

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari reports installation through a non-standard flag.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Install entry point for the PWA.
 *
 * Chromium-based browsers expose `beforeinstallprompt`, so the install runs in
 * one tap. iOS Safari has no such API, so it gets the manual Share -> Add to
 * Home Screen steps instead of a dead button.
 */
export function InstallApp() {
  const [platform, setPlatform] = useState<Platform>('unsupported');
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setPlatform('installed');
      return;
    }
    if (isIos()) {
      setPlatform('ios');
      return;
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setPlatform('installable');
    };
    const onInstalled = () => {
      setPlatform('installed');
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') setPlatform('installed');
    setDeferred(null);
  };

  if (platform === 'installed') {
    return (
      <p className="flex items-center justify-center gap-1.5 rounded-md border border-success/35 bg-success/8 px-3 py-2.5 text-xs font-semibold text-success">
        <Check className="size-4 shrink-0" aria-hidden />
        האפליקציה מותקנת במכשיר הזה
      </p>
    );
  }

  if (platform === 'unsupported') {
    // No install path on this browser; pointing at one would be misleading.
    return null;
  }

  return (
    <>
      <Button
        variant="secondary"
        block
        size="lg"
        onClick={() => (platform === 'ios' ? setHelpOpen(true) : install())}
      >
        {platform === 'ios' ? (
          <Smartphone className="size-4" aria-hidden />
        ) : (
          <Download className="size-4" aria-hidden />
        )}
        התקנת GLoW כאפליקציה
      </Button>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>התקנה על אייפון</DialogTitle>
            <DialogDescription>
              ב-iPhone ההתקנה נעשית מתוך Safari בשני צעדים. אחריה GLoW ייפתח כאפליקציה מלאה, בלי
              סרגל הדפדפן.
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-3">
            <Step
              index={1}
              icon={<Share className="size-4 text-accent-ink" aria-hidden />}
              title="פתחו את תפריט השיתוף"
              body="לחצו על אייקון השיתוף בתחתית המסך ב-Safari."
            />
            <Step
              index={2}
              icon={<SquarePlus className="size-4 text-accent-ink" aria-hidden />}
              title='בחרו "הוספה למסך הבית"'
              body='גללו ברשימה, בחרו "Add to Home Screen" ואשרו. האייקון של GLoW יופיע במסך הבית.'
            />
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Step({
  index,
  icon,
  title,
  body,
}: {
  index: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-md border border-line bg-raised p-3">
      <span className="num flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/12 text-xs font-extrabold text-accent-ink">
        {index}
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-bold">
          {icon}
          {title}
        </p>
        <p className="mt-0.5 text-xs text-muted">{body}</p>
      </div>
    </li>
  );
}
