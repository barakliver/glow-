'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { saveBodyMetricAction } from '@/app/actions/tracking';
import type { BodyMetric } from '@/lib/domain/types';

/**
 * Height and weight for today.
 *
 * The height prefills from whatever was last recorded, because it does not
 * change and nobody should retype it to correct a weight.
 */
export function BodyMetricForm({ latest }: { latest: BodyMetric | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [height, setHeight] = useState(latest?.height_cm ? String(latest.height_cm) : '');
  const [weight, setWeight] = useState('');

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveBodyMetricAction({
        height_cm: height.trim() === '' ? undefined : Number(height),
        weight_kg: weight.trim() === '' ? undefined : Number(weight),
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      toast({ title: result.message, tone: 'success' });
      setWeight('');
      router.refresh();
    });
  };

  return (
    <section className="surface p-5">
      <h2 className="flex items-center gap-2 text-sm font-bold">
        <Ruler className="size-4 text-accent-ink" aria-hidden />
        גובה ומשקל
      </h2>
      <p className="mt-1.5 text-xs text-muted">
        נשמר רק אצלך. גם המאמנים לא רואים את המספרים האלה.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="body-height">גובה בס״מ</Label>
          <Input
            id="body-height"
            type="number"
            inputMode="decimal"
            min="80"
            max="260"
            step="0.5"
            dir="ltr"
            className="num mt-2"
            value={height}
            onChange={(event) => setHeight(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="body-weight">משקל בק״ג</Label>
          <Input
            id="body-weight"
            type="number"
            inputMode="decimal"
            min="20"
            max="400"
            step="0.1"
            dir="ltr"
            className="num mt-2"
            placeholder={latest?.weight_kg ? String(latest.weight_kg) : undefined}
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      <Button className="mt-5" block onClick={submit} disabled={pending}>
        <Check className="size-4" aria-hidden />
        {pending ? 'שומר…' : 'שמירה'}
      </Button>
    </section>
  );
}
