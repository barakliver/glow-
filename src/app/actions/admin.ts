'use server';

import { revalidatePath } from 'next/cache';
import { requireStaff, requireOwner, getRepository, isOwner } from '@/lib/auth';
import {
  classFormSchema,
  exerciseFormSchema,
  gymSettingsSchema,
  inviteFormSchema,
  seriesFormSchema,
  templateFormSchema,
} from '@/lib/validation';
import { fromGymTime } from '@/lib/time';
import type { ActionResult } from '@/app/actions/booking';
import type {
  BodyArea,
  BookingStatus,
  Equipment,
  GymClass,
  Membership,
  MovementCategory,
} from '@/lib/domain/types';

function revalidateSchedule(classId?: string) {
  revalidatePath('/admin/schedule');
  revalidatePath('/admin');
  revalidatePath('/schedule');
  revalidatePath('/');
  if (classId) {
    revalidatePath(`/classes/${classId}`);
    revalidatePath(`/admin/classes/${classId}`);
  }
}

/** A trainer may only touch classes assigned to them; the owner may touch all. */
async function assertCanManageClass(classId: string): Promise<ActionResult | null> {
  const user = await requireStaff();
  if (isOwner(user)) return null;
  const repository = await getRepository();
  const gymClass = await repository.getClass(classId, null);
  if (!gymClass) return { ok: false, message: 'השיעור לא נמצא.' };
  if (!user.trainer || gymClass.trainer_id !== user.trainer.id) {
    return { ok: false, message: 'אפשר לנהל רק שיעורים שאתם משובצים אליהם.' };
  }
  return null;
}

// --- classes ----------------------------------------------------------------
export async function createClassAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireOwner();
  const parsed = classFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'הנתונים אינם תקינים.' };
  }
  const repository = await getRepository();
  const startsAt = fromGymTime(parsed.data.date, parsed.data.time);
  const gymClass = await repository.createClass({
    title: parsed.data.title,
    description: parsed.data.description || null,
    category: parsed.data.category,
    difficulty: parsed.data.difficulty,
    trainer_id: parsed.data.trainer_id || null,
    location: parsed.data.location,
    capacity: parsed.data.capacity,
    starts_at: startsAt.toISOString(),
    ends_at: new Date(startsAt.getTime() + parsed.data.duration_minutes * 60_000).toISOString(),
    equipment: parsed.data.equipment as Equipment[],
    published: parsed.data.published,
  });
  revalidateSchedule(gymClass.id);
  return { ok: true, message: 'השיעור נוצר.', data: { id: gymClass.id } };
}

export async function updateClassAction(
  classId: string,
  input: unknown,
): Promise<ActionResult> {
  const denied = await assertCanManageClass(classId);
  if (denied) return denied;
  const parsed = classFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'הנתונים אינם תקינים.' };
  }
  const repository = await getRepository();
  const startsAt = fromGymTime(parsed.data.date, parsed.data.time);
  await repository.updateClass(classId, {
    title: parsed.data.title,
    description: parsed.data.description || null,
    category: parsed.data.category,
    difficulty: parsed.data.difficulty,
    trainer_id: parsed.data.trainer_id || null,
    location: parsed.data.location,
    capacity: parsed.data.capacity,
    starts_at: startsAt.toISOString(),
    ends_at: new Date(startsAt.getTime() + parsed.data.duration_minutes * 60_000).toISOString(),
    equipment: parsed.data.equipment as Equipment[],
    published: parsed.data.published,
  });
  revalidateSchedule(classId);
  return { ok: true, message: 'השיעור עודכן. המשתתפים קיבלו התראה על שינוי בשעה.' };
}

export async function patchClassAction(
  classId: string,
  patch: Partial<Pick<GymClass, 'published' | 'registration_closed' | 'status' | 'capacity'>>,
): Promise<ActionResult> {
  const denied = await assertCanManageClass(classId);
  if (denied) return denied;
  const repository = await getRepository();

  const safePatch: Partial<GymClass> = {};
  if (typeof patch.published === 'boolean') safePatch.published = patch.published;
  if (typeof patch.registration_closed === 'boolean')
    safePatch.registration_closed = patch.registration_closed;
  if (patch.status === 'cancelled' || patch.status === 'scheduled') safePatch.status = patch.status;
  if (typeof patch.capacity === 'number' && patch.capacity > 0 && patch.capacity <= 100) {
    safePatch.capacity = Math.round(patch.capacity);
  }

  await repository.updateClass(classId, safePatch);
  revalidateSchedule(classId);
  return { ok: true, message: 'השיעור עודכן.' };
}

