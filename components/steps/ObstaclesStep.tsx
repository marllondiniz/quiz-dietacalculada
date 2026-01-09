'use client';

import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';

const obstacles = [
  { id: 'consistencia', label: 'Falta de consistência' },
  { id: 'habitos', label: 'Hábitos alimentares ruins' },
  { id: 'apoio', label: 'Falta de apoio' },
  { id: 'agenda', label: 'Agenda lotada' },
  { id: 'inspiracao', label: 'Falta de inspiração' },
];

export default function ObstaclesStep() {
  const router = useRouter();
  const { updateAnswer, nextStep, currentStep, answers } = useQuizStore();

  const handleToggle = (obstacleId: string) => {
    const current = answers.obstacles || [];
    const updated = current.includes(obstacleId)
      ? current.filter((id) => id !== obstacleId)
      : [...current, obstacleId];
    updateAnswer('obstacles', updated);
  };

  const handleContinue = () => {
    if (answers.obstacles && answers.obstacles.length > 0) {
      nextStep();
      router.push(`/quiz/${currentStep + 1}`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-4">
        <h1 className="text-[32px] md:text-[40px] font-bold text-black mb-2 leading-tight max-w-md mx-auto text-center">
          O que está te impedindo?
        </h1>
        <p className="text-[15px] md:text-[16px] text-gray-500 max-w-md mx-auto text-center">
          Selecione todas que se aplicam
        </p>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center px-6 overflow-y-auto py-4">
        <div className="space-y-3 max-w-md mx-auto w-full">
          {obstacles.map((obstacle) => {
            const isSelected = answers.obstacles?.includes(obstacle.id) || false;
            return (
              <button
                key={obstacle.id}
                onClick={() => handleToggle(obstacle.id)}
                className={`w-full py-4 md:py-5 px-6 rounded-[16px] md:rounded-[20px] transition-all duration-200 text-left flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#FF911A] text-white'
                    : 'bg-[#f5f5f5] text-black active:bg-gray-200 hover:bg-gray-200'
                }`}
              >
                <span className={`text-[18px] md:text-[20px] font-semibold ${
                  isSelected ? 'text-white' : 'text-black'
                }`}>
                  {obstacle.label}
                </span>

                {/* Checkbox indicator */}
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'border-white bg-white' 
                    : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <svg className="w-4 h-4 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="px-6 pb-6 md:pb-8">
        <div className="max-w-md mx-auto w-full">
          <SafeNavigationButton
            onClick={handleContinue}
            disabled={!answers.obstacles || answers.obstacles.length === 0}
            className={`w-full py-4 md:py-5 px-6 rounded-[16px] md:rounded-[20px] font-semibold text-[16px] md:text-[17px] transition-all duration-200 ${
              answers.obstacles && answers.obstacles.length > 0
                ? 'bg-[#FF911A] text-white active:bg-[#FF911A]/90 hover:bg-[#FF911A]/90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuar
          </SafeNavigationButton>
        </div>
      </div>
    </div>
  );
}
