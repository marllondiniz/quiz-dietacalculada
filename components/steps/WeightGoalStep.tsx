'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import { useEffect } from 'react';

export default function WeightGoalStep() {
  const router = useRouter();
  const params = useParams();
  const currentStepFromUrl = parseInt(params.step as string, 10);
  const { nextStep, answers } = useQuizStore();

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
    }
  }, [goal, currentStepFromUrl, nextStep, router]);

  // Se for manter, não renderizar nada
  if (goal === 'manter') {
    return null;
  }

  const getGoalVerb = () => {
    if (goal === 'ganhar') return 'Ganhando';
    return 'Perdendo';
  };

  const getMotivationalText = () => {
    if (goal === 'ganhar') {
      return '90% dos usuários conseguem ganhar massa de forma saudável com o Dieta Calculada';
    }
    return '90% dos usuários dizem que a mudança é evidente após usar o Dieta Calculada e que é difícil voltar ao antigo';
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
          <h1 className="text-[32px] md:text-[40px] font-bold text-black mb-6 leading-tight">
            {getGoalVerb()}{' '}
            <span className="text-[#e5a96c]">{weightDifference.toFixed(1)} kg</span>
            {' '}é uma meta realista. Não é nada difícil!
          </h1>
          
          {/* Texto motivacional */}
          <p className="text-[16px] md:text-[18px] text-gray-600 leading-relaxed max-w-sm mx-auto">
            {getMotivationalText()}
          </p>

        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="px-6 pb-6 md:pb-8">
        <div className="max-w-md mx-auto w-full">
          <button
            onClick={handleContinue}
            className="w-full py-4 md:py-5 px-6 rounded-[16px] md:rounded-[20px] font-semibold text-[16px] md:text-[17px] transition-all duration-200 bg-[#1a1a1a] text-white active:bg-black hover:bg-gray-800"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
