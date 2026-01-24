'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// URLs de checkout Hubla
const CHECKOUT_URLS = {
  annual: 'https://pay.hub.la/9uz9SIpLP3pZ0f12ydsD',
  monthly: 'https://pay.hub.la/QnE0thkRCtKbXLmS5yPy',
};

// Links WhatsApp
const WHATSAPP_LINKS = {
  conhecer: 'https://api.whatsapp.com/send?phone=5527992866320&text=Ol%C3%A1%2C%20gostaria%20de%20conhecer%20mais%20sobre%20o%20Dieta%20Calculada',
  cancelamento: 'https://api.whatsapp.com/send/?phone=5527992230718&text=Ol%C3%A1%2C+gostaria+de+solicitar+o+cancelamento+do+meu+servi%C3%A7o&type=phone_number&app_absent=0',
};

// YouTube Videos
const YOUTUBE_VIDEOS = [
  '7PE456g1tQI',
  'xlnwBKkjuV4',
  'ozyyTv-Pyb8',
  'JKI4Tn9DWyQ',
  'vsWkgakqq4s',
  'Q5OzeBG5Zig',
];

// Features/Cards
const FEATURES = [
  {
    icon: '/Analytics-Pie-Chart.svg',
    title: 'Análise de Refeição',
    description: 'Envie uma foto do seu prato e nosso sistema calculará automaticamente as calorias consumidas.',
  },
  {
    icon: '/Balance-Law-Icon.svg',
    title: 'Controle de Macros',
    description: 'Monitore com precisão seus macronutrientes e mantenha-se dentro dos objetivos da sua dieta.',
  },
  {
    icon: '/Leaf-icon.svg',
    title: 'Praticidade no Uso',
    description: 'Nossa ferramenta é utilizada no WhatsApp tornando o controle da dieta simples e conveniente.',
  },
  {
    icon: '/Calculator-icon-1.svg',
    title: 'Cálculo de TMB e NCT',
    description: 'Obtenha cálculos personalizados da Taxa Metabólica Basal (TMB) e da Necessidade Calórica Total (NCT).',
  },
];

// FAQ Items
const FAQ_ITEMS = [
  {
    question: 'O que é o Dieta Calculada?',
    answer: 'Dieta Calculada é uma ferramenta que utiliza tecnologia avançada de reconhecimento de imagem para analisar fotos de refeições e estimar as calorias dos alimentos. Isso ajuda os usuários a monitorar sua ingestão calórica de maneira simples e precisa.',
  },
  {
    question: 'Como o Dieta Calculada funciona?',
    answer: 'Para usar o Dieta Calculada, basta tirar uma foto da sua refeição e enviá-la através do bot no WhatsApp. A tecnologia de reconhecimento de imagem da ferramenta analisa os alimentos na imagem e estima a quantidade de calorias.',
  },
  {
    question: 'Qual a precisão da estimativa de macronutrientes?',
    answer: 'O Dieta Calculada usa algoritmos avançados para estimar macronutrientes com precisão, embora possam ocorrer variações devido ao tamanho das porções e à diversidade dos alimentos. Se necessário, você pode ajustar as informações da refeição para uma nova análise mais precisa.',
  },
  {
    question: 'Como faço para usar Dieta Calculada?',
    answer: 'Basta enviar uma mensagem para o chatbot Dieta Calculada.',
    hasLink: true,
    linkText: 'Clique aqui para mandar mensagem para o bot',
    linkUrl: WHATSAPP_LINKS.conhecer,
  },
  {
    question: 'Preciso inserir manualmente algum dado sobre a refeição?',
    answer: 'Na maioria dos casos, não é necessário inserir dados manualmente. No entanto, para maior precisão, o aplicativo pode solicitar informações adicionais, como o tamanho das porções ou ingredientes específicos. Além disso, você pode ajustar manualmente os dados da refeição se necessário.',
  },
  {
    question: 'Como a ferramenta me ajuda com a dieta?',
    answer: 'Ao monitorar sua ingestão calórica, o Dieta Calculada ajuda você a tomar decisões mais conscientes sobre sua alimentação, facilitando o controle da dieta e auxiliando na conquista dos seus objetivos de saúde e bem-estar.',
  },
  {
    question: 'Os dados da minha alimentação estão seguros?',
    answer: 'Sim, o Dieta Calculada valoriza a privacidade dos usuários e garante que todos os dados pessoais e de alimentação sejam tratados com segurança e confidencialidade.',
  },
  {
    question: 'O Dieta Calculada oferece algum suporte ao usuário?',
    answer: 'Sim, o Dieta Calculada oferece suporte ao usuário através do email suporte@dietacalculada.com',
  },
  {
    question: 'Como faço para cancelar minha assinatura?',
    answer: 'Você pode cancelar sua assinatura a qualquer momento. No entanto, o prazo para solicitar reembolso é de até 7 dias corridos, a partir da data de contratação ou do recebimento do serviço, conforme previsto no Código de Defesa do Consumidor. Para prosseguir com o cancelamento ou esclarecer dúvidas, entre em contato diretamente com o nosso suporte via WhatsApp.',
    hasLink: true,
    linkText: 'Clique aqui',
    linkUrl: WHATSAPP_LINKS.cancelamento,
  },
];

