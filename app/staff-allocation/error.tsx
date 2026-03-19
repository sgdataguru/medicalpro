'use client';

export default function StaffAllocationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-surface-container flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface-container-high rounded-xl border border-red-600/30 p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-600/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-[24px] text-red-400">error</span>
        </div>
        <h2 className="font-headline text-lg font-semibold text-on-surface mb-2">
          Staff Allocation Error
        </h2>
        <p className="text-sm text-on-surface-variant mb-6">
          {error.message || 'Failed to load the staff allocation dashboard. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-secondary text-white text-sm font-medium rounded-lg hover:bg-secondary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
