import { Skeleton } from '@/components/ui/skeleton';

/** Fixed heights keep the layout stable while data loads. */
export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">טוען...</span>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-40" />
      </div>
      <Skeleton className="h-[148px] w-full rounded-lg" />
      <Skeleton className="h-[124px] w-full rounded-lg" />
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-[84px] rounded-md" />
        <Skeleton className="h-[84px] rounded-md" />
        <Skeleton className="h-[84px] rounded-md" />
      </div>
    </div>
  );
}
