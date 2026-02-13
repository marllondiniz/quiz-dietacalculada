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
  GenderStep,
  WorkoutsStep,
  TriedAppsStep,
  LongTermResultsStep,
  ContactInfoStep,
  HeightWeightStep,
  BirthDateStep,
  TrainerStep,
  DietHelperStep,
  GoalStep,
  DesiredWeightStep,
  WeightGoalStep,
  AlmostThereStep,
  WeightSpeedStep,
  ComparisonStep,
  ObstaclesStep,
  DietTypeStep,
  AchievementsStep,
  TrustStep,
  ReadyStep,
  LoadingStep,
  PlanReadyStep,
  GoalsGuideStep,
  ThankYouStep,
];

const V2_BASE = '/v2';

export default function V2QuizStepPage() {
  const params = useParams();
  const router = useRouter();
  const { setCurrentStep, totalSteps } = useQuizStore();
  const step = parseInt(params.step as string, 10);

  useEffect(() => {
    if (isNaN(step) || step < 0 || step >= totalSteps) {
      router.push(`${V2_BASE}/0`);
      return;
    }
    setCurrentStep(step);
  }, [step, setCurrentStep, totalSteps, router]);

  const CurrentStepComponent = steps[step];

  if (!CurrentStepComponent) {
    return null;
  }

  return (
    <QuizLayout showBackButton={step > 0} basePath={V2_BASE}>
      <CurrentStepComponent />
    </QuizLayout>
  );
}
