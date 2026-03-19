'use client';

import { formatDistanceToNow } from 'date-fns';

interface BedAllocationHeaderProps {
  lastUpdated: string;
  onRefresh: () => void;
  onExport: () => void;
}

export default function BedAllocationHeader({
  lastUpdated,
  onRefresh,
  onExport,
}: BedAllocationHeaderProps) {
  const relativeTime = formatDistanceToNow(new Date(lastUpdated), {
    addSuffix: false,
  })
    .replace('less than a minute', '<1m')
    .replace(/^about /, '')
    .replace(/ minutes?/, 'm')
    .replace(/ hours?/, 'h')
    .replace(/ days?/, 'd')
    .replace(/ months?/, 'mo')
    .replace(/ years?/, 'y')
    .concat(' ago');

  return (
    <header className="flex flex-row items-center justify-between">
      <h1 className="font-headline text-2xl font-bold text-on-surface">
        Bed Allocation
      </h1>

      <div className="flex items-center gap-3">
        <span className="text-sm text-on-surface-variant">
          Last updated: {relativeTime}
        </span>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-on-secondary transition-colors hover:bg-secondary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311V15.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5H6.758l.173.172a4 4 0 0 0 6.694-1.793.75.75 0 1 1 1.455.369 5.507 5.507 0 0 1-.768 1.925ZM4.688 8.576a5.5 5.5 0 0 1 9.201-2.466l.312.311V4.5a.75.75 0 0 1 1.5 0V8a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1 0-1.5h1.791l-.173-.172a4 4 0 0 0-6.694 1.793.75.75 0 0 1-1.455-.369c.155-.614.415-1.19.768-1.926Z"
              clipRule="evenodd"
            />
          </svg>
          Refresh
        </button>

        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
            <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
          </svg>
          Export
        </button>
      </div>
    </header>
  );
}