export async function deleteClassAction(classId: string): Promise<ActionResult> {
  await requireOwner();
  const repository = await getRepository();
  await repository.deleteClass(classId);
  revalidateSchedule();
  return { ok: true, message: 'השיעור נמחק.' };
}

export async function duplicateClassAction(
  classId: string,
  newDate: string,
  newTime: string,
): Promise<ActionResult<{ id: string }>> {
  await requireOwner();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate) || !/^\d{2}:\d{2}$/.test(newTime)) {
    return { ok: false, message: 'תאריך או שעה אינם תקינים.' };
  }
  const repository = await getRepository();
  const created = await repository.duplicateClass(
    classId,
    fromGymTime(newDate, newTime).toISOString(),
  );
  revalidateSchedule(created.id);
  return { ok: true, message: 'השיעור שוכפל.', data: { id: created.id } };
}

// --- recurring series -------------------------------------------------------
export async function createSeriesAction(
  input: unknown,
): Promise<ActionResult<{ created: number }>> {
  await requireOwner();
  const parsed = seriesFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'הנתונים אינם תקינים.' };
  }
  const repository = await getRepository();
  const { created } = await repository.createSeries({
    title: parsed.data.title,
    description: parsed.data.description || null,
    category: parsed.data.category,
    difficulty: parsed.data.difficulty,
    trainer_id: parsed.data.trainer_id || null,
    location: parsed.data.location,
    capacity: parsed.data.capacity,
    duration_minutes: parsed.data.duration_minutes,
    equipment: parsed.data.equipment as Equipment[],
    recurrence: {
      weekdays: parsed.data.weekdays,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
      start_time: parsed.data.time,
    },
    active: true,
  });
  revalidateSchedule();
  return { ok: true, message: `נוצרה סדרה עם ${created} מופעים.`, data: { created } };
}

export async function updateSeriesScopeAction(
  seriesId: string,
  classId: string,
  input: unknown,
  scope: 'one' | 'all',
): Promise<ActionResult> {
  await requireOwner();
  const parsed = classFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'הנתונים אינם תקינים.' };
  }
  const repository = await getRepository();

  if (scope === 'one') {
    return updateClassAction(classId, input);
  }

  await repository.updateSeries(
    seriesId,
    {
      title: parsed.data.title,
      description: parsed.data.description || null,
      category: parsed.data.category,
      difficulty: parsed.data.difficulty,
      trainer_id: parsed.data.trainer_id || null,
      location: parsed.data.location,
      capacity: parsed.data.capacity,
      duration_minutes: parsed.data.duration_minutes,
      equipment: parsed.data.equipment as Equipment[],
      recurrence: {
        weekdays: [],
        start_date: parsed.data.date,
        end_date: parsed.data.date,
        start_time: parsed.data.time,
      },
    },
    'all',
  );
  revalidateSchedule(classId);
  return { ok: true, message: 'כל המופעים העתידיים בסדרה עודכנו.' };
}

export async function deleteSeriesAction(seriesId: string): Promise<ActionResult> {
  await requireOwner();
  const repository = await getRepository();
  await repository.deleteSeries(seriesId);
  revalidateSchedule();
  return { ok: true, message: 'הסדרה בוטלה והמופעים העתידיים הוסרו.' };
}

// --- bookings / attendance --------------------------------------------------
export async function setBookingStatusAction(
  classId: string,
  bookingId: string,
  status: BookingStatus,
): Promise<ActionResult> {
  const denied = await assertCanManageClass(classId);
  if (denied) return denied;
  const repository = await getRepository();
  await repository.setBookingStatus(bookingId, status);
  revalidateSchedule(classId);
  return { ok: true, message: 'סטטוס הרישום עודכן.' };
}

