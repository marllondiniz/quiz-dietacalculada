'use client';

import { useState } from 'react';

export default function FormatSheet() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFormat = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/sheets/format', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
      } else {
        setError(result.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Formatar Planilha
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          Clique no botão abaixo para formatar automaticamente a planilha do Google Sheets com cabeçalhos, cores e filtros.
        </p>

        <button
          onClick={handleFormat}
          disabled={loading}
          className="w-full py-3 px-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Formatando...' : 'Formatar Planilha'}
        </button>

        {message && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">✅ {message}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">❌ {error}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-2 text-sm">
            O que será formatado:
          </h2>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>✓ Cabeçalhos com fundo escuro e texto branco</li>
            <li>✓ Linha de cabeçalho congelada</li>
            <li>✓ Larguras de colunas otimizadas</li>
            <li>✓ Linhas zebradas (cinza claro alternado)</li>
            <li>✓ Filtros habilitados</li>
          </ul>
        </div>

        <div className="mt-4">
          <a
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            ← Voltar para o Quiz
          </a>
        </div>
      </div>
    </div>
  );
}

