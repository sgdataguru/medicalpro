/**
 * @file sandbox.utils.ts
 * @description Utility functions for the Sandbox Demo module
 * @module lib/sandbox
 */

import type { SandboxFeatureUsage, WarningLevel } from './sandbox.types';

/**
 * Format milliseconds to HH:MM:SS countdown display
 */
export function formatCountdownTime(ms: number): string {
  if (ms <= 0) return '0:00:00';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Calculate exploration progress as a percentage
 */
export function calculateExplorationProgress(features: SandboxFeatureUsage): number {
  const values = Object.values(features);
  const explored = values.filter((status) => status !== 'not_visited').length;
  return Math.round((explored / values.length) * 100);
}

/**
 * Count explored features
 */
export function countExploredFeatures(features: SandboxFeatureUsage): number {
  return Object.values(features).filter((status) => status !== 'not_visited').length;
}

/**
 * Total feature count
 */
export function totalFeatureCount(features: SandboxFeatureUsage): number {
  return Object.values(features).length;
}

/**
 * Generate a random session ID
 */
export function generateSessionId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Determine warning level based on remaining milliseconds
 */
export function getWarningLevel(ms: number): WarningLevel {
  if (ms <= 0) return 'critical';
  if (ms <= 5 * 60 * 1000) return 'critical';       // <5 min
  if (ms <= 15 * 60 * 1000) return 'medium';         // <15 min
  if (ms <= 30 * 60 * 1000) return 'low';            // <30 min
  return 'none';
}

/**
 * Check if a session is expired based on expiresAt timestamp
 */
export function isSessionExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}

/**
 * Validate an access code format (8-char alphanumeric)
 */
export function isValidAccessCodeFormat(code: string): boolean {
  return /^[A-Za-z0-9]{8}$/.test(code);
}
