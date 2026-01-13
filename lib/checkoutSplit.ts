/**
 * Checkout Split System - 80/20 A/B Testing
 * 
 * 80% -> Hubla
 * 20% -> Checkout próprio
 * 
 * Persistência por 30 dias via localStorage/cookie
 */

export type CheckoutVariant = 'hubla' | 'proprio';
export type PlanType = 'annual' | 'monthly';

export const SPLIT_VERSION = '80_20_v1';
const STORAGE_KEY = 'dc_checkout_variant';
const EXPIRY_DAYS = 30;

interface StoredVariant {
  variant: CheckoutVariant;
  timestamp: number;
  splitVersion: string;
}

// URLs de checkout
const CHECKOUT_URLS = {
  hubla: {
    annual: 'https://pay.hub.la/9uz9SIpLP3pZ0f12ydsD',
    monthly: 'https://pay.hub.la/QnE0thkRCtKbXLmS5yPy',
  },
  proprio: {
    annual: 'https://checkout.dietacalculada.com?plan=annual',
    monthly: 'https://checkout.dietacalculada.com?plan=monthly',
  },
};

/**
 * Gera um hash simples do email para identificação consistente
 */
export function hashEmail(email: string): string {
  if (!email) return '';
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Verifica se a variante armazenada ainda é válida (30 dias)
 */
function isVariantValid(stored: StoredVariant): boolean {
  const now = Date.now();
  const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return (now - stored.timestamp) < expiryMs;
}

/**
 * Recupera a variante armazenada do localStorage
 */
function getStoredVariant(): StoredVariant | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed: StoredVariant = JSON.parse(stored);
    
    // Verificar se ainda é válida
    if (!isVariantValid(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Erro ao recuperar variante do localStorage:', error);
    return null;
  }
}

/**
 * Salva a variante no localStorage
 */
function saveVariant(variant: CheckoutVariant): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data: StoredVariant = {
      variant,
      timestamp: Date.now(),
      splitVersion: SPLIT_VERSION,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log(`💾 Variante "${variant}" salva no localStorage`);
  } catch (error) {
    console.error('Erro ao salvar variante no localStorage:', error);
  }
}

/**
 * Determina a variante de checkout para o usuário
 * 
 * Regras:
 * 1. Se já existe variante válida no storage, usa ela
 * 2. Se tem email, usa hash do email para determinar (consistência)
 * 3. Senão, sorteia 80/20 e salva
 */
export function getCheckoutVariant(email?: string): CheckoutVariant {
  // 1. Verificar se já existe variante armazenada
  const storedVariant = getStoredVariant();
  if (storedVariant) {
    console.log(`🔄 Usando variante existente: ${storedVariant.variant}`);
    return storedVariant.variant;
  }
  
  // 2. Se tem email, usar hash para consistência
  let variant: CheckoutVariant;
  
  if (email) {
    const hash = hashEmail(email);
    // Usar os últimos 2 caracteres do hash para determinar (0-255)
    const hashNum = parseInt(hash.slice(-2), 16) || 0;
    // 0-204 = hubla (80%), 205-255 = proprio (20%)
    variant = hashNum < 205 ? 'hubla' : 'proprio';
    console.log(`📧 Variante baseada em email hash (${hash}): ${variant}`);
  } else {
    // 3. Sortear 80/20
    const random = Math.random();
    variant = random < 0.8 ? 'hubla' : 'proprio';
    console.log(`🎲 Variante sorteada (random=${random.toFixed(3)}): ${variant}`);
  }
  
  // Salvar para futuras visitas
  saveVariant(variant);
  
  return variant;
}

/**
 * Monta a URL final de checkout com UTMs
 */
export function buildFinalCheckoutUrl(
  variant: CheckoutVariant,
  plan: PlanType,
  utmParams: Record<string, string>
): string {
  const baseUrl = CHECKOUT_URLS[variant][plan];
  
  // Construir query string com UTMs
  const params = new URLSearchParams();
  
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });
  
  const queryString = params.toString();
  
  if (!queryString) {
    return baseUrl;
  }
  
  // Verificar se URL já tem query params
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${queryString}`;
}

/**
 * Informações completas do checkout para salvar no Sheets
 */
export interface CheckoutInfo {
  checkout_variant: CheckoutVariant;
  checkout_plan: PlanType;
  checkout_url: string;
  split_version: string;
}

/**
 * Gera todas as informações de checkout de uma vez
 */
export function generateCheckoutInfo(
  plan: PlanType,
  utmParams: Record<string, string>,
  email?: string
): CheckoutInfo {
  const variant = getCheckoutVariant(email);
  const url = buildFinalCheckoutUrl(variant, plan, utmParams);
  
  return {
    checkout_variant: variant,
    checkout_plan: plan,
    checkout_url: url,
    split_version: SPLIT_VERSION,
  };
}
