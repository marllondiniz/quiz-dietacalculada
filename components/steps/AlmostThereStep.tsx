'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';
import { useEffect, useState } from 'react';

export default function AlmostThereStep() {
  const router = useRouter();
  const params = useParams();
  const currentStepFromUrl = parseInt(params.step as string, 10);
  const { nextStep } = useQuizStore();
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    // Habilitar botão após 2 segundos (tempo mínimo de leitura)
    const enableButton = setTimeout(() => setCanContinue(true), 2000);
    return () => clearTimeout(enableButton);
  }, []);

  const handleContinue = () => {
    nextStep();
    router.push(`/quiz/${currentStepFromUrl + 1}`);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Conteúdo centralizado */}
      <div className="flex-1 flex flex-col justify-center px-5 md:px-6">
        <div className="max-w-md mx-auto w-full text-center">
          
          {/* Título principal */}
          <h1 className="text-[28px] md:text-[40px] font-bold text-black mb-4 md:mb-6 leading-tight">
            FALTA POUCO!
          </h1>
          
          {/* Subtítulo */}
          <p className="text-[18px] md:text-[22px] text-gray-700 mb-6 md:mb-8 leading-relaxed font-medium px-4">
            Mais alguns passos e você terá um plano para atingir seu objetivo nos próximos 30 dias!
          </p>

          {/* Ícone ou elemento visual */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#FF911A] to-[#FF6B00] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl md:text-5xl">🎯</span>
            </div>
          </div>

        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="flex-shrink-0 px-5 md:px-6 pb-5 md:pb-8 bg-white">
        <div className="max-w-md mx-auto w-full">
          <SafeNavigationButton
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full py-3.5 md:py-5 px-6 rounded-[14px] md:rounded-[20px] font-semibold text-[15px] md:text-[17px] transition-all duration-200 ${
              canContinue
                ? 'bg-[#FF911A] text-white active:bg-[#FF911A]/90 hover:bg-[#FF911A]/90'
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
