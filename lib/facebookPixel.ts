/**
 * Helper para disparar eventos do Facebook Pixel
 */

declare global {
  interface Window {
    fbq: (
      action: 'track' | 'trackCustom',
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}

/**
 * Dispara um evento do Facebook Pixel (client-side)
 */
export function trackFacebookEvent(
  eventName: string,
  params?: Record<string, any>
): void {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
    console.log(`📊 Facebook Pixel - Evento: ${eventName}`, params);
  }
}

/**
 * Dispara um evento customizado do Facebook Pixel
 */
export function trackCustomFacebookEvent(
  eventName: string,
  params?: Record<string, any>
): void {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
    console.log(`📊 Facebook Pixel - Evento Custom: ${eventName}`, params);
  }
}

/**
 * Envia evento para Facebook Conversions API (server-side)
 */
export async function sendFacebookConversion(
  eventName: string,
  userData?: {
    email?: string;
    phone?: string;
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
  },
  customData?: {
    currency?: string;
    value?: number;
    content_name?: string;
    content_category?: string;
  },
  eventId?: string
): Promise<void> {
  try {
    const response = await fetch('/api/facebook-conversions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_name: eventName,
        user_data: userData,
        custom_data: customData,
        event_id: eventId,
        event_source_url: typeof window !== 'undefined' ? window.location.href : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Erro ao enviar conversão para Facebook:', error);
    } else {
      console.log('✅ Conversão enviada para Facebook Conversions API:', eventName);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar conversão para Facebook:', error);
  }
}

/**
 * Obtém o _fbp (Facebook Browser ID) do cookie
 */
export function getFacebookBrowserId(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '_fbp') {
      return value || null;
    }
  }
  return null;
}

/**
 * Obtém o _fbc (Facebook Click ID) do cookie ou query params
 */
export function getFacebookClickId(): string | null {
  if (typeof document === 'undefined') return null;
  
  // Tentar buscar do cookie
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '_fbc') {
      return value || null;
    }
  }
  
  // Tentar buscar da URL
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('fbclid') || null;
}
