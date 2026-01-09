'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';
import { useState, useRef, useEffect } from 'react';

export default function DesiredWeightStep() {
  const router = useRouter();
  const params = useParams();
  const currentStepFromUrl = parseInt(params.step as string, 10);
  const { updateAnswer, nextStep, answers } = useQuizStore();
  
  const currentWeight = answers.weightKg || 70;
  const goal = answers.goal || 'perder';
  
  useEffect(() => {
    if (goal === 'manter') {
      updateAnswer('desiredWeightKg', currentWeight);
      nextStep();
      router.replace(`/quiz/${currentStepFromUrl + 1}`);
    }
  }, [goal, currentWeight, currentStepFromUrl, nextStep, router, updateAnswer]);

  if (goal === 'manter') {
    return null;
  }
  
  const getInitialWeight = () => {
    if (answers.desiredWeightKg) return answers.desiredWeightKg;
    if (goal === 'perder') return Math.max(40, currentWeight - 5);
    if (goal === 'ganhar') return Math.min(200, currentWeight + 5);
    return currentWeight;
  };
  
  const [desiredWeight, setDesiredWeight] = useState(getInitialWeight());
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  
  const minWeight = 40;
  const maxWeight = 200;

  const getTitle = () => {
    if (goal === 'ganhar') return 'Qual é o seu peso ideal?';
    return 'Qual é o seu peso desejado?';
  };

  const getGoalText = () => {
    if (goal === 'ganhar') return 'Ganhar peso';
    return 'Perder peso';
  };

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

  // Função para calcular peso baseado na posição X
  const calculateWeightFromPosition = (clientX: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const weight = minWeight + (percentage * (maxWeight - minWeight));
    
    setDesiredWeight(Math.round(weight * 10) / 10);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    calculateWeightFromPosition(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      calculateWeightFromPosition(e.clientX);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    calculateWeightFromPosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging.current) {
      e.preventDefault();
      calculateWeightFromPosition(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // Gerar marcas do ruler
  const marks = [];
  for (let i = minWeight; i <= maxWeight; i += 1) {
    marks.push(i);
  }

  const getMarkHeight = (mark: number) => {
    if (mark % 10 === 0) return 24;
    if (mark % 5 === 0) return 16;
    return 8;
  };

  const getMarkColor = (mark: number) => {
    const distance = Math.abs(mark - desiredWeight);
    if (distance <= 0.5) return '#1a1a1a';
    if (distance <= 2) return '#6b7280';
    return '#d1d5db';
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
            <div className={`text-[56px] md:text-[64px] font-bold leading-none mb-1 transition-colors duration-200 ${isValidWeight() ? 'text-black' : 'text-red-500'}`}>
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

          {/* Ruler/Slider Container - COM DRAG */}
          <div className="relative mb-8 select-none">
            <div 
              ref={sliderRef}
              className="relative h-24 md:h-20 overflow-visible rounded-lg bg-gray-50 cursor-pointer active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'none' }}
            >
              {/* Gradient overlay */}
              <div 
                className="absolute inset-0 rounded-lg pointer-events-none"
                style={{
                  background: `linear-gradient(to right, transparent 0%, transparent ${selectedPosition}%, #e5e7eb ${selectedPosition}%, #d1d5db 100%)`
                }}
              />
              
              {/* Marcador do peso atual */}
              <div
                className="absolute bottom-0 w-0.5 bg-blue-400 pointer-events-none"
                style={{
                  left: `${currentWeightPosition}%`,
                  transform: 'translateX(-50%)',
                  height: '100%',
                  zIndex: 5,
                }}
              />
              
              {/* Ruler marks */}
              <div className="absolute inset-0 flex items-end px-2 pointer-events-none">
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
                          width: '2px',
                          height: `${height}px`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              
              {/* Selected indicator line com thumb */}
              <div
                className="absolute bottom-0 flex flex-col items-center pointer-events-none transition-all duration-100"
                style={{
                  left: `${selectedPosition}%`,
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                }}
              >
                {/* Linha vertical */}
                <div 
                  className={`w-1 rounded-t transition-colors duration-200 ${isValidWeight() ? 'bg-[#FF911A]' : 'bg-red-500'}`}
                  style={{ height: '32px' }}
                />
                {/* Thumb (bolinha) */}
                <div 
                  className={`w-7 h-7 rounded-full shadow-lg -mt-1 transition-all duration-200 ${
                    isValidWeight() ? 'bg-[#FF911A]' : 'bg-red-500'
                  } ${isDragging.current ? 'scale-110' : 'scale-100'}`}
                />
              </div>
            </div>

            {/* Instruções */}
            <p className="text-[12px] text-gray-400 text-center mt-3">
              👆 Arraste ou toque para ajustar
            </p>
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
          <SafeNavigationButton
            onClick={handleContinue}
            disabled={!isValidWeight()}
            className={`w-full py-4 md:py-5 px-6 rounded-[16px] md:rounded-[20px] font-semibold text-[16px] md:text-[17px] transition-all duration-200 ${
              isValidWeight() 
                ? 'bg-[#FF911A] text-white active:scale-[0.98] hover:bg-[#FF911A]/90' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continuar
          </SafeNavigationButton>
        </div>
      </div>
    </div>
  );
}
