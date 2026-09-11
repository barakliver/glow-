import 'server-only';
import type { DeliveryStatus } from '@/lib/domain/types';

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  /** Member-level opt-in. When false the message stays in-app only. */
  enabled: boolean;
}

export interface EmailResult {
  status: DeliveryStatus;
  error: string | null;
}

function providerConfigured(): 'resend' | 'smtp' | null {
  if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) return 'resend';
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.EMAIL_FROM) return 'smtp';
  return null;
}

/**
 * Email notification adapter.
 *
 * When no provider credentials exist the message is NOT dropped: the caller
 * still stores it in the in-app notification center and records the delivery
 * status, so the owner can see exactly what would have been sent.
 */
export async function deliverEmail(payload: EmailPayload): Promise<EmailResult> {
  if (!payload.enabled) return { status: 'skipped_no_provider', error: 'email_disabled_by_member' };

  const provider = providerConfigured();
  if (!provider) return { status: 'skipped_no_provider', error: null };
  if (!payload.to) return { status: 'failed', error: 'missing_recipient' };

  if (provider === 'resend') {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM,
          to: [payload.to],
          subject: `GLoW · ${payload.subject}`,
          text: payload.body,
        }),
      });
      if (!response.ok) {
        return { status: 'failed', error: `resend_${response.status}` };
      }
      return { status: 'sent', error: null };
    } catch (error) {
      return { status: 'failed', error: error instanceof Error ? error.message : 'resend_error' };
    }
  }

  // SMTP transport is intentionally not bundled: adding a mailer dependency is
  // a deployment decision. The hook below is where it plugs in.
  return { status: 'pending', error: 'smtp_transport_not_installed' };
}

export function emailProviderName(): string {
  const provider = providerConfigured();
  if (provider === 'resend') return 'Resend';
  if (provider === 'smtp') return 'SMTP';
  return 'לא מוגדר';
}
