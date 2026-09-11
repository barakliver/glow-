'use client';

import { ShareActions } from '@/components/share/share-actions';
import { QrCode } from '@/components/share/qr-code';

export function InviteShare({ url, organizationName }: { url: string; organizationName: string }) {
  return (
    <div className="surface space-y-4 p-4">
      <ShareActions
        url={url}
        title={`הזמנה ל-${organizationName}`}
        text={`הוזמנת ללוח האימונים של ${organizationName}`}
      />
      <div className="flex flex-col items-center gap-2 border-t border-line pt-4">
        <QrCode value={url} size={168} />
        <p className="text-xs text-muted">סריקה מהירה כדי לפתוח את ההזמנה</p>
      </div>
    </div>
  );
}
