'use client';

import { useEffect, useState, useRef } from 'react';
import { useQuizStore, type QuizAnswers } from '@/store/quizStore';
import { useSearchParams } from 'next/navigation';

type PlanType = 'annual' | 'monthly';

export default function ThankYouStep() {
  const { answers } = useQuizStore();
  const [dataSent, setDataSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const hasSentRef = useRef(false);
  const searchParams = useSearchParams();

  // Enviar dados para Google Sheets quando o componente for montado (apenas uma vez)
  useEffect(() => {
    const sendDataToSheets = async () => {
      // Evitar envio duplicado usando ref
      if (hasSentRef.current || isSending) return;

      hasSentRef.current = true;
      setIsSending(true);
      setSendError(null);

      try {
        console.log('📤 Enviando dados do quiz para Google Sheets...');
        console.log('Dados:', answers);

        // Preparar dados para envio
        const dataToSend = {
          ...answers,
          // Converter Date para string se existir
          birthDate: answers.birthDate 
            ? (answers.birthDate instanceof Date 
                ? answers.birthDate.toISOString() 
                : answers.birthDate)
            : undefined,
        };

        const response = await fetch('/api/sheets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });

        const result = await response.json();

        if (response.ok) {
          setDataSent(true);
          setIsSending(false);
          console.log('✅ Dados enviados com sucesso para Google Sheets!', result);
        } else {
          setIsSending(false);
          hasSentRef.current = false; // Permitir nova tentativa em caso de erro
          const errorMsg = result.error || result.details?.message || 'Erro desconhecido';
          setSendError(errorMsg);
          console.error('❌ Erro ao enviar dados:', result);
        }
      } catch (error: any) {
        setIsSending(false);
        hasSentRef.current = false; // Permitir nova tentativa em caso de erro
        const errorMsg = error.message || 'Erro ao conectar com o servidor';
        setSendError(errorMsg);
        console.error('❌ Erro ao enviar dados para Google Sheets:', error);
      }
    };

    sendDataToSheets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executar apenas uma vez quando o componente montar

  // Função para construir URL com UTMs (prioriza store, depois URL, depois sessionStorage)
  const buildCheckoutUrl = (baseUrl: string): string => {
    const utmParams = new URLSearchParams();
    
    // Capturar todos os parâmetros UTM de múltiplas fontes
    const utmKeys: Array<keyof QuizAnswers> = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    
    utmKeys.forEach(key => {
      // 1. Prioridade: buscar do store (já deve estar salvo)
      let value: string | undefined = answers[key] as string | undefined;
      
      // 2. Se não estiver no store, tentar buscar da URL atual
      if (!value) {
        const urlValue = searchParams.get(key.replace('_', '')) || searchParams.get(key);
        value = urlValue || undefined;
      }
      
      // 3. Se ainda não tiver, tentar recuperar do sessionStorage
      if (!value) {
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
        utmParams.append(key, value);
      }
    });

    // Se houver UTMs, adicionar à URL base
    const utmString = utmParams.toString();
    if (utmString) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      console.log('🔗 URL de checkout com UTMs:', `${baseUrl}${separator}${utmString}`);
      return `${baseUrl}${separator}${utmString}`;
    }

    console.log('⚠️ Nenhuma UTM encontrada para anexar ao checkout');
    return baseUrl;
  };

  const handleCheckout = (plan: PlanType) => {
    const checkoutUrls = {
      annual: 'https://pay.hub.la/9uz9SIpLP3pZ0f12ydsD',
      monthly: 'https://pay.hub.la/QnE0thkRCtKbXLmS5yPy'
    };

    const baseUrl = checkoutUrls[plan];
    const finalUrl = buildCheckoutUrl(baseUrl);
    
    console.log('🔗 Redirecionando para checkout:', plan, finalUrl);
    window.location.href = finalUrl;
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
              Seu plano personalizado está pronto. Escolha a melhor opção para você:
            </p>

            {/* Status do envio para Google Sheets */}
            {isSending && (
              <div className="bg-blue-50 border border-blue-200 rounded-[14px] p-3 mb-4 text-center">
                <p className="text-[12px] text-blue-700">
                  💾 Salvando seus dados...
                </p>
              </div>
            )}
            
            {dataSent && (
              <div className="bg-green-50 border border-green-200 rounded-[14px] p-3 mb-4 text-center">
                <p className="text-[12px] text-green-700">
                  ✅ Dados salvos com sucesso!
                </p>
              </div>
            )}
            
            {sendError && (
              <div className="bg-red-50 border border-red-200 rounded-[14px] p-3 mb-4 text-center">
                <p className="text-[12px] text-red-700 font-semibold mb-1">
                  ⚠️ Erro ao salvar dados
                </p>
                <p className="text-[11px] text-red-600">
                  {sendError}
                </p>
                <p className="text-[10px] text-red-500 mt-1">
                  Verifique o console do navegador para mais detalhes
                </p>
              </div>
            )}

            {/* Opções de Planos */}
            <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
              {/* Plano Anual - RECOMENDADO */}
              <div 
                onClick={() => setSelectedPlan('annual')}
                className={`relative bg-[#f9f9f9] rounded-[16px] md:rounded-[20px] p-4 md:p-5 cursor-pointer transition-all duration-200 border-2 ${
                  selectedPlan === 'annual' 
                    ? 'border-[#FF911A] shadow-lg' 
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                {/* Badge Recomendado */}
                <div className="absolute -top-2.5 md:-top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#FF911A] text-white text-[10px] md:text-[11px] font-bold px-3 md:px-4 py-0.5 md:py-1 rounded-full shadow-md uppercase">
                    ⭐ Mais Popular
                  </span>
                </div>

                {/* Radio Button */}
                <div className="absolute top-4 md:top-5 right-4 md:right-5">
                  <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === 'annual' 
                      ? 'border-[#FF911A] bg-[#FF911A]' 
                      : 'border-gray-300'
                  }`}>
                    {selectedPlan === 'annual' && (
                      <svg width="12" height="12" className="md:w-[14px] md:h-[14px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M5 12l5 5L19 7"/>
                      </svg>
                    )}
                  </div>
                </div>

                <div className="mt-2 md:mt-3">
                  <h3 className="text-[17px] md:text-[20px] font-bold text-black mb-1.5 md:mb-2">Plano Anual</h3>
                  
                  <div className="mb-2 md:mb-3">
                    <p className="text-[26px] md:text-[32px] font-bold text-black leading-none">
                      12x de R$ 10,90
                    </p>
                    <p className="text-[12px] md:text-[13px] text-green-600 font-semibold mt-1">
                      💰 Economize 70% com o plano anual
                    </p>
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

              {/* Plano Mensal */}
              <div 
                onClick={() => setSelectedPlan('monthly')}
                className={`relative bg-[#f9f9f9] rounded-[16px] md:rounded-[20px] p-4 md:p-5 cursor-pointer transition-all duration-200 border-2 ${
                  selectedPlan === 'monthly' 
                    ? 'border-[#FF911A] shadow-lg' 
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                {/* Radio Button */}
                <div className="absolute top-4 md:top-5 right-4 md:right-5">
                  <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === 'monthly' 
                      ? 'border-[#FF911A] bg-[#FF911A]' 
                      : 'border-gray-300'
                  }`}>
                    {selectedPlan === 'monthly' && (
                      <svg width="12" height="12" className="md:w-[14px] md:h-[14px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M5 12l5 5L19 7"/>
                      </svg>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-[17px] md:text-[20px] font-bold text-black mb-1.5 md:mb-2">Plano Mensal</h3>
                  
                  <div className="mb-2 md:mb-3">
                    <p className="text-[26px] md:text-[32px] font-bold text-black leading-none">
                      R$ 27,90<span className="text-[14px] md:text-[16px] text-gray-600 font-normal">/mês</span>
                    </p>
                    <p className="text-[12px] md:text-[13px] text-gray-600 mt-1">
                      Pagamento mensal recorrente
                    </p>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <svg width="8" height="8" className="md:w-[10px] md:h-[10px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M5 12l5 5L19 7"/>
                        </svg>
                      </div>
                      <p className="text-[12px] md:text-[13px] text-gray-700">Acesso completo à plataforma</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <svg width="8" height="8" className="md:w-[10px] md:h-[10px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M5 12l5 5L19 7"/>
                        </svg>
                      </div>
                      <p className="text-[12px] md:text-[13px] text-gray-700">Cancele quando quiser</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <svg width="8" height="8" className="md:w-[10px] md:h-[10px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M5 12l5 5L19 7"/>
                        </svg>
                      </div>
                      <p className="text-[12px] md:text-[13px] text-gray-700">Suporte por WhatsApp</p>
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
            onClick={() => handleCheckout(selectedPlan)}
            className="w-full py-3.5 md:py-5 px-5 md:px-6 rounded-[14px] font-bold text-[14px] md:text-[16px] transition-all duration-200 bg-[#FF911A] text-white active:bg-[#FF911A]/90 hover:bg-[#FF911A]/90 shadow-md uppercase"
          >
            {selectedPlan === 'annual' ? 'GARANTIR PLANO ANUAL' : 'GARANTIR PLANO MENSAL'}
          </button>
          
          <p className="text-center text-[10px] md:text-[12px] text-gray-500 mt-2">
            🔒 Pagamento 100% seguro • Acesso imediato
          </p>
        </div>
      </div>
    </div>
  );
}
