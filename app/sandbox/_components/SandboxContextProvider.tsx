'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useParams } from 'next/navigation';
import { useSandboxSession } from '../_hooks/useSandboxSession';
import { useSandboxTimer } from '../_hooks/useSandboxTimer';
import type {
  SandboxSessionState,
  SandboxAction,
  WarningLevel,
} from '@/lib/sandbox/sandbox.types';

// ===== Context Value Shape =====

interface SandboxContextValue {
  /** Full session state from the reducer */
  session: SandboxSessionState;
  /** Dispatch for direct reducer actions */
  dispatch: React.Dispatch<SandboxAction>;

  /** Session lifecycle helpers */
  createSession: (accessCode?: string) => Promise<string | null>;
  loadSession: (sessionId: string) => Promise<void>;
  extend: () => Promise<boolean>;
  terminate: () => void;
  isActive: boolean;
  isExpired: boolean;

  /** Timer state */
  timeRemaining: number;
  formattedTime: string;
  warningLevel: WarningLevel;
  timerExpired: boolean;
}

const SandboxContext = createContext<SandboxContextValue | null>(null);

// ===== Hook =====

export function useSandboxContext(): SandboxContextValue {
  const ctx = useContext(SandboxContext);
  if (!ctx) {
    throw new Error(
      'useSandboxContext must be used within a <SandboxContextProvider>',
    );
  }
  return ctx;
}

// ===== Provider =====

interface SandboxContextProviderProps {
  children: ReactNode;
}

export default function SandboxContextProvider({
  children,
}: SandboxContextProviderProps) {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const {
    session,
    dispatch,
    createSession,
    loadSession,
    extend,
    terminate,
    isActive,
    isExpired,
  } = useSandboxSession();

  // ---- Timer wired to session expiry ----

  const handleTimerExpired = useCallback(() => {
    terminate();
  }, [terminate]);

  const handleWarningChange = useCallback(
    (level: WarningLevel) => {
      if (level === 'critical' || level === 'medium') {
        dispatch({ type: 'SET_STATUS', payload: 'expiring_soon' });
      }
    },
    [dispatch],
  );

  const {
    timeRemaining,
    formattedTime,
    warningLevel,
    isExpired: timerExpired,
  } = useSandboxTimer({
    expiresAt: session.expiresAt,
    onExpired: handleTimerExpired,
    onWarningChange: handleWarningChange,
  });

  // ---- Auto-load session on mount ----

  useEffect(() => {
    if (sessionId && !session.sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, session.sessionId, loadSession]);

  // ---- Assemble context value ----

  const value: SandboxContextValue = {
    session,
    dispatch,
    createSession,
    loadSession,
    extend,
    terminate,
    isActive,
    isExpired,
    timeRemaining,
    formattedTime,
    warningLevel,
    timerExpired,
  };

  return (
    <SandboxContext.Provider value={value}>{children}</SandboxContext.Provider>
  );
}
