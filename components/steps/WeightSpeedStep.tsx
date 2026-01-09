'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';
import { useState, useEffect } from 'react';

export default function WeightSpeedStep() {
  const router = useRouter();
  const params = useParams();
  const currentStepFromUrl = parseInt(params.step as string, 10);
  const { updateAnswer, nextStep, answers } = useQuizStore();
  
  const goal = answers.goal || 'perder';
  const [weightSpeed, setWeightSpeed] = useState(answers.weightSpeedPerWeek || 0.8);
  
  const minSpeed = 0.1;
  const maxSpeed = 1.5;
  const recommendedSpeed = 0.8;
  
  // Se objetivo é "manter", pular essa etapa automaticamente
  useEffect(() => {
    if (goal === 'manter') {
      updateAnswer('weightSpeedPerWeek', 0);
      nextStep();
      router.replace(`/quiz/${currentStepFromUrl + 1}`);
    }
  }, [goal, currentStepFromUrl, nextStep, router, updateAnswer]);

  // Se for manter, não renderizar nada (vai pular)
  if (goal === 'manter') {
    return null;
  }

  const handleContinue = () => {
    updateAnswer('weightSpeedPerWeek', weightSpeed);
    nextStep();
    router.push(`/quiz/${currentStepFromUrl + 1}`);
  };

  // Calcular posição do slider (0-100%)
  const sliderPosition = ((weightSpeed - minSpeed) / (maxSpeed - minSpeed)) * 100;
  
  // Verificar se está na velocidade recomendada
  const isRecommended = Math.abs(weightSpeed - recommendedSpeed) < 0.1;

  // Textos dinâmicos baseados no objetivo
  const getTitle = () => {
    if (goal === 'ganhar') return 'Quão rápido você quer ganhar peso?';
    return 'Quão rápido você quer perder peso?';
  };

  const getSpeedLabel = () => {
    if (goal === 'ganhar') return 'Velocidade de ganho por semana';
    return 'Velocidade de perda por semana';
  };

  // Ícones e labels baseados no objetivo
  const getSlowLabel = () => goal === 'ganhar' ? 'Devagar' : 'Devagar';
  const getMediumLabel = () => 'Moderado';
  const getFastLabel = () => goal === 'ganhar' ? 'Rápido' : 'Rápido';

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-4">
        <h1 className="text-[32px] md:text-[40px] font-bold text-black mb-3 leading-tight max-w-md mx-auto text-center">
          {getTitle()}
        </h1>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="max-w-md mx-auto w-full">
          
          {/* Label */}
          <div className="text-center mb-4">
            <p className="text-[16px] md:text-[17px] text-gray-600">
              {getSpeedLabel()}
            </p>
          </div>

          {/* Valor */}
          <div className="text-center mb-8">
            <div className="text-[48px] md:text-[56px] font-bold text-black leading-none">
              {weightSpeed.toFixed(1).replace('.', ',')} kg
            </div>
          </div>

          {/* Ícones de animais */}
          <div className="flex justify-between items-end mb-4 px-2">
            {/* Tartaruga - Lento */}
            <div className="flex flex-col items-center">
              <div className={`text-3xl ${weightSpeed <= 0.4 ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                🐢
              </div>
              <span className="text-[11px] text-gray-500 mt-1">{getSlowLabel()}</span>
            </div>
            
            {/* Coelho - Médio */}
            <div className="flex flex-col items-center">
              <div className={`text-3xl ${weightSpeed > 0.4 && weightSpeed <= 1.0 ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                🐇
              </div>
              <span className="text-[11px] text-gray-500 mt-1">{getMediumLabel()}</span>
            </div>
            
            {/* Lebre/Guepardo - Rápido */}
            <div className="flex flex-col items-center">
              <div className={`text-3xl ${weightSpeed > 1.0 ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                🐆
              </div>
              <span className="text-[11px] text-gray-500 mt-1">{getFastLabel()}</span>
            </div>
          </div>

          {/* Slider */}
          <div className="relative mb-4">
            {/* Track background */}
            <div className="h-1.5 bg-gray-200 rounded-full relative">
              {/* Track filled */}
              <div 
                className="absolute h-full bg-black rounded-full transition-all duration-150"
                style={{ width: `${sliderPosition}%` }}
              />
            </div>
            
            {/* Slider thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-300 rounded-full shadow-md transition-all duration-150"
              style={{ left: `calc(${sliderPosition}% - 12px)` }}
            />
            
            {/* Input invisível */}
            <input
              type="range"
              min={minSpeed}
              max={maxSpeed}
              step={0.1}
              value={weightSpeed}
              onChange={(e) => setWeightSpeed(parseFloat(e.target.value))}
              className="absolute top-0 left-0 w-full h-6 opacity-0 cursor-pointer -mt-2.5"
            />
          </div>

          {/* Labels de velocidade */}
          <div className="flex justify-between px-2 mb-8">
            <span className="text-[14px] text-gray-500">0,1 kg</span>
            <span className="text-[14px] text-gray-500">0,8 kg</span>
            <span className="text-[14px] text-gray-500">1,5 kg</span>
          </div>

          {/* Badge Recomendado */}
          {isRecommended && (
            <div className="flex justify-center">
              <div className="bg-[#f5f5f5] px-6 py-3 rounded-full">
                <span className="text-[16px] font-medium text-black">Recomendado</span>
              </div>
            </div>
          )}

          {/* Aviso de saúde */}
          {weightSpeed > 1.0 && (
            <div className="flex justify-center mt-4">
              <p className="text-[13px] text-amber-600 text-center">
                ⚠️ Perder mais de 1kg por semana pode não ser saudável a longo prazo
              </p>
            </div>
          )}

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
