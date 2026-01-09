'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';
import { useMemo, useEffect, useState } from 'react';

export default function PlanReadyStep() {
  const router = useRouter();
  const params = useParams();
  const currentStepFromUrl = parseInt(params.step as string, 10);
  const { nextStep, answers } = useQuizStore();
  const [isAnimated, setIsAnimated] = useState(false);
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 300);
    // Habilitar botão após 3 segundos (página com cálculos importantes)
    const enableButton = setTimeout(() => setCanContinue(true), 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(enableButton);
    };
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
      // Ajustar se ainda não fez aniversário este ano
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
    }

    // 1) BMR (Basal Metabolic Rate) usando Mifflin-St Jeor
    // Homens: BMR = (10 × peso em kg) + (6.25 × altura em cm) - (5 × idade) + 5
    // Mulheres: BMR = (10 × peso em kg) + (6.25 × altura em cm) - (5 × idade) - 161
    let bmr: number;
    if (gender === 'feminino') {
      bmr = (10 * weight) + (6.25 * heightCm) - (5 * age) - 161;
    } else {
      bmr = (10 * weight) + (6.25 * heightCm) - (5 * age) + 5;
    }

    // 2) Fator de atividade física para calcular TDEE
    // Sedentário: 1.2 (pouco ou nenhum exercício)
    // Levemente ativo: 1.375 (exercício leve 1-3 dias/semana)
    // Moderadamente ativo: 1.55 (exercício moderado 3-5 dias/semana)
    // Muito ativo: 1.725 (exercício intenso 6-7 dias/semana)
    // Extremamente ativo: 1.9 (exercício muito intenso, trabalho físico)
    let activityFactor = 1.2; // Sedentário (0-2 exercícios)
    if (workouts === '3-5') {
      activityFactor = 1.55; // Moderadamente ativo
    } else if (workouts === '6+') {
      activityFactor = 1.725; // Muito ativo
    }

    // TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activityFactor;

    // 3) Calcular déficit/superávit calórico baseado na meta
    // Referência: 7.700 kcal = 1 kg de gordura
    let calorieAdjustment = 0;
    
    if (goal === 'perder' && weightSpeed > 0) {
      // Déficit diário = (kg por semana × 7.700 kcal/kg) ÷ 7 dias
      const dailyDeficit = (weightSpeed * 7700) / 7;
      calorieAdjustment = -dailyDeficit;
    } else if (goal === 'ganhar' && weightSpeed > 0) {
      // Superávit diário = (kg por semana × 7.700 kcal/kg) ÷ 7 dias
      const dailySurplus = (weightSpeed * 7700) / 7;
      calorieAdjustment = dailySurplus;
    }
    // Se goal === 'manter', calorieAdjustment permanece 0

    // Calorias finais = TDEE + ajuste (déficit negativo ou superávit positivo)
    let calories = Math.round(tdee + calorieAdjustment);
    
    // Garantir mínimo de calorias para segurança (nunca menos que 1200 kcal)
    const MIN_CALORIES = 1200;
    if (calories < MIN_CALORIES) {
      calories = MIN_CALORIES;
    }
    
    // Macronutrientes com validações e ajustes automáticos
    // Mínimos recomendados para saúde
    const MIN_CARBS = 50; // gramas (mínimo absoluto para função cerebral)
    const MIN_FAT = 30; // gramas (mínimo para hormônios e absorção de vitaminas)
    
    // 1. Calcular proteína (1.6-2.0g por kg de peso corporal)
    let proteinGrams = Math.round(weight * 1.8);
    
    // 2. Calcular gordura (20-30% das calorias totais)
    let fatGrams = Math.round((calories * 0.25) / 9);
    
    // Garantir mínimo de gordura
    if (fatGrams < MIN_FAT) {
      fatGrams = MIN_FAT;
    }
    
    // 3. Calcular calorias restantes para carboidratos
    const proteinCalories = proteinGrams * 4;
    const fatCalories = fatGrams * 9;
    const remainingCalories = calories - proteinCalories - fatCalories;
    
    // 4. Calcular carboidratos com o restante
    let carbGrams = Math.round(remainingCalories / 4);
    
    // 5. VALIDAÇÃO CRÍTICA: Se carboidratos ficarem abaixo do mínimo
    if (carbGrams < MIN_CARBS) {
      // Ajustar automaticamente a distribuição de macros
      console.warn('⚠️ Carboidratos abaixo do mínimo. Ajustando distribuição de macros...');
      
      // Garantir mínimo de carboidratos
      carbGrams = MIN_CARBS;
      
      // Recalcular calorias necessárias com os mínimos
      const minCaloriesNeeded = (proteinGrams * 4) + (fatGrams * 9) + (carbGrams * 4);
      
      // Se as calorias atuais não comportam os mínimos, ajustar proteína
      if (minCaloriesNeeded > calories) {
        // Reduzir proteína para acomodar carboidratos mínimos
        const availableForProtein = calories - (fatGrams * 9) - (carbGrams * 4);
        proteinGrams = Math.max(Math.round(availableForProtein / 4), Math.round(weight * 1.2));
        
        console.warn('🔧 Proteína ajustada para:', proteinGrams, 'g');
      }
    }
    
    // 6. Garantir que a soma dos macros não exceda as calorias totais
    const totalMacroCalories = (proteinGrams * 4) + (fatGrams * 9) + (carbGrams * 4);
    if (totalMacroCalories > calories) {
      // Ajuste fino: reduzir proporcionalmente
      const ratio = calories / totalMacroCalories;
      proteinGrams = Math.round(proteinGrams * ratio);
      fatGrams = Math.max(MIN_FAT, Math.round(fatGrams * ratio));
      carbGrams = Math.max(MIN_CARBS, Math.round(carbGrams * ratio));
    }
    
    console.log('📊 Macros calculados:', {
      calories,
      proteina: proteinGrams + 'g',
      gordura: fatGrams + 'g',
      carboidratos: carbGrams + 'g',
      total: ((proteinGrams * 4) + (fatGrams * 9) + (carbGrams * 4)) + ' kcal'
    });

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
          <SafeNavigationButton
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full py-4 md:py-5 px-6 rounded-2xl font-semibold text-[16px] md:text-[17px] transition-all duration-200 ${
              canContinue
                ? 'bg-[#FF911A] text-white active:scale-[0.98] hover:bg-[#FF911A]/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canContinue ? 'Vamos começar! 🚀' : 'Calculando...'}
          </SafeNavigationButton>
        </div>
      </div>
    </div>
  );
}
