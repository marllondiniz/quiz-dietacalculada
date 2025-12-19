'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import { useMemo, useEffect, useState } from 'react';

export default function PlanReadyStep() {
  const router = useRouter();
  const params = useParams();
  const currentStepFromUrl = parseInt(params.step as string, 10);
  const { nextStep, answers } = useQuizStore();
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Cálculos baseados nas respostas do quiz
  const calculations = useMemo(() => {
    const weight = answers.weightKg || 70;
    const desiredWeight = answers.desiredWeightKg || weight;
    const heightCm = answers.heightCm || 170;
    const gender = answers.gender || 'masculino';
    const goal = answers.goal || 'perder';
    const workouts = answers.workoutsPerWeek || '0-2';
    const weightSpeed = answers.weightSpeedPerWeek || 0.8;

    // Calcular idade a partir da data de nascimento
    let age = 30;
    if (answers.birthDate) {
      const today = new Date();
      const birth = new Date(answers.birthDate);
      age = today.getFullYear() - birth.getFullYear();
    }

    // TMB (Taxa Metabólica Basal) - Fórmula de Mifflin-St Jeor
    let tmb: number;
    if (gender === 'feminino') {
      tmb = (10 * weight) + (6.25 * heightCm) - (5 * age) - 161;
    } else {
      tmb = (10 * weight) + (6.25 * heightCm) - (5 * age) + 5;
    }

    // Fator de atividade
    let activityFactor = 1.2;
    if (workouts === '3-5') activityFactor = 1.55;
    if (workouts === '6+') activityFactor = 1.725;

    // TDEE (Gasto Energético Total Diário)
    let tdee = tmb * activityFactor;

    // Ajuste baseado no objetivo
    if (goal === 'perder') {
      tdee -= 500;
    } else if (goal === 'ganhar') {
      tdee += 300;
    }

    const calories = Math.round(tdee);
    
    // Macronutrientes
    const proteinGrams = Math.round(weight * 1.8);
    const fatGrams = Math.round((calories * 0.25) / 9);
    const carbGrams = Math.round((calories - (proteinGrams * 4) - (fatGrams * 9)) / 4);

    // Diferença de peso e data estimada
    const weightDiff = Math.abs(weight - desiredWeight);
    const weeksToGoal = weightSpeed > 0 ? Math.ceil(weightDiff / weightSpeed) : 0;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (weeksToGoal * 7));

    const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    return {
      calories,
      carbGrams,
      proteinGrams,
      fatGrams,
      weightDiff: weightDiff.toFixed(1),
      targetDate: `${targetDate.getDate()} de ${monthNames[targetDate.getMonth()]} de ${targetDate.getFullYear()}`,
      goal,
      weight,
      desiredWeight,
    };
  }, [answers]);

  const handleContinue = () => {
    nextStep();
    router.push(`/quiz/${currentStepFromUrl + 1}`);
  };

  // Componente de círculo de progresso animado
  const CircleProgress = ({ 
    value, 
    label, 
    unit, 
    color, 
    delay 
  }: { 
    value: number; 
    label: string; 
    unit?: string; 
    color: string; 
    delay: number;
  }) => {
    const circumference = 2 * Math.PI * 32;
    const progress = isAnimated ? 0.7 : 1; // 70% preenchido quando animado
    
    return (
      <div 
        className="flex flex-col items-center transition-all duration-500"
        style={{ 
          opacity: isAnimated ? 1 : 0, 
          transform: isAnimated ? 'translateY(0)' : 'translateY(20px)',
          transitionDelay: `${delay}ms`
        }}
      >
        <div className="relative w-20 h-20 md:w-24 md:h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            {/* Background circle */}
            <circle 
              cx="40" cy="40" r="32" 
              fill="none" 
              stroke="#f3f4f6" 
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle 
              cx="40" cy="40" r="32" 
              fill="none" 
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={isAnimated ? circumference * progress : circumference}
              className="transition-all duration-1000 ease-out"
              style={{ transitionDelay: `${delay + 200}ms` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[18px] md:text-[20px] font-bold text-black">
              {value}
              {unit && <span className="text-[12px] font-normal text-gray-500">{unit}</span>}
            </span>
          </div>
        </div>
        <span className="mt-2 text-[13px] md:text-[14px] text-gray-600 font-medium">{label}</span>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Conteúdo scrollável */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-md mx-auto w-full">
          
          {/* Ícone de check animado */}
          <div 
            className="flex justify-center mb-5 transition-all duration-500"
            style={{ 
              opacity: isAnimated ? 1 : 0, 
              transform: isAnimated ? 'scale(1)' : 'scale(0.5)'
            }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M5 12l5 5L19 7" 
                  stroke="white" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={isAnimated ? 'animate-draw' : ''}
                  style={{
                    strokeDasharray: 30,
                    strokeDashoffset: isAnimated ? 0 : 30,
                    transition: 'stroke-dashoffset 0.5s ease-out 0.3s'
                  }}
                />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1 
            className="text-[26px] md:text-[30px] font-bold text-black text-center mb-6 leading-tight transition-all duration-500"
            style={{ 
              opacity: isAnimated ? 1 : 0, 
              transform: isAnimated ? 'translateY(0)' : 'translateY(10px)',
              transitionDelay: '100ms'
            }}
          >
            Parabéns! 🎉<br />
            <span className="text-gray-700">Seu plano está pronto!</span>
          </h1>

          {/* Card de meta */}
          <div 
            className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 mb-6 transition-all duration-500"
            style={{ 
              opacity: isAnimated ? 1 : 0, 
              transform: isAnimated ? 'translateY(0)' : 'translateY(10px)',
              transitionDelay: '200ms'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-amber-700 font-medium mb-1">Sua meta</p>
                <p className="text-[18px] font-bold text-black">
                  {calculations.goal === 'perder' ? 'Perder' : calculations.goal === 'ganhar' ? 'Ganhar' : 'Manter'} {calculations.weightDiff} kg
                </p>
              </div>
              <div className="text-right">
                <p className="text-[13px] text-amber-700 font-medium mb-1">Previsão</p>
                <p className="text-[14px] font-semibold text-black">{calculations.targetDate}</p>
              </div>
            </div>
            
            {/* Progress visual */}
            <div className="mt-4 flex items-center gap-3">
              <div className="text-center">
                <p className="text-[12px] text-gray-500">Atual</p>
                <p className="text-[16px] font-bold text-gray-700">{calculations.weight}kg</p>
              </div>
              <div className="flex-1 h-2 bg-amber-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-1000"
                  style={{ width: isAnimated ? '100%' : '0%', transitionDelay: '500ms' }}
                />
              </div>
              <div className="text-center">
                <p className="text-[12px] text-gray-500">Meta</p>
                <p className="text-[16px] font-bold text-amber-600">{calculations.desiredWeight}kg</p>
              </div>
            </div>
          </div>

          {/* Recomendação diária */}
          <div 
            className="mb-6 transition-all duration-500"
            style={{ 
              opacity: isAnimated ? 1 : 0, 
              transitionDelay: '300ms'
            }}
          >
            <h2 className="text-[17px] font-bold text-black mb-1 text-center">Recomendação diária</h2>
            <p className="text-[13px] text-gray-500 mb-5 text-center">Baseado no seu perfil</p>

            {/* Grid de macros */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <CircleProgress 
                value={calculations.calories} 
                label="Calorias" 
                color="#f59e0b" 
                delay={400}
              />
              <CircleProgress 
                value={calculations.carbGrams} 
                label="Carboidratos" 
                unit="g"
                color="#22c55e" 
                delay={500}
              />
              <CircleProgress 
                value={calculations.proteinGrams} 
                label="Proteína" 
                unit="g"
                color="#ef4444" 
                delay={600}
              />
              <CircleProgress 
                value={calculations.fatGrams} 
                label="Gorduras" 
                unit="g"
                color="#3b82f6" 
                delay={700}
              />
            </div>
          </div>

          {/* Dica */}
          <div 
            className="bg-gray-50 rounded-xl p-4 text-center transition-all duration-500"
            style={{ 
              opacity: isAnimated ? 1 : 0, 
              transform: isAnimated ? 'translateY(0)' : 'translateY(10px)',
              transitionDelay: '800ms'
            }}
          >
            <p className="text-[13px] text-gray-600">
              💡 <span className="font-medium">Dica:</span> Você pode ajustar essas metas a qualquer momento no app
            </p>
          </div>

        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="flex-shrink-0 px-6 pb-6 md:pb-8 bg-white">
        <div className="max-w-md mx-auto w-full">
          <button
            onClick={handleContinue}
            className="w-full py-4 md:py-5 px-6 rounded-2xl font-semibold text-[16px] md:text-[17px] transition-all duration-200 bg-gradient-to-r from-green-500 to-green-600 text-white active:scale-[0.98] hover:shadow-lg hover:shadow-green-200"
          >
            Vamos começar! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
