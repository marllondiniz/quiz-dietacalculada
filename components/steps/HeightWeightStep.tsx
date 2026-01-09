'use client';

import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import { useState } from 'react';
import SafeNavigationButton from '@/components/SafeNavigationButton';

export default function HeightWeightStep() {
  const router = useRouter();
  const { updateAnswer, nextStep, currentStep, answers } = useQuizStore();
  
  const [heightCm, setHeightCm] = useState(answers.heightCm || 170);
  const [weightKg, setWeightKg] = useState(answers.weightKg || 70);

  const handleHeightChange = (delta: number) => {
    setHeightCm(prev => Math.max(120, Math.min(240, prev + delta)));
  };

  const handleWeightChange = (delta: number) => {
    setWeightKg(prev => Math.max(30, Math.min(200, prev + delta)));
  };

  const handleContinue = () => {
    updateAnswer('heightCm', heightCm);
    updateAnswer('weightKg', weightKg);
    updateAnswer('unit', 'metric');
    nextStep();
    router.push(`/quiz/${currentStep + 1}`);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-4">
        <h1 className="text-[32px] md:text-[40px] font-bold text-black mb-3 leading-tight max-w-md mx-auto text-center">
          Altura e peso
        </h1>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="max-w-md mx-auto w-full space-y-8">
          
          {/* Altura */}
          <div className="bg-[#f5f5f5] rounded-[20px] p-6">
            <label className="block text-[14px] font-medium text-gray-500 mb-4 text-center uppercase tracking-wide">
              Altura
            </label>
            
            <div className="flex items-center justify-center gap-4">
              {/* Botão diminuir */}
              <button
                onClick={() => handleHeightChange(-1)}
                className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                </svg>
              </button>

              {/* Valor */}
              <div className="w-32 text-center">
                <span className="text-[48px] font-bold text-black leading-none">{heightCm}</span>
                <span className="text-[18px] text-gray-500 ml-1">cm</span>
              </div>

              {/* Botão aumentar */}
              <button
                onClick={() => handleHeightChange(1)}
                className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Slider */}
            <div className="mt-5 px-2">
              <div className="relative py-3">
                <input
                  type="range"
                  min="120"
                  max="240"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value))}
                  className="w-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #1a1a1a 0%, #1a1a1a ${((heightCm - 120) / 120) * 100}%, #d1d5db ${((heightCm - 120) / 120) * 100}%, #d1d5db 100%)`,
                    height: '8px',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div className="flex justify-between text-[12px] text-gray-400">
                <span>120 cm</span>
                <span>240 cm</span>
              </div>
            </div>
          </div>

          {/* Peso */}
          <div className="bg-[#f5f5f5] rounded-[20px] p-6">
            <label className="block text-[14px] font-medium text-gray-500 mb-4 text-center uppercase tracking-wide">
              Peso
            </label>
            
            <div className="flex items-center justify-center gap-4">
              {/* Botão diminuir */}
              <button
                onClick={() => handleWeightChange(-1)}
                className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                </svg>
              </button>

              {/* Valor */}
              <div className="w-32 text-center">
                <span className="text-[48px] font-bold text-black leading-none">{weightKg}</span>
                <span className="text-[18px] text-gray-500 ml-1">kg</span>
              </div>

              {/* Botão aumentar */}
              <button
                onClick={() => handleWeightChange(1)}
                className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Slider */}
            <div className="mt-5 px-2">
              <div className="relative py-3">
                <input
                  type="range"
                  min="30"
                  max="200"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseInt(e.target.value))}
                  className="w-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #1a1a1a 0%, #1a1a1a ${((weightKg - 30) / 170) * 100}%, #d1d5db ${((weightKg - 30) / 170) * 100}%, #d1d5db 100%)`,
                    height: '8px',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div className="flex justify-between text-[12px] text-gray-400">
                <span>30 kg</span>
                <span>200 kg</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="px-6 pb-6 md:pb-8">
        <div className="max-w-md mx-auto w-full">
          <SafeNavigationButton
            onClick={handleContinue}
            className="w-full py-4 md:py-5 px-6 rounded-[16px] md:rounded-[20px] font-semibold text-[16px] md:text-[17px] transition-all duration-200 bg-[#FF911A] text-white active:bg-[#FF911A]/90 hover:bg-[#FF911A]/90"
          >
            Continuar
          </SafeNavigationButton>
        </div>
      </div>
    </div>
  );
}
