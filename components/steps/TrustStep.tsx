'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import { useEffect, useState } from 'react';

export default function TrustStep() {
  const router = useRouter();
  const params = useParams();
  const currentStepFromUrl = parseInt(params.step as string, 10);
  const { nextStep } = useQuizStore();
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    nextStep();
    router.push(`/quiz/${currentStepFromUrl + 1}`);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <div className="max-w-md mx-auto w-full text-center">
          
          {/* Ilustração com imagem */}
          <div 
            className="relative w-48 h-48 md:w-56 md:h-56 mx-auto mb-8 transition-all duration-700"
            style={{
              opacity: isAnimated ? 1 : 0,
              transform: isAnimated ? 'scale(1)' : 'scale(0.8)'
            }}
          >
            {/* Círculos de fundo animados */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 animate-pulse" 
                 style={{ animationDuration: '3s' }} />
            <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-white to-gray-50" />
            
            {/* Círculo interno com imagem */}
            <div className="absolute inset-6 rounded-full bg-white shadow-inner flex items-center justify-center overflow-hidden">
              <img 
                src="/maos.png" 
                alt="Aperto de mãos" 
                className="w-full h-full object-contain p-4"
              />
            </div>
            
            {/* Sparkles decorativos */}
            <div className={`absolute top-2 left-4 w-2 h-2 bg-yellow-400 rounded-full ${isAnimated ? 'animate-pulse' : ''}`} />
            <div className={`absolute top-4 right-6 w-1.5 h-1.5 bg-pink-400 rounded-full ${isAnimated ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.5s' }} />
            <div className={`absolute bottom-6 left-2 w-1.5 h-1.5 bg-blue-400 rounded-full ${isAnimated ? 'animate-pulse' : ''}`} style={{ animationDelay: '1s' }} />
            <div className={`absolute bottom-4 right-4 w-2 h-2 bg-green-400 rounded-full ${isAnimated ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.3s' }} />
          </div>

          {/* Título */}
          <h1 
            className="text-[28px] md:text-[34px] font-bold text-black mb-3 leading-tight transition-all duration-500"
            style={{
              opacity: isAnimated ? 1 : 0,
              transform: isAnimated ? 'translateY(0)' : 'translateY(10px)',
              transitionDelay: '200ms'
            }}
          >
            Obrigado por confiar em nós 💚
          </h1>
          
          {/* Subtítulo */}
          <p 
            className="text-[15px] md:text-[16px] text-gray-500 mb-8 transition-all duration-500"
            style={{
              opacity: isAnimated ? 1 : 0,
              transform: isAnimated ? 'translateY(0)' : 'translateY(10px)',
              transitionDelay: '300ms'
            }}
          >
            Agora vamos personalizar o Dieta Calculada para você...
          </p>

          {/* Card de privacidade */}
          <div 
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-100 transition-all duration-500"
            style={{
              opacity: isAnimated ? 1 : 0,
              transform: isAnimated ? 'translateY(0)' : 'translateY(10px)',
              transitionDelay: '400ms'
            }}
          >
            {/* Ícone de escudo/cadeado */}
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M12 2L4 6V12C4 16.42 7.45 20.35 12 22C16.55 20.35 20 16.42 20 12V6L12 2Z" 
                  stroke="white" 
                  strokeWidth="2" 
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path 
                  d="M9 12L11 14L15 10" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            <h3 className="text-[15px] md:text-[16px] font-semibold text-black mb-2">
              Sua privacidade e segurança importam para nós
            </h3>
            <p className="text-[13px] md:text-[14px] text-gray-500 leading-relaxed">
              Prometemos sempre manter suas informações pessoais privadas e seguras.
            </p>
          </div>

        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="px-6 pb-6 md:pb-8">
        <div className="max-w-md mx-auto w-full">
          <button
            onClick={handleContinue}
            className="w-full py-4 md:py-5 px-6 rounded-2xl font-semibold text-[16px] md:text-[17px] transition-all duration-200 bg-[#1a1a1a] text-white active:scale-[0.98] hover:bg-gray-800"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
