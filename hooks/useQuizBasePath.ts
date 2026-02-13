'use client';

import { usePathname } from 'next/navigation';

/**
 * Retorna o base path do quiz a partir da URL atual.
 * /v2/* -> '/v2' (oferta R$ 197)
 * /quiz/* -> '/quiz'
 */
export function useQuizBasePath(): string {
  const pathname = usePathname();
  return pathname?.startsWith('/v2') ? '/v2' : '/quiz';
}
