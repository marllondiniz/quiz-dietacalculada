'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import { useState, useRef, useEffect } from 'react';

export default function DesiredWeightStep() {
  const router = useRouter();
  const params = useParams();
  const currentStepFromUrl = parseInt(params.step as string, 10);
  const { updateAnswer, nextStep, answers } = useQuizStore();
  
  // Usar peso atual como referência para valor inicial
  const currentWeight = answers.weightKg || 70;
  const goal = answers.goal || 'perder';
  
  // Se objetivo é "manter", pular essa etapa
  useEffect(() => {
    if (goal === 'manter') {
      updateAnswer('desiredWeightKg', currentWeight);
      nextStep();
      router.replace(`/quiz/${currentStepFromUrl + 1}`);
    }
  }, [goal, currentWeight, currentStepFromUrl, nextStep, router, updateAnswer]);

  // Se for manter, não renderizar nada
  if (goal === 'manter') {
    return null;
  }
  
  // Valor inicial baseado no objetivo
  const getInitialWeight = () => {
    if (answers.desiredWeightKg) return answers.desiredWeightKg;
    if (goal === 'perder') return Math.max(40, currentWeight - 5);
    if (goal === 'ganhar') return Math.min(200, currentWeight + 5);
    return currentWeight;
  };
  
  const [desiredWeight, setDesiredWeight] = useState(getInitialWeight());
  const sliderRef = useRef<HTMLInputElement>(null);
  
  // Textos dinâmicos
  const getTitle = () => {
    if (goal === 'ganhar') return 'Qual é o seu peso ideal?';
    return 'Qual é o seu peso desejado?';
  };

  const getGoalText = () => {
    if (goal === 'ganhar') return 'Ganhar peso';
    return 'Perder peso';
  };

  // Validação do peso
  const isValidWeight = () => {
    if (goal === 'perder') return desiredWeight < currentWeight;
    if (goal === 'ganhar') return desiredWeight > currentWeight;
    return true;
  };

  const getValidationMessage = () => {
    if (goal === 'perder' && desiredWeight >= currentWeight) {
      return 'O peso desejado deve ser menor que o peso atual';
    }
    if (goal === 'ganhar' && desiredWeight <= currentWeight) {
      return 'O peso ideal deve ser maior que o peso atual';
    }
    return '';
  };

  const handleContinue = () => {
    if (!isValidWeight()) return;
    updateAnswer('desiredWeightKg', desiredWeight);
    nextStep();
    router.push(`/quiz/${currentStepFromUrl + 1}`);
  };

  // Gerar marcas do ruler
  const minWeight = 40;
  const maxWeight = 200;
  const marks = [];
  for (let i = minWeight; i <= maxWeight; i += 1) {
    marks.push(i);
  }

  const getMarkHeight = (mark: number) => {
    if (mark % 10 === 0) return 24; // Marcas principais
    if (mark % 5 === 0) return 16; // Marcas médias
    return 8; // Marcas pequenas
  };

  const getMarkColor = (mark: number) => {
    const distance = Math.abs(mark - desiredWeight);
    if (distance <= 0.5) return '#1a1a1a'; // Muito próximo
    if (distance <= 2) return '#6b7280'; // Próximo
    return '#d1d5db'; // Longe
  };

  const selectedPosition = ((desiredWeight - minWeight) / (maxWeight - minWeight)) * 100;
  const currentWeightPosition = ((currentWeight - minWeight) / (maxWeight - minWeight)) * 100;

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
          
          {/* Objetivo */}
          <div className="text-center mb-2">
            <p className="text-[16px] md:text-[17px] text-gray-600 font-medium">
              {getGoalText()}
            </p>
          </div>

          {/* Peso atual como referência */}
          <div className="text-center mb-4">
            <p className="text-[14px] text-gray-400">
              Peso atual: {currentWeight.toFixed(1)} kg
            </p>
          </div>

          {/* Valor do peso desejado */}
          <div className="text-center mb-10">
            <div className={`text-[56px] md:text-[64px] font-bold leading-none mb-1 ${isValidWeight() ? 'text-black' : 'text-red-500'}`}>
              {desiredWeight.toFixed(1)}
            </div>
            <div className="text-[20px] md:text-[22px] text-gray-500">
              kg
            </div>
          </div>

          {/* Mensagem de validação */}
          {!isValidWeight() && (
            <div className="text-center mb-4">
              <p className="text-[14px] text-red-500">
                {getValidationMessage()}
              </p>
            </div>
          )}

          {/* Ruler/Slider Container */}
          <div className="relative mb-8">
            {/* Ruler background with gradient */}
            <div className="relative h-20 overflow-hidden rounded-lg">
              {/* Gradient overlay */}
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, transparent 0%, transparent ${selectedPosition}%, #e5e7eb ${selectedPosition}%, #d1d5db 100%)`
                }}
              />
              
              {/* Marcador do peso atual */}
              <div
                className="absolute bottom-0 w-0.5 bg-blue-400 z-5"
                style={{
                  left: `${currentWeightPosition}%`,
                  transform: 'translateX(-50%)',
                  height: '100%',
                }}
              />
              
              {/* Ruler marks */}
              <div className="absolute inset-0 flex items-end px-2">
                {marks.filter((_, i) => i % 2 === 0).map((mark) => {
                  const position = ((mark - minWeight) / (maxWeight - minWeight)) * 100;
                  const height = getMarkHeight(mark);
                  const color = getMarkColor(mark);
                  
                  return (
                    <div
                      key={mark}
                      className="absolute bottom-0"
                      style={{ 
                        left: `${position}%`, 
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <div
                        className="transition-all duration-150"
                        style={{
                          width: '1px',
                          height: `${height}px`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              
              {/* Selected indicator line - vertical bar */}
              <div
                className={`absolute bottom-0 w-1 z-10 rounded-t ${isValidWeight() ? 'bg-[#1a1a1a]' : 'bg-red-500'}`}
                style={{
                  left: `${selectedPosition}%`,
                  transform: 'translateX(-50%)',
                  height: '32px',
                }}
              />
            </div>

            {/* Slider input - invisible overlay */}
            <input
              ref={sliderRef}
              type="range"
              min={minWeight}
              max={maxWeight}
              step={0.1}
              value={desiredWeight}
              onChange={(e) => setDesiredWeight(parseFloat(e.target.value))}
              className="absolute top-0 left-0 w-full h-20 opacity-0 cursor-pointer z-20"
              style={{ WebkitAppearance: 'none' }}
            />
          </div>

          {/* Diferença de peso */}
          {isValidWeight() && (
            <div className="text-center">
              <p className="text-[14px] text-gray-500">
                {goal === 'perder' ? 'Você vai perder' : 'Você vai ganhar'}{' '}
                <span className="font-semibold text-black">
                  {Math.abs(currentWeight - desiredWeight).toFixed(1)} kg
                </span>
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="px-6 pb-6 md:pb-8">
        <div className="max-w-md mx-auto w-full">
          <button
            onClick={handleContinue}
            disabled={!isValidWeight()}
            className={`w-full py-4 md:py-5 px-6 rounded-[16px] md:rounded-[20px] font-semibold text-[16px] md:text-[17px] transition-all duration-200 ${
              isValidWeight() 
                ? 'bg-[#1a1a1a] text-white active:bg-black hover:bg-gray-800' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
