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
import DietHelperStep from '@/components/steps/DietHelperStep';
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
import AlmostThereStep from '@/components/steps/AlmostThereStep';
import WeightSpeedStep from '@/components/steps/WeightSpeedStep';
import ComparisonStep from '@/components/steps/ComparisonStep';
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
  DietHelperStep,       // Etapa 8 - Auxílio na dieta
  GoalStep,             // Etapa 9 - Objetivo
  DesiredWeightStep,    // Etapa 10 - Peso desejado
  WeightGoalStep,       // Etapa 11 - Meta motivacional
  AlmostThereStep,     // Etapa 12 - Falta pouco!
  WeightSpeedStep,      // Etapa 13 - Velocidade de perda
  ComparisonStep,       // Etapa 14 - Comparação
  ObstaclesStep,        // Etapa 15 - Obstáculos
  DietTypeStep,         // Etapa 16 - Tipo de dieta
  AchievementsStep,     // Etapa 17 - Conquistas
  TrustStep,            // Etapa 18 - Obrigado por confiar
  ReadyStep,            // Etapa 19 - Tudo pronto
  LoadingStep,          // Etapa 20 - Carregando plano
  PlanReadyStep,        // Etapa 21 - Plano pronto
  GoalsGuideStep,       // Etapa 22 - Como atingir metas
  ThankYouStep,         // Etapa 23 - Oferta final
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

