/**
 * @file sandbox.service.ts
 * @description Mock service layer for the Sandbox Demo module
 * @module lib/sandbox
 */

import type {
  SandboxSessionState,
  SandboxConfig,
  CreateSandboxResponse,
  ValidateAccessCodeResponse,
  DemoRequest,
  DemoRequestResponse,
  AnalyticsEvent,
} from './sandbox.types';
import { DEFAULT_SANDBOX_CONFIG, DEFAULT_FEATURE_USAGE } from './sandbox.constants';
import { generateSessionId, isValidAccessCodeFormat } from './sandbox.utils';

async function delay(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

/**
 * Create a new sandbox session
 */
export async function createSandboxSession(
  accessCode?: string,
): Promise<CreateSandboxResponse> {
  await delay(600);

  const sessionId = generateSessionId();
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + DEFAULT_SANDBOX_CONFIG.sessionTtlMs,
  ).toISOString();

  return {
    success: true,
    sessionId,
    expiresAt,
    config: DEFAULT_SANDBOX_CONFIG,
  };
}

/**
 * Get sandbox session status
 */
export async function getSandboxSession(
  sessionId: string,
): Promise<SandboxSessionState> {
  await delay(300);

  const now = new Date();
  const createdAt = new Date(
    now.getTime() - 10 * 60 * 1000,
  ).toISOString();
  const expiresAt = new Date(
    now.getTime() + DEFAULT_SANDBOX_CONFIG.sessionTtlMs,
  ).toISOString();

  return {
    sessionId,
    status: 'active',
    createdAt,
    expiresAt,
    timeRemainingMs: DEFAULT_SANDBOX_CONFIG.sessionTtlMs,
    extensionsUsed: 0,
    maxExtensions: DEFAULT_SANDBOX_CONFIG.maxExtensions,
    features: { ...DEFAULT_FEATURE_USAGE },
    simulationsRun: 0,
    maxSimulations: DEFAULT_SANDBOX_CONFIG.maxSimulationsPerSession,
    tourCompleted: false,
    tourStep: 0,
  };
}

/**
 * Reset sandbox data to initial state
 */
export async function resetSandbox(
  sessionId: string,
): Promise<{ success: boolean; resetAt: string; message: string }> {
  await delay(1200);

  return {
    success: true,
    resetAt: new Date().toISOString(),
    message: 'Sandbox data has been reset to initial state.',
  };
}

/**
 * Extend sandbox session TTL
 */
export async function extendSession(
  sessionId: string,
  durationMs?: number,
): Promise<{
  success: boolean;
  newExpiresAt: string;
  extensionsRemaining: number;
}> {
  await delay(400);

  const extension = durationMs ?? DEFAULT_SANDBOX_CONFIG.extensionDurationMs;
  const newExpiresAt = new Date(Date.now() + extension).toISOString();

  return {
    success: true,
    newExpiresAt,
    extensionsRemaining: 0,
  };
}

/**
 * Validate an access code
 */
export async function validateAccessCode(
  code: string,
): Promise<ValidateAccessCodeResponse> {
  await delay(500);

  if (!isValidAccessCodeFormat(code)) {
    return {
      valid: false,
      error: 'Invalid access code format. Must be 8 alphanumeric characters.',
    };
  }

  // Mock: accept codes starting with "DEMO"
  if (code.toUpperCase().startsWith('DEMO')) {
    const sessionId = generateSessionId();
    return {
      valid: true,
      sessionId,
      clientName: 'Demo Client',
    };
  }

  return {
    valid: false,
    error: 'Access code not found or has expired.',
  };
}

/**
 * Submit a demo request
 */
export async function submitDemoRequest(
  request: DemoRequest,
): Promise<DemoRequestResponse> {
  await delay(800);

  const referenceId = `DR-${Date.now().toString(36).toUpperCase()}`;

  return {
    success: true,
    message:
      'Thank you for your interest! Our sales team will contact you within 24 hours.',
    referenceId,
  };
}

/**
 * Track a sandbox analytics event
 */
export async function trackAnalyticsEvent(
  sessionId: string,
  event: AnalyticsEvent,
): Promise<{ success: boolean }> {
  // Fire-and-forget in MVP — no actual backend
  await delay(100);
  return { success: true };
}

/**
 * Simulate sandbox provisioning with progress stages
 */
export async function provisionSandbox(
  onProgress: (stage: string, percent: number) => void,
): Promise<{ sessionId: string; expiresAt: string; config: SandboxConfig }> {
  const sessionId = generateSessionId();

  onProgress('initializing', 10);
  await delay(800);

  onProgress('seeding_data', 40);
  await delay(1200);

  onProgress('configuring', 75);
  await delay(800);

  onProgress('ready', 100);
  await delay(400);

  const expiresAt = new Date(
    Date.now() + DEFAULT_SANDBOX_CONFIG.sessionTtlMs,
  ).toISOString();

  return {
    sessionId,
    expiresAt,
    config: DEFAULT_SANDBOX_CONFIG,
  };
}
