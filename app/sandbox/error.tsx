'use client';

export default function SandboxError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary-container px-4">
      <span className="material-symbols-outlined text-[48px] text-error mb-4">
        error
      </span>
      <h2 className="font-headline text-xl font-bold text-white mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-white/60 mb-6 text-center max-w-md">
        {error.message || 'An unexpected error occurred while loading the sandbox.'}
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90"
      >
        <span className="material-symbols-outlined text-[18px]">refresh</span>
        Try Again
      </button>
    </div>
  );
}