// Menu Mobile Component
function MenuMobile() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Início', id: 'inicio' },
    { label: 'Recursos', id: 'recursos' },
    { label: 'Depoimentos', id: 'depoimentos' },
    { label: 'Planos', id: 'planos' },
    { label: 'FAQ', id: 'faq' },
  ];

  const handleClick = (id: string) => {
    setIsOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Menu"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-700"
        >
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-[85px] left-0 right-0 bg-white border-b border-gray-200 shadow-xl z-50 md:hidden">
            <nav className="flex flex-col py-4">
              {menuItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleClick(item.id);
                  }}
                  className="px-6 py-3 text-[15px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#FF911A] transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#planos"
                onClick={(e) => {
                  e.preventDefault();
                  handleClick('planos');
                }}
                className="mx-6 mt-2 bg-[#FF911A] hover:bg-[#e87f0f] text-white font-bold text-[15px] px-6 py-3 rounded-full text-center transition-colors"
              >
                Começar Agora
              </a>
            </nav>
          </div>
        </>
      )}
    </>
  );
}

// FAQ Accordion Component
function FAQItem({ item, isOpen, onClick }: { item: typeof FAQ_ITEMS[0]; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onClick}
        className="w-full py-5 px-1 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-lg"
      >
        <span className="text-[15px] md:text-[17px] font-semibold text-gray-900 pr-4">{item.question}</span>
        <span className={`flex-shrink-0 w-8 h-8 rounded-full bg-[#FF911A]/10 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF911A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed px-1">
          {item.answer}
          {item.hasLink && (
            <>
              {' '}
              <a
                href={item.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF911A] font-semibold hover:underline"
              >
                {item.linkText}
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

// YouTube Embed Component
function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="aspect-[9/16] w-full rounded-2xl overflow-hidden shadow-lg bg-black flex-shrink-0 pointer-events-auto">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full pointer-events-auto"
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
}

// YouTube Carousel Component
function YouTubeCarousel({ videos }: { videos: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3); // Desktop: 3 vídeos
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2); // Tablet: 2 vídeos
      } else {
        setItemsPerView(1); // Mobile: 1 vídeo
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, videos.length - itemsPerView);

  const goToSlide = (index: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentIndex(Math.min(index, maxIndex));
  };

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => Math.max(0, prev - itemsPerView));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => Math.min(maxIndex, prev + itemsPerView));
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {videos.map((videoId, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <YouTubeEmbed videoId={videoId} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Fora do container do vídeo */}
      <button
        onClick={goToPrevious}
        type="button"
        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-white rounded-full shadow-lg flex items-center justify-center z-[100] transition-all duration-300 hover:scale-110"
        aria-label="Vídeo anterior"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <button
        onClick={goToNext}
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-white rounded-full shadow-lg flex items-center justify-center z-[100] transition-all duration-300 hover:scale-110"
        aria-label="Próximo vídeo"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: Math.ceil(videos.length / itemsPerView) }).map((_, index) => {
          const slideIndex = index * itemsPerView;
          return (
            <button
              key={index}
              type="button"
              onClick={(e) => goToSlide(slideIndex, e)}
              className={`transition-all duration-300 rounded-full ${
                currentIndex >= slideIndex && currentIndex < slideIndex + itemsPerView
                  ? 'w-8 h-2 bg-[#FF911A]'
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function VendasPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const plansRef = useRef<HTMLDivElement>(null);

  const scrollToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCheckout = (plan: 'annual' | 'monthly') => {
    window.location.href = CHECKOUT_URLS[plan];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================ */}
      {/* HEADER FIXO COM LOGO E NAVEGAÇÃO */}
      {/* ============================================ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-1 md:py-1.5">
          <div className="flex items-center justify-between">
            {/* Espaçador invisível para mobile (para centralizar a logo) */}
            <div className="md:hidden w-10" />

            {/* Logo - Centralizada no mobile, à esquerda no desktop */}
            <a href="#inicio" className="flex-1 flex justify-center md:justify-start md:flex-none">
              <Image
                src="/cropped-principal.png"
                alt="Dieta Calculada"
                width={160}
                height={160}
                className="w-24 h-24 md:w-28 md:h-28 object-contain hover:opacity-80 transition-opacity"
                priority
              />
            </a>

            {/* Menu Mobile - Hamburger à direita */}
            <div className="md:hidden">
              <MenuMobile />
            </div>

            {/* Menu de Navegação - Desktop (oculto no mobile) */}
            <nav className="hidden md:flex items-center gap-6 flex-1 justify-end">
              <a
                href="#inicio"
                className="text-[14px] font-semibold text-gray-700 hover:text-[#FF911A] transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Início
              </a>
              <a
                href="#recursos"
                className="text-[14px] font-semibold text-gray-700 hover:text-[#FF911A] transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('recursos')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Recursos
              </a>
              <a
                href="#depoimentos"
                className="text-[14px] font-semibold text-gray-700 hover:text-[#FF911A] transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('depoimentos')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Depoimentos
              </a>
              <a
                href="#planos"
                className="text-[14px] font-semibold text-gray-700 hover:text-[#FF911A] transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Planos
              </a>
              <a
                href="#faq"
                className="text-[14px] font-semibold text-gray-700 hover:text-[#FF911A] transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                FAQ
              </a>
              <a
                href="#planos"
                className="bg-[#FF911A] hover:bg-[#e87f0f] text-white font-bold text-[14px] px-6 py-2 rounded-full transition-all duration-300 hover:scale-105 shadow-md"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Começar Agora
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* ============================================ */}
      {/* DOBRA 1 - HERO COM VÍDEO */}
      {/* ============================================ */}
      <section id="inicio" className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-32 md:pt-40 pb-12 md:py-20 overflow-hidden bg-white">
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Título Principal */}
          <h1 className="text-[32px] md:text-[56px] lg:text-[64px] font-extrabold text-gray-900 leading-tight mb-6 animate-fadeInUp">
            Controlar sua alimentação diária{' '}
            <span className="text-[#FF911A]">nunca foi tão fácil</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-[16px] md:text-[20px] text-gray-600 mb-8 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            Contabilize e consulte os macronutrientes de suas refeições em segundos
          </p>

          {/* CTA Button */}
          <button
            onClick={scrollToPlans}
            className="inline-flex items-center gap-3 bg-[#FF911A] hover:bg-[#e87f0f] text-white font-bold text-[16px] md:text-[18px] px-8 py-4 rounded-full shadow-lg shadow-[#FF911A]/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#FF911A]/40 animate-fadeInUp mb-12"
            style={{ animationDelay: '0.3s' }}
          >
            Assinar agora
          </button>

          {/* Vídeo */}
          <div className="relative w-full max-w-[280px] md:max-w-sm mx-auto animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <div className="absolute -inset-4 bg-gradient-to-r from-[#FF911A]/20 to-orange-300/20 rounded-3xl blur-xl" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-auto"
                style={{ maxHeight: '65vh' }}
              >
                <source src="/Video_Dieta_Calculada-1.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* DOBRA 2 - O QUE OFERECEMOS */}
      {/* ============================================ */}
      <section id="recursos" className="py-16 md:py-24 px-4 bg-gray-50 scroll-mt-28">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 bg-[#FF911A]/10 text-[#FF911A] font-bold text-sm uppercase tracking-wider mb-3 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-[#FF911A] rounded-full" />
              Recursos
            </span>
            <h2 className="text-[28px] md:text-[42px] font-extrabold text-gray-900 mb-4">
              O que oferecemos
            </h2>
            <p className="text-[15px] md:text-[18px] text-gray-600 max-w-2xl mx-auto">
              Descubra como nossos serviços podem transformar sua alimentação e bem-estar
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-lg md:max-w-none mx-auto">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl hover:shadow-[#FF911A]/10 transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-[#FF911A]/30"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#FF911A] to-orange-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#FF911A]/20 p-2.5">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={36}
                    height={36}
                    className="w-9 h-9 object-contain"
                  />
                </div>
                <h3 className="text-[18px] md:text-[22px] font-bold text-gray-900 mb-3 group-hover:text-[#FF911A] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[14px] md:text-[16px] text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* DOBRA 3 - DEPOIMENTOS EM VÍDEO */}
      {/* ============================================ */}
      <section id="depoimentos" className="py-16 md:py-24 px-4 bg-white scroll-mt-28">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 bg-[#FF911A]/10 text-[#FF911A] font-bold text-sm uppercase tracking-wider mb-3 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-[#FF911A] rounded-full" />
              Depoimentos
            </span>
            <h2 className="text-[28px] md:text-[42px] font-extrabold text-gray-900 mb-4">
              Quem testou, <span className="text-[#FF911A]">aprovou!</span>
            </h2>
            <p className="text-[15px] md:text-[18px] text-gray-600 max-w-2xl mx-auto">
              Veja o que estão falando de nós:
            </p>
          </div>

          {/* YouTube Videos Carousel */}
          <div className="mb-12">
            <YouTubeCarousel videos={YOUTUBE_VIDEOS} />
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={scrollToPlans}
              className="inline-flex items-center gap-3 bg-[#FF911A] hover:bg-[#e87f0f] text-white font-bold text-[16px] md:text-[18px] px-8 py-4 rounded-full shadow-lg shadow-[#FF911A]/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#FF911A]/40"
            >
              Quero começar agora
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* DOBRA 5 - PLANOS */}
      {/* ============================================ */}
      <section ref={plansRef} id="planos" className="py-16 md:py-24 px-4 bg-gray-900 scroll-mt-28">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 bg-[#FF911A]/20 text-[#FF911A] font-bold text-sm uppercase tracking-wider mb-3 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-[#FF911A] rounded-full" />
              Planos
            </span>
            <h2 className="text-[28px] md:text-[42px] font-extrabold text-white mb-4">
              Escolha seu plano e <span className="text-[#FF911A]">comece hoje</span>
            </h2>
            <p className="text-[15px] md:text-[18px] text-gray-400 max-w-2xl mx-auto">
              Comece sua jornada de transformação agora mesmo
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Plano Anual */}
            <div
              onClick={() => setSelectedPlan('annual')}
              className={`relative bg-gray-800 rounded-3xl p-6 md:p-8 cursor-pointer transition-all duration-300 border-2 ${
                selectedPlan === 'annual'
                  ? 'border-[#FF911A] shadow-lg shadow-[#FF911A]/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {/* Badge Mais Popular */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-[#FF911A] to-orange-500 text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wide">
                  ⭐ Mais Popular
                </span>
              </div>

              {/* Radio Indicator */}
              <div className="absolute top-6 right-6">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedPlan === 'annual'
                    ? 'border-[#FF911A] bg-[#FF911A]'
                    : 'border-gray-600'
                }`}>
                  {selectedPlan === 'annual' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M5 12l5 5L19 7"/>
                    </svg>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-[20px] md:text-[24px] font-bold text-white mb-2">Plano Anual</h3>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[16px] text-gray-400">12x de</span>
                    <span className="text-[42px] md:text-[52px] font-extrabold text-[#FF911A]">R$ 10,24</span>
                  </div>
                  <p className="text-[14px] text-gray-500">ou R$ 99,90 à vista</p>
                </div>

                {/* Badge Economia */}
                <div className="inline-block bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-[13px] font-bold mb-6">
                  💰 Economize R$ 234,90 no ano!
                </div>

                <ul className="space-y-3">
                  {['Acesso completo por 12 meses', 'Suporte prioritário', 'Todas as atualizações incluídas'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[14px] text-gray-300">
                      <div className="w-5 h-5 rounded-full bg-[#FF911A]/20 flex items-center justify-center flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF911A" strokeWidth="3">
                          <path d="M5 12l5 5L19 7"/>
                        </svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Plano Mensal */}
            <div
              onClick={() => setSelectedPlan('monthly')}
              className={`relative bg-gray-800 rounded-3xl p-6 md:p-8 cursor-pointer transition-all duration-300 border-2 ${
                selectedPlan === 'monthly'
                  ? 'border-[#FF911A] shadow-lg shadow-[#FF911A]/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {/* Radio Indicator */}
              <div className="absolute top-6 right-6">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedPlan === 'monthly'
                    ? 'border-[#FF911A] bg-[#FF911A]'
                    : 'border-gray-600'
                }`}>
                  {selectedPlan === 'monthly' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M5 12l5 5L19 7"/>
                    </svg>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-[20px] md:text-[24px] font-bold text-white mb-2">Plano Mensal</h3>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[42px] md:text-[52px] font-extrabold text-white">R$ 27,90</span>
                    <span className="text-[16px] text-gray-400">/mês</span>
                  </div>
                  <p className="text-[14px] text-gray-500">Pagamento mensal recorrente</p>
                </div>

                <ul className="space-y-3 mt-[52px]">
                  {['Acesso completo por 1 mês', 'Suporte prioritário', 'Todas as atualizações incluídas'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[14px] text-gray-300">
                      <div className="w-5 h-5 rounded-full bg-[#FF911A]/20 flex items-center justify-center flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF911A" strokeWidth="3">
                          <path d="M5 12l5 5L19 7"/>
                        </svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-10 text-center">
            <button
              onClick={() => handleCheckout(selectedPlan)}
              className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#FF911A] to-orange-500 hover:from-[#e87f0f] hover:to-orange-600 text-white font-bold text-[16px] md:text-[18px] px-12 py-5 rounded-full shadow-lg shadow-[#FF911A]/30 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              {selectedPlan === 'annual' ? 'GARANTIR PLANO ANUAL' : 'GARANTIR PLANO MENSAL'}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            {/* Garantia */}
            <div className="mt-6 inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-5 py-2.5 rounded-full">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span className="text-[14px] font-semibold">Garantia de 7 dias - 100% do dinheiro de volta</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* DOBRA 6 - FAQ */}
      {/* ============================================ */}
      <section id="faq" className="py-16 md:py-24 px-4 bg-white scroll-mt-28">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 bg-[#FF911A]/10 text-[#FF911A] font-bold text-sm uppercase tracking-wider mb-3 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-[#FF911A] rounded-full" />
              FAQ
            </span>
            <h2 className="text-[28px] md:text-[42px] font-extrabold text-gray-900 mb-4">
              Perguntas <span className="text-[#FF911A]">frequentes</span>
            </h2>
            <p className="text-[15px] md:text-[18px] text-gray-600">
              Tire suas dúvidas sobre o Dieta Calculada
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-gray-50 rounded-2xl p-4 md:p-6">
            {FAQ_ITEMS.map((item, index) => (
              <FAQItem
                key={index}
                item={item}
                isOpen={openFAQ === index}
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="bg-gradient-to-b from-gray-50 to-white py-12 md:py-16 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-8">
            {/* Logo e Descrição */}
            <div className="md:col-span-1">
              <Image
                src="/cropped-principal.png"
                alt="Dieta Calculada"
                width={120}
                height={120}
                className="w-28 h-28 object-contain mb-4"
              />
              <p className="text-gray-600 text-sm leading-relaxed">
                Controle sua alimentação de forma inteligente e prática.
              </p>
            </div>

            {/* Links Rápidos */}
            <div>
              <h4 className="text-gray-900 font-bold text-lg mb-4">Links Rápidos</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#inicio"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-gray-600 hover:text-[#FF911A] transition-colors text-sm flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                    Início
                  </a>
                </li>
                <li>
                  <a
                    href="#recursos"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('recursos')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-gray-600 hover:text-[#FF911A] transition-colors text-sm flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                    Recursos
                  </a>
                </li>
                <li>
                  <a
                    href="#depoimentos"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('depoimentos')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-gray-600 hover:text-[#FF911A] transition-colors text-sm flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                    Depoimentos
                  </a>
                </li>
                <li>
                  <a
                    href="#planos"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-gray-600 hover:text-[#FF911A] transition-colors text-sm flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                    Planos
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-gray-600 hover:text-[#FF911A] transition-colors text-sm flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h4 className="text-gray-900 font-bold text-lg mb-4">Contato</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href={WHATSAPP_LINKS.conhecer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#FF911A] transition-colors text-sm flex items-center gap-2"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:suporte@dietacalculada.com"
                    className="text-gray-600 hover:text-[#FF911A] transition-colors text-sm flex items-center gap-2"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m2 7 10 6 10-6"/>
                    </svg>
                    suporte@dietacalculada.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Suporte */}
            <div>
              <h4 className="text-gray-900 font-bold text-lg mb-4">Suporte</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href={WHATSAPP_LINKS.conhecer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#FF911A] transition-colors text-sm flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                    Falar com Bot
                  </a>
                </li>
                <li>
                  <a
                    href={WHATSAPP_LINKS.cancelamento}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#FF911A] transition-colors text-sm flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                    Cancelamento
                  </a>
                </li>
                <li>
                  <span className="text-gray-600 text-sm flex items-start gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                    <span>Garantia de 7 dias</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm text-center md:text-left">
                © {new Date().getFullYear()} Dieta Calculada. Todos os direitos reservados.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  className="text-gray-500 hover:text-[#FF911A] transition-colors text-sm"
                >
                  Termos de Uso
                </a>
                <span className="text-gray-300">|</span>
                <a
                  href="#"
                  className="text-gray-500 hover:text-[#FF911A] transition-colors text-sm"
                >
                  Política de Privacidade
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
