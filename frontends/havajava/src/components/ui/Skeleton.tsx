interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden bg-surface-elevated rounded-[var(--radius-md)] ${className}`}>
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        style={{ animation: 'shimmer 1.8s infinite' }}
      />
    </div>
  );
}

export function MenuItemSkeleton() {
  return (
    <div className="flex gap-3 p-4" role="status" aria-label="Loading menu item">
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-4 w-16 mt-1" />
      </div>
      <Skeleton className="w-20 h-20 rounded-[var(--radius-lg)] shrink-0" />
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="space-y-1" role="status" aria-label="Loading menu category">
      <Skeleton className="h-7 w-40 mb-3 mx-4" />
      <MenuItemSkeleton />
      <MenuItemSkeleton />
      <MenuItemSkeleton />
    </div>
  );
}

export function CategoryNavSkeleton() {
  return (
    <div className="flex gap-2 px-4 py-3" role="status" aria-label="Loading categories">
      <Skeleton className="h-8 w-24 rounded-full" />
      <Skeleton className="h-8 w-20 rounded-full" />
      <Skeleton className="h-8 w-28 rounded-full" />
      <Skeleton className="h-8 w-20 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="bg-surface-elevated p-4 py-6 space-y-3" role="status" aria-label="Loading restaurant info">
      <Skeleton className="h-8 w-56" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-3 w-36" />
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="space-y-6 p-4" role="status" aria-label="Loading checkout">
      <Skeleton className="h-12 w-full rounded-[var(--radius-md)]" />
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-[var(--radius-md)]" />
        <Skeleton className="h-12 w-full rounded-[var(--radius-md)]" />
        <Skeleton className="h-12 w-full rounded-[var(--radius-md)]" />
      </div>
      <Skeleton className="h-40 w-full rounded-[var(--radius-lg)]" />
      <Skeleton className="h-14 w-full rounded-[var(--radius-lg)]" />
    </div>
  );
}
