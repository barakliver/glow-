'use client';

import { useState } from 'react';
import { CalendarPlus, Check, Copy, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

/**
 * Native share with explicit fallbacks. WhatsApp and Copy Link are always
 * offered, because the Web Share API is missing on most desktop browsers.
 */
export function ShareActions({
  url,
  title,
  text,
  icsHref,
  compact = false,
}: {
  url: string;
  title: string;
  text: string;
  icsHref?: string;
  compact?: boolean;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: 'הקישור הועתק', tone: 'success' });
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast({ title: 'ההעתקה נכשלה', description: url, tone: 'error' });
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // User dismissed the sheet: fall through to copying.
      }
    }
    await copyLink();
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;

  return (
    <div className={compact ? 'flex flex-wrap gap-2' : 'grid gap-2 sm:grid-cols-2'}>
      <Button variant="secondary" onClick={nativeShare} block={!compact}>
        <Share2 className="size-4" aria-hidden />
        שיתוף
      </Button>
      <Button variant="secondary" onClick={copyLink} block={!compact}>
        {copied ? <Check className="size-4 text-success" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        העתקת קישור
      </Button>
      <Button variant="secondary" asChild block={!compact}>
        <a href={whatsappHref} target="_blank" rel="noreferrer noopener">
          <MessageCircle className="size-4" aria-hidden />
          שיתוף בוואטסאפ
        </a>
      </Button>
      {icsHref && (
        <Button variant="secondary" asChild block={!compact}>
          <a href={icsHref}>
            <CalendarPlus className="size-4" aria-hidden />
            הוספה ליומן
          </a>
        </Button>
      )}
    </div>
  );
}
