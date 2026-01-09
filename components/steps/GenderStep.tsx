'use client';

import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';

const genders = [
  { id: 'masculino', label: 'Masculino' },
  { id: 'feminino', label: 'Feminino' },
  { id: 'outro', label: 'Outro' },
];

export default function GenderStep() {
  const router = useRouter();
  const { updateAnswer, nextStep, currentStep, answers } = useQuizStore();

  const handleSelect = (genderId: string) => {
    updateAnswer('gender', genderId);
  };

  const handleContinue = () => {
    if (answers.gender) {
      nextStep();
      router.push(`/quiz/${currentStep + 1}`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-5 md:px-6 pt-3 md:pt-4">
        <h1 className="text-[24px] md:text-[40px] font-bold text-black mb-2 leading-tight max-w-md mx-auto text-center">
          Escolha seu gênero
        </h1>
        <p className="text-[13px] md:text-[16px] text-gray-500 max-w-md mx-auto leading-relaxed text-center">
          Isso será usado para calibrar seu plano personalizado.
        </p>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center px-5 md:px-6">
        <div className="space-y-2.5 md:space-y-3 max-w-md mx-auto w-full">
          {genders.map((gender) => {
            const isSelected = answers.gender === gender.id;
            return (
              <button
                key={gender.id}
                onClick={() => handleSelect(gender.id)}
                className={`w-full py-4 md:py-6 px-5 md:px-6 rounded-[14px] md:rounded-[20px] transition-all duration-200 text-left flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#FF911A] text-white'
                    : 'bg-[#f5f5f5] text-black active:bg-gray-200 hover:bg-gray-200'
                }`}
              >
                <span className={`text-[16px] md:text-[20px] font-semibold ${
                  isSelected ? 'text-white' : 'text-black'
                }`}>
                  {gender.label}
                </span>

                {/* Radio indicator */}
                <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'border-green-500 bg-green-500' 
                    : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div className="px-5 md:px-6 pb-5 md:pb-8">
        <div className="max-w-md mx-auto w-full">
          <SafeNavigationButton
            onClick={handleContinue}
            disabled={!answers.gender}
            className={`w-full py-3.5 md:py-5 px-6 rounded-[14px] md:rounded-[20px] font-semibold text-[15px] md:text-[17px] transition-all duration-200 ${
              answers.gender
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
