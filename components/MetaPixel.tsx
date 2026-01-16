'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    fbqInitialized?: boolean;
    _fbq?: any;
  }
}

export default function MetaPixel() {
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevenir múltiplas inicializações mesmo com React Strict Mode
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    // Aguardar o fbq estar disponível e inicializar apenas uma vez
    const initializePixel = () => {
      if (typeof window === 'undefined') return;
      
      // Verificar se fbq existe no window
      const fbq = (window as any).fbq;
      if (!fbq || typeof fbq !== 'function') return;
      
      // Verificar se já foi inicializado
      if ((window as any).fbqInitialized) return;

      try {
        // Inicializar o pixel apenas uma vez
        (fbq as any)('init', '460171273178832');
        (fbq as any)('track', 'PageView');
        (window as any).fbqInitialized = true;
      } catch (e) {
        console.error('Error initializing Facebook Pixel:', e);
      }
    };

    // Se já estiver carregado, inicializar imediatamente
    if (typeof window !== 'undefined' && (window as any).fbq) {
      initializePixel();
    } else {
      // Caso contrário, aguardar o carregamento do script
      const checkInterval = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).fbq) {
          initializePixel();
          clearInterval(checkInterval);
        }
      }, 100);

      // Limpar após 5 segundos se não carregar
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
      }, 5000);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }
  }, []);

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src="https://www.facebook.com/tr?id=460171273178832&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
    </>
  );
}
