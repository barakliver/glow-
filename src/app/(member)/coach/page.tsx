import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { CoachScreen } from './coach-screen';

export const metadata: Metadata = { title: 'המאמן' };

export default async function CoachPage() {
  await requireUser('/coach');
  return <CoachScreen />;
}
