'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';
import { useEffect, useState } from 'react';

export default function ReadyStep() {
  const router = useRouter();
  const params = useParams();
  const currentStepFromUrl = parseInt(params.step as string, 10);
  const { nextStep } = useQuizStore();
  const [isAnimated, setIsAnimated] = useState(false);
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    // Habilitar botão após 2 segundos (tempo mínimo de leitura)
    const enableButton = setTimeout(() => setCanContinue(true), 2000);
    return () => {
      clearTimeout(timer);
      clearTimeout(enableButton);
    };
  }, []);

  const handleContinue = () => {
    nextStep();
    router.push(`/quiz/${currentStepFromUrl + 1}`);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <div className="max-w-md mx-auto w-full text-center">
          
          {/* Ilustração com imagem */}
          <div 
            className="relative w-52 h-52 md:w-60 md:h-60 mx-auto mb-8 transition-all duration-700"
            style={{
              opacity: isAnimated ? 1 : 0,
              transform: isAnimated ? 'scale(1)' : 'scale(0.8)'
            }}
          >
            {/* Círculos de fundo animados */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 animate-pulse" 
                 style={{ animationDuration: '3s' }} />
            <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-white to-green-50" />
            
            {/* Círculo interno com imagem */}
            <div className="absolute inset-5 rounded-full bg-white shadow-inner flex items-center justify-center overflow-hidden">
              <img 
                src="/plano.avif" 
                alt="Plano personalizado" 
                className="w-full h-full object-contain p-3"
              />
            </div>
            
            {/* Sparkles decorativos */}
            <div className={`absolute top-0 left-6 w-3 h-3 bg-green-400 rounded-full ${isAnimated ? 'animate-bounce' : ''}`} style={{ animationDuration: '2s' }} />
            <div className={`absolute top-4 right-4 w-2 h-2 bg-emerald-400 rounded-full ${isAnimated ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.5s' }} />
            <div className={`absolute bottom-8 left-2 w-2 h-2 bg-teal-400 rounded-full ${isAnimated ? 'animate-pulse' : ''}`} style={{ animationDelay: '1s' }} />
            <div className={`absolute bottom-2 right-8 w-3 h-3 bg-green-500 rounded-full ${isAnimated ? 'animate-bounce' : ''}`} style={{ animationDelay: '0.3s', animationDuration: '2.5s' }} />
          </div>

          {/* Badge "Tudo pronto!" */}
          <div 
            className="inline-flex items-center gap-2 mb-4 bg-green-50 px-4 py-2 rounded-full transition-all duration-500"
            style={{
              opacity: isAnimated ? 1 : 0,
              transform: isAnimated ? 'translateY(0)' : 'translateY(10px)',
              transitionDelay: '200ms'
            }}
          >
            <span className="text-[18px]">✅</span>
            <span className="text-[15px] md:text-[16px] font-semibold text-green-700">Tudo pronto!</span>
          </div>

          {/* Título */}
          <h1 
            className="text-[28px] md:text-[36px] font-bold text-black leading-tight transition-all duration-500"
            style={{
              opacity: isAnimated ? 1 : 0,
              transform: isAnimated ? 'translateY(0)' : 'translateY(10px)',
              transitionDelay: '300ms'
            }}
          >
            Hora de gerar<br />o seu plano<br />personalizado!
          </h1>

        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="px-6 pb-6 md:pb-8">
        <div className="max-w-md mx-auto w-full">
          <SafeNavigationButton
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full py-4 md:py-5 px-6 rounded-2xl font-semibold text-[16px] md:text-[17px] transition-all duration-200 ${
              canContinue
                ? 'bg-[#FF911A] text-white active:scale-[0.98] hover:bg-[#FF911A]/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canContinue ? 'Continuar' : 'Aguarde...'}
          </SafeNavigationButton>
        </div>
      </div>
    </div>
  );
}
