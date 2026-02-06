'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQuizStore } from '@/store/quizStore';
import { generateLeadId } from '@/lib/utils';
import { saveQuizProgress } from '@/lib/quizProgress';

const DEBOUNCE_MS = 500;

/**
 * Hook para gerenciar salvamento progressivo do quiz.
 *
 * Estratégia:
 *  - Um único efeito debounced escuta TANTO `answers` QUANTO `currentStep`.
 *  - No momento de salvar, lê o estado MAIS RECENTE do Zustand (getState()),
 *    garantindo que nenhuma resposta se perca.
 *  - Se um save estiver em andamento e o usuário fizer nova alteração,
 *    uma flag `pendingSave` agenda um retry automático após o save atual.
 */
export function useQuizProgress() {
  const { leadId, setLeadId, answers, currentStep } = useQuizStore();
  const hasInitialized = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(false);

  // ── Gerar leadId na primeira montagem ──
  useEffect(() => {
    if (!leadId && !hasInitialized.current) {
      const newLeadId = generateLeadId();
      setLeadId(newLeadId);
      hasInitialized.current = true;
      console.log('🆔 Lead ID gerado:', newLeadId);
    }
  }, [leadId, setLeadId]);

  // ── Função de salvamento (sempre lê o estado mais recente) ──
  const performSave = useCallback(async () => {
    const {
      leadId: lid,
      answers: latestAnswers,
      currentStep: latestStep,
    } = useQuizStore.getState();

    if (!lid) return;

    // Se já está salvando, marcar para tentar novamente depois
    if (isSavingRef.current) {
      pendingSaveRef.current = true;
      return;
    }

    isSavingRef.current = true;
    pendingSaveRef.current = false;

    const trackingData = {
      utm_source: latestAnswers.utm_source,
      utm_medium: latestAnswers.utm_medium,
      utm_campaign: latestAnswers.utm_campaign,
      utm_term: latestAnswers.utm_term,
      utm_content: latestAnswers.utm_content,
      referrer: latestAnswers.referrer,
      landingPage: latestAnswers.landingPage,
      userAgent: latestAnswers.userAgent,
    };

    console.log('💾 Salvando progresso:', {
      step: latestStep,
      answersCount: Object.keys(latestAnswers).length,
    });

    try {
      const result = await saveQuizProgress(
        lid,
        latestAnswers,
        latestStep,
        trackingData
      );
      if (result.success) {
        console.log('✅ Progresso salvo no step', latestStep);
      } else {
        console.error('❌ Falha ao salvar progresso:', result);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar progresso:', error);
    } finally {
      isSavingRef.current = false;

      // Se houve mudança enquanto salvava, salvar novamente com dados atualizados
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        console.log('🔄 Retry: houve mudança durante o save anterior');
        performSave();
      }
    }
  }, []);

  // ── Efeito único: dispara save debounced quando step OU answers mudam ──
  useEffect(() => {
    if (!leadId) return;

    // Cancelar debounce anterior (só o mais recente executa)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSave();
      debounceRef.current = null;
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [leadId, currentStep, answers, performSave]);

  return { leadId };
}
