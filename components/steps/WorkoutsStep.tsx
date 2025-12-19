'use client';

import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';

const workoutOptions = [
  { id: '0-2', label: '0-2 treinos', description: 'Leve' },
  { id: '3-5', label: '3-5 treinos', description: 'Moderado' },
  { id: '6+', label: '6+ treinos', description: 'Intenso' },
];

export default function WorkoutsStep() {
  const router = useRouter();
  const { updateAnswer, nextStep, currentStep, answers } = useQuizStore();

  const handleSelect = (workoutId: string) => {
    updateAnswer('workoutsPerWeek', workoutId);
  };

  const handleContinue = () => {
    if (answers.workoutsPerWeek) {
      nextStep();
      router.push(`/quiz/${currentStep + 1}`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-4">
        <h1 className="text-[32px] md:text-[40px] font-bold text-black mb-3 leading-tight max-w-md mx-auto text-center">
          Quantos treinos você faz por semana?
        </h1>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="space-y-3 max-w-md mx-auto w-full">
          {workoutOptions.map((option) => {
            const isSelected = answers.workoutsPerWeek === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`w-full py-5 md:py-6 px-6 rounded-[16px] md:rounded-[20px] transition-all duration-200 text-left flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-[#f5f5f5] text-black active:bg-gray-200 hover:bg-gray-200'
                }`}
              >
                <div>
                  <span className={`text-[18px] md:text-[20px] font-semibold block ${
                    isSelected ? 'text-white' : 'text-black'
                  }`}>
                    {option.label}
                  </span>
                  <span className={`text-[15px] md:text-[16px] ${
                    isSelected ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {option.description}
                  </span>
                </div>

                {/* Radio indicator */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'border-white bg-white' 
                    : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-[#1a1a1a]" />
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
          <button
            onClick={handleContinue}
            disabled={!answers.workoutsPerWeek}
            className={`w-full py-4 md:py-5 px-6 rounded-[16px] md:rounded-[20px] font-semibold text-[16px] md:text-[17px] transition-all duration-200 ${
              answers.workoutsPerWeek
                ? 'bg-[#1a1a1a] text-white active:bg-black hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
