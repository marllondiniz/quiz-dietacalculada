'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function TestUTMPage() {
  const searchParams = useSearchParams();
  const [utmData, setUtmData] = useState<Record<string, string>>({});
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    // Capturar UTMs da URL
    const utms: Record<string, string> = {};
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    
    utmKeys.forEach(key => {
      const value = searchParams.get(key);
      if (value) {
        utms[key] = value;
      }
    });
    
    setUtmData(utms);

    // Capturar do sessionStorage
    try {
      const saved = sessionStorage.getItem('quiz_utm_tracking');
      if (saved) {
        setSessionData(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao ler sessionStorage:', error);
    }
  }, [searchParams]);

  const generateTestUrl = (source: string, medium: string, campaign: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}&utm_term=teste&utm_content=teste_utm`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🧪 Teste de UTMs
        </h1>

        {/* UTMs da URL */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📍 UTMs da URL Atual
          </h2>
          {Object.keys(utmData).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(utmData).map(([key, value]) => (
                <div key={key} className="flex items-center gap-4 p-3 bg-green-50 rounded">
                  <span className="font-medium text-gray-700 w-32">{key}:</span>
                  <span className="text-gray-900 font-mono">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Nenhuma UTM encontrada na URL</p>
          )}
        </div>

        {/* SessionStorage */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            💾 UTMs no SessionStorage
          </h2>
          {sessionData ? (
            <div className="space-y-2">
              {Object.entries(sessionData).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center gap-4 p-3 bg-blue-50 rounded">
                  <span className="font-medium text-gray-700 w-32">{key}:</span>
                  <span className="text-gray-900 font-mono text-sm">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Nenhum dado no sessionStorage</p>
          )}
        </div>

        {/* URLs de Teste Rápidas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🔗 URLs de Teste Rápidas
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Google Ads:</p>
              <a
                href={generateTestUrl('google', 'cpc', 'teste_google')}
                className="text-blue-600 hover:underline font-mono text-sm break-all"
              >
                {generateTestUrl('google', 'cpc', 'teste_google')}
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Facebook Ads:</p>
              <a
                href={generateTestUrl('facebook', 'social', 'teste_facebook')}
                className="text-blue-600 hover:underline font-mono text-sm break-all"
              >
                {generateTestUrl('facebook', 'social', 'teste_facebook')}
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email Marketing:</p>
              <a
                href={generateTestUrl('email', 'newsletter', 'teste_email')}
                className="text-blue-600 hover:underline font-mono text-sm break-all"
              >
                {generateTestUrl('email', 'newsletter', 'teste_email')}
              </a>
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📋 Como Testar
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Clique em uma das URLs de teste acima</li>
            <li>Verifique se as UTMs aparecem na seção "UTMs da URL Atual"</li>
            <li>Complete o quiz até o final</li>
            <li>Verifique se as UTMs persistem no sessionStorage</li>
            <li>Clique em "GARANTIR PLANO" e verifique se as UTMs aparecem na URL de checkout</li>
            <li>Verifique na planilha do Google Sheets (colunas V-Z)</li>
          </ol>
        </div>

        {/* Link para Quiz */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="inline-block bg-[#FF911A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF911A]/90 transition-colors"
          >
            🚀 Ir para o Quiz
          </a>
        </div>
      </div>
    </div>
  );
}
