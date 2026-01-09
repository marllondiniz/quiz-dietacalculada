'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';

// Chave para armazenar UTMs no sessionStorage
const UTM_STORAGE_KEY = 'quiz_utm_tracking';

export default function TrackingCapture() {
  const searchParams = useSearchParams();
  const { updateAnswer } = useQuizStore();

  useEffect(() => {
    // Capturar UTMs da URL
    const utm_source = searchParams.get('utm_source');
    const utm_medium = searchParams.get('utm_medium');
    const utm_campaign = searchParams.get('utm_campaign');
    const utm_term = searchParams.get('utm_term');
    const utm_content = searchParams.get('utm_content');
    
    // Capturar outras informações de tracking
    const referrer = document.referrer || 'Direto';
    const landingPage = window.location.href;
    const userAgent = navigator.userAgent;
    
    // Se houver UTMs na URL, salvar no sessionStorage e no store
    if (utm_source || utm_medium || utm_campaign || utm_term || utm_content) {
      const trackingData = {
        utm_source: utm_source || undefined,
        utm_medium: utm_medium || undefined,
        utm_campaign: utm_campaign || undefined,
        utm_term: utm_term || undefined,
        utm_content: utm_content || undefined,
        referrer,
        landingPage,
        userAgent,
        timestamp: new Date().toISOString(),
      };
      
      // Salvar no sessionStorage para persistir durante toda a sessão
      try {
        sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(trackingData));
        console.log('💾 UTMs salvas no sessionStorage:', trackingData);
      } catch (error) {
        console.error('❌ Erro ao salvar UTMs no sessionStorage:', error);
      }
      
      // Salvar no store
      if (utm_source) updateAnswer('utm_source', utm_source);
      if (utm_medium) updateAnswer('utm_medium', utm_medium);
      if (utm_campaign) updateAnswer('utm_campaign', utm_campaign);
      if (utm_term) updateAnswer('utm_term', utm_term);
      if (utm_content) updateAnswer('utm_content', utm_content);
      updateAnswer('referrer', referrer);
      updateAnswer('landingPage', landingPage);
      updateAnswer('userAgent', userAgent);
      
      console.log('📊 Tracking capturado da URL:', {
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        referrer,
        landingPage,
      });
    } else {
      // Se não houver UTMs na URL, tentar recuperar do sessionStorage
      try {
        const savedTracking = sessionStorage.getItem(UTM_STORAGE_KEY);
        if (savedTracking) {
          const trackingData = JSON.parse(savedTracking);
          console.log('♻️ UTMs recuperadas do sessionStorage:', trackingData);
          
          // Restaurar no store
          if (trackingData.utm_source) updateAnswer('utm_source', trackingData.utm_source);
          if (trackingData.utm_medium) updateAnswer('utm_medium', trackingData.utm_medium);
          if (trackingData.utm_campaign) updateAnswer('utm_campaign', trackingData.utm_campaign);
          if (trackingData.utm_term) updateAnswer('utm_term', trackingData.utm_term);
          if (trackingData.utm_content) updateAnswer('utm_content', trackingData.utm_content);
          if (trackingData.referrer) updateAnswer('referrer', trackingData.referrer);
          if (trackingData.landingPage) updateAnswer('landingPage', trackingData.landingPage);
          if (trackingData.userAgent) updateAnswer('userAgent', trackingData.userAgent);
        }
      } catch (error) {
        console.error('❌ Erro ao recuperar UTMs do sessionStorage:', error);
      }
    }
  }, [searchParams, updateAnswer]);

  return null;
}

// Função auxiliar para recuperar UTMs salvas (pode ser usada em outros componentes)
export function getSavedUTMs() {
  try {
    const savedTracking = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (savedTracking) {
      return JSON.parse(savedTracking);
    }
  } catch (error) {
    console.error('❌ Erro ao recuperar UTMs:', error);
  }
  return null;
}

// Função auxiliar para construir URL com UTMs salvas
export function appendSavedUTMs(baseUrl: string): string {
  const savedUTMs = getSavedUTMs();
  if (!savedUTMs) return baseUrl;
  
  const utmParams = new URLSearchParams();
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  
  utmKeys.forEach(key => {
    if (savedUTMs[key]) {
      utmParams.append(key, savedUTMs[key]);
    }
  });
  
  const utmString = utmParams.toString();
  if (utmString) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${utmString}`;
  }
  
  return baseUrl;
}

