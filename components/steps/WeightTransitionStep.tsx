'use client';

import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';
import { useEffect, useState } from 'react';

export default function WeightTransitionStep() {
  const router = useRouter();
  const { nextStep, currentStep } = useQuizStore();
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    nextStep();
    router.push(`/quiz/${currentStep + 1}`);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-4">
        <h1 className="text-[32px] md:text-[40px] font-bold text-black mb-3 leading-tight max-w-md mx-auto text-center">
          Você tem grande potencial para alcançar sua meta
        </h1>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="max-w-md mx-auto w-full">
          
          {/* Card do gráfico */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
            
            {/* Título do gráfico */}
            <h2 className="text-[18px] md:text-[20px] font-semibold text-black mb-6">
              Transição do seu peso
            </h2>

            {/* Gráfico SVG */}
            <div className="relative mb-4">
              <svg viewBox="0 0 320 180" className="w-full h-auto">
                {/* Linha pontilhada horizontal */}
                <line 
                  x1="30" y1="60" x2="290" y2="60" 
                  stroke="#e5e5e5" 
                  strokeWidth="1" 
                  strokeDasharray="4 4"
                />
                
                {/* Área preenchida */}
                <path
                  d={isAnimated 
                    ? "M30 140 Q80 135 110 120 Q160 100 180 80 Q240 40 280 30 L280 140 Z"
                    : "M30 140 Q80 140 110 140 Q160 140 180 140 Q240 140 280 140 L280 140 Z"
                  }
                  fill="url(#gradient)"
                  className="transition-all duration-1000 ease-out"
                />
                
                {/* Linha da curva */}
                <path
                  d={isAnimated 
                    ? "M30 140 Q80 135 110 120 Q160 100 180 80 Q240 40 280 30"
                    : "M30 140 Q80 140 110 140 Q160 140 180 140 Q240 140 280 140"
                  }
                  fill="none"
                  stroke="#e5a96c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                
                {/* Linha base */}
                <line x1="30" y1="140" x2="290" y2="140" stroke="#1a1a1a" strokeWidth="1.5"/>
                
                {/* Pontos */}
                {/* 3 Dias */}
                <circle
                  cx="70"
                  cy={isAnimated ? "132" : "140"}
                  r="8"
                  fill="white"
                  stroke="#e5a96c"
                  strokeWidth="2"
                  className="transition-all duration-1000 ease-out delay-200"
                />
                
                {/* 7 Dias */}
                <circle
                  cx="150"
                  cy={isAnimated ? "110" : "140"}
                  r="8"
                  fill="white"
                  stroke="#e5a96c"
                  strokeWidth="2"
                  className="transition-all duration-1000 ease-out delay-400"
                />
                
                {/* 30 Dias */}
                <circle
                  cx="230"
                  cy={isAnimated ? "55" : "140"}
                  r="8"
                  fill="white"
                  stroke="#e5a96c"
                  strokeWidth="2"
                  className="transition-all duration-1000 ease-out delay-600"
                />
                
                {/* Troféu */}
                <g transform={`translate(270, ${isAnimated ? '15' : '130'})`} className="transition-all duration-1000 ease-out delay-700">
                  <circle cx="0" cy="0" r="16" fill="#e5a96c"/>
                  <text x="0" y="5" textAnchor="middle" fill="white" fontSize="14">🏆</text>
                </g>
                
                {/* Labels */}
                <text x="70" y="165" textAnchor="middle" fill="#666" fontSize="12" fontWeight="500">3 Dias</text>
                <text x="150" y="165" textAnchor="middle" fill="#666" fontSize="12" fontWeight="500">7 Dias</text>
                <text x="230" y="165" textAnchor="middle" fill="#666" fontSize="12" fontWeight="500">30 Dias</text>
                
                {/* Gradiente */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#e5a96c" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#e5a96c" stopOpacity="0.05"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Texto explicativo */}
            <p className="text-[14px] md:text-[15px] text-gray-500 leading-relaxed">
              Com base nos dados históricos do Dieta Calculada, peso a perda geralmente demora no início, mas após 7 dias, você pode queimar gordura como nunca!
            </p>

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

