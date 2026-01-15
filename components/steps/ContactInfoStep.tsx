'use client';

import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import SafeNavigationButton from '@/components/SafeNavigationButton';
import { useState } from 'react';
import { 
  trackFacebookEvent, 
  sendFacebookConversion,
  getFacebookBrowserId,
  getFacebookClickId
} from '@/lib/facebookPixel';

export default function ContactInfoStep() {
  const router = useRouter();
  const { updateAnswer, nextStep, currentStep, answers } = useQuizStore();
  
  const [name, setName] = useState(answers.name || '');
  const [email, setEmail] = useState(answers.email || '');
  const [phone, setPhone] = useState(answers.phone || '');

  const handleContinue = () => {
    if (name.trim() && email.trim() && phone.trim()) {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      const trimmedPhone = phone.trim();
      
      updateAnswer('name', trimmedName);
      updateAnswer('email', trimmedEmail);
      updateAnswer('phone', trimmedPhone);
      
      // Disparar evento Lead do Facebook Pixel (client-side)
      trackFacebookEvent('Lead', {
        content_name: 'Quiz Lead',
        content_category: 'Diet Quiz',
      });
      
      // Enviar evento Lead para Facebook Conversions API (server-side)
      sendFacebookConversion(
        'Lead',
        {
          email: trimmedEmail,
          phone: trimmedPhone,
          client_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          fbp: getFacebookBrowserId() || undefined,
          fbc: getFacebookClickId() || undefined,
        },
        {
          content_name: 'Quiz Lead',
          content_category: 'Diet Quiz',
        },
        `lead_${Date.now()}_${Math.random().toString(36).substring(7)}`
      );
      
      nextStep();
      router.push(`/quiz/${currentStep + 1}`);
    }
  };

  const isValid = name.trim().length > 0 && 
                  email.trim().length > 0 && 
                  email.includes('@') &&
                  phone.trim().length >= 10;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-4">
        <h1 className="text-[32px] md:text-[40px] font-bold text-black mb-2 leading-tight max-w-md mx-auto text-center">
          Seus dados de contato
        </h1>
        <p className="text-[15px] md:text-[16px] text-gray-500 max-w-md mx-auto leading-relaxed text-center">
          Para enviarmos seu plano personalizado
        </p>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="max-w-md mx-auto w-full space-y-4">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-[14px] md:text-[15px] font-medium text-gray-700 mb-2">
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              className="w-full py-4 px-5 rounded-[16px] md:rounded-[20px] bg-[#f5f5f5] text-black placeholder-gray-400 text-[16px] md:text-[17px] focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
            />
          </div>

          {/* E-mail */}
          <div>
            <label htmlFor="email" className="block text-[14px] md:text-[15px] font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full py-4 px-5 rounded-[16px] md:rounded-[20px] bg-[#f5f5f5] text-black placeholder-gray-400 text-[16px] md:text-[17px] focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
            />
          </div>

          {/* Telefone */}
          <div>
            <label htmlFor="phone" className="block text-[14px] md:text-[15px] font-medium text-gray-700 mb-2">
              Telefone (WhatsApp)
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                // Remove tudo que não é número
                const numbers = e.target.value.replace(/\D/g, '');
                // Formata o número
                if (numbers.length <= 11) {
                  let formatted = numbers;
                  if (numbers.length > 2) {
                    formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
                  }
                  if (numbers.length > 7) {
                    formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
                  }
                  setPhone(formatted);
                }
              }}
              placeholder="(11) 99999-9999"
              className="w-full py-4 px-5 rounded-[16px] md:rounded-[20px] bg-[#f5f5f5] text-black placeholder-gray-400 text-[16px] md:text-[17px] focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Botão fixo no bottom */}
      <div className="px-6 pb-6 md:pb-8">
        <div className="max-w-md mx-auto w-full">
          <SafeNavigationButton
            onClick={handleContinue}
            disabled={!isValid}
            className={`w-full py-4 md:py-5 px-6 rounded-[16px] md:rounded-[20px] font-semibold text-[16px] md:text-[17px] transition-all duration-200 ${
              isValid
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

