'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';

export default function ReferralCodeStep() {
  const router = useRouter();
  const { updateAnswer, nextStep, currentStep } = useQuizStore();
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    if (code.trim()) {
      updateAnswer('referralCode', code.trim());
    }
    nextStep();
    router.push(`/quiz/${currentStep + 1}`);
  };

  const handleSkip = () => {
    nextStep();
    router.push(`/quiz/${currentStep + 1}`);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-4">
        <h1 className="text-[26px] md:text-[32px] font-bold text-black mb-2 leading-tight max-w-2xl mx-auto text-center">
          Código de referência
        </h1>
        <p className="text-gray-500 text-[15px] md:text-base max-w-2xl mx-auto text-center">
          Tem um código? Use-o para desbloquear benefícios
        </p>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="max-w-2xl mx-auto w-full">
          <div className="text-center mb-6">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#1a1a1a] rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl md:text-3xl">🎁</span>
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Digite seu código"
              className="w-full px-5 py-4 md:py-5 bg-[#f5f5f5] border-2 border-transparent rounded-[16px] md:rounded-[20px] focus:outline-none focus:border-[#1a1a1a] transition-all text-center text-lg font-semibold tracking-wider"
              maxLength={10}
            />
          </div>
          
          {code && (
            <button
              onClick={handleSubmit}
              className="w-full mb-3 px-6 py-4 md:py-5 bg-green-600 text-white rounded-[16px] md:rounded-[20px] font-semibold active:bg-green-700 hover:bg-green-700 transition-all text-[16px] md:text-[17px]"
            >
              ✓ Aplicar Código
            </button>
          )}
        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="px-6 pb-6 md:pb-8">
        <div className="max-w-2xl mx-auto w-full">
          <button
            onClick={handleSkip}
            className="w-full py-4 md:py-5 px-6 rounded-[16px] md:rounded-[20px] font-semibold text-[16px] md:text-[17px] transition-all duration-200 bg-[#f5f5f5] text-black active:bg-gray-200 hover:bg-gray-200"
          >
            Pular esta etapa
          </button>
        </div>
      </div>
    </div>
  );
}
