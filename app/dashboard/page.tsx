'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

type SheetData = {
  headers: string[];
  rows: string[][];
  totalRows: number;
};

type DashboardData = {
  pagina1: SheetData;
  listaVendas: SheetData;
  leadsAutomacao: SheetData;
  gastosTrafico: SheetData;
  _meta?: { fetchedAt: string };
};

const IconChart = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const IconClipboard = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);
const IconCart = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const IconCog = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 2.31.826 1.37 1.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 2.31-1.37 1.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-2.31-.826-1.37-1.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-2.31 1.37-1.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconTrending = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const IconRefresh = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const IconClock = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconUsers = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const IconCheck = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconCurrency = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconStore = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);
const IconSearch = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const IconList = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);
const IconChevronLeft = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const IconChevronRight = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
const IconMegaphone = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.027-6.082A1.76 1.76 0 006.43 12H3a1.76 1.76 0 01-1.76-1.76V9.76A1.76 1.76 0 013 8h3.43a1.76 1.76 0 001.126-.627l2.027-6.083A1.76 1.76 0 0111 5.882z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 8v8M18 6v12M21.5 4v16" />
  </svg>
);

const TABS = [
  { id: 'resumo', label: 'Resumo', Icon: IconChart },
  { id: 'pagina1', label: 'Quiz', Icon: IconClipboard },
  { id: 'listaVendas', label: 'Vendas', Icon: IconCart },
  { id: 'leadsAutomacao', label: 'Automação', Icon: IconCog },
  { id: 'gastosTrafico', label: 'Gastos Tráfego', Icon: IconTrending },
] as const;

const ROWS_PER_PAGE = 50;
const MAX_TABLE_ROWS = 500; // máx. linhas carregadas na tabela (paginação interna)

