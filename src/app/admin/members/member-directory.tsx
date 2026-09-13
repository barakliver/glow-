'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Phone, Search, ShieldCheck, UserCog, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { approveMemberAction, setMemberRoleAction, setMemberStatusAction } from '@/app/actions/admin';
import { ROLE_LABELS } from '@/lib/labels';
import { formatHebrewFullDate } from '@/lib/time';
import type { Membership, Role } from '@/lib/domain/types';

interface Row {
  profileId: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: Membership['status'];
  /** Null while this person is still waiting to be let in. */
  approvedAt: string | null;
  joinedAt: string;
  attended: number;
  upcoming: number;
  attendanceRate: number | null;
}

export function MemberDirectory({
  rows,
  currentProfileId,
}: {
  rows: Row[];
  currentProfileId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');

  const waiting = useMemo(() => rows.filter((row) => row.approvedAt === null), [rows]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows
      .filter((row) => row.approvedAt !== null)
      .filter((row) => roleFilter === 'all' || row.role === roleFilter)
      .filter(
        (row) =>
          needle === '' ||
          row.name.toLowerCase().includes(needle) ||
          row.email.toLowerCase().includes(needle) ||
          (row.phone ?? '').includes(needle),
      );
  }, [rows, query, roleFilter]);

  const run = (fn: () => Promise<{ ok: boolean; message: string }>) => {
    startTransition(async () => {
      const result = await fn();
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="display text-2xl tracking-tight">מתאמנים</h1>
        <p className="text-sm text-muted">
          {rows.length - waiting.length} חברים במועדון ·{' '}
          {rows.filter((r) => r.approvedAt !== null && r.role !== 'member').length} אנשי צוות
        </p>
      </div>

      {waiting.length > 0 && (
        <section aria-labelledby="waiting-title" className="surface space-y-3 border-accent/40 p-3.5">
          <div>
            <h2 id="waiting-title" className="section-label">
              ממתינים לאישור
              <Badge tone="accent" className="ms-2">
                {waiting.length}
              </Badge>
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              נרשמו לאפליקציה ועדיין לא נכנסו למועדון. בחרו אם להכניס אותם כמתאמנים או כמאמנים.
            </p>
          </div>

          <ul className="space-y-2">
            {waiting.map((row) => (
              <li key={row.profileId} className="rounded-md border border-line bg-raised p-3">
                <p className="text-sm font-bold">{row.name}</p>
                <p className="num text-xs text-muted">{row.email}</p>
                {row.phone && <p className="num text-xs text-muted">{row.phone}</p>}
                <p className="num mt-1 text-[11px] text-muted">
                  נרשם {formatHebrewFullDate(row.joinedAt)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() => run(() => approveMemberAction(row.profileId, 'member'))}
                  >
                    <Check className="size-4" aria-hidden />
                    אישור כמתאמן
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pending}
                    onClick={() => run(() => approveMemberAction(row.profileId, 'trainer'))}
                  >
                    <UserCog className="size-4" aria-hidden />
                    אישור כמאמן
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-2 sm:grid-cols-[1fr_200px]">
        <div className="relative">
          <Search
            className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="חיפוש לפי שם, אימייל או טלפון"
            aria-label="חיפוש מתאמן"
            className="pe-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as Role | 'all')}>
          <SelectTrigger aria-label="סינון לפי תפקיד">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל התפקידים</SelectItem>
            <SelectItem value="owner">בעלים</SelectItem>
            <SelectItem value="trainer">מאמנים</SelectItem>
            <SelectItem value="member">מתאמנים</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="לא נמצאו מתאמנים"
          description="נסו לחפש מילה אחרת או לשנות את הסינון."
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((row) => {
            const isSelf = row.profileId === currentProfileId;
            return (
              <li key={row.profileId} className="surface p-3.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-bold">{row.name}</h2>
                      <Badge
                        tone={
                          row.role === 'owner' ? 'accent' : row.role === 'trainer' ? 'warning' : 'neutral'
                        }
                      >
                        {ROLE_LABELS[row.role]}
                      </Badge>
                      {row.status === 'suspended' && <Badge tone="danger">מושעה</Badge>}
                      {isSelf && <Badge tone="outline">זה אתם</Badge>}
                    </div>
                    <p className="num mt-1 truncate text-xs text-muted" dir="ltr">
                      {row.email}
                    </p>
                    {row.phone && (
                      <a
                        href={`tel:${row.phone}`}
                        className="num mt-0.5 inline-flex items-center gap-1 text-xs text-muted hover:text-accent-ink"
                        dir="ltr"
                      >
                        <Phone className="size-3" aria-hidden />
                        {row.phone}
                      </a>
                    )}
                    <p className="num mt-1.5 text-[11px] text-muted">
                      הצטרף {formatHebrewFullDate(row.joinedAt)} · {row.attended} שיעורים ·{' '}
                      {row.upcoming} קרובים
                      {row.attendanceRate !== null && ` · ${row.attendanceRate}% הגעה`}
                    </p>
                  </div>
                </div>

                {!isSelf && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Select
                      value={row.role}
                      onValueChange={(value) =>
                        run(() => setMemberRoleAction(row.profileId, value as Role))
                      }
                    >
                      <SelectTrigger
                        className="h-9 w-auto min-w-[140px]"
                        aria-label={`תפקיד של ${row.name}`}
                      >
                        <UserCog className="size-4 shrink-0 text-muted" aria-hidden />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">מתאמן</SelectItem>
                        <SelectItem value="trainer">מאמן</SelectItem>
                        <SelectItem value="owner">בעלים</SelectItem>
                      </SelectContent>
                    </Select>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant={row.status === 'active' ? 'ghost' : 'success'}
                          size="sm"
                          disabled={pending}
                        >
                          <ShieldCheck className="size-4" aria-hidden />
                          {row.status === 'active' ? 'השעיה' : 'הפעלה מחדש'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {row.status === 'active'
                              ? `להשעות את ${row.name}?`
                              : `להפעיל מחדש את ${row.name}?`}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {row.status === 'active'
                              ? 'המתאמן לא יוכל להיכנס לאפליקציה או להירשם לשיעורים עד להפעלה מחדש.'
                              : 'המתאמן יוכל להיכנס שוב ולהירשם לשיעורים.'}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogAction
                            onClick={() =>
                              run(() =>
                                setMemberStatusAction(
                                  row.profileId,
                                  row.status === 'active' ? 'suspended' : 'active',
                                ),
                              )
                            }
                          >
                            אישור
                          </AlertDialogAction>
                          <AlertDialogCancel>ביטול</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
