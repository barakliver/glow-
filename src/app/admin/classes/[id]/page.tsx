import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaff, getRepository, isOwner } from "@/lib/auth";
import { ClassRoster } from "./class-roster";
import { WorkoutPicker } from "./workout-picker";
import { APP_URL } from "@/lib/env";

export const metadata: Metadata = { title: "ניהול שיעור" };

export default async function AdminClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireStaff();
  const repository = await getRepository();

  const gymClass = await repository.getClass(id, null);
  if (!gymClass) notFound();

  const canManage =
    isOwner(user) || (user.trainer && gymClass.trainer_id === user.trainer.id);
  const [bookings, attendance, reveal, workouts] = await Promise.all([
    repository.listClassBookings(id),
    repository.listAttendance(""),
    repository.getClassWorkout(id, user.profile.id),
    repository.listWorkouts(),
  ]);

  return (
    <div className="space-y-4">
      <ClassRoster
        gymClass={gymClass}
        rows={bookings.map((row) => ({
          bookingId: row.booking.id,
          profileId: row.profile.id,
          name: row.profile.full_name,
          phone: row.profile.phone,
          status: row.booking.status,
          waitlistPosition: row.booking.waitlist_position,
        }))}
        canManage={Boolean(canManage)}
        checkinUrl={`${APP_URL}/checkin/${gymClass.id}`}
        attendanceCount={attendance.length}
      />
      {canManage && (
        <WorkoutPicker
          classId={gymClass.id}
          workouts={workouts}
          current={reveal.state === "revealed" ? reveal.workout : null}
          currentNotes={reveal.state === "revealed" ? reveal.notes : null}
        />
      )}
    </div>
  );
}
