'use client';

import React, { useEffect, useState } from 'react';
import ProgressBar from './ProgressBar';
import { useQuizStore } from '@/store/quizStore';
import { useRouter, useParams } from 'next/navigation';

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
  
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationKey, setAnimationKey] = useState(stepFromUrl);

  // Reset animation when step changes
  useEffect(() => {
    setIsAnimating(false);
    // Small delay to reset animation
    const timeout = setTimeout(() => {
      setAnimationKey(stepFromUrl);
      setIsAnimating(true);
    }, 50);
    
    return () => clearTimeout(timeout);
  }, [stepFromUrl]);

  const handleBack = () => {
    previousStep();
    router.push(`/quiz/${currentStep - 1}`);
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Header com progress bar */}
      <div className="flex-shrink-0 px-4 md:px-6 pt-3 md:pt-4 pb-2">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          {showBackButton ? (
            <button
              onClick={handleBack}
              className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all duration-200 active:scale-95"
              aria-label="Voltar"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          ) : (
            <div className="w-10 md:w-11"></div>
          )}
          <div className="flex-1">
            <ProgressBar current={currentStep + 1} total={totalSteps} />
          </div>
        </div>
      </div>

      {/* Content with animation */}
      <div className="flex-1 overflow-hidden">
        <div 
          key={animationKey}
          className={`h-full transition-all duration-300 ${
            isAnimating 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 translate-x-4'
          }`}
          style={{
            animation: isAnimating ? 'pageEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
