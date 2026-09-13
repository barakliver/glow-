import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { OnboardingForm } from './onboarding-form';

export const metadata: Metadata = { title: 'השלמת פרטים' };

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/sign-in');
  if (user.profile.onboarding_completed) redirect('/');

  return (
    <OnboardingForm
      defaultName={user.profile.full_name}
      defaultPhone={user.profile.phone ?? ''}
      defaultLevel={user.profile.experience_level}
      defaultStyle={user.profile.avocado_style}
      defaultWeeklyGoal={user.profile.weekly_goal_sessions}
    />
  );
}
