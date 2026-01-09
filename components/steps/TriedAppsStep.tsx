'use client';

import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';

export default function TriedAppsStep() {
  const router = useRouter();
  const { updateAnswer, nextStep, currentStep, answers } = useQuizStore();

  const handleSelect = (triedApps: boolean) => {
    updateAnswer('triedOtherApps', triedApps);
  };

  const handleContinue = () => {
    if (answers.triedOtherApps !== undefined) {
      nextStep();
      router.push(`/quiz/${currentStep + 1}`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-4">
        <h1 className="text-[32px] md:text-[40px] font-bold text-black mb-3 leading-tight max-w-md mx-auto text-center">
          Você já tentou outros apps de contagem de calorias?
        </h1>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="space-y-3 max-w-md mx-auto w-full">
          <button
            onClick={() => handleSelect(true)}
            className={`w-full py-5 md:py-6 px-6 rounded-[16px] md:rounded-[20px] transition-all duration-200 flex items-center justify-between ${
              answers.triedOtherApps === true
                ? 'bg-[#FF911A] text-white'
                : 'bg-[#f5f5f5] text-black active:bg-gray-200 hover:bg-gray-200'
            }`}
          >
            <span className={`text-[18px] md:text-[20px] font-semibold ${
              answers.triedOtherApps === true ? 'text-white' : 'text-black'
            }`}>
              Sim, já tentei
            </span>

            {/* Radio indicator */}
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              answers.triedOtherApps === true 
                ? 'border-green-500 bg-green-500' 
                : 'border-gray-300'
            }`}>
              {answers.triedOtherApps === true && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>

          <button
            onClick={() => handleSelect(false)}
            className={`w-full py-5 md:py-6 px-6 rounded-[16px] md:rounded-[20px] transition-all duration-200 flex items-center justify-between ${
              answers.triedOtherApps === false
                ? 'bg-[#FF911A] text-white'
                : 'bg-[#f5f5f5] text-black active:bg-gray-200 hover:bg-gray-200'
            }`}
          >
            <span className={`text-[18px] md:text-[20px] font-semibold ${
              answers.triedOtherApps === false ? 'text-white' : 'text-black'
            }`}>
              Não, é minha primeira vez
            </span>

            {/* Radio indicator */}
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              answers.triedOtherApps === false 
                ? 'border-green-500 bg-green-500' 
                : 'border-gray-300'
            }`}>
              {answers.triedOtherApps === false && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="px-6 pb-6 md:pb-8">
        <div className="max-w-md mx-auto w-full">
          <SafeNavigationButton
            onClick={handleContinue}
            disabled={answers.triedOtherApps === undefined}
            className={`w-full py-4 md:py-5 px-6 rounded-[16px] md:rounded-[20px] font-semibold text-[16px] md:text-[17px] transition-all duration-200 ${
              answers.triedOtherApps !== undefined
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
