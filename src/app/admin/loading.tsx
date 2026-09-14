import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="space-y-7" aria-busy="true" aria-live="polite">
      <span className="sr-only">טוען...</span>
      <Skeleton className="h-9 w-56" />
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-[104px] rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[260px] w-full rounded-lg" />
    </div>
  );
}
