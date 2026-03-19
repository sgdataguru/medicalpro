'use client';

import { useReducer, useCallback } from 'react';
import type { SandboxSessionState, SandboxAction } from '@/lib/sandbox/sandbox.types';
import { DEFAULT_SESSION_STATE } from '@/lib/sandbox/sandbox.constants';
import * as service from '@/lib/sandbox/sandbox.service';

function sessionReducer(
  state: SandboxSessionState,
  action: SandboxAction,
): SandboxSessionState {
  switch (action.type) {
    case 'SET_SESSION':
      return action.payload;
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_TIME_REMAINING':
      return { ...state, timeRemainingMs: action.payload };
    case 'SET_EXPIRES_AT':
      return { ...state, expiresAt: action.payload };
    case 'INCREMENT_EXTENSIONS':
      return { ...state, extensionsUsed: state.extensionsUsed + 1 };
    case 'SET_FEATURE_STATUS':
      return {
        ...state,
        features: {
          ...state.features,
          [action.payload.feature]: action.payload.status,
        },
      };
    case 'INCREMENT_SIMULATIONS':
      return { ...state, simulationsRun: state.simulationsRun + 1 };
    case 'SET_TOUR_COMPLETED':
      return { ...state, tourCompleted: action.payload };
    case 'SET_TOUR_STEP':
      return { ...state, tourStep: action.payload };
    case 'RESET_SESSION':
      return action.payload;
    default:
      return state;
  }
}

export function useSandboxSession() {
  const [session, dispatch] = useReducer(sessionReducer, DEFAULT_SESSION_STATE);

  const createSession = useCallback(async (accessCode?: string) => {
    dispatch({ type: 'SET_STATUS', payload: 'provisioning' });
    try {
      const result = await service.createSandboxSession(accessCode);
      const now = new Date().toISOString();
      dispatch({
        type: 'SET_SESSION',
        payload: {
          ...DEFAULT_SESSION_STATE,
          sessionId: result.sessionId,
          status: 'active',
          createdAt: now,
          expiresAt: result.expiresAt,
          timeRemainingMs: result.config.sessionTtlMs,
          maxExtensions: result.config.maxExtensions,
          maxSimulations: result.config.maxSimulationsPerSession,
        },
      });
      return result.sessionId;
    } catch {
      dispatch({ type: 'SET_STATUS', payload: 'error' });
      return null;
    }
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const sessionData = await service.getSandboxSession(sessionId);
      dispatch({ type: 'SET_SESSION', payload: sessionData });
    } catch {
      dispatch({ type: 'SET_STATUS', payload: 'error' });
    }
  }, []);

  const extend = useCallback(async () => {
    if (session.extensionsUsed >= session.maxExtensions) return false;
    try {
      const result = await service.extendSession(session.sessionId);
      dispatch({ type: 'SET_EXPIRES_AT', payload: result.newExpiresAt });
      dispatch({ type: 'INCREMENT_EXTENSIONS' });
      dispatch({ type: 'SET_STATUS', payload: 'active' });
      return true;
    } catch {
      return false;
    }
  }, [session.sessionId, session.extensionsUsed, session.maxExtensions]);

  const terminate = useCallback(() => {
    dispatch({ type: 'SET_STATUS', payload: 'expired' });
  }, []);

  const isActive = session.status === 'active' || session.status === 'expiring_soon';
  const isExpired = session.status === 'expired';

  return {
    session,
    dispatch,
    createSession,
    loadSession,
    extend,
    terminate,
    isActive,
    isExpired,
  };
}
