'use client';

import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';

const diets = [
  { id: 'classico', label: 'Clássico', description: 'Como de tudo' },
  { id: 'vegetariano', label: 'Vegetariano', description: 'Sem carne' },
  { id: 'vegano', label: 'Vegano', description: 'Sem produtos animais' },
];

export default function DietTypeStep() {
  const router = useRouter();
  const { updateAnswer, nextStep, currentStep, answers } = useQuizStore();

  const handleSelect = (dietId: string) => {
    updateAnswer('dietType', dietId);
  };

  const handleContinue = () => {
    if (answers.dietType) {
      nextStep();
      router.push(`/quiz/${currentStep + 1}`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-4">
        <h1 className="text-[32px] md:text-[40px] font-bold text-black mb-3 leading-tight max-w-md mx-auto text-center">
          Qual tipo de dieta você segue?
        </h1>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="space-y-3 max-w-md mx-auto w-full">
          {diets.map((diet) => {
            const isSelected = answers.dietType === diet.id;
            return (
              <button
                key={diet.id}
                onClick={() => handleSelect(diet.id)}
                className={`w-full py-5 md:py-6 px-6 rounded-[16px] md:rounded-[20px] transition-all duration-200 text-left flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#FF911A] text-white'
                    : 'bg-[#f5f5f5] text-black active:bg-gray-200 hover:bg-gray-200'
                }`}
              >
                <div>
                  <span className={`text-[18px] md:text-[20px] font-semibold block ${
                    isSelected ? 'text-white' : 'text-black'
                  }`}>
                    {diet.label}
                  </span>
                  <span className={`text-[15px] md:text-[16px] ${
                    isSelected ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {diet.description}
                  </span>
                </div>

                {/* Radio indicator */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'border-green-500 bg-green-500' 
                    : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            disabled={!answers.dietType}
            className={`w-full py-4 md:py-5 px-6 rounded-[16px] md:rounded-[20px] font-semibold text-[16px] md:text-[17px] transition-all duration-200 ${
              answers.dietType
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
