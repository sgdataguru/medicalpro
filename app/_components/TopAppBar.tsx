export default function TopAppBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant/15 bg-surface/80 px-8 backdrop-blur-md">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-full bg-surface-container-high/50 px-4 py-2 w-80">
        <span className="material-symbols-outlined text-[18px] text-on-primary-container">
          search
        </span>
        <span className="text-sm text-on-primary-container">
          Search modules, metrics, alerts…
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 rounded-full bg-on-tertiary-container/10 px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-on-tertiary-container opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-on-tertiary-container" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-tertiary-container">
            Live
          </span>
        </div>

        {/* Notification bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-container-high/50 transition-colors">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
            notifications
          </span>
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white">
            3
          </span>
        </button>

        {/* User avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white">
          MK
        </div>
      </div>
    </header>
  );
}
