'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import TrackingCapture from '@/components/TrackingCapture';
import { sendFacebookConversion, getFacebookBrowserId, getFacebookClickId } from '@/lib/facebookPixel';

/**
 * Tela inicial do quiz v2 (oferta R$ 197 / 12x R$ 20,38).
 * Botão "Continuar" leva para o primeiro step do quiz em /v2/0.
 */
export default function V2LandingPage() {
  const router = useRouter();
  const { reset } = useQuizStore();

  useEffect(() => {
    reset();
    sendFacebookConversion(
      'PageView',
      {
        client_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        fbp: getFacebookBrowserId() || undefined,
        fbc: getFacebookClickId() || undefined,
      },
      {
        content_name: 'Landing V2 - Quiz Dieta',
        content_category: 'Landing Page',
      },
      `pageview_v2_${Date.now()}_${Math.random().toString(36).substring(7)}`
    );
  }, [reset]);

  const handleContinue = () => {
    router.push('/v2/0');
  };

  return (
    <div className="fixed inset-0 bg-white overflow-y-auto">
      <Suspense fallback={null}>
        <TrackingCapture />
      </Suspense>

      <div className="min-h-full flex flex-col justify-center px-5 py-6 md:py-10">
        <div className="max-w-lg mx-auto w-full">
          <div className="flex justify-center mb-4 md:mb-8">
            <img
              src="/cropped-principal.png"
              alt="Dieta Calculada"
              className="w-20 h-20 md:w-32 md:h-32 object-contain"
            />
          </div>

          <h1 className="text-[22px] md:text-[32px] font-extrabold text-center text-gray-900 leading-tight mb-6 md:mb-12">
            Descubra em <span className="text-[#FF911A]">1 minuto</span> quantos kg você consegue emagrecer em 30 dias usando o Dieta Calculada!
          </h1>

          <div className="relative mb-6 md:mb-12 rounded-[20px] md:rounded-[28px] overflow-hidden shadow-lg md:shadow-xl">
            <img
              src="/app-godrin.png"
              alt="Transformação Real - Antes e Depois com Dieta Calculada"
              className="w-full h-auto object-cover"
            />
          </div>

          <button
            onClick={handleContinue}
            className="w-full py-4 md:py-6 px-6 md:px-8 rounded-[16px] md:rounded-[20px] font-extrabold text-[16px] md:text-[20px] uppercase transition-all duration-200 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-300/50 hover:scale-[1.02] active:scale-[0.98] mb-5 md:mb-6"
          >
            CONTINUAR
          </button>

          <div className="flex flex-col gap-2 md:gap-3 text-center">
            <div className="flex items-center justify-center gap-2 text-[13px] md:text-[15px] text-gray-600">
              <span className="text-green-500 font-bold">✓</span>
              <span>Grátis para começar</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-[13px] md:text-[15px] text-gray-600">
              <span className="text-green-500 font-bold">✓</span>
              <span>Leva apenas 1 minuto</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-[13px] md:text-[15px] text-gray-600">
              <span className="text-green-500 font-bold">✓</span>
              <span>Sem compromisso</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