export async function adminCancelBookingAction(
  classId: string,
  profileId: string,
): Promise<ActionResult> {
  const denied = await assertCanManageClass(classId);
  if (denied) return denied;
  const repository = await getRepository();
  const result = await repository.cancelBooking(classId, profileId, { force: true });
  revalidateSchedule(classId);
  if (!result.ok) return { ok: false, message: 'לא ניתן היה לבטל את הרישום.' };
  return {
    ok: true,
    message: result.promotedProfileId
      ? 'הרישום בוטל והמתאמן הבא ברשימת ההמתנה קודם.'
      : 'הרישום בוטל.',
  };
}

export async function markAttendanceAction(
  classId: string,
  profileId: string,
  present: boolean,
): Promise<ActionResult> {
  const denied = await assertCanManageClass(classId);
  if (denied) return denied;
  const user = await requireStaff();
  const repository = await getRepository();
  await repository.markAttendance(classId, profileId, present, user.profile.id, 'manual');
  revalidateSchedule(classId);
  return { ok: true, message: present ? 'סומן כנוכח.' : 'סומן כלא הגיע.' };
}

// --- members ----------------------------------------------------------------
export async function setMemberRoleAction(
  profileId: string,
  role: Membership['role'],
): Promise<ActionResult> {
  const user = await requireOwner();
  if (profileId === user.profile.id) {
    return { ok: false, message: 'אי אפשר לשנות את התפקיד של עצמכם.' };
  }
  const repository = await getRepository();
  await repository.setMemberRole(profileId, role);
  revalidatePath('/admin/members');
  return { ok: true, message: 'התפקיד עודכן.' };
}

export async function setMemberStatusAction(
  profileId: string,
  status: Membership['status'],
): Promise<ActionResult> {
  const user = await requireOwner();
  if (profileId === user.profile.id) {
    return { ok: false, message: 'אי אפשר להשעות את עצמכם.' };
  }
  const repository = await getRepository();
  await repository.setMemberStatus(profileId, status);
  revalidatePath('/admin/members');
  return { ok: true, message: status === 'active' ? 'המתאמן הופעל.' : 'המתאמן הושעה.' };
}

// --- exercises --------------------------------------------------------------
export async function saveExerciseAction(
  input: unknown,
  exerciseId?: string,
): Promise<ActionResult> {
  await requireStaff();
  const parsed = exerciseFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'הנתונים אינם תקינים.' };
  }
  const repository = await getRepository();
  const payload = {
    name_he: parsed.data.name_he,
    name_en: parsed.data.name_en,
    movement_category: parsed.data.movement_category as MovementCategory,
    target_areas: parsed.data.target_areas as BodyArea[],
    equipment: parsed.data.equipment as Equipment[],
    difficulty: parsed.data.difficulty,
    instructions: parsed.data.instructions,
    safety_cues: parsed.data.safety_cues || '',
    media_url: parsed.data.media_url || null,
  };
  if (exerciseId) await repository.updateExercise(exerciseId, payload);
  else await repository.createExercise(payload);

  revalidatePath('/admin/exercises');
  revalidatePath('/workout/library');
  return { ok: true, message: exerciseId ? 'התרגיל עודכן.' : 'התרגיל נוסף לספרייה.' };
}

export async function archiveExerciseAction(
  exerciseId: string,
  archived: boolean,
): Promise<ActionResult> {
  await requireStaff();
  const repository = await getRepository();
  await repository.updateExercise(exerciseId, { archived });
  revalidatePath('/admin/exercises');
  revalidatePath('/workout/library');
  return { ok: true, message: archived ? 'התרגיל הועבר לארכיון.' : 'התרגיל שוחזר.' };
}

