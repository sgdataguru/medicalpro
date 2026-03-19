/**
 * @file useScenarioLibrary.ts
 * @description Hook for managing scenario library data: fetching scenarios, templates, and duplicating scenarios.
 * @module app/simulations/_hooks
 */

'use client';

import { useState, useCallback } from 'react';
import type { ScenarioSummary, ScenarioTemplate } from '@/lib/simulation/simulation.types';
import * as service from '@/lib/simulation/simulation.service';

export function useScenarioLibrary() {
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [templates, setTemplates] = useState<ScenarioTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadScenarios = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await service.fetchScenarios();
      setScenarios(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await service.fetchTemplates();
      setTemplates(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const duplicateScenario = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const original = await service.fetchScenarioDetail(id);
      const copy = await service.createScenario(
        `${original.name} (Copy)`,
        original.description,
      );
      const updated = await service.updateScenario({
        ...copy,
        variables: original.variables.map((v, i) => ({ ...v, id: `dup-${i}-${Date.now()}` })),
        tags: [...original.tags],
      });
      setScenarios((prev) => [
        ...prev,
        {
          id: updated.id,
          name: updated.name,
          description: updated.description,
          status: updated.status,
          createdBy: updated.createdBy,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
          variableCount: updated.variables.length,
          modules: updated.modules,
          overallRisk: null,
          tags: updated.tags,
          isShared: false,
          isTemplate: false,
        },
      ]);
      return updated;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { scenarios, templates, isLoading, loadScenarios, loadTemplates, duplicateScenario };
}
