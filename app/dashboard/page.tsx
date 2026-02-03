'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';

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

// Tooltip customizado para os gráficos
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold">{payload[0].value} vendas</p>
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-slate-400 text-xs mb-1">{payload[0].name}</p>
      <p className="text-white font-semibold">{payload[0].value} vendas</p>
    </div>
  );
};

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
          <section className="space-y-6">
            {/* Hero - Receita em Destaque */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 sm:p-8">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGMxLjI1NCAwIDIuNDgtLjEyOCAzLjY2LS4zNzEiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
              <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <p className="text-emerald-100 text-sm font-medium mb-1">Receita Total</p>
                  <p className="text-white text-4xl sm:text-5xl font-bold tracking-tight">
                    {totalVendasValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p className="text-emerald-100 text-sm mt-2">
                    Líquido: <span className="font-semibold text-white">{totalVendasLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <IconCart className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">{data.listaVendas?.totalRows ?? 0} vendas</span>
                </div>
              </div>
            </div>

            {/* Cards principais em grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl border border-slate-700/50 p-5 hover:border-sky-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                    <IconUsers className="w-5 h-5 text-sky-400" />
                  </div>
                </div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Leads</p>
                <p className="text-white text-2xl font-bold mt-1">{data.pagina1?.totalRows ?? 0}</p>
                <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl border border-slate-700/50 p-5 hover:border-green-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <IconCheck className="w-5 h-5 text-green-400" />
                  </div>
                </div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Conversões</p>
                <p className="text-white text-2xl font-bold mt-1">{purchasedCount}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-green-400 text-sm font-semibold">{conversionRate}%</span>
                  <span className="text-slate-500 text-xs">taxa</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl border border-slate-700/50 p-5 hover:border-amber-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <IconTrending className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Investido</p>
                <p className="text-white text-2xl font-bold mt-1">
                  {amountSpentTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </p>
                <p className="text-slate-500 text-xs mt-2">{data.gastosTrafico?.totalRows ?? 0} campanhas</p>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl border border-slate-700/50 p-5 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <IconCog className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Automação</p>
                <p className="text-white text-2xl font-bold mt-1">{zaiaEnviadosCount}</p>
                <p className="text-slate-500 text-xs mt-2">enviados Zaia</p>
              </div>
            </div>

            {/* Gráficos principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vendas por Plano */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold">Vendas por Plano</h3>
                  <div className="flex gap-3">
                    {vendasPorPlanoExibir.map(([plano, count], i) => (
                      <span key={plano} className="flex items-center gap-1.5 text-xs">
                        <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-sky-400' : i === 1 ? 'bg-emerald-400' : 'bg-purple-400'}`} />
                        <span className="text-slate-400">{plano}: <span className="text-white font-medium">{count}</span></span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vendasPorPlanoExibir.map(([name, count]) => ({ name: name || 'Outro', vendas: count }))} margin={{ top: 8, right: 8, left: -10, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                      <Bar dataKey="vendas" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0ea5e9" />
                          <stop offset="100%" stopColor="#0284c7" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {vendasPorPlanoExibir.length === 0 && <p className="text-slate-500 text-sm text-center py-8">Nenhuma venda registrada</p>}
              </div>

              {/* Forma de Pagamento */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold">Forma de Pagamento</h3>
                  <div className="text-xs text-slate-400">
                    Total: <span className="text-white font-medium">{vendasPorFormaPagamento.pix + vendasPorFormaPagamento.cartaoCredito}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="text-slate-300 text-sm">PIX</span>
                    </div>
                    <p className="text-white text-2xl font-bold">{vendasPorFormaPagamento.pix}</p>
                    <p className="text-emerald-400 text-xs mt-1">
                      {((vendasPorFormaPagamento.pix / Math.max(1, vendasPorFormaPagamento.pix + vendasPorFormaPagamento.cartaoCredito)) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-sky-400" />
                      <span className="text-slate-300 text-sm">Cartão</span>
                    </div>
                    <p className="text-white text-2xl font-bold">{vendasPorFormaPagamento.cartaoCredito}</p>
                    <p className="text-sky-400 text-xs mt-1">
                      {((vendasPorFormaPagamento.cartaoCredito / Math.max(1, vendasPorFormaPagamento.pix + vendasPorFormaPagamento.cartaoCredito)) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'PIX', value: vendasPorFormaPagamento.pix },
                          { name: 'Cartão', value: vendasPorFormaPagamento.cartaoCredito },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        <Cell fill="#10b981" stroke="rgb(15 23 42)" strokeWidth={2} />
                        <Cell fill="#0ea5e9" stroke="rgb(15 23 42)" strokeWidth={2} />
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Checkout e Top Campanhas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Checkout */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-white font-semibold mb-4">Vendas por Checkout</h3>
                <div className="space-y-3">
                  {Object.entries(vendasPorCheckout).map(([checkout, count], i) => {
                    const total = Object.values(vendasPorCheckout).reduce((a, b) => a + b, 0);
                    const percent = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={checkout} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-slate-300 text-sm font-medium">{checkout}</span>
                          <span className="text-white font-semibold">{count}</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${i === 0 ? 'bg-gradient-to-r from-sky-500 to-sky-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(vendasPorCheckout).length === 0 && <p className="text-slate-500 text-sm text-center py-4">Nenhuma venda</p>}
                </div>
              </div>

              {/* Top Campanhas */}
              <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Top Campanhas</h3>
                  {melhorAnuncio && (
                    <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                      Melhor: {melhorAnuncio.vendas} vendas
                    </span>
                  )}
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(vendasPorCampanha)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 6)
                        .map(([name, vendas]) => ({ name: name.length > 25 ? name.slice(0, 22) + '…' : name, vendas }))}
                      margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                      <Bar dataKey="vendas" fill="url(#purpleGradient)" radius={[0, 6, 6, 0]} />
                      <defs>
                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#a78bfa" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {Object.keys(vendasPorCampanha).length === 0 && <p className="text-slate-500 text-sm text-center py-8">Nenhuma campanha com vendas</p>}
              </div>
            </div>

            {/* Funil de conversão - Design melhorado */}
            <div className="bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-800/90 backdrop-blur rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-xl mb-1">Funil de conversão</h3>
                    <p className="text-slate-400 text-sm">Acompanhe a jornada do lead até a conversão</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-700/30 rounded-lg border border-slate-600/30">
                    <IconChart className="w-5 h-5 text-sky-400" />
                    <span className="text-slate-300 text-sm font-medium">Taxa geral: {(() => {
                      const leadsQuiz = data.pagina1?.totalRows ?? 0;
                      return leadsQuiz > 0 ? ((purchasedCount / leadsQuiz) * 100).toFixed(1) : '0.0';
                    })()}%</span>
                  </div>
                </div>
              </div>
              {(() => {
                const leadsQuiz = data.pagina1?.totalRows ?? 0;
                const funnelData = [
                  { 
                    name: 'Leads (Quiz)', 
                    value: leadsQuiz, 
                    fill: 'url(#funnelGradient1)',
                    icon: IconUsers,
                    color: 'sky',
                    description: 'Pessoas que completaram o quiz'
                  },
                  { 
                    name: 'Na automação', 
                    value: totalLeadsAutomacao, 
                    fill: 'url(#funnelGradient2)',
                    icon: IconCog,
                    color: 'indigo',
                    description: 'Leads na planilha de automação'
                  },
                  { 
                    name: 'Enviados Zaia', 
                    value: zaiaEnviadosCount, 
                    fill: 'url(#funnelGradient3)',
                    icon: IconMegaphone,
                    color: 'purple',
                    description: 'Leads que receberam envio Zaia'
                  },
                  { 
                    name: 'Compraram', 
                    value: purchasedCount, 
                    fill: 'url(#funnelGradient4)',
                    icon: IconCheck,
                    color: 'emerald',
                    description: 'Conversões realizadas'
                  },
                ];
                const hasAnyValue = funnelData.some((d) => d.value > 0);
                if (!hasAnyValue) {
                  return (
                    <div className="p-12 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700/50 mb-4">
                        <IconChart className="w-8 h-8 text-slate-500" />
                      </div>
                      <p className="text-slate-500 text-sm">Sem dados para exibir o funil</p>
                    </div>
                  );
                }
                
                // Calcular taxas de conversão
                const funnelWithRates = funnelData.map((item, idx) => {
                  const prev = idx > 0 ? funnelData[idx - 1].value : item.value;
                  const rate = prev > 0 ? ((item.value / prev) * 100) : 100;
                  const totalRate = leadsQuiz > 0 ? ((item.value / leadsQuiz) * 100) : 0;
                  return { ...item, rate, totalRate };
                });

                return (
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Funil visual */}
                      <div className="lg:col-span-2">
                        <div className="h-96 relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <FunnelChart>
                              <defs>
                                <linearGradient id="funnelGradient1" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.9} />
                                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.7} />
                                </linearGradient>
                                <linearGradient id="funnelGradient2" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.7} />
                                </linearGradient>
                                <linearGradient id="funnelGradient3" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.7} />
                                </linearGradient>
                                <linearGradient id="funnelGradient4" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                                  <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                                </linearGradient>
                              </defs>
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (!active || !payload?.length) return null;
                                  const p = payload[0].payload;
                                  const item = funnelWithRates.find((d) => d.name === p.name);
                                  if (!item) return null;
                                  return (
                                    <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 shadow-xl min-w-[200px]">
                                      <div className="flex items-center gap-2 mb-2">
                                        {item.icon && <item.icon className="w-4 h-4 text-sky-400" />}
                                        <p className="text-white font-semibold">{p.name}</p>
                                      </div>
                                      <p className="text-slate-300 text-lg font-bold mb-1">{p.value.toLocaleString('pt-BR')} pessoas</p>
                                      <p className="text-slate-400 text-xs mb-2">{item.description}</p>
                                      {item.rate < 100 && (
                                        <div className="pt-2 border-t border-slate-700">
                                          <p className="text-sky-400 text-xs">
                                            Taxa de conversão: <span className="font-semibold">{item.rate.toFixed(1)}%</span>
                                          </p>
                                          <p className="text-slate-500 text-xs mt-1">
                                            Do total inicial: <span className="text-slate-400">{item.totalRate.toFixed(1)}%</span>
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }}
                              />
                              <Funnel 
                                dataKey="value" 
                                data={funnelData} 
                                isAnimationActive
                                animationDuration={800}
                              >
                                <LabelList 
                                  position="center" 
                                  fill="#fff" 
                                  stroke="none" 
                                  dataKey="name" 
                                  className="text-sm font-semibold"
                                  style={{ fontSize: '14px', fontWeight: 600 }}
                                />
                                <LabelList 
                                  position="right" 
                                  fill="#cbd5e1" 
                                  stroke="none" 
                                  dataKey="value" 
                                  formatter={(v: number) => `${v.toLocaleString('pt-BR')}`}
                                  style={{ fontSize: '13px' }}
                                />
                              </Funnel>
                            </FunnelChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Cards informativos */}
                      <div className="space-y-4">
                        {funnelWithRates.map((item, idx) => {
                          const IconComponent = item.icon;
                          const colorConfig = {
                            sky: {
                              bg: 'from-sky-500/20 to-sky-600/10 border-sky-500/30',
                              iconBg: 'bg-sky-500/20',
                              iconColor: 'text-sky-400',
                              textColor: 'text-sky-400',
                            },
                            indigo: {
                              bg: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30',
                              iconBg: 'bg-indigo-500/20',
                              iconColor: 'text-indigo-400',
                              textColor: 'text-indigo-400',
                            },
                            purple: {
                              bg: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
                              iconBg: 'bg-purple-500/20',
                              iconColor: 'text-purple-400',
                              textColor: 'text-purple-400',
                            },
                            emerald: {
                              bg: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
                              iconBg: 'bg-emerald-500/20',
                              iconColor: 'text-emerald-400',
                              textColor: 'text-emerald-400',
                            },
                          };
                          const colors = colorConfig[item.color as keyof typeof colorConfig] || colorConfig.sky;
                          return (
                            <div 
                              key={item.name}
                              className={`bg-gradient-to-br ${colors.bg} rounded-xl border p-4 transition-all hover:scale-[1.02] hover:shadow-lg`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  {IconComponent && (
                                    <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                                      <IconComponent className={`w-4 h-4 ${colors.iconColor}`} />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-white font-semibold text-sm">{item.name}</p>
                                    <p className="text-slate-400 text-xs mt-0.5">{item.description}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-baseline gap-2">
                                  <p className="text-white text-2xl font-bold">{item.value.toLocaleString('pt-BR')}</p>
                                  <span className="text-slate-400 text-xs">pessoas</span>
                                </div>
                                {idx > 0 && item.rate < 100 && (
                                  <div className="pt-2 border-t border-slate-700/50">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-slate-400">Taxa etapa:</span>
                                      <span className={`font-semibold ${colors.textColor}`}>{item.rate.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs mt-1">
                                      <span className="text-slate-400">Do total:</span>
                                      <span className="text-slate-300 font-medium">{item.totalRate.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                )}
                                {idx === 0 && (
                                  <div className="pt-2 border-t border-slate-700/50">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-slate-400">Base inicial</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
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
