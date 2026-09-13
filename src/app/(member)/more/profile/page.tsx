import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { ProfileForm } from './profile-form';

export const metadata: Metadata = { title: 'הפרטים שלי' };

export default async function ProfilePage() {
  const user = await requireUser('/more/profile');
  return (
    <ProfileForm
      profileId={user.profile.id}
      fullName={user.profile.full_name}
      displayName={user.profile.display_name ?? ''}
      avatarPreset={user.profile.avatar_preset}
      phone={user.profile.phone ?? ''}
      email={user.profile.email}
      level={user.profile.experience_level}
      style={user.profile.avocado_style}
      weeklyGoal={user.profile.weekly_goal_sessions}
    />
  );
}
