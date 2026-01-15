'use client';

import React, { useEffect, useState } from 'react';
import ProgressBar from './ProgressBar';
import { useQuizStore } from '@/store/quizStore';
import { useRouter, useParams } from 'next/navigation';
import { useQuizProgress } from '@/hooks/useQuizProgress';

interface QuizLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

export default function QuizLayout({
  children,
  showBackButton = true,
}: QuizLayoutProps) {
  const { currentStep, totalSteps, previousStep } = useQuizStore();
  const router = useRouter();
  const params = useParams();
  const stepFromUrl = parseInt(params.step as string, 10);
  
  // Salvamento progressivo com debounce otimizado
  useQuizProgress();
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(stepFromUrl);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Reset animation when step changes
  useEffect(() => {
    // Detectar direção
    if (stepFromUrl > animationKey) {
      setDirection('forward');
    } else if (stepFromUrl < animationKey) {
      setDirection('backward');
    }

    setIsAnimating(false);
    
    // Delay para reset
    const timeout = setTimeout(() => {
      setAnimationKey(stepFromUrl);
      setIsAnimating(true);
    }, 50);
    
    return () => clearTimeout(timeout);
  }, [stepFromUrl, animationKey]);

  const handleBack = () => {
    previousStep();
    router.push(`/quiz/${currentStep - 1}`);
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col overflow-hidden">
      {/* Header com logo e progress bar */}
      <div className="flex-shrink-0 px-5 md:px-6 pt-2 md:pt-4 pb-2 md:pb-4 z-10 bg-white">
        <div className="max-w-lg mx-auto">
          {/* Logo centralizada */}
          <div className="flex justify-center mb-2 md:mb-4">
            <img 
              src="/cropped-principal.png" 
              alt="Dieta Calculada" 
              className="w-20 h-20 md:w-36 md:h-36 object-contain"
            />
          </div>
          
          {/* Botão voltar e progress bar */}
          <div className="flex items-center gap-3 md:gap-4 relative">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="absolute left-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 active:scale-95"
                aria-label="Voltar"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            
            <div className={`flex-1 ${showBackButton ? 'pl-11 md:pl-14' : ''}`}>
              <ProgressBar current={currentStep + 1} total={totalSteps} />
            </div>
          </div>
        </div>
      </div>

      {/* Content with improved animation */}
      <div className="flex-1 overflow-hidden relative">
        <div 
          key={animationKey}
          className="h-full w-full absolute inset-0"
          style={{
            opacity: isAnimating ? 1 : 0,
            transform: isAnimating 
              ? 'translateX(0) scale(1)' 
              : direction === 'forward' 
                ? 'translateX(30px) scale(0.98)' 
                : 'translateX(-30px) scale(0.98)',
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
