import { NextResponse } from 'next/server';
import { getCurrentUser, getRepository } from '@/lib/auth';
import { buildClassIcs } from '@/lib/ics';

/** Returns an ICS file for one class. Requires an authenticated member. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return new NextResponse('unauthorized', { status: 401 });

  const repository = await getRepository();
  const gymClass = await repository.getClass(id, user.profile.id);
  if (!gymClass || !gymClass.published) {
    return new NextResponse('not found', { status: 404 });
  }

  const ics = buildClassIcs(gymClass, gymClass.trainer_name);
  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="glow-class-${id}.ics"`,
      'Cache-Control': 'no-store',
    },
  });
}
