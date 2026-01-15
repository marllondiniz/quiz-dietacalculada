'use client';

import { useEffect, useRef } from 'react';
import { useQuizStore } from '@/store/quizStore';
import { generateLeadId } from '@/lib/utils';
import { saveQuizProgress } from '@/lib/quizProgress';

/**
 * Hook para gerenciar salvamento progressivo do quiz
 * Com debounce para evitar exceder quota do Google Sheets
 */
export function useQuizProgress() {
  const { leadId, setLeadId, answers, currentStep } = useQuizStore();
  const hasInitialized = useRef(false);
  const lastSavedStep = useRef<number>(-1);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Inicializar leadId quando o hook é montado
  useEffect(() => {
    if (!leadId && !hasInitialized.current) {
      const newLeadId = generateLeadId();
      setLeadId(newLeadId);
      hasInitialized.current = true;
      console.log('🆔 Lead ID gerado:', newLeadId);
    }
  }, [leadId, setLeadId]);

  // Salvar progresso com debounce quando step muda
  useEffect(() => {
    if (!leadId) {
      console.log('⏳ Aguardando leadId...');
      return;
    }

    // Só salvar se o step mudou
    if (currentStep === lastSavedStep.current) {
      return;
    }

    // Limpar timeout anterior se existir
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Se já está salvando, não fazer nada
    if (isSavingRef.current) {
      console.log('⏳ Salvamento em andamento, aguardando...');
      return;
    }

    // Aguardar 500ms antes de salvar (debounce)
    saveTimeoutRef.current = setTimeout(async () => {
      isSavingRef.current = true;

      // Preparar dados de tracking
      const trackingData = {
        utm_source: answers.utm_source,
        utm_medium: answers.utm_medium,
        utm_campaign: answers.utm_campaign,
        utm_term: answers.utm_term,
        utm_content: answers.utm_content,
        referrer: answers.referrer,
        landingPage: answers.landingPage,
        userAgent: answers.userAgent,
      };

      console.log('💾 Salvando progresso:', { 
        leadId, 
        step: currentStep, 
        answersCount: Object.keys(answers).length 
      });
      
      try {
        const result = await saveQuizProgress(leadId, answers, currentStep, trackingData);
        
        if (result.success) {
          lastSavedStep.current = currentStep;
          console.log('✅ Progresso salvo com sucesso');
        } else {
          console.error('❌ Falha ao salvar progresso:', result);
        }
      } catch (error) {
        console.error('❌ Erro ao salvar progresso:', error);
      } finally {
        isSavingRef.current = false;
      }
    }, 500); // Debounce de 500ms

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [leadId, answers, currentStep]);

  return { leadId };
}
