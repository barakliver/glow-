import { requireUser, getRepository, isStaff } from '@/lib/auth';
import { AppHeader } from '@/components/layout/app-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { DemoBanner } from '@/components/pwa/demo-banner';
import { isDemoMode } from '@/lib/env';

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const repository = await getRepository();
  const notifications = await repository.listNotifications(user.profile.id);
  const unread = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="min-h-dvh bg-bg">
      {isDemoMode() && <DemoBanner />}
      <AppHeader unreadCount={unread} showAdminLink={isStaff(user)} />
      {/* Wider side gutters and a real gap under the header: the content used
          to start 16px from both edges, which is what made it feel packed. */}
      <main id="main" className="pb-nav mx-auto w-full max-w-2xl px-5 pt-6 lg:max-w-4xl">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
