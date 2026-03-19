'use client';

import { useEffect, useState } from 'react';

import type { ExecutiveDashboardData } from '@/lib/dashboard/dashboard.types';
import { fetchExecutiveDashboard } from '@/lib/dashboard/dashboard.service';

import ExecutiveDashboardHeader from './_components/dashboard/ExecutiveDashboardHeader';
import KpiSection from './_components/dashboard/KpiSection';
import RevenueCycleChart from './_components/dashboard/RevenueCycleChart';
import ExpenseBreakdown from './_components/dashboard/ExpenseBreakdown';
import PayerMixAnalysis from './_components/dashboard/PayerMixAnalysis';
import ForesightSimulationROI from './_components/dashboard/ForesightSimulationROI';
import SystemHealthIndicator from './_components/dashboard/SystemHealthIndicator';

export default function Home() {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecutiveDashboard().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-16 bg-surface-container-low rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-surface-container-low rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-surface-container-low rounded-xl" />
          <div className="h-80 bg-surface-container-low rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-surface-container-low rounded-xl" />
          <div className="h-64 bg-surface-container-low rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <ExecutiveDashboardHeader reportingPeriod={data.reportingPeriod} />

      {/* KPI Cards */}
      <KpiSection kpis={data.kpis} />

      {/* Middle Section: Revenue Cycle & Expense */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueCycleChart data={data.revenueCycle} />
        <ExpenseBreakdown items={data.expenses} />
      </div>

      {/* Bottom Section: Payer Mix & ROI Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PayerMixAnalysis rows={data.payerMix} />
        <ForesightSimulationROI data={data.foresight} />
      </div>

      {/* Floating System Health Indicator */}
      <SystemHealthIndicator />
    </div>
  );
}
