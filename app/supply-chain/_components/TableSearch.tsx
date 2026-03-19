'use client';

interface TableSearchProps {
  value: string;
  onChange: (q: string) => void;
  placeholder?: string;
}

export default function TableSearch({
  value,
  onChange,
  placeholder = 'Search...',
}: TableSearchProps) {
  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-gray-400 focus:border-secondary-container focus:outline-none focus:ring-1 focus:ring-secondary-container/20"
      />
    </div>
  );
}
