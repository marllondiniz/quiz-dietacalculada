'use client';

import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';

const sources = [
  { id: 'youtube', label: 'Youtube', icon: 'youtube', color: 'bg-red-500' },
  { id: 'tiktok', label: 'TikTok', icon: 'tiktok', color: 'bg-black' },
  { id: 'x', label: 'X', icon: 'x', color: 'bg-black' },
  { id: 'facebook', label: 'Facebook', icon: 'facebook', color: 'bg-blue-600' },
  { id: 'google', label: 'Google', icon: 'google', color: 'bg-white' },
  { id: 'tv', label: 'TV', icon: 'tv', color: 'bg-white' },
  { id: 'appstore', label: 'App Store', icon: 'appstore', color: 'bg-blue-500' },
];

export default function HeardFromStep() {
  const router = useRouter();
  const { updateAnswer, nextStep, currentStep, answers } = useQuizStore();

  const handleSelect = (sourceId: string) => {
    updateAnswer('heardFrom', sourceId);
  };

  const handleContinue = () => {
    if (answers.heardFrom) {
      nextStep();
      router.push(`/quiz/${currentStep + 1}`);
    }
  };

  const renderIcon = (iconType: string, isSelected: boolean) => {
    const iconColor = isSelected ? 'text-white' : 'text-black';
    
    switch (iconType) {
      case 'youtube':
        return (
          <div className={`w-10 h-10 rounded-lg ${isSelected ? 'bg-white' : 'bg-red-500'} flex items-center justify-center`}>
            <svg className={isSelected ? 'text-red-500' : 'text-white'} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        );
      case 'tiktok':
        return (
          <div className={`w-10 h-10 rounded-full ${isSelected ? 'bg-white' : 'bg-black'} flex items-center justify-center`}>
            <svg className={isSelected ? 'text-black' : 'text-white'} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
          </div>
        );
      case 'x':
        return (
          <div className={`w-10 h-10 rounded-lg ${isSelected ? 'bg-white' : 'bg-black'} flex items-center justify-center`}>
            <svg className={isSelected ? 'text-black' : 'text-white'} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
        );
      case 'facebook':
        return (
          <div className={`w-10 h-10 rounded-lg ${isSelected ? 'bg-white' : 'bg-blue-600'} flex items-center justify-center`}>
            <svg className={isSelected ? 'text-blue-600' : 'text-white'} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
        );
      case 'google':
        return (
          <div className={`w-10 h-10 rounded-lg ${isSelected ? 'bg-[#FF911A]' : 'bg-white border border-gray-200'} flex items-center justify-center`}>
            <svg className={isSelected ? '' : ''} width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
        );
      case 'tv':
        return (
          <div className={`w-10 h-10 rounded-lg ${isSelected ? 'bg-white' : 'bg-white border border-gray-200'} flex items-center justify-center`}>
            <svg className={isSelected ? 'text-white' : 'text-black'} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
              <polyline points="17 2 12 7 7 2"/>
            </svg>
          </div>
        );
      case 'appstore':
        return (
          <div className={`w-10 h-10 rounded-lg ${isSelected ? 'bg-white' : 'bg-blue-500'} flex items-center justify-center`}>
            <svg className={isSelected ? 'text-blue-500' : 'text-white'} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2a4.44 4.44 0 0 0-3 1.52 4.17 4.17 0 0 0-1 3.09 3.69 3.69 0 0 0 2.94-1.42zm2.52 7.44a4.51 4.51 0 0 1 2.16-3.81 4.66 4.66 0 0 0-3.66-2c-1.56-.16-3 .91-3.83.91s-2-.89-3.3-.87A4.92 4.92 0 0 0 4.69 9.39c-1.76 3-0.46 7.42 1.25 9.83 0.84 1.18 1.84 2.5 3.16 2.45s1.73-.79 3.25-.79 2 .79 3.3.76 2.21-1.17 3-2.36a10.13 10.13 0 0 0 1.37-2.82 4.37 4.37 0 0 1-2.56-3.83z"/>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-4">
        <h1 className="text-[32px] md:text-[40px] font-bold text-black mb-3 leading-tight max-w-md mx-auto text-center">
          Onde você ouviu falar de nós?
        </h1>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center overflow-y-auto px-6 py-4">
        <div className="space-y-2 md:space-y-3 max-w-md mx-auto w-full">
          {sources.map((source) => {
            const isSelected = answers.heardFrom === source.id;
            return (
              <button
                key={source.id}
                onClick={() => handleSelect(source.id)}
                className={`w-full py-3 md:py-4 px-4 md:px-6 rounded-[16px] md:rounded-[20px] transition-all duration-200 text-left flex items-center gap-3 md:gap-4 ${
                  isSelected
                    ? 'bg-[#FF911A] text-white'
                    : 'bg-[#f5f5f5] text-black active:bg-gray-200 hover:bg-gray-200'
                }`}
              >
                {renderIcon(source.icon, isSelected)}
                <span className="text-[16px] md:text-[17px] font-medium">{source.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="px-6 pb-6 md:pb-8">
        <div className="max-w-md mx-auto w-full">
          <SafeNavigationButton
            onClick={handleContinue}
            disabled={!answers.heardFrom}
            className={`w-full py-4 md:py-5 px-6 rounded-[16px] md:rounded-[20px] font-semibold text-[16px] md:text-[17px] transition-all duration-200 ${
              answers.heardFrom
                ? 'bg-[#FF911A] text-white active:bg-[#FF911A]/90 hover:bg-[#FF911A]/90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuar
          </SafeNavigationButton>
        </div>
      </div>
    </div>
  );
}
