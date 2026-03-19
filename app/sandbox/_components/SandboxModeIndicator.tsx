'use client';

export default function SandboxModeIndicator() {
  return (
    <div className="flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1">
      <span className="material-symbols-outlined text-[18px] text-secondary">
        science
      </span>
      <span className="text-xs font-semibold tracking-wide text-secondary sm:text-sm">
        Sandbox Mode
      </span>
    </div>
  );
}
