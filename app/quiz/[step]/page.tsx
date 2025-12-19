'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuizStore } from '@/store/quizStore';
import QuizLayout from '@/components/QuizLayout';
import DietTypeStep from '@/components/steps/DietTypeStep';
import BirthDateStep from '@/components/steps/BirthDateStep';
import GenderStep from '@/components/steps/GenderStep';
import WorkoutsStep from '@/components/steps/WorkoutsStep';
import TrainerStep from '@/components/steps/TrainerStep';
import GoalStep from '@/components/steps/GoalStep';
import ObstaclesStep from '@/components/steps/ObstaclesStep';
import TriedAppsStep from '@/components/steps/TriedAppsStep';
import LongTermResultsStep from '@/components/steps/LongTermResultsStep';
import ContactInfoStep from '@/components/steps/ContactInfoStep';
import HeightWeightStep from '@/components/steps/HeightWeightStep';
import AchievementsStep from '@/components/steps/AchievementsStep';
import ThankYouStep from '@/components/steps/ThankYouStep';
import DesiredWeightStep from '@/components/steps/DesiredWeightStep';
import WeightGoalStep from '@/components/steps/WeightGoalStep';
import WeightSpeedStep from '@/components/steps/WeightSpeedStep';
import ComparisonStep from '@/components/steps/ComparisonStep';
import WeightTransitionStep from '@/components/steps/WeightTransitionStep';
import TrustStep from '@/components/steps/TrustStep';
import ReadyStep from '@/components/steps/ReadyStep';
import LoadingStep from '@/components/steps/LoadingStep';
import PlanReadyStep from '@/components/steps/PlanReadyStep';
import GoalsGuideStep from '@/components/steps/GoalsGuideStep';

const steps = [
  GenderStep,           // Etapa 0 - Sexo
  WorkoutsStep,         // Etapa 1 - Treinos por semana
  TriedAppsStep,        // Etapa 2 - Já usou apps
  LongTermResultsStep,  // Etapa 3 - Resultados a longo prazo
  ContactInfoStep,      // Etapa 4 - Dados de contato
  HeightWeightStep,     // Etapa 5 - Altura e peso
  BirthDateStep,        // Etapa 6 - Data de nascimento
  TrainerStep,          // Etapa 7 - Tem personal
  GoalStep,             // Etapa 8 - Objetivo
  DesiredWeightStep,    // Etapa 9 - Peso desejado
  WeightGoalStep,       // Etapa 10 - Meta motivacional
  WeightSpeedStep,      // Etapa 11 - Velocidade de perda
  ComparisonStep,       // Etapa 12 - Comparação
  WeightTransitionStep, // Etapa 13 - Transição de peso (gráfico)
  ObstaclesStep,        // Etapa 14 - Obstáculos
  DietTypeStep,         // Etapa 15 - Tipo de dieta
  AchievementsStep,     // Etapa 16 - Conquistas
  TrustStep,            // Etapa 17 - Obrigado por confiar
  ReadyStep,            // Etapa 18 - Tudo pronto
  LoadingStep,          // Etapa 19 - Carregando plano
  PlanReadyStep,        // Etapa 20 - Plano pronto
  GoalsGuideStep,       // Etapa 21 - Como atingir metas
  ThankYouStep,         // Etapa 22 - Oferta final
];

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { setCurrentStep, totalSteps } = useQuizStore();
  const step = parseInt(params.step as string, 10);

  useEffect(() => {
    if (isNaN(step) || step < 0 || step >= totalSteps) {
      router.push('/quiz/0');
      return;
    }
    setCurrentStep(step);
  }, [step, setCurrentStep, totalSteps, router]);

  const CurrentStepComponent = steps[step];

  if (!CurrentStepComponent) {
    return null;
  }

  return (
    <QuizLayout showBackButton={step > 0}>
      <CurrentStepComponent />
    </QuizLayout>
  );
}

