'use client';

import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';
import { useEffect, useState } from 'react';

export default function GoalsGuideStep() {
  const router = useRouter();
  const { nextStep, currentStep } = useQuizStore();
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    // Habilitar botão após 3 segundos (página com mais conteúdo)
    const enableButton = setTimeout(() => setCanContinue(true), 3000);
    return () => clearTimeout(enableButton);
  }, []);

  const handleContinue = () => {
    nextStep();
    router.push(`/quiz/${currentStep + 1}`);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Conteúdo scrollável */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-md mx-auto w-full">
          
          {/* Card de pontuação de saúde */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-4 mb-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💪</span>
                </div>
                <span className="text-[16px] font-medium text-black">Pontuação de Saúde</span>
              </div>
              <span className="text-[18px] font-bold text-black">7/10</span>
            </div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-[70%] bg-gradient-to-r from-green-400 to-green-500 rounded-full" />
            </div>
          </div>

          {/* Como atingir suas metas */}
          <h2 className="text-[20px] md:text-[22px] font-bold text-black mb-6">
            Como atingir suas metas:
          </h2>

          <div className="space-y-5 mb-8">
            {/* Item 1 */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl">⚡</span>
              </div>
              <p className="text-[15px] md:text-[16px] text-black font-medium pt-3">
                Use pontuações de saúde para melhorar sua rotina
              </p>
            </div>

            {/* Item 2 */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🥑</span>
              </div>
              <p className="text-[15px] md:text-[16px] text-black font-medium pt-3">
                Registre sua alimentação
              </p>
            </div>

            {/* Item 3 */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🔥</span>
              </div>
              <p className="text-[15px] md:text-[16px] text-black font-medium pt-3">
                Siga sua recomendação diária de calorias
              </p>
            </div>

            {/* Item 4 */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl">⚖️</span>
              </div>
              <p className="text-[15px] md:text-[16px] text-black font-medium pt-3">
                Equilibre seus carboidratos, proteínas e gorduras
              </p>
            </div>
          </div>

          {/* Fontes */}
          <div className="bg-[#f9f9f9] rounded-[16px] p-4">
            <p className="text-[14px] font-semibold text-black mb-3">
              Plano baseado nas seguintes fontes, entre outros estudos médicos revisados por pares:
            </p>
            <ul className="space-y-1.5">
              <li className="text-[13px] text-gray-600">• Taxa metabólica basal</li>
              <li className="text-[13px] text-gray-600">• Contagem de calorias - Harvard</li>
              <li className="text-[13px] text-gray-600">• International Society of Sports Nutrition</li>
              <li className="text-[13px] text-gray-600">• National Institutes of Health</li>
            </ul>
          </div>

        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="flex-shrink-0 px-6 pb-6 md:pb-8 bg-white">
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
            {canContinue ? 'Vamos começar!' : 'Aguarde...'}
          </SafeNavigationButton>
        </div>
      </div>
    </div>
  );
}

