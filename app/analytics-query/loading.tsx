export default function AnalyticsQueryLoading() {
  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-80 bg-surface-container-high rounded-lg animate-pulse" />
        <div className="h-4 w-56 bg-surface-container-high rounded animate-pulse" />
      </div>

      {/* Query input skeleton */}
      <div className="h-14 bg-surface-container-high rounded-xl animate-pulse" />

      {/* Suggested questions skeleton */}
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-48 bg-surface-container-high rounded-full animate-pulse" />
        ))}
      </div>

      {/* Response area skeleton */}
      <div className="bg-surface-container-high/30 rounded-xl border border-outline-variant/10 p-6 space-y-4">
        <div className="h-5 w-40 bg-surface-container-high rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-surface-container-high rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-surface-container-high rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-surface-container-high rounded animate-pulse" />
        </div>
        <div className="h-64 bg-surface-container-high rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
