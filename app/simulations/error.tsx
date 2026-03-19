'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function SimulationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Simulations] Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container ring-1 ring-outline-variant/15">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-error"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="mb-3 font-headline text-3xl font-bold tracking-tight text-on-surface">
          Something Went Wrong
        </h1>

        {/* Description */}
        <p className="mx-auto mb-2 max-w-md text-base leading-relaxed text-on-surface-variant">
          The Foresight Simulations module encountered an unexpected error.
          Your scenarios and simulation data remain safe — this is a
          display-level issue only.
        </p>

        {/* Error digest */}
        {error.digest && (
          <p className="mb-6 font-mono text-xs tracking-wide text-on-surface-variant/50">
            Reference: {error.digest}
          </p>
        )}

        {!error.digest && <div className="mb-6" />}

        {/* Error details */}
        <details className="mx-auto mb-8 max-w-md rounded-lg bg-surface-container px-4 py-3 text-left ring-1 ring-outline-variant/15">
          <summary className="cursor-pointer text-sm font-medium text-on-surface-variant select-none hover:text-on-surface">
            Technical details
          </summary>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-error/80">
            {error.message || 'An unknown error occurred.'}
          </pre>
        </details>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="inline-flex h-11 min-w-[160px] items-center justify-center gap-2 rounded-lg bg-secondary px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-[0.98]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
              />
            </svg>
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex h-11 min-w-[160px] items-center justify-center gap-2 rounded-lg border border-outline-variant/15 bg-surface-container px-6 text-sm font-semibold text-on-surface-variant transition-all duration-200 hover:border-outline-variant/30 hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-[0.98]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            Go to Dashboard
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-10 text-xs text-on-surface-variant/40">
          If this issue persists, please contact your system administrator.
        </p>
      </div>
    </div>
  );
}
