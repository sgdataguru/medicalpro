'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: 'dashboard' },
  { label: 'Staff Optimization', href: '/staff-allocation', icon: 'groups' },
  { label: 'Bed Allocation', href: '/bed-allocation', icon: 'bed' },
  { label: 'Supply Chain', href: '/supply-chain', icon: 'inventory_2' },
  { label: 'Revenue & Finance', href: '/revenue-cost', icon: 'payments' },
  { label: 'Anomaly Detection', href: '/anomalies', icon: 'warning' },
  { label: 'Simulations', href: '/simulations', icon: 'labs' },
  { label: 'Analytics Query', href: '/analytics-query', icon: 'question_answer' },
  { label: 'Recommendations', href: '/recommendations', icon: 'recommend' },
  { label: 'Sandbox Demo', href: '/sandbox', icon: 'science' },
];

export default function SideNavBar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-surface-container-low border-r border-outline-variant/10">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-white">
          <span className="material-symbols-outlined text-[20px]">local_hospital</span>
        </div>
        <div>
          <p className="font-headline text-sm font-extrabold tracking-tight text-on-surface">
            Farrer Park Hospital
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-primary-container">
            Clinical Analytics OS
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-r-lg px-4 py-2.5 text-sm font-semibold font-headline tracking-tight transition-colors ${
                isActive
                  ? 'text-secondary border-r-4 border-secondary bg-surface-container-highest/50'
                  : 'text-on-surface-variant hover:bg-surface-container-high/30 hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-outline-variant/10 px-6 py-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-primary-container">
          v2.0 — Clinical OS
        </p>
      </div>
    </aside>
  );
}