const IconLogout = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('resumo');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Cache-busting com timestamp para evitar cache do navegador/CDN
      const timestamp = Date.now();
      const url = typeof window !== 'undefined' 
        ? `${window.location.origin}/api/dashboard?_t=${timestamp}` 
        : `/api/dashboard?_t=${timestamp}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const res = await fetch(url, {
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erro ${res.status}`);
      }
      const json: DashboardData = await res.json();
      setData(json);
    } catch (e) {
      const message = e instanceof Error 
        ? (e.name === 'AbortError' ? 'Tempo esgotado. Tente novamente.' : e.message)
        : 'Erro ao carregar dados';
      setError(message);
      console.error('[Dashboard] Erro ao carregar:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <img
            src="/WhatsApp%20Image%202026-02-02%20at%2015.02.48.jpeg"
            alt=""
            className="w-full aspect-square object-cover rounded-2xl mb-6 shadow-xl border border-slate-700"
          />
          <p className="text-white font-semibold text-lg mb-2">
            Parabéns! Marllin já está deixando tudo arrumadinho pra você!
          </p>
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400 mt-2" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-500 font-medium transition-colors"
          >
            <IconRefresh className="w-4 h-4" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const purchasedCount =
    data.leadsAutomacao?.rows?.filter(
      (row) => String(row[5] || '').toLowerCase() === 'true'
    ).length ?? 0;

  const totalLeadsAutomacao = data.leadsAutomacao?.totalRows ?? 0;
  const zaiaEnviadosCount =
    data.leadsAutomacao?.rows?.filter(
      (row) => String(row[6] || '').toLowerCase() === 'true'
    ).length ?? 0;
  const conversionRate = totalLeadsAutomacao > 0 
    ? (purchasedCount / totalLeadsAutomacao * 100).toFixed(1) 
    : '0.0';

  const totalVendasValue = (data.listaVendas?.rows ?? []).reduce((acc, row) => {
    const raw = String(row[5] || '')
      .replace(/[^\d.,]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    const num = parseFloat(raw);
    return acc + (Number.isNaN(num) ? 0 : num);
  }, 0);

  const totalVendasLiquido = (data.listaVendas?.rows ?? []).reduce((acc, row) => {
    const raw = String(row[6] || '')
      .replace(/[^\d.,]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    const num = parseFloat(raw);
    return acc + (Number.isNaN(num) ? 0 : num);
  }, 0);

  const vendasPorCheckout = (data.listaVendas?.rows ?? []).reduce((acc, row) => {
    const checkout = String(row[2] || '').toUpperCase();
    if (checkout === 'HUBLA' || checkout === 'CAKTO') {
      acc[checkout] = (acc[checkout] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const PLANO_INVALIDO = /^plano(\s*1)?$/i;
  const vendasPorPlano = (data.listaVendas?.rows ?? []).reduce((acc, row) => {
    const plano = String(row[4] || '').trim();
    if (plano && !PLANO_INVALIDO.test(plano)) {
      acc[plano] = (acc[plano] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const vendasPorPlanoExibir = Object.entries(vendasPorPlano).filter(
    ([plano]) => !PLANO_INVALIDO.test(String(plano).trim())
  );

  // Lista Vendas: coluna N = índice 13 (UTM_CAMPAIGN)
  const INDICE_UTM_CAMPAIGN = 13;
  const vendasPorCampanha = (data.listaVendas?.rows ?? []).reduce(
    (acc, row) => {
      const campanha = String(row[INDICE_UTM_CAMPAIGN] ?? '').trim();
      if (campanha) acc[campanha] = (acc[campanha] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const melhorAnuncio = (() => {
    const entries = Object.entries(vendasPorCampanha);
    if (entries.length === 0) return null;
    let best = entries[0];
    for (let i = 1; i < entries.length; i++) {
      if (entries[i][1] > best[1]) best = entries[i];
    }
    return { nome: best[0], vendas: best[1] };
  })();

  // Coluna H = índice 7 (FORMA DE PAGAMENTO) - mesmo padrão que row[2], row[4], row[5], row[6]
  const INDICE_FORMA_PAGAMENTO = 7;
  const vendasPorFormaPagamento = (data.listaVendas?.rows ?? []).reduce(
    (acc, row) => {
      const raw = String(row[INDICE_FORMA_PAGAMENTO] ?? '').trim().toLowerCase();
      const forma = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (forma.includes('pix')) acc.pix += 1;
      else if (
        forma.includes('credito') ||
        forma.includes('credit') ||
        (forma.includes('cartao') && !forma.includes('debito'))
      )
        acc.cartaoCredito += 1;
      return acc;
    },
    { pix: 0, cartaoCredito: 0 }
  );

  const amountSpentTotal = (() => {
    const sheet = data.gastosTrafico;
    if (!sheet?.headers?.length || !sheet?.rows?.length) return 0;
    const idx = sheet.headers.findIndex(
      (h) => String(h || '').toLowerCase().trim() === 'amount spent'
    );
    if (idx === -1) return 0;
    return sheet.rows.reduce((acc, row) => {
      const raw = String(row[idx] || '')
        .replace(/[^\d.,]/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
      const num = parseFloat(raw);
      return acc + (Number.isNaN(num) ? 0 : num);
    }, 0);
  })();

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="sticky top-0 z-10 bg-slate-800 border-b border-slate-700/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-0.5">Dieta Calculada</p>
          </div>
          <div className="flex items-center gap-3">
            {data._meta?.fetchedAt && (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 tabular-nums bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-600/50">
                <IconClock className="w-4 h-4 text-slate-500" />
                {new Date(data._meta.fetchedAt).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-500/50"
            >
              <IconRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
            <button
              type="button"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/login?redirect=/dashboard');
                router.refresh();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600 hover:text-white transition-colors border border-slate-600"
            >
              <IconLogout className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1 border-b border-slate-700 -mb-px overflow-x-auto">
            {TABS.map((tab) => {
              const TabIcon = tab.Icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'border-sky-400 text-white bg-slate-700/30'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/20'
                  }`}
                >
                  <TabIcon className="w-4 h-4 flex-shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'resumo' && (
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-700/50 border border-slate-600/50 flex items-center justify-center">
                <IconChart className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Visão geral</h2>
                <p className="text-white font-semibold text-lg">Métricas principais</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total de Leads"
                value={data.pagina1?.totalRows ?? 0}
                subtitle="Quiz"
                accent="blue"
                Icon={IconUsers}
              />
              <MetricCard
                title="Total de Vendas"
                value={data.listaVendas?.totalRows ?? 0}
                subtitle="Lista Vendas"
                accent="green"
                Icon={IconCart}
              />
              <MetricCard
                title="Leads Comprados"
                value={purchasedCount}
                subtitle={`${conversionRate}% conversão`}
                accent="emerald"
                Icon={IconCheck}
              />
              <MetricCard
                title="Receita Bruta"
                value={totalVendasValue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 2,
                })}
                subtitle={`Líquido: ${totalVendasLiquido.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}`}
                accent="purple"
                isLarge
                Icon={IconCurrency}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
                  <IconStore className="w-4 h-4 text-sky-400" />
                  Vendas por Checkout
                </h3>
                <div className="space-y-4">
                  {Object.entries(vendasPorCheckout).map(([checkout, count]) => (
                    <div key={checkout} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                      <span className="text-slate-300 font-medium">{checkout}</span>
                      <span className="text-white font-semibold tabular-nums">{count}</span>
                    </div>
                  ))}
                  {Object.keys(vendasPorCheckout).length === 0 && (
                    <p className="text-slate-500 text-sm">Nenhuma venda registrada</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
                  <IconCurrency className="w-4 h-4 text-sky-400" />
                  PIX e Cartão de Crédito
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-slate-700">
                    <span className="text-slate-300 font-medium">PIX</span>
                    <span className="text-white font-semibold tabular-nums">{vendasPorFormaPagamento.pix}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 last:border-0">
                    <span className="text-slate-300 font-medium">Cartão de Crédito</span>
                    <span className="text-white font-semibold tabular-nums">{vendasPorFormaPagamento.cartaoCredito}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
                  <IconList className="w-4 h-4 text-sky-400" />
                  Vendas por Plano
                </h3>
                <div className="space-y-4">
                  {vendasPorPlanoExibir.map(([plano, count]) => (
                    <div key={plano} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                      <span className="text-slate-300 font-medium">{plano || 'Não especificado'}</span>
                      <span className="text-white font-semibold tabular-nums">{count}</span>
                    </div>
                  ))}
                  {vendasPorPlanoExibir.length === 0 && (
                    <p className="text-slate-500 text-sm">Nenhuma venda registrada</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <IconCog className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Leads Automação</p>
                  <p className="text-2xl font-semibold text-white tabular-nums">{zaiaEnviadosCount}</p>
                  <p className="text-xs text-slate-500 mt-1">enviados para Zaia</p>
                </div>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-900/40 flex items-center justify-center flex-shrink-0 border border-emerald-700/30">
                  <IconChart className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Taxa de Conversão</p>
                  <p className="text-2xl font-semibold text-emerald-400 tabular-nums">{conversionRate}%</p>
                </div>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-900/40 flex items-center justify-center flex-shrink-0 border border-sky-700/30">
                  <IconTrending className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Tráfego pago (Amount Spent)</p>
                  <p className="text-2xl font-semibold text-white tabular-nums">
                    {amountSpentTotal.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {data.gastosTrafico?.totalRows ?? 0} registros
                  </p>
                </div>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-900/40 flex items-center justify-center flex-shrink-0 border border-amber-700/30">
                  <IconMegaphone className="w-5 h-5 text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-400 mb-1">Melhor anúncio</p>
                  {melhorAnuncio ? (
                    <>
                      <p className="text-xl font-semibold text-white truncate" title={melhorAnuncio.nome}>
                        {melhorAnuncio.nome}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{melhorAnuncio.vendas} vendas</p>
                    </>
                  ) : (
                    <p className="text-slate-500 text-sm">Sem dados de campanha</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {TABS.filter((t) => t.id !== 'resumo').map(
          (tab) => {
            const raw = data[tab.id as keyof DashboardData];
            const tabData = raw && 'headers' in raw ? raw : null;
            return activeTab === tab.id && (
              <section key={tab.id} className="space-y-4">
                <h2 className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <tab.Icon className="w-4 h-4 text-sky-400" />
                  {tab.label}
                </h2>
                <DataTable
                  headers={tabData?.headers ?? []}
                  rows={
                    tab.id === 'listaVendas'
                      ? (data.listaVendas?.rows ?? [])
                      : (tabData?.rows ?? []).slice(0, MAX_TABLE_ROWS)
                  }
                  totalRows={tabData?.totalRows ?? 0}
                />
              </section>
            );
          }
        )}
      </main>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  accent,
  isLarge,
  Icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  accent: 'blue' | 'green' | 'emerald' | 'purple';
  isLarge?: boolean;
  Icon?: React.ComponentType<{ className?: string }>;
}) {
  const accentClasses = {
    blue: 'border-l-sky-500',
    green: 'border-l-green-500',
    emerald: 'border-l-emerald-500',
    purple: 'border-l-purple-500',
  };
  const iconBg = {
    blue: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    green: 'bg-green-500/10 text-green-400 border border-green-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  };

  return (
    <div className={`bg-slate-800 rounded-xl border border-slate-700 border-l-4 ${accentClasses[accent]} p-5 transition-shadow hover:shadow-xl hover:shadow-black/10`}>
      <div className="flex items-start justify-between gap-3">
        {Icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg[accent]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <p className={`${isLarge ? 'text-2xl' : 'text-xl'} font-semibold text-white tabular-nums`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DataTable({
  headers,
  rows,
  totalRows,
}: {
  headers: string[];
  rows: string[][];
  totalRows: number;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{column: number; direction: 'asc' | 'desc'} | null>(null);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter((row) =>
      row.some((cell) => String(cell || '').toLowerCase().includes(term))
    );
  }, [rows, searchTerm]);

  const sortedRows = useMemo(() => {
    if (!sortConfig) return filteredRows;
    const sorted = [...filteredRows].sort((a, b) => {
      const aVal = String(a[sortConfig.column] || '');
      const bVal = String(b[sortConfig.column] || '');
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredRows, sortConfig]);

  const totalPages = Math.ceil(sortedRows.length / ROWS_PER_PAGE);
  const paginatedRows = sortedRows.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleSort = (columnIndex: number) => {
    setSortConfig((prev) => {
      if (prev?.column === columnIndex) {
        return prev.direction === 'asc' 
          ? { column: columnIndex, direction: 'desc' }
          : null;
      }
      return { column: columnIndex, direction: 'asc' };
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (headers.length === 0 && rows.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center text-slate-500">
        <p className="font-medium text-slate-400 mb-1">Nenhum dado encontrado</p>
        <p className="text-sm text-slate-500">Esta aba está vazia ou não foi encontrada.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Barra de pesquisa */}
      <div className="border-b border-slate-700 p-4 bg-slate-800/80">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Pesquisar em qualquer coluna..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
            />
          </div>
          <div className="text-sm text-slate-400 font-medium">
            {filteredRows.length === totalRows ? (
              <span>{totalRows} registros</span>
            ) : (
              <span>{filteredRows.length} de {totalRows} registros</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-700/50 border-b border-slate-600">
              {headers.map((h, i) => (
                <th
                  key={i}
                  onClick={() => handleSort(i)}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {h || `Col ${i + 1}`}
                    {sortConfig?.column === i && (
                      <span className="text-sky-400 font-normal">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors"
                >
                  {headers.map((_, colIdx) => (
                    <td 
                      key={colIdx} 
                      className="px-4 py-3 text-slate-300 max-w-[300px]"
                      title={row[colIdx]}
                    >
                      <div className="truncate">
                        {row[colIdx] ?? '—'}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-4 py-12 text-center text-slate-500">
                  <p className="font-medium text-slate-400">Nenhum resultado para &quot;{searchTerm}&quot;</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="border-t border-slate-700 bg-slate-800/80 px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-slate-400">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-300 border border-slate-600 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-800"
              >
                <IconChevronLeft className="w-4 h-4" /> Primeira
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-300 border border-slate-600 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-800"
              >
                <IconChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-300 border border-slate-600 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-800"
              >
                Próxima <IconChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-300 border border-slate-600 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-800"
              >
                Última <IconChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
