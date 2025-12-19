'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import { useEffect, useState } from 'react';

export default function LoadingStep() {
  const router = useRouter();
  const params = useParams();
  const currentStepFromUrl = parseInt(params.step as string, 10);
  const { nextStep } = useQuizStore();
  const [progress, setProgress] = useState(0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  const tasks = [
    { label: 'Analisando seu perfil', icon: '👤' },
    { label: 'Calculando calorias', icon: '🔥' },
    { label: 'Definindo carboidratos', icon: '🍞' },
    { label: 'Calculando proteínas', icon: '🥩' },
    { label: 'Ajustando gorduras', icon: '🥑' },
    { label: 'Finalizando seu plano', icon: '✨' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            nextStep();
            router.push(`/quiz/${currentStepFromUrl + 1}`);
          }, 800);
          return 100;
        }
        
        // Atualiza a task baseado no progresso
        const taskIndex = Math.min(Math.floor(prev / 17), tasks.length - 1);
        setCurrentTaskIndex(taskIndex);
        
        // Velocidade variável para parecer mais natural
        const increment = prev < 30 ? 3 : prev < 70 ? 2 : prev < 90 ? 1.5 : 1;
        return Math.min(prev + increment, 100);
      });
    }, 60);

    return () => clearInterval(interval);
  }, [currentStepFromUrl, nextStep, router, tasks.length]);

  // Calcular valores do círculo de progresso
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-white to-gray-50">
      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <div className="max-w-md mx-auto w-full">
          
          {/* Círculo de progresso */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <svg className="w-44 h-44 md:w-52 md:h-52 -rotate-90" viewBox="0 0 160 160">
                {/* Círculo de fundo */}
                <circle 
                  cx="80" cy="80" r="70" 
                  fill="none" 
                  stroke="#f3f4f6" 
                  strokeWidth="8"
                />
                {/* Círculo de progresso com gradiente */}
                <circle 
                  cx="80" cy="80" r="70" 
                  fill="none" 
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-100 ease-out"
                />
                {/* Gradiente */}
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Porcentagem no centro */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[48px] md:text-[56px] font-bold text-black">
                  {Math.round(progress)}
                </span>
                <span className="text-[20px] text-gray-400 -mt-2">%</span>
              </div>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-[22px] md:text-[26px] font-bold text-black mb-2 text-center">
            Estamos configurando tudo para você
          </h1>
          
          {/* Task atual com animação */}
          <div className="flex items-center justify-center gap-2 mb-10">
            <span className="text-xl animate-bounce">{tasks[currentTaskIndex].icon}</span>
            <p className="text-[15px] md:text-[16px] text-gray-500">
              {tasks[currentTaskIndex].label}...
            </p>
          </div>

          {/* Lista de itens sendo calculados */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-[14px] font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Calculando para você
            </h3>
            <ul className="space-y-3">
              {tasks.map((task, index) => {
                const isCompleted = index < currentTaskIndex;
                const isCurrent = index === currentTaskIndex;
                
                return (
                  <li 
                    key={index}
                    className={`flex items-center gap-3 transition-all duration-300 ${
                      isCompleted ? 'opacity-100' : isCurrent ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    {/* Ícone de status */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500' 
                        : isCurrent 
                          ? 'bg-blue-500 animate-pulse' 
                          : 'bg-gray-200'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isCurrent ? (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      )}
                    </div>
                    
                    {/* Label */}
                    <span className={`text-[15px] transition-all duration-300 ${
                      isCompleted 
                        ? 'text-green-600 font-medium' 
                        : isCurrent 
                          ? 'text-black font-medium' 
                          : 'text-gray-400'
                    }`}>
                      {task.label}
                    </span>
                    
                    {/* Emoji */}
                    <span className={`ml-auto text-lg transition-all duration-300 ${
                      isCompleted || isCurrent ? 'opacity-100' : 'opacity-30'
                    }`}>
                      {task.icon}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Texto de segurança */}
          <p className="text-[12px] text-gray-400 text-center mt-6">
            🔒 Seus dados estão seguros e protegidos
          </p>

        </div>
      </div>
    </div>
  );
}
