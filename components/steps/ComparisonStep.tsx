'use client';

import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';

export default function ComparisonStep() {
  const router = useRouter();
  const { nextStep, currentStep } = useQuizStore();

  const handleContinue = () => {
    nextStep();
    router.push(`/quiz/${currentStep + 1}`);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-4">
        <h1 className="text-[32px] md:text-[40px] font-bold text-black mb-3 leading-tight max-w-md mx-auto text-center">
          Lose duas vezes mais perda de peso com Dieta Calculada versus sozinho
        </h1>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="max-w-md mx-auto w-full">
          
          {/* Card de comparação */}
          <div className="bg-[#f5f5f5] rounded-[24px] p-6 md:p-8">
            
            {/* Barras de comparação */}
            <div className="flex justify-center gap-6 mb-6">
              
              {/* Sem Dieta Calculada */}
              <div className="flex flex-col items-center">
                <p className="text-[14px] md:text-[15px] font-semibold text-black mb-4 text-center">
                  Sem<br />Dieta Calculada
                </p>
                <div className="w-24 md:w-28 h-48 md:h-56 bg-white rounded-[16px] flex flex-col justify-end overflow-hidden">
                  {/* Barra cinza - 20% */}
                  <div className="bg-[#e5e5e5] h-[40%] rounded-b-[16px] flex items-center justify-center">
                    <span className="text-[18px] md:text-[20px] font-bold text-gray-600">20%</span>
                  </div>
                </div>
              </div>

              {/* Com Dieta Calculada */}
              <div className="flex flex-col items-center">
                <p className="text-[14px] md:text-[15px] font-semibold text-black mb-4 text-center">
                  Com<br />Dieta Calculada
                </p>
                <div className="w-24 md:w-28 h-48 md:h-56 bg-white rounded-[16px] flex flex-col justify-end overflow-hidden border-2 border-black">
                  {/* Barra preta - 2X */}
                  <div className="bg-[#1a1a1a] h-[75%] rounded-b-[14px] flex items-center justify-center">
                    <span className="text-[18px] md:text-[20px] font-bold text-white">2X</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Texto explicativo */}
            <p className="text-[15px] md:text-[16px] text-gray-500 text-center leading-relaxed">
              Dieta Calculada facilita e mantém<br />responsabilize você.
            </p>

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

