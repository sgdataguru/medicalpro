'use client';

import { useMemo, useCallback } from 'react';
import type { StaffAllocationFilters } from '@/lib/staff-allocation/staff-allocation.types';
import { DEFAULT_FILTERS } from '@/lib/staff-allocation/staff-allocation.constants';

export function useStaffFilters(
  filters: StaffAllocationFilters,
  updateFilters: (partial: Partial<StaffAllocationFilters>) => void,
) {
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.departmentIds.length > 0) count++;
    if (filters.roles.length > 0) count++;
    if (filters.shifts.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  }, [filters]);

  const resetFilters = useCallback(() => {
    updateFilters(DEFAULT_FILTERS);
  }, [updateFilters]);

  const toggleDepartment = useCallback((id: string) => {
    const current = filters.departmentIds;
    const next = current.includes(id) ? current.filter((d) => d !== id) : [...current, id];
    updateFilters({ departmentIds: next });
  }, [filters.departmentIds, updateFilters]);

  const toggleRole = useCallback((role: StaffAllocationFilters['roles'][number]) => {
    const current = filters.roles;
    const next = current.includes(role) ? current.filter((r) => r !== role) : [...current, role];
    updateFilters({ roles: next });
  }, [filters.roles, updateFilters]);

  const toggleShift = useCallback((shift: StaffAllocationFilters['shifts'][number]) => {
    const current = filters.shifts;
    const next = current.includes(shift) ? current.filter((s) => s !== shift) : [...current, shift];
    updateFilters({ shifts: next });
  }, [filters.shifts, updateFilters]);

  return { activeFilterCount, resetFilters, toggleDepartment, toggleRole, toggleShift };
}
