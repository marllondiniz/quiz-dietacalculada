'use client';

import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';
import { useEffect, useState } from 'react';

export default function LongTermResultsStep() {
  const router = useRouter();
  const { nextStep, currentStep } = useQuizStore();
  const [isAnimated, setIsAnimated] = useState(false);
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    // Iniciar animação após montar
    const timer = setTimeout(() => setIsAnimated(true), 100);
    // Habilitar botão após 2.5 segundos
    const enableButton = setTimeout(() => setCanContinue(true), 2500);
    return () => {
      clearTimeout(timer);
      clearTimeout(enableButton);
    };
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
          Dieta Calculada cria resultados a longo prazo
        </h1>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="max-w-md mx-auto w-full">
          {/* Gráfico */}
          <div className="bg-white rounded-[20px] p-5 mb-4 shadow-sm border border-gray-100">
            <div className="mb-3">
              <p className="text-[13px] md:text-[14px] text-gray-500 mb-3 font-medium">Seu peso</p>
              
              {/* SVG do gráfico com animação melhorada */}
              <svg viewBox="0 0 340 200" className="w-full h-auto">
                <defs>
                  {/* Gradiente para a linha vermelha */}
                  <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff6b6b" stopOpacity="1"/>
                    <stop offset="100%" stopColor="#ee5a6f" stopOpacity="1"/>
                  </linearGradient>
                  
                  {/* Gradiente para a linha preta */}
                  <linearGradient id="blackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2d2d2d" stopOpacity="1"/>
                    <stop offset="100%" stopColor="#1a1a1a" stopOpacity="1"/>
                  </linearGradient>
                  
                  {/* Sombra para as linhas */}
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/>
                  </filter>
                  
                  {/* Definição das animações */}
                  <style>
                    {`
                      .line-red {
                        stroke-dasharray: 500;
                        stroke-dashoffset: ${isAnimated ? '0' : '500'};
                        transition: stroke-dashoffset 2.5s cubic-bezier(0.65, 0, 0.35, 1);
                      }
                      .line-black {
                        stroke-dasharray: 500;
                        stroke-dashoffset: ${isAnimated ? '0' : '500'};
                        transition: stroke-dashoffset 2.5s cubic-bezier(0.65, 0, 0.35, 1) 0.4s;
                      }
                      .point {
                        opacity: ${isAnimated ? '1' : '0'};
                        transform: ${isAnimated ? 'scale(1)' : 'scale(0)'};
                        transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 2s;
                      }
                      .point-end {
                        opacity: ${isAnimated ? '1' : '0'};
                        transform: ${isAnimated ? 'scale(1)' : 'scale(0)'};
                        transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 2.5s;
                      }
                      .label {
                        opacity: ${isAnimated ? '1' : '0'};
                        transition: opacity 0.6s ease-out 1.5s;
                      }
                      .badge {
                        opacity: ${isAnimated ? '1' : '0'};
                        transform: ${isAnimated ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.95)'};
                        transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 2s;
                      }
                    `}
                  </style>
                </defs>

                {/* Grid lines com estilo melhorado */}
                <line x1="30" y1="50" x2="310" y2="50" stroke="#f0f0f0" strokeWidth="1"/>
                <line x1="30" y1="90" x2="310" y2="90" stroke="#f0f0f0" strokeWidth="1"/>
                <line x1="30" y1="130" x2="310" y2="130" stroke="#f0f0f0" strokeWidth="1"/>
                
                {/* Linha vermelha - Dieta tradicional com sombra */}
                <path 
                  className="line-red"
                  d="M 30,50 Q 90,110 150,90 Q 210,70 310,30" 
                  fill="none" 
                  stroke="url(#redGradient)" 
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#shadow)"
                />
                
                {/* Linha preta - Dieta Calculada com sombra */}
                <path 
                  className="line-black"
                  d="M 30,50 Q 100,65 170,85 Q 240,105 300,125" 
                  fill="none" 
                  stroke="url(#blackGradient)" 
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#shadow)"
                />
                
                {/* Ponto inicial com animação */}
                <g className="point">
                  <circle cx="30" cy="50" r="7" fill="#1a1a1a"/>
                  <circle cx="30" cy="50" r="5" fill="white" opacity="0.3"/>
                </g>
                
                {/* Ponto final Dieta Calculada com animação */}
                <g className="point-end">
                  <circle cx="300" cy="125" r="7" fill="#1a1a1a"/>
                  <circle cx="300" cy="125" r="5" fill="white" opacity="0.3"/>
                </g>
                
                {/* Ponto final Dieta Tradicional (vermelho) */}
                <g className="point-end">
                  <circle cx="310" cy="30" r="6" fill="#ff6b6b"/>
                  <circle cx="310" cy="30" r="4" fill="white" opacity="0.4"/>
                </g>
                
                {/* Label Dieta tradicional */}
                <text className="label" x="250" y="25" fontSize="11" fill="#ff6b6b" textAnchor="middle" fontWeight="600">
                  Dieta tradicional
                </text>
                
                {/* Badge Dieta Calculada melhorado */}
                <g className="badge" transform="translate(130, 100)">
                  <rect x="0" y="0" width="140" height="28" rx="14" fill="#1a1a1a" filter="url(#shadow)"/>
                  <rect x="1" y="1" width="138" height="26" rx="13" fill="#2d2d2d"/>
                  <text x="18" y="18" fontSize="11" fill="white" fontWeight="700">
                    🍎 Dieta Calculada
                  </text>
                </g>
                
                {/* Eixo X labels */}
                <text className="label" x="30" y="175" fontSize="12" fill="#999" textAnchor="start" fontWeight="500">Mês 1</text>
                <text className="label" x="300" y="175" fontSize="12" fill="#999" textAnchor="end" fontWeight="500">Mês 6</text>
                
                {/* Label "Peso" vertical */}
                <text className="label" x="10" y="100" fontSize="10" fill="#aaa" textAnchor="middle" transform="rotate(-90, 10, 100)" fontWeight="500">Peso</text>
              </svg>
            </div>
            
            <p className={`text-[13px] md:text-[14px] text-center text-gray-700 leading-snug transition-opacity duration-500 ${isAnimated ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '2.5s' }}>
              80% dos usuários do Dieta Calculada mantêm seu resultado mesmo 6 meses depois
            </p>
          </div>
        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="px-6 pb-6 md:pb-8">
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
            {canContinue ? 'Continuar' : 'Aguarde...'}
          </SafeNavigationButton>
        </div>
      </div>
    </div>
  );
}

