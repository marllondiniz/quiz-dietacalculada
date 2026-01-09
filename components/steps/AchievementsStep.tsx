'use client';

import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';

const achievements = [
  { id: 'saudavel', label: 'Viver de forma mais saudável' },
  { id: 'energia', label: 'Ter mais energia e disposição' },
  { id: 'motivacao', label: 'Manter consistência' },
  { id: 'corpo', label: 'Gostar mais do meu corpo' },
];

export default function AchievementsStep() {
  const router = useRouter();
  const { updateAnswer, nextStep, currentStep, answers } = useQuizStore();

  const handleToggle = (achievementId: string) => {
    const current = answers.achievements || [];
    const updated = current.includes(achievementId)
      ? current.filter((id) => id !== achievementId)
      : [...current, achievementId];
    updateAnswer('achievements', updated);
  };

  const handleContinue = () => {
    if (answers.achievements && answers.achievements.length > 0) {
      nextStep();
      router.push(`/quiz/${currentStep + 1}`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-4">
        <h1 className="text-[32px] md:text-[40px] font-bold text-black mb-2 leading-tight max-w-md mx-auto text-center">
          O que você quer alcançar?
        </h1>
        <p className="text-[15px] md:text-[16px] text-gray-500 max-w-md mx-auto text-center">
          Selecione todas que se aplicam
        </p>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="space-y-3 max-w-md mx-auto w-full">
          {achievements.map((achievement) => {
            const isSelected = answers.achievements?.includes(achievement.id) || false;
            return (
              <button
                key={achievement.id}
                onClick={() => handleToggle(achievement.id)}
                className={`w-full py-4 md:py-5 px-6 rounded-[16px] md:rounded-[20px] transition-all duration-200 text-left flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#FF911A] text-white'
                    : 'bg-[#f5f5f5] text-black active:bg-gray-200 hover:bg-gray-200'
                }`}
              >
                <span className={`text-[18px] md:text-[20px] font-semibold ${
                  isSelected ? 'text-white' : 'text-black'
                }`}>
                  {achievement.label}
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
            disabled={!answers.achievements || answers.achievements.length === 0}
            className={`w-full py-4 md:py-5 px-6 rounded-[16px] md:rounded-[20px] font-semibold text-[16px] md:text-[17px] transition-all duration-200 ${
              answers.achievements && answers.achievements.length > 0
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
