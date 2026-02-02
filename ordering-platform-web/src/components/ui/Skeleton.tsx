interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-surface-elevated rounded-[var(--radius-md)] ${className}`}
    />
  );
}

export function MenuItemSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="w-20 h-20 rounded-[var(--radius-lg)] shrink-0" />
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="space-y-1">
      <Skeleton className="h-7 w-40 mb-3 mx-4" />
      <MenuItemSkeleton />
      <MenuItemSkeleton />
      <MenuItemSkeleton />
    </div>
  );
}
