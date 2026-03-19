export default function StaffAllocationLoading() {
  return (
    <div className="min-h-screen p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-64 bg-surface-container-high rounded-lg" />
          <div className="h-4 w-96 bg-surface-container-high rounded-lg mt-2" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-surface-container-high rounded-lg" />
          <div className="h-9 w-28 bg-surface-container-high rounded-lg" />
        </div>
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-36 bg-surface-container-high rounded-xl" />
        <div className="h-36 bg-surface-container-high rounded-xl" />
      </div>

      {/* Heatmap skeleton */}
      <div className="h-80 bg-surface-container-high rounded-xl" />

      {/* Bottom charts skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="h-64 bg-surface-container-high rounded-xl" />
        <div className="h-64 bg-surface-container-high rounded-xl" />
      </div>
    </div>
  );
}
