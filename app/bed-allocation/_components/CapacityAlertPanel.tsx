'use client';

import { useState } from 'react';
import type { CapacityAlert, AlertSeverity } from '@/lib/bed-allocation/bed-allocation.types';
import CapacityAlertItem from './CapacityAlertItem';

type FilterTab = 'ALL' | AlertSeverity;

interface CapacityAlertPanelProps {
  alerts: CapacityAlert[];
  onAcknowledge: (id: string) => void;
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'CRITICAL', label: 'Critical' },
  { key: 'WARNING', label: 'Warning' },
];

export default function CapacityAlertPanel({
  alerts,
  onAcknowledge,
}: CapacityAlertPanelProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  const filteredAlerts =
    activeTab === 'ALL'
      ? alerts
      : alerts.filter((a) => a.severity === activeTab);

  function countBySeverity(severity: AlertSeverity): number {
    return alerts.filter((a) => a.severity === severity).length;
  }

  return (
    <div className="rounded-xl shadow-sm bg-surface-container-lowest p-6">
      {/* Heading */}
      <h2 className="font-headline text-lg font-semibold text-on-surface">
        Capacity Alerts
      </h2>

      {/* Tab filters */}
      <div className="mt-4 flex items-center gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count =
            tab.key === 'ALL' ? alerts.length : countBySeverity(tab.key);

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-on-surface text-surface'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {tab.label}
              <span
                className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold ${
                  isActive
                    ? 'bg-white/20 text-surface'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Alert list */}
      <div className="mt-4">
        {filteredAlerts.length === 0 ? (
          <p className="py-6 text-center text-sm text-on-surface-variant">
            No alerts
          </p>
        ) : (
          filteredAlerts.map((alert) => (
            <CapacityAlertItem
              key={alert.alertId}
              alert={alert}
              onAcknowledge={onAcknowledge}
            />
          ))
        )}
      </div>
    </div>
  );
}
