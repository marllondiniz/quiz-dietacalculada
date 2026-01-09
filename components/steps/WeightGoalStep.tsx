'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';
import { useEffect, useState } from 'react';

export default function WeightGoalStep() {
  const router = useRouter();
  const params = useParams();
  const currentStepFromUrl = parseInt(params.step as string, 10);
  const { nextStep, answers } = useQuizStore();
  const [canContinue, setCanContinue] = useState(false);

  // Calcular diferença de peso
  const currentWeight = answers.weightKg || 70;
  const desiredWeight = answers.desiredWeightKg || 65;
  const weightDifference = Math.abs(currentWeight - desiredWeight);
  const goal = answers.goal || 'perder';

  // Se objetivo é "manter", pular essa etapa
  useEffect(() => {
    if (goal === 'manter') {
      nextStep();
      router.replace(`/quiz/${currentStepFromUrl + 1}`);
    } else {
      // Habilitar botão após 2 segundos (tempo mínimo de leitura)
      const enableButton = setTimeout(() => setCanContinue(true), 2000);
      return () => clearTimeout(enableButton);
    }
  }, [goal, currentStepFromUrl, nextStep, router]);

  // Se for manter, não renderizar nada
  if (goal === 'manter') {
    return null;
  }

  const getGoalVerb = () => {
    if (goal === 'ganhar') return 'Ganhar';
    return 'Perder';
  };

  const handleContinue = () => {
    nextStep();
    router.push(`/quiz/${currentStepFromUrl + 1}`);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Conteúdo centralizado */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="max-w-md mx-auto w-full text-center">
          
          {/* Título principal */}
          <h1 className="text-[32px] md:text-[40px] font-bold text-black mb-4 leading-tight">
            {getGoalVerb()}{' '}
            <span className="text-[#e5a96c]">{weightDifference.toFixed(1)} kg</span>
            {' '}é uma meta alcançável!
          </h1>
          
          {/* Subtítulo */}
          <p className="text-[18px] md:text-[20px] text-gray-700 mb-6 leading-relaxed font-medium">
            Basta ter um plano para seguir.
          </p>
          
          {/* Texto motivacional */}
          <p className="text-[16px] md:text-[18px] text-gray-600 leading-relaxed max-w-sm mx-auto">
            90% dos usuários dizem que nunca mais voltaram ao peso antigo depois de usar o Dieta Calculada
          </p>

        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="px-6 pb-6 md:pb-8">
        <div className="max-w-md mx-auto w-full">
          <SafeNavigationButton
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full py-4 md:py-5 px-6 rounded-[16px] md:rounded-[20px] font-semibold text-[16px] md:text-[17px] transition-all duration-200 ${
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
