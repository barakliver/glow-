'use server';

import { revalidatePath } from 'next/cache';
import { requireUser, requireStaff, getRepository } from '@/lib/auth';
import { announcementSchema, notificationPreferencesSchema } from '@/lib/validation';
import type { ActionResult } from '@/app/actions/booking';

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  const user = await requireUser('/notifications');
  const repository = await getRepository();
  const notifications = await repository.listNotifications(user.profile.id);
  if (!notifications.some((n) => n.id === id)) {
    return { ok: false, message: 'ההתראה לא נמצאה.' };
  }
  await repository.markNotificationRead(id);
  revalidatePath('/notifications');
  revalidatePath('/', 'layout');
  return { ok: true, message: '' };
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const user = await requireUser('/notifications');
  const repository = await getRepository();
  await repository.markAllNotificationsRead(user.profile.id);
  revalidatePath('/notifications');
  revalidatePath('/', 'layout');
  return { ok: true, message: 'כל ההתראות סומנו כנקראו.' };
}

export async function saveNotificationPreferencesAction(input: unknown): Promise<ActionResult> {
  const user = await requireUser('/more/notifications');
  const parsed = notificationPreferencesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: 'ההעדפות אינן תקינות.' };
  }
  const repository = await getRepository();
  await repository.setNotificationPreferences(user.profile.id, parsed.data);
  revalidatePath('/more/notifications');
  return { ok: true, message: 'ההעדפות נשמרו.' };
}

export async function sendAnnouncementAction(formData: FormData): Promise<ActionResult> {
  const user = await requireStaff();
  const parsed = announcementSchema.safeParse({
    title: formData.get('title'),
    body: formData.get('body'),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'ההודעה אינה תקינה.' };
  }
  const repository = await getRepository();
  const count = await repository.broadcastAnnouncement({
    title: parsed.data.title,
    body: parsed.data.body,
    authorId: user.profile.id,
  });
  revalidatePath('/admin/announcements');
  revalidatePath('/notifications');
  return { ok: true, message: `ההודעה נשלחה ל-${count} מתאמנים.` };
}
