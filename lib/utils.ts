/**
 * Gera um UUID único simples
 */
export function generateLeadId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback para navegadores mais antigos
  return 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Adiciona parâmetros de busca a uma URL
 */
export function appendSearchParams(baseUrl: string, params: Record<string, string>): string {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
}
