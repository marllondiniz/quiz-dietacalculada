/**
 * Autenticação simples: um único login (senha) para o dashboard.
 * Use a variável de ambiente DASHBOARD_PASSWORD.
 */

import { createHash } from 'crypto';

const COOKIE_NAME = 'dashboard_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias
const SALT = 'dietacalculada-dashboard';

/** Gera o token que será armazenado no cookie (hash da senha + salt) */
export function getAuthToken(password: string): string {
  return createHash('sha256').update(password + SALT).digest('hex');
}

/** Verifica se a senha está correta */
export function checkPassword(password: string): boolean {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) return false;
  return password === expected;
}

export function getCookieName(): string {
  return COOKIE_NAME;
}

export function getCookieMaxAge(): number {
  return COOKIE_MAX_AGE;
}

/** Gera o token esperado (para comparação no middleware - server-side) */
export function getExpectedToken(): string | null {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return null;
  return getAuthToken(password);
}
