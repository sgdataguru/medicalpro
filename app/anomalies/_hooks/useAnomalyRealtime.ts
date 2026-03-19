'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AnomalyAlert, AnomalyStats, AnomalySeverity, HospitalModule } from '@/lib/anomaly/anomaly.types';
import { SSE_RECONNECT_INTERVAL } from '@/lib/anomaly/anomaly.constants';

interface AnomalyStreamEvent {
  type: 'anomaly_created' | 'anomaly_updated' | 'anomaly_resolved' | 'stats_updated' | 'heartbeat';
  data: unknown;
}

interface UseAnomalyRealtimeOptions {
  onNewAnomaly?: (alert: AnomalyAlert) => void;
  onAnomalyUpdated?: (update: Partial<AnomalyAlert> & { id: string }) => void;
  onStatsUpdated?: (stats: AnomalyStats) => void;
  enabled?: boolean;
}

const MOCK_TITLES = [
  'Unexpected lab result variance in Hematology',
  'Medication dispensing delay in Pharmacy',
  'Patient fall risk score elevated in Ward 3B',
  'Equipment calibration overdue in Radiology',
  'Blood bank stock below threshold',
  'Staff overtime threshold exceeded in OR',
  'Discharge processing delay in Med-Surg',
];

const MOCK_SEVERITIES: AnomalySeverity[] = ['critical', 'warning', 'informational'];
const MOCK_MODULES: HospitalModule[] = ['staffing', 'bed-allocation', 'supply-chain', 'finance'];

let mockCounter = 100;

function generateMockAnomaly(): AnomalyAlert {
  mockCounter++;
  const severity = MOCK_SEVERITIES[Math.floor(Math.random() * MOCK_SEVERITIES.length)];
  const module = MOCK_MODULES[Math.floor(Math.random() * MOCK_MODULES.length)];
  const title = MOCK_TITLES[Math.floor(Math.random() * MOCK_TITLES.length)];

  return {
    id: `ANM-RT-${mockCounter}`,
    title,
    description: `Auto-detected anomaly: ${title}. This was flagged by the real-time monitoring system.`,
    severity,
    status: 'active',
    module,
    detectedAt: new Date().toISOString(),
    acknowledgedAt: null,
    resolvedAt: null,
    triggeredBy: [
      {
        field: 'metric.value',
        operator: 'deviation',
        expectedValue: 100,
        actualValue: 100 + Math.floor(Math.random() * 50),
        dataSource: `${module}.monitoring`,
        recordId: `RT-${mockCounter}`,
      },
    ],
    affectedModules: [module],
    context: {
      summary: `Real-time anomaly detected in ${module} module. Immediate review recommended.`,
      rootCauseHypothesis: 'Automated detection — root cause analysis pending investigation.',
      recommendedActions: ['Review the flagged metric', 'Investigate underlying data source', 'Acknowledge or dismiss if expected'],
      relatedAnomalyIds: [],
      impactAssessment: { affectedPatients: 0, financialImpact: null, operationalRisk: severity === 'critical' ? 'high' : 'medium' },
    },
    assignedTo: null,
    auditTrail: [
      {
        id: `AUD-RT-${mockCounter}`,
        anomalyId: `ANM-RT-${mockCounter}`,
        action: 'created',
        actorId: 'SYSTEM',
        actorName: 'Real-time Monitor',
        timestamp: new Date().toISOString(),
        metadata: { source: 'sse_mock' },
      },
    ],
  };
}

export function useAnomalyRealtime({
  onNewAnomaly,
  onAnomalyUpdated,
  onStatsUpdated,
  enabled = false,
}: UseAnomalyRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<AnomalyStreamEvent | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbacksRef = useRef({ onNewAnomaly, onAnomalyUpdated, onStatsUpdated });

  // Keep callbacks ref up-to-date without causing reconnects
  callbacksRef.current = { onNewAnomaly, onAnomalyUpdated, onStatsUpdated };

  const connect = useCallback(() => {
    setIsConnected(true);

    // Start mock event generation every ~15s
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const alert = generateMockAnomaly();
      setLastEvent({ type: 'anomaly_created', data: alert });
      callbacksRef.current.onNewAnomaly?.(alert);
    }, 15000);
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectTimerRef.current = setTimeout(() => {
      connect();
    }, SSE_RECONNECT_INTERVAL);
  }, [connect, disconnect]);

  useEffect(() => {
    if (enabled) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return { isConnected, lastEvent, reconnect };
}
