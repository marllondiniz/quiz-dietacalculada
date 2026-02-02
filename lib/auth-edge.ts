/**
 * Helpers de auth compatíveis com Edge Runtime (middleware).
 * Usa Web Crypto API em vez de Node crypto.
 */

const SALT = 'dietacalculada-dashboard';

/** SHA-256 em hex (para uso no Edge) */
export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Retorna o token esperado para comparar com o cookie (Edge) */
export async function getExpectedTokenEdge(): Promise<string | null> {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return null;
  return sha256Hex(password + SALT);
}

export const AUTH_COOKIE_NAME = 'dashboard_auth';
