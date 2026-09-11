'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isDemoMode } from '@/lib/env';

/**
 * Browser Supabase client. Returns null in demo mode so callers degrade to the
 * demo adapter instead of crashing.
 */
export function createClient() {
  if (isDemoMode()) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