// --- workout templates ------------------------------------------------------
export async function saveTemplateAction(
  input: unknown,
  templateId?: string,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireStaff();
  const parsed = templateFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'הנתונים אינם תקינים.' };
  }
  const repository = await getRepository();
  const exercises = await repository.listExercises(true);
  const byId = new Map(exercises.map((e) => [e.id, e]));

  const items = parsed.data.items.map((item, index) => ({
    exercise_id: item.exercise_id,
    block: item.block,
    position: index + 1,
    sets: item.sets ?? null,
    reps: item.reps ?? null,
    load_kg: item.load_kg ?? null,
    duration_seconds: item.duration_seconds ?? null,
    distance_meters: item.distance_meters ?? null,
    rest_seconds: item.rest_seconds ?? null,
    trainer_notes: item.trainer_notes ?? null,
    alternative_exercise_ids: item.alternative_exercise_ids,
  }));

  const referenced = items
    .map((item) => byId.get(item.exercise_id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const template = {
    title: parsed.data.title,
    description: parsed.data.description || null,
    goal: parsed.data.goal,
    difficulty: parsed.data.difficulty,
    duration_minutes: parsed.data.duration_minutes,
    approved: parsed.data.approved,
    suggestable: parsed.data.suggestable,
    equipment: [...new Set(referenced.flatMap((e) => e.equipment))] as Equipment[],
    focus_areas: [...new Set(referenced.flatMap((e) => e.target_areas))] as BodyArea[],
    movement_categories: [...new Set(referenced.map((e) => e.movement_category))],
    created_by: user.profile.id,
  };

  const saved = templateId
    ? await repository.updateTemplate(templateId, { template, items })
    : await repository.createTemplate({ template, items });

  revalidatePath('/admin/templates');
  revalidatePath('/workout');
  return { ok: true, message: 'התבנית נשמרה.', data: { id: saved.id } };
}

export async function setTemplateFlagsAction(
  templateId: string,
  flags: { approved?: boolean; suggestable?: boolean; archived?: boolean },
): Promise<ActionResult> {
  await requireStaff();
  const repository = await getRepository();
  await repository.updateTemplate(templateId, { template: flags });
  revalidatePath('/admin/templates');
  revalidatePath('/workout');
  return { ok: true, message: 'התבנית עודכנה.' };
}

// --- invitations ------------------------------------------------------------
export async function createInviteAction(input: unknown): Promise<ActionResult<{ token: string }>> {
  const user = await requireOwner();
  const parsed = inviteFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'הנתונים אינם תקינים.' };
  }
  const repository = await getRepository();
  const invite = await repository.createInvite({
    label: parsed.data.label,
    expires_at: parsed.data.expires_at
      ? fromGymTime(parsed.data.expires_at, '23:59').toISOString()
      : null,
    max_uses: parsed.data.max_uses ?? null,
    created_by: user.profile.id,
  });
  revalidatePath('/admin/invites');
  return { ok: true, message: 'נוצר קישור הזמנה.', data: { token: invite.token } };
}

export async function revokeInviteAction(inviteId: string): Promise<ActionResult> {
  await requireOwner();
  const repository = await getRepository();
  await repository.revokeInvite(inviteId);
  revalidatePath('/admin/invites');
  return { ok: true, message: 'ההזמנה בוטלה.' };
}

// --- gym settings -----------------------------------------------------------
export async function saveGymSettingsAction(input: unknown): Promise<ActionResult> {
  await requireOwner();
  const parsed = gymSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'ההגדרות אינן תקינות.' };
  }
  const repository = await getRepository();
  await repository.updateOrganization(parsed.data);
  revalidatePath('/admin/settings');
  revalidatePath('/schedule');
  return { ok: true, message: 'ההגדרות נשמרו.' };
}

/**
 * Publishes every draft class in a week and tells members the schedule is up.
 * One notification per member, not one per class.
 */
export async function publishWeekAction(
  fromIso: string,
  toIso: string,
): Promise<ActionResult<{ published: number; notified: number }>> {
  await requireOwner();
  const repository = await getRepository();

  const classes = await repository.listClasses({
    fromIso,
    toIso,
    profileId: null,
    includeUnpublished: true,
  });
  const drafts = classes.filter((c) => !c.published && c.status === 'scheduled');
  for (const draft of drafts) {
    await repository.updateClass(draft.id, { published: true });
  }

  const members = await repository.listMembers();
  const recipients = members.filter((row) => row.membership.status === 'active');
  for (const recipient of recipients) {
    await repository.createNotification({
      profile_id: recipient.profile.id,
      type: 'schedule_published',
      title: 'הלוח השבועי עודכן',
      body: `יש ${classes.length} שיעורים פתוחים להרשמה בשבוע הקרוב.`,
      link: '/schedule',
    });
  }

  revalidateSchedule();
  revalidatePath('/notifications');
  return {
    ok: true,
    message:
      drafts.length > 0
        ? `פורסמו ${drafts.length} שיעורים והודעה נשלחה ל-${recipients.length} מתאמנים.`
        : `הלוח כבר מפורסם. נשלחה הודעה ל-${recipients.length} מתאמנים.`,
    data: { published: drafts.length, notified: recipients.length },
  };
}
