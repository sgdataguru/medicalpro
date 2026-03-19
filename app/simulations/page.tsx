'use client';

import { useEffect, useCallback, useState } from 'react';
import { useSimulation } from './_hooks/useSimulation';
import { useSimulationExecution } from './_hooks/useSimulationExecution';
import { useScenarioComparison } from './_hooks/useScenarioComparison';
import SimulationPageHeader from './_components/SimulationPageHeader';
import ScenarioLibrary from './_components/ScenarioLibrary';
import ScenarioBuilder from './_components/ScenarioBuilder';
import ScenarioActionBar from './_components/ScenarioActionBar';
import ImpactSummaryCards from './_components/ImpactSummaryCards';
import CascadeFlowDiagram from './_components/CascadeFlowDiagram';
import BeforeAfterComparisonTable from './_components/BeforeAfterComparisonTable';
import ConfidenceIntervalChart from './_components/ConfidenceIntervalChart';
import SimulationNarrativeSummary from './_components/SimulationNarrativeSummary';
import ResultsActionBar from './_components/ResultsActionBar';
import ScenarioComparisonView from './_components/ScenarioComparisonView';
import SimulationProgressOverlay from './_components/SimulationProgressOverlay';
import ShareScenarioDialog from './_components/ShareScenarioDialog';

export default function SimulationsPage() {
  const {
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
  } = useSimulation();

  const {
    comparisonScenarios,
    addScenario: addComparisonScenario,
    removeScenario: removeComparisonScenario,
    clearComparison,
    isComparing,
    setIsComparing,
  } = useScenarioComparison();

  const handleSimulationComplete = useCallback(
    (results: import('@/lib/simulation/simulation.types').SimulationResults) => {
      dispatch({ type: 'SET_SIMULATION_RESULTS', payload: results });
      dispatch({ type: 'SET_SIMULATION_PROGRESS', payload: null });
      dispatch({ type: 'SET_VIEW_MODE', payload: 'results' });
    },
    [dispatch],
  );

  const handleSimulationProgress = useCallback(
    (progress: import('@/lib/simulation/simulation.types').SimulationProgress) => {
      dispatch({ type: 'SET_SIMULATION_PROGRESS', payload: progress });
    },
    [dispatch],
  );

  const handleSimulationError = useCallback(
    (error: string) => {
      dispatch({ type: 'SET_ERROR', payload: error });
      dispatch({ type: 'SET_SIMULATION_PROGRESS', payload: null });
      dispatch({ type: 'SET_SCENARIO_STATUS', payload: 'failed' });
    },
    [dispatch],
  );

  const { run, cancel, isRunning } = useSimulationExecution({
    onProgress: handleSimulationProgress,
    onComplete: handleSimulationComplete,
    onError: handleSimulationError,
  });

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  const handleRunSimulation = useCallback(() => {
    if (!state.activeScenario) return;
    dispatch({ type: 'SET_SCENARIO_STATUS', payload: 'running' });
    run(state.activeScenario.id, state.activeScenario.variables);
  }, [state.activeScenario, dispatch, run]);

  const handleCancelSimulation = useCallback(() => {
    cancel();
    dispatch({ type: 'SET_SIMULATION_PROGRESS', payload: null });
    dispatch({ type: 'SET_SCENARIO_STATUS', payload: 'ready' });
  }, [cancel, dispatch]);

  const handleNewScenario = useCallback(() => {
    createNewScenario('Untitled Scenario', '');
  }, [createNewScenario]);

  const handleBackToLibrary = useCallback(() => {
    dispatch({ type: 'SET_VIEW_MODE', payload: 'library' });
    dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: null });
    loadScenarios();
  }, [dispatch, loadScenarios]);

  const handleBackToBuilder = useCallback(() => {
    dispatch({ type: 'SET_VIEW_MODE', payload: 'builder' });
  }, [dispatch]);

  const handleCompare = useCallback(async () => {
    if (state.activeScenario) {
      await addComparisonScenario(state.activeScenario.id);
    }
    setIsComparing(true);
    dispatch({ type: 'SET_VIEW_MODE', payload: 'comparison' });
  }, [state.activeScenario, addComparisonScenario, setIsComparing, dispatch]);

  // Share dialog state
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="min-h-screen space-y-6 p-6">
      <SimulationPageHeader
        viewMode={state.viewMode}
        scenarioName={state.activeScenario?.name}
        onNewScenario={handleNewScenario}
        onNavigate={(mode) => dispatch({ type: 'SET_VIEW_MODE', payload: mode })}
        onBackToLibrary={handleBackToLibrary}
      />

      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {state.error}
            <button
              onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Library View */}
      {state.viewMode === 'library' && (
        <ScenarioLibrary
          scenarios={state.scenarios}
          templates={state.templates}
          libraryTab={state.libraryTab}
          librarySearch={state.librarySearch}
          loading={state.loading}
          onTabChange={(tab) => dispatch({ type: 'SET_LIBRARY_TAB', payload: tab })}
          onSearchChange={(q) => dispatch({ type: 'SET_LIBRARY_SEARCH', payload: q })}
          onSelectScenario={selectScenario}
          onDeleteScenario={deleteScenarioById}
          onNewScenario={handleNewScenario}
        />
      )}

      {/* Builder View */}
      {state.viewMode === 'builder' && state.activeScenario && (
        <>
          <ScenarioBuilder
            scenario={state.activeScenario}
            onUpdateName={(name) => dispatch({ type: 'UPDATE_SCENARIO_NAME', payload: name })}
            onUpdateDescription={(desc) => dispatch({ type: 'UPDATE_SCENARIO_DESCRIPTION', payload: desc })}
            onAddVariable={addVariable}
            onUpdateVariable={updateVariable}
            onRemoveVariable={removeVariable}
          />
          <ScenarioActionBar
            variableCount={state.activeScenario.variables.length}
            onRunSimulation={handleRunSimulation}
            onSaveDraft={saveScenario}
            loading={state.loading}
          />
        </>
      )}

      {/* Results View */}
      {state.viewMode === 'results' && state.activeScenario?.results && (
        <div className="space-y-6">
          <ImpactSummaryCards impacts={state.activeScenario.results.moduleImpacts} />
          <CascadeFlowDiagram graph={state.activeScenario.results.cascadeGraph} />
          <BeforeAfterComparisonTable entries={state.activeScenario.results.beforeAfterComparison} />
          <ConfidenceIntervalChart intervals={state.activeScenario.results.confidenceIntervals} />
          <SimulationNarrativeSummary
            narrative={state.activeScenario.results.narrativeSummary}
            riskAssessment={state.activeScenario.results.riskAssessment}
          />
          <ResultsActionBar
            onCompare={handleCompare}
            onShare={() => setShareOpen(true)}
            onBackToBuilder={handleBackToBuilder}
            onSaveResults={saveScenario}
          />
        </div>
      )}

      {/* Comparison View */}
      {state.viewMode === 'comparison' && (
        <ScenarioComparisonView
          scenarios={comparisonScenarios}
          allScenarios={state.scenarios}
          onAddScenario={addComparisonScenario}
          onRemoveScenario={removeComparisonScenario}
          onClear={clearComparison}
          onBack={handleBackToLibrary}
        />
      )}

      {/* Progress Overlay */}
      {state.simulationProgress && isRunning && (
        <SimulationProgressOverlay
          progress={state.simulationProgress}
          onCancel={handleCancelSimulation}
        />
      )}

      {/* Share Dialog */}
      {shareOpen && state.activeScenario && (
        <ShareScenarioDialog
          scenarioId={state.activeScenario.id}
          scenarioName={state.activeScenario.name}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
