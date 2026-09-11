import { requireUser, getRepository, isStaff } from '@/lib/auth';
import { AppHeader } from '@/components/layout/app-header';
import { BottomNav } from '@/components/layout/bottom-nav';

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const repository = await getRepository();
  const notifications = await repository.listNotifications(user.profile.id);
  const unread = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader unreadCount={unread} showAdminLink={isStaff(user)} />
      <main id="main" className="pb-nav mx-auto w-full max-w-2xl px-4 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
