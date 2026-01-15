'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';

export default function BirthDateStep() {
  const router = useRouter();
  const { updateAnswer, nextStep, currentStep, answers } = useQuizStore();
  
  const [day, setDay] = useState(answers.birthDate?.getDate() || 15);
  const [month, setMonth] = useState(
    answers.birthDate?.getMonth() !== undefined
      ? answers.birthDate.getMonth() + 1
      : 6
  );
  const [year, setYear] = useState(answers.birthDate?.getFullYear() || 2000);

  const months = [
    { value: 1, label: 'Janeiro', short: 'Jan' },
    { value: 2, label: 'Fevereiro', short: 'Fev' },
    { value: 3, label: 'Março', short: 'Mar' },
    { value: 4, label: 'Abril', short: 'Abr' },
    { value: 5, label: 'Maio', short: 'Mai' },
    { value: 6, label: 'Junho', short: 'Jun' },
    { value: 7, label: 'Julho', short: 'Jul' },
    { value: 8, label: 'Agosto', short: 'Ago' },
    { value: 9, label: 'Setembro', short: 'Set' },
    { value: 10, label: 'Outubro', short: 'Out' },
    { value: 11, label: 'Novembro', short: 'Nov' },
    { value: 12, label: 'Dezembro', short: 'Dez' },
  ];

  const daysInMonth = new Date(year, month, 0).getDate();
  const currentYear = new Date().getFullYear();

  const handleDayChange = (delta: number) => {
    setDay(prev => {
      const newDay = prev + delta;
      if (newDay < 1) return daysInMonth;
      if (newDay > daysInMonth) return 1;
      return newDay;
    });
  };

  const handleMonthChange = (delta: number) => {
    setMonth(prev => {
      const newMonth = prev + delta;
      if (newMonth < 1) return 12;
      if (newMonth > 12) return 1;
      return newMonth;
    });
  };

  const handleYearChange = (delta: number) => {
    setYear(prev => Math.max(1920, Math.min(currentYear - 10, prev + delta)));
  };

  // Calcular idade
  const age = currentYear - year;

  const handleContinue = () => {
    const birthDate = new Date(year, month - 1, Math.min(day, daysInMonth));
    updateAnswer('birthDate', birthDate);
    // Também salvar a idade calculada
    updateAnswer('age', age);
    console.log('📅 Salvando data de nascimento e idade:', { birthDate, age });
    nextStep();
    router.push(`/quiz/${currentStep + 1}`);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-5 md:px-6 pt-3 md:pt-4">
        <h1 className="text-[24px] md:text-[40px] font-bold text-black mb-2 md:mb-3 leading-tight max-w-md mx-auto text-center">
          Quando você nasceu?
        </h1>
      </div>

      {/* Conteúdo com scroll */}
      <div className="flex-1 overflow-y-auto px-5 md:px-6 py-4 md:py-6">
        <div className="max-w-md mx-auto w-full">
          
          {/* Data selecionada em destaque */}
          <div className="text-center mb-5 md:mb-8">
            <div className="text-[16px] md:text-[20px] text-gray-500 mb-2">Sua data de nascimento</div>
            <div className="text-[24px] md:text-[36px] font-bold text-black">
              {day} de {months[month - 1].label} de {year}
            </div>
            <div className="text-[14px] md:text-[16px] text-gray-500 mt-1 md:mt-2">
              {age} anos
            </div>
          </div>

          {/* Seletores */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            
            {/* Dia */}
            <div className="bg-[#f5f5f5] rounded-[12px] md:rounded-[16px] p-3 md:p-4">
              <label className="block text-[11px] md:text-[12px] font-medium text-gray-500 mb-2 md:mb-3 text-center uppercase tracking-wide">
                Dia
              </label>
              
              <div className="flex flex-col items-center gap-1.5 md:gap-2">
                <button
                  onClick={() => handleDayChange(1)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                  </svg>
                </button>

                <span className="text-[28px] md:text-[32px] font-bold text-black leading-none py-1 md:py-2">
                  {day.toString().padStart(2, '0')}
                </span>

                <button
                  onClick={() => handleDayChange(-1)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mês */}
            <div className="bg-[#f5f5f5] rounded-[12px] md:rounded-[16px] p-3 md:p-4">
              <label className="block text-[11px] md:text-[12px] font-medium text-gray-500 mb-2 md:mb-3 text-center uppercase tracking-wide">
                Mês
              </label>
              
              <div className="flex flex-col items-center gap-1.5 md:gap-2">
                <button
                  onClick={() => handleMonthChange(1)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                  </svg>
                </button>

                <span className="text-[20px] md:text-[28px] font-bold text-black leading-none py-1 md:py-2">
                  {months[month - 1].short}
                </span>

                <button
                  onClick={() => handleMonthChange(-1)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Ano */}
            <div className="bg-[#f5f5f5] rounded-[12px] md:rounded-[16px] p-3 md:p-4">
              <label className="block text-[11px] md:text-[12px] font-medium text-gray-500 mb-2 md:mb-3 text-center uppercase tracking-wide">
                Ano
              </label>
              
              <div className="flex flex-col items-center gap-1.5 md:gap-2">
                <button
                  onClick={() => handleYearChange(1)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                  </svg>
                </button>

                <span className="text-[24px] md:text-[32px] font-bold text-black leading-none py-1 md:py-2">
                  {year}
                </span>

                <button
                  onClick={() => handleYearChange(-1)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

          </div>

          {/* Slider para ano (ajuste rápido) */}
          <div className="mt-4 md:mt-6 bg-[#f5f5f5] rounded-[12px] md:rounded-[16px] p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] md:text-[12px] text-gray-500">Ajuste rápido do ano</span>
              <span className="text-[13px] md:text-[14px] font-semibold text-black">{year}</span>
            </div>
            <input
              type="range"
              min="1920"
              max={currentYear - 10}
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #1a1a1a 0%, #1a1a1a ${((year - 1920) / (currentYear - 10 - 1920)) * 100}%, #d1d5db ${((year - 1920) / (currentYear - 10 - 1920)) * 100}%, #d1d5db 100%)`
              }}
            />
            <div className="flex justify-between mt-2 text-[10px] md:text-[11px] text-gray-400">
              <span>1920</span>
              <span>{currentYear - 10}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="flex-shrink-0 px-5 md:px-6 pb-5 md:pb-8 bg-white">
        <div className="max-w-md mx-auto w-full">
          <SafeNavigationButton
            onClick={handleContinue}
            className="w-full py-3.5 md:py-5 px-6 rounded-[14px] md:rounded-[20px] font-semibold text-[15px] md:text-[17px] transition-all duration-200 bg-[#FF911A] text-white active:bg-[#FF911A]/90 hover:bg-[#FF911A]/90"
          >
            Continuar
          </SafeNavigationButton>
        </div>
      </div>
    </div>
  );
}
