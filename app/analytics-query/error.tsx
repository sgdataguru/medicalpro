'use client';

export default function AnalyticsQueryError({
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
          <svg
            className="w-6 h-6 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="font-headline text-lg font-semibold text-on-surface mb-2">
          Analytics Query Error
        </h2>
        <p className="text-sm text-on-surface-variant mb-6">
          {error.message || 'Failed to load the analytics query interface. Please try again.'}
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
