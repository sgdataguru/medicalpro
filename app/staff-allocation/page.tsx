'use client';

import { useEffect } from 'react';

import { useStaffAllocation } from './_hooks/useStaffAllocation';
import { useStaffPrediction } from './_hooks/useStaffPrediction';

import StaffAllocationHeader from './_components/StaffAllocationHeader';
import KeyMetricsRow from './_components/KeyMetricsRow';
import DepartmentalDistribution from './_components/DepartmentalDistribution';
import StaffingForesight from './_components/StaffingForesight';
import LiveUnitPulse from './_components/LiveUnitPulse';

export default function StaffAllocationPage() {
  const { state, dispatch, loadStaffing } = useStaffAllocation();
  const { triggerPrediction } = useStaffPrediction({ dispatch });

  useEffect(() => {
    loadStaffing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derive key metrics from state
  const totalRequired = state.totals.totalRequired || 1;
  const vacancyRate = ((totalRequired - state.totals.totalOnDuty) / totalRequired) * 100;
  const overtimeCost = state.overtimeProjections.reduce((s, p) => s + p.currentOvertimeCost, 0);

  // Find department with most critical gaps
  const gapsByDept = state.coverageGaps.reduce<Record<string, number>>((acc, g) => {
    acc[g.departmentName] = (acc[g.departmentName] ?? 0) + g.staffShortfall;
    return acc;
  }, {});
  const criticalDept = Object.entries(gapsByDept).sort(([, a], [, b]) => b - a)[0];

  // Average patient-to-staff ratio across departments
  const allRatios = state.currentStaffing.flatMap((d) =>
    d.shifts.filter((s) => s.nurseToPatientRatio > 0).map((s) => s.nurseToPatientRatio),
  );
  const avgRatio = allRatios.length > 0 ? allRatios.reduce((s, r) => s + r, 0) / allRatios.length : 4.2;

  // Efficiency score from coverage
  const efficiency = state.totals.overallCoverage || 94.2;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <StaffAllocationHeader onRefresh={loadStaffing} loading={state.loading} />

      {/* Key Metrics Row */}
      <KeyMetricsRow
        totals={state.totals}
        overtimeCost={overtimeCost}
        vacancyRate={Math.max(0, vacancyRate)}
        criticalOpenings={criticalDept ? gapsByDept[criticalDept[0]] : 0}
        criticalDepartment={criticalDept?.[0] ?? 'Surgery'}
        patientToStaffRatio={avgRatio}
        loading={state.loading}
      />

      {/* Main Distribution & Foresight Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Staff Distribution (2/3 width) */}
        <div className="lg:col-span-2">
          <DepartmentalDistribution
            departments={state.currentStaffing}
            loading={state.loading}
          />
        </div>

        {/* Staffing Foresight (1/3 width) */}
        <div className="lg:col-span-1">
          <StaffingForesight
            prediction={state.predictions}
            predictionStatus={state.predictionJobStatus}
            onRunPrediction={triggerPrediction}
          />

          {/* Live Unit Pulse */}
          <LiveUnitPulse efficiency={efficiency} />
        </div>
      </div>
    </div>
  );
}
