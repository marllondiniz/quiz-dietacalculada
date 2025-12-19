'use client';

import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import { useEffect, useState } from 'react';

export default function ComparisonStep() {
  const router = useRouter();
  const { nextStep, currentStep } = useQuizStore();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 300);
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
          87% de sucesso com Dieta Calculada
        </h1>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="max-w-md mx-auto w-full">
          
          {/* Card de comparação */}
          <div className="bg-gradient-to-br from-[#f8f9fa] to-[#f0f1f3] rounded-[28px] p-8 md:p-10 shadow-lg">
            
            {/* Barras de comparação */}
            <div className="flex justify-center gap-8 md:gap-12 mb-8">
              
              {/* Sem Dieta Calculada */}
              <div className="flex flex-col items-center">
                <p className="text-[15px] md:text-[16px] font-bold text-gray-700 mb-5 text-center leading-tight">
                  Sem<br />Dieta Calculada
                </p>
                <div className="relative w-28 md:w-32 h-56 md:h-64 bg-white rounded-[20px] flex flex-col justify-end overflow-hidden shadow-md border border-gray-200">
                  {/* Barra cinza - 35% de progresso */}
                  <div 
                    className="bg-gradient-to-t from-[#d1d5db] to-[#e5e7eb] rounded-b-[20px] flex flex-col items-center justify-center transition-all duration-1200 ease-out relative"
                    style={{
                      height: animate ? '35%' : '0%',
                    }}
                  >
                    <span 
                      className={`text-[28px] md:text-[32px] font-bold text-gray-600 transition-opacity duration-500 ${animate ? 'opacity-100' : 'opacity-0'}`}
                      style={{ transitionDelay: '900ms' }}
                    >
                      35%
                    </span>
                    {/* Efeito de brilho */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-50" />
                  </div>
                </div>
                <p className="text-[13px] md:text-[14px] text-gray-500 mt-3 font-medium">Taxa de sucesso</p>
              </div>

              {/* Com Dieta Calculada */}
              <div className="flex flex-col items-center">
                <p className="text-[15px] md:text-[16px] font-bold text-black mb-5 text-center leading-tight">
                  Com<br />Dieta Calculada
                </p>
                <div className="relative w-28 md:w-32 h-56 md:h-64 bg-white rounded-[20px] flex flex-col justify-end overflow-hidden shadow-xl border-2 border-black">
                  {/* Barra preta - 87% de progresso */}
                  <div 
                    className="bg-gradient-to-t from-black via-[#1a1a1a] to-[#2a2a2a] rounded-b-[18px] flex flex-col items-center justify-center transition-all duration-1200 ease-out relative overflow-hidden"
                    style={{
                      height: animate ? '87%' : '0%',
                    }}
                  >
                    <span 
                      className={`text-[36px] md:text-[40px] font-bold text-white transition-opacity duration-500 relative z-10 ${animate ? 'opacity-100' : 'opacity-0'}`}
                      style={{ transitionDelay: '900ms' }}
                    >
                      87%
                    </span>
                    {/* Efeito de brilho animado */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent opacity-50" />
                    <div 
                      className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-1000 ${animate ? 'translate-x-full' : '-translate-x-full'}`}
                      style={{ transitionDelay: '1200ms' }}
                    />
                  </div>
                </div>
                <p className="text-[13px] md:text-[14px] text-black mt-3 font-bold">Taxa de sucesso</p>
              </div>

            </div>

            {/* Texto explicativo com ícone */}
            <div className="bg-white/60 rounded-[20px] p-5 backdrop-blur-sm border border-green-100">
              <div className="flex items-start gap-3 justify-center">
                <span className="text-[20px] flex-shrink-0 mt-0.5">✅</span>
                <p className="text-[15px] md:text-[16px] text-gray-700 text-center leading-relaxed font-medium">
                  Plano personalizado + acompanhamento profissional =<br /><span className="text-black font-bold">2.5x mais chances de alcançar seu objetivo</span>
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="px-6 pb-6 md:pb-8">
        <div className="max-w-md mx-auto w-full">
          <button
            onClick={handleContinue}
            className="w-full py-4 md:py-5 px-6 rounded-[16px] md:rounded-[20px] font-semibold text-[16px] md:text-[17px] transition-all duration-200 bg-[#1a1a1a] text-white active:bg-black hover:bg-gray-800"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

