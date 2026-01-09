'use client';

import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';

type DietHelperOption = 'nao-faco-dieta' | 'seguir-intuicao' | 'montar-propria' | 'copiar-dieta' | 'plano-online' | 'nutricionista-online' | 'nutricionista-presencial';

const dietHelperOptions: { value: DietHelperOption; label: string }[] = [
  { value: 'nao-faco-dieta', label: 'Não faço dieta' },
  { value: 'montar-propria', label: 'Faço do meu jeito' },
  { value: 'plano-online', label: 'Assino um plano online' },
  { value: 'nutricionista-online', label: 'Tenho nutricionista online' },
  { value: 'nutricionista-presencial', label: 'Tenho nutricionista presencial' },
];

export default function DietHelperStep() {
  const router = useRouter();
  const { updateAnswer, nextStep, currentStep, answers } = useQuizStore();

  const handleSelect = (option: DietHelperOption) => {
    updateAnswer('dietHelper', option);
  };

  const handleContinue = () => {
    if (answers.dietHelper) {
      nextStep();
      router.push(`/quiz/${currentStep + 1}`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-5 md:px-6 pt-3 md:pt-4">
        <h1 className="text-[22px] md:text-[40px] font-bold text-black mb-3 leading-tight max-w-md mx-auto text-center">
          Você tem alguém auxiliando na sua dieta hoje?
        </h1>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center px-5 md:px-6 overflow-y-auto">
        <div className="space-y-2.5 md:space-y-3 max-w-md mx-auto w-full py-3 md:py-4">
          {dietHelperOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full py-3.5 md:py-6 px-4 md:px-6 rounded-[14px] md:rounded-[20px] transition-all duration-200 flex items-center justify-between ${
                answers.dietHelper === option.value
                  ? 'bg-[#FF911A] text-white'
                  : 'bg-[#f5f5f5] text-black active:bg-gray-200 hover:bg-gray-200'
              }`}
            >
              <span className={`text-[15px] md:text-[20px] font-semibold text-left ${
                answers.dietHelper === option.value ? 'text-white' : 'text-black'
              }`}>
                {option.label}
              </span>

              {/* Radio indicator */}
              <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ml-2 md:ml-3 ${
                answers.dietHelper === option.value 
                  ? 'border-green-500 bg-green-500' 
                  : 'border-gray-300'
              }`}>
                {answers.dietHelper === option.value && (
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="px-5 md:px-6 pb-5 md:pb-8">
        <div className="max-w-md mx-auto w-full">
          <SafeNavigationButton
            onClick={handleContinue}
            disabled={!answers.dietHelper}
            className={`w-full py-3.5 md:py-5 px-6 rounded-[14px] md:rounded-[20px] font-semibold text-[15px] md:text-[17px] transition-all duration-200 ${
              answers.dietHelper
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

