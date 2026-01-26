/**
 * Cakto API Integration
 * 
 * Autenticação OAuth2 e funções auxiliares para integração com Cakto
 */

export interface CaktoTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface CaktoAccessToken {
  token: string;
  expiresAt: number; // timestamp em ms
}

/**
 * Obtém um access token do Cakto usando OAuth2
 */
export async function getCaktoAccessToken(): Promise<CaktoAccessToken> {
  const clientId = process.env.CAKTO_CLIENT_ID;
  const clientSecret = process.env.CAKTO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('CAKTO_CLIENT_ID e CAKTO_CLIENT_SECRET devem estar configurados');
  }

  try {
    const response = await fetch('https://api.cakto.com.br/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Erro ao obter token Cakto: ${response.status}`);
    }

    const data: CaktoTokenResponse = await response.json();
    
    const expiresAt = Date.now() + (data.expires_in - 300) * 1000;

    return {
      token: data.access_token,
      expiresAt,
    };
  } catch (error: any) {
    throw error;
  }
}

// Cache do token em memória (válido apenas durante a execução da função)
let cachedToken: CaktoAccessToken | null = null;

/**
 * Obtém um access token válido (usa cache se ainda válido)
 */
export async function getValidCaktoToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  cachedToken = await getCaktoAccessToken();
  return cachedToken.token;
}

/**
 * Faz uma requisição autenticada para a API do Cakto
 */
export async function caktoApiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getValidCaktoToken();
  const baseUrl = 'https://api.cakto.com.br';

  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Erro na API Cakto: ${response.status}`);
  }

  return response.json();
}

/**
 * Exemplo: Buscar informações de um produto no Cakto
 */
export async function getCaktoProduct(productId: string) {
  return caktoApiRequest(`/api/v1/products/${productId}`);
}

/**
 * Exemplo: Buscar informações de uma transação no Cakto
 */
export async function getCaktoTransaction(transactionId: string) {
  return caktoApiRequest(`/api/v1/transactions/${transactionId}`);
}
