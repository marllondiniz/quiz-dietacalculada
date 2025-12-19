import { create } from 'zustand';

export interface QuizAnswers {
  referralCode?: string;
  dietType?: 'classico' | 'pescetariano' | 'vegetariano' | 'vegano';
  birthDate?: Date;
  gender?: 'masculino' | 'feminino' | 'outro';
  workoutsPerWeek?: '0-2' | '3-5' | '6+';
  hasTrainer?: boolean;
  goal?: 'perder' | 'manter' | 'ganhar';
  achievements?: string[];
  obstacles?: string[];
  heardFrom?: string;
  triedOtherApps?: boolean;
  name?: string;
  email?: string;
  phone?: string;
  unit?: 'imperial' | 'metric';
  heightFt?: number;
  heightIn?: number;
  heightCm?: number;
  weightLb?: number;
  weightKg?: number;
  desiredWeightKg?: number;
  weightSpeedPerWeek?: number;
  addBurnedCalories?: boolean;
  transferExtraCalories?: boolean;
}

interface QuizStore {
  currentStep: number;
  answers: QuizAnswers;
  totalSteps: number;
  setCurrentStep: (step: number) => void;
  updateAnswer: (key: keyof QuizAnswers, value: any) => void;
  nextStep: () => void;
  previousStep: () => void;
  reset: () => void;
}

const initialAnswers: QuizAnswers = {};

export const useQuizStore = create<QuizStore>((set) => ({
  currentStep: 0,
  answers: initialAnswers,
  totalSteps: 23,
  setCurrentStep: (step) => set({ currentStep: step }),
  updateAnswer: (key, value) =>
    set((state) => ({
      answers: { ...state.answers, [key]: value },
    })),
  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1),
    })),
  previousStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    })),
  reset: () => set({ currentStep: 0, answers: initialAnswers }),
}));

