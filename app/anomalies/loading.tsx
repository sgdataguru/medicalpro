export default function AnomaliesLoading() {
  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-72 bg-surface-container-high rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-surface-container-high rounded animate-pulse" />
        </div>
        <div className="h-10 w-24 bg-surface-container-high rounded-lg animate-pulse" />
      </div>

      {/* Stats bar skeleton */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-surface-container-high/30 backdrop-blur-md rounded-xl border border-secondary/30 animate-pulse"
          />
        ))}
      </div>

      {/* Filter bar skeleton */}
      <div className="h-14 bg-surface-container-high rounded-xl animate-pulse" />

      {/* Content panels skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface-container-high rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-surface-container-high rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
