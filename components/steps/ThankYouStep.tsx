'use client';

export default function ThankYouStep() {
  const handleCheckout = () => {
    // Substitua esta URL pela URL do seu checkout
    const checkoutUrl = 'https://pay.kiwify.com.br/seu-produto';
    window.location.href = checkoutUrl;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Conteúdo com scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 md:py-8">
          <div className="max-w-md mx-auto w-full">
            {/* Logo */}
            <div className="flex justify-center mb-5">
              <img 
                src="/cropped-principal.png" 
                alt="Dieta Calculada" 
                className="w-32 h-32 md:w-40 md:h-40 object-contain"
              />
            </div>
            
            {/* Título Principal */}
            <h1 className="text-[28px] md:text-[32px] font-bold text-black mb-3 leading-tight text-center">
              Seu Plano Personalizado está pronto!
            </h1>
            
            {/* Subtítulo */}
            <p className="text-[14px] md:text-[15px] text-gray-600 mb-6 text-center">
              Baseado nas suas respostas, criamos o plano perfeito para você alcançar seus objetivos
            </p>

            {/* Card de Oferta */}
            <div className="bg-[#f9f9f9] rounded-[20px] p-5 mb-4">
              {/* Preço */}
              <div className="text-center mb-5">
                <p className="text-gray-500 text-[13px] mb-1">
                  De <span className="line-through">R$ 197,00</span>
                </p>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-[42px] md:text-[48px] font-bold text-black leading-none">R$ 97</span>
                  <div className="text-left">
                    <p className="text-[13px] text-gray-600 leading-tight">apenas</p>
                    <p className="text-[11px] text-green-600 font-semibold leading-tight">50% OFF</p>
                  </div>
                </div>
                <p className="text-[12px] text-gray-500">ou 12x de R$ 9,70 sem juros</p>
              </div>

              {/* Benefícios */}
              <div className="space-y-2.5 mb-5">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M5 12l5 5L19 7"/>
                    </svg>
                  </div>
                  <p className="text-[13px] md:text-[14px] text-gray-800 leading-snug">
                    <strong className="font-semibold">Plano alimentar personalizado</strong> baseado nas suas respostas
                  </p>
                </div>
                
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M5 12l5 5L19 7"/>
                    </svg>
                  </div>
                  <p className="text-[13px] md:text-[14px] text-gray-800 leading-snug">
                    <strong className="font-semibold">Contador de calorias e macros</strong> automático
                  </p>
                </div>
                
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M5 12l5 5L19 7"/>
                    </svg>
                  </div>
                  <p className="text-[13px] md:text-[14px] text-gray-800 leading-snug">
                    <strong className="font-semibold">Receitas exclusivas</strong> adaptadas ao seu objetivo
                  </p>
                </div>
                
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M5 12l5 5L19 7"/>
                    </svg>
                  </div>
                  <p className="text-[13px] md:text-[14px] text-gray-800 leading-snug">
                    <strong className="font-semibold">Suporte nutricional</strong> via WhatsApp
                  </p>
                </div>
                
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M5 12l5 5L19 7"/>
                    </svg>
                  </div>
                  <p className="text-[13px] md:text-[14px] text-gray-800 leading-snug">
                    <strong className="font-semibold">Acesso vitalício</strong> a todas as atualizações
                  </p>
                </div>
              </div>

              {/* Garantia */}
              <div className="bg-green-50 rounded-[14px] p-3.5 text-center">
                <p className="text-[13px] md:text-[14px] text-green-800 font-semibold mb-0.5">
                  🔒 Garantia de 7 dias
                </p>
                <p className="text-[12px] text-green-700 leading-snug">
                  Se não gostar, devolvemos 100% do seu dinheiro
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Checkout fixo */}
      <div className="flex-shrink-0 px-6 pb-6 md:pb-8 bg-white">
        <div className="max-w-md mx-auto w-full">
          <button
            onClick={handleCheckout}
            className="w-full py-4 md:py-5 px-6 rounded-[14px] font-bold text-[15px] md:text-[16px] transition-all duration-200 bg-green-600 text-white active:bg-green-700 hover:bg-green-700 shadow-md uppercase"
          >
            GARANTIR MINHA VAGA COM 50% OFF
          </button>
          
          <p className="text-center text-[11px] md:text-[12px] text-gray-500 mt-2.5">
            🔒 Pagamento 100% seguro • Acesso imediato
          </p>
        </div>
      </div>
    </div>
  );
}
