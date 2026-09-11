import type { Metadata } from 'next';
import { requireOwner, getRepository } from '@/lib/auth';
import { emailProviderName } from '@/lib/notifications/email';
import { isDemoMode } from '@/lib/env';
import { GymSettingsForm } from './settings-form';

export const metadata: Metadata = { title: 'הגדרות המועדון' };

export default async function SettingsPage() {
  await requireOwner();
  const repository = await getRepository();
  const organization = await repository.getOrganization();

  return (
    <GymSettingsForm
      organization={{
        name: organization.name,
        booking_cutoff_minutes: organization.booking_cutoff_minutes,
        cancel_cutoff_minutes: organization.cancel_cutoff_minutes,
        waitlist_enabled: organization.waitlist_enabled,
        timezone: organization.timezone,
      }}
      emailProvider={emailProviderName()}
      demoMode={isDemoMode()}
    />
  );
}
