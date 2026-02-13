'use client';

import { useState, useMemo } from 'react';
import { useQuizStore, type QuizAnswers } from '@/store/quizStore';
import { useSearchParams, usePathname } from 'next/navigation';

/** Oferta v2: R$ 197 à vista ou 12x R$ 20,38 — link Hubla específico */
const CHECKOUT_V2_URL = 'https://pay.hub.la/auru2M9e7OlmQlNZYuxJ';
const FALLBACK_V1_URL = 'https://pay.hub.la/LG07vLA6urwSwXjGiTm3';

export default function ThankYouStep() {
  const pathname = usePathname();
  const isV2 = pathname?.startsWith('/v2');
  const { answers, leadId } = useQuizStore();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const searchParams = useSearchParams();

  // Captura UTMs de múltiplas fontes
  const utmParams = useMemo(() => {
    const params: Record<string, string> = {};
    const utmKeys: Array<keyof QuizAnswers> = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    
    utmKeys.forEach(key => {
      // 1. Prioridade: buscar do store
      let value: string | undefined = answers[key] as string | undefined;
      
      // 2. Se não estiver no store, tentar buscar da URL atual
      if (!value) {
        const urlValue = searchParams.get(key.replace('_', '')) || searchParams.get(key);
        value = urlValue || undefined;
      }
      
      // 3. Se ainda não tiver, tentar recuperar do sessionStorage (apenas no browser)
      if (!value && typeof window !== 'undefined') {
        try {
          const savedTracking = sessionStorage.getItem('quiz_utm_tracking');
          if (savedTracking) {
            const trackingData = JSON.parse(savedTracking);
            value = trackingData[key] || undefined;
          }
        } catch (error) {
          console.error('Erro ao recuperar UTM do sessionStorage:', error);
        }
      }
      
      if (value) {
        params[key] = value;
      }
    });

    return params;
  }, [answers, searchParams]);

  // Função que chama a API de checkout split e redireciona (apenas plano anual)
  const handleCheckout = async () => {
    if (isRedirecting) return;
    
    setIsRedirecting(true);
    
    try {
      console.log('📤 Enviando dados para API de checkout split...');
      
      // Preparar dados do quiz para envio
      const quizData = {
        ...answers,
        leadId: leadId || undefined,
        birthDate: answers.birthDate 
          ? (answers.birthDate instanceof Date 
              ? answers.birthDate.toISOString() 
              : answers.birthDate)
          : undefined,
      };

      // Chamar API de checkout split (decisão no servidor)
      const response = await fetch('/api/checkout-split', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'annual',
          utmParams,
          quizData,
          quizVersion: isV2 ? 'v2' : undefined,
        }),
      });

      const result = await response.json();

      if (result.success && result.checkout_url) {
        console.log('✅ Checkout processado:', {
          variant: result.checkout_variant,
          plan: result.checkout_plan,
          checkoutVersion: result.checkout_version,
        });
        
        // Redirecionar para o checkout
        console.log('🚀 Redirecionando para:', result.checkout_url);
        window.location.href = result.checkout_url;
      } else {
        console.error('❌ Erro na API de checkout split:', result);
        const fallbackUrl = isV2 ? CHECKOUT_V2_URL : FALLBACK_V1_URL;
        console.log('🔄 Usando fallback Hubla:', fallbackUrl);
        window.location.href = fallbackUrl;
      }
    } catch (error) {
      console.error('❌ Erro ao processar checkout:', error);
      const fallbackUrl = isV2 ? CHECKOUT_V2_URL : FALLBACK_V1_URL;
      console.log('🔄 Usando fallback Hubla:', fallbackUrl);
      window.location.href = fallbackUrl;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Conteúdo com scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 md:px-6 py-4 md:py-8">
          <div className="max-w-md mx-auto w-full">
            {/* Título Principal */}
            <h1 className="text-[22px] md:text-[32px] font-bold text-black mb-2 md:mb-3 leading-tight text-center">
              Escolha seu plano e comece agora!
            </h1>
            
            {/* Subtítulo */}
            <p className="text-[13px] md:text-[15px] text-gray-600 mb-4 md:mb-6 text-center">
              Seu plano personalizado está pronto. Confirme abaixo e garanta seu acesso:
            </p>

            {/* Plano Anual (único) */}
            <div className="mb-4 md:mb-6">
              <div className={`relative bg-[#f9f9f9] rounded-[16px] md:rounded-[20px] p-4 md:p-5 border-2 border-[#FF911A] shadow-lg ${isRedirecting ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* Badge Recomendado */}
                <div className="absolute -top-2.5 md:-top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#FF911A] text-white text-[10px] md:text-[11px] font-bold px-3 md:px-4 py-0.5 md:py-1 rounded-full shadow-md uppercase">
                    ⭐ Mais Popular
                  </span>
                </div>

                <div className="mt-2 md:mt-3">
                  <h3 className="text-[17px] md:text-[20px] font-bold text-black mb-1.5 md:mb-2">Plano Anual</h3>
                  
                  <div className="mb-2 md:mb-3">
                    {isV2 ? (
                      <>
                        <div className="bg-gradient-to-br from-[#FF911A]/10 to-[#FF6B00]/10 rounded-xl p-3 md:p-4 mb-2 border-2 border-[#FF911A]/30">
                          <div className="flex items-baseline justify-center gap-1.5">
                            <span className="text-[18px] md:text-[22px] font-bold text-gray-700">12x de</span>
                            <span className="text-[36px] md:text-[48px] font-extrabold text-[#FF911A] leading-none drop-shadow-sm">R$ 20,38</span>
                          </div>
                          <p className="text-[11px] md:text-[12px] text-gray-600 text-center mt-1">
                            ou R$ 197,00 à vista
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-gradient-to-br from-[#FF911A]/10 to-[#FF6B00]/10 rounded-xl p-3 md:p-4 mb-2 border-2 border-[#FF911A]/30">
                          <div className="flex items-baseline justify-center gap-1.5">
                            <span className="text-[18px] md:text-[22px] font-bold text-gray-700">12x de</span>
                            <span className="text-[36px] md:text-[48px] font-extrabold text-[#FF911A] leading-none drop-shadow-sm">R$ 11,37</span>
                          </div>
                          <p className="text-[11px] md:text-[12px] text-gray-600 text-center mt-1">
                            ou R$ 109,90 à vista
                          </p>
                        </div>
                        <div className="flex justify-center mt-2">
                          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1.5 rounded-full text-[12px] md:text-[13px] font-bold shadow-lg transform hover:scale-105 transition-transform">
                            💰 Economize R$ 260,90 no ano!
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <svg width="8" height="8" className="md:w-[10px] md:h-[10px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M5 12l5 5L19 7"/>
                        </svg>
                      </div>
                      <p className="text-[12px] md:text-[13px] text-gray-700">Acesso completo por 12 meses</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <svg width="8" height="8" className="md:w-[10px] md:h-[10px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M5 12l5 5L19 7"/>
                        </svg>
                      </div>
                      <p className="text-[12px] md:text-[13px] text-gray-700">Suporte prioritário</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <svg width="8" height="8" className="md:w-[10px] md:h-[10px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M5 12l5 5L19 7"/>
                        </svg>
                      </div>
                      <p className="text-[12px] md:text-[13px] text-gray-700">Todas as atualizações incluídas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Garantia */}
            <div className="bg-green-50 rounded-[12px] md:rounded-[14px] p-2.5 md:p-3.5 text-center mb-3 md:mb-4">
              <p className="text-[12px] md:text-[14px] text-green-800 font-semibold mb-0.5">
                🔒 Garantia de 7 dias
              </p>
              <p className="text-[11px] md:text-[12px] text-green-700 leading-snug">
                Se não gostar, devolvemos 100% do seu dinheiro
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Checkout fixo */}
      <div className="flex-shrink-0 px-5 md:px-6 pb-5 md:pb-8 bg-white">
        <div className="max-w-md mx-auto w-full">
          <button
            onClick={() => handleCheckout()}
            disabled={isRedirecting}
            className={`w-full py-3.5 md:py-5 px-5 md:px-6 rounded-[14px] font-bold text-[14px] md:text-[16px] transition-all duration-200 shadow-md uppercase ${
              isRedirecting
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-[#FF911A] text-white active:bg-[#FF911A]/90 hover:bg-[#FF911A]/90'
            }`}
          >
            {isRedirecting ? '🔄 Redirecionando...' : 'GARANTIR PLANO ANUAL'}
          </button>
          
          <p className="text-center text-[10px] md:text-[12px] text-gray-500 mt-2">
            🔒 Pagamento 100% seguro • Acesso imediato
          </p>
        </div>
      </div>
    </div>
  );
}
