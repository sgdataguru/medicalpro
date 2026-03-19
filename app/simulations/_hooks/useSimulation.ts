/**
 * @file useSimulation.ts
 * @description Primary state management hook for the Foresight Simulation module.
 *              Wraps useReducer with action creators for scenario CRUD and variable management.
 * @module app/simulations/_hooks
 */

'use client';

import { useReducer, useCallback } from 'react';
import type {
  SimulationState,
  SimulationAction,
  SimulationVariable,
  SimulationResults,
  SimulationProgress,
  ScenarioStatus,
  SimulationViewMode,
  LibraryTab,
  Scenario,
  ScenarioSummary,
  ScenarioTemplate,
} from '@/lib/simulation/simulation.types';
import { DEFAULT_SIMULATION_STATE } from '@/lib/simulation/simulation.constants';
import * as service from '@/lib/simulation/simulation.service';

function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_SCENARIOS':
      return { ...state, scenarios: action.payload };
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload };
    case 'SET_ACTIVE_SCENARIO':
      return { ...state, activeScenario: action.payload };
    case 'UPDATE_SCENARIO_NAME':
      return state.activeScenario
        ? { ...state, activeScenario: { ...state.activeScenario, name: action.payload } }
        : state;
    case 'UPDATE_SCENARIO_DESCRIPTION':
      return state.activeScenario
        ? { ...state, activeScenario: { ...state.activeScenario, description: action.payload } }
        : state;
    case 'ADD_VARIABLE':
      return state.activeScenario
        ? {
            ...state,
            activeScenario: {
              ...state.activeScenario,
              variables: [...state.activeScenario.variables, action.payload],
            },
          }
        : state;
    case 'UPDATE_VARIABLE':
      return state.activeScenario
        ? {
            ...state,
            activeScenario: {
              ...state.activeScenario,
              variables: state.activeScenario.variables.map((v) =>
                v.id === action.payload.id ? action.payload : v,
              ),
            },
          }
        : state;
    case 'REMOVE_VARIABLE':
      return state.activeScenario
        ? {
            ...state,
            activeScenario: {
              ...state.activeScenario,
              variables: state.activeScenario.variables.filter((v) => v.id !== action.payload),
            },
          }
        : state;
    case 'SET_SIMULATION_PROGRESS':
      return { ...state, simulationProgress: action.payload };
    case 'SET_SIMULATION_RESULTS':
      return state.activeScenario
        ? {
            ...state,
            activeScenario: { ...state.activeScenario, results: action.payload, status: 'completed' },
          }
        : state;
    case 'SET_SCENARIO_STATUS':
      return state.activeScenario
        ? { ...state, activeScenario: { ...state.activeScenario, status: action.payload } }
        : state;
    case 'SET_COMPARISON_IDS':
      return { ...state, comparisonScenarioIds: action.payload };
    case 'SET_COMPARISON_SCENARIOS':
      return { ...state, comparisonScenarios: action.payload };
    case 'SET_LIBRARY_TAB':
      return { ...state, libraryTab: action.payload };
    case 'SET_LIBRARY_SEARCH':
      return { ...state, librarySearch: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function useSimulation() {
  const [state, dispatch] = useReducer(simulationReducer, DEFAULT_SIMULATION_STATE);

  const loadScenarios = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const scenarios = await service.fetchScenarios();
      dispatch({ type: 'SET_SCENARIOS', payload: scenarios });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to load scenarios' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createNewScenario = useCallback(async (name: string, description: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const scenario = await service.createScenario(name, description);
      dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: scenario });
      dispatch({ type: 'SET_VIEW_MODE', payload: 'builder' });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to create scenario' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const selectScenario = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const scenario = await service.fetchScenarioDetail(id);
      dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: scenario });
      dispatch({ type: 'SET_VIEW_MODE', payload: scenario.results ? 'results' : 'builder' });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to load scenario' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addVariable = useCallback((variable: SimulationVariable) => {
    dispatch({ type: 'ADD_VARIABLE', payload: variable });
  }, []);

  const updateVariable = useCallback((variable: SimulationVariable) => {
    dispatch({ type: 'UPDATE_VARIABLE', payload: variable });
  }, []);

  const removeVariable = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_VARIABLE', payload: id });
  }, []);

  const saveScenario = useCallback(async () => {
    if (!state.activeScenario) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const updated = await service.updateScenario(state.activeScenario);
      dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: updated });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to save scenario' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.activeScenario]);

  const deleteScenarioById = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await service.deleteScenario(id);
      dispatch({ type: 'SET_SCENARIOS', payload: state.scenarios.filter((s) => s.id !== id) });
      if (state.activeScenario?.id === id) {
        dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: null });
        dispatch({ type: 'SET_VIEW_MODE', payload: 'library' });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to delete scenario' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.scenarios, state.activeScenario]);

  return {
    state,
    dispatch,
    loadScenarios,
    createNewScenario,
    selectScenario,
    addVariable,
    updateVariable,
    removeVariable,
    saveScenario,
    deleteScenarioById,
  };
}
