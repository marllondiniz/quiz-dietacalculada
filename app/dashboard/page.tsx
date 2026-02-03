'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@/components/DatePicker';
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
const IconFilter = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);
const IconX = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/** Normaliza texto para comparação (minúsculo, sem acentos) */
function normalizeHeader(h: string): string {
  return String(h || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/** Encontra índice da coluna pelo nome (ou variações) */
function findColumnIndex(headers: string[], ...names: string[]): number {
  for (const name of names) {
    const n = normalizeHeader(name);
    const idx = headers.findIndex((h) => normalizeHeader(h) === n || normalizeHeader(h).includes(n) || n.includes(normalizeHeader(h)));
    if (idx !== -1) return idx;
  }
  return -1;
}

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
  // Filtros do resumo
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [filterCampanha, setFilterCampanha] = useState<string>('');
  const [filterConjunto, setFilterConjunto] = useState<string>('');
  const [filterAnuncio, setFilterAnuncio] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState(false);

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

  const emptyResumo = useMemo(() => ({
    filteredVendas: [] as string[][],
    totalVendasValue: 0,
    totalVendasLiquido: 0,
    vendasPorCheckout: {} as Record<string, number>,
    vendasPorPlanoExibir: [] as [string, number][],
    vendasPorCampanha: {} as Record<string, number>,
    vendasPorFormaPagamento: { pix: 0, cartaoCredito: 0 },
    amountSpentTotal: 0,
    roi: null as number | null,
    filteredLeadsCount: 0,
    filteredPurchasedCount: 0,
    filteredZaiaCount: 0,
    filteredLeadsAutomacaoCount: 0,
    filteredGastosCount: 0,
    quizFunnelData: [] as Array<{ name: string; value: number }>,
    opcoesCampanha: [] as string[],
    opcoesConjunto: [] as string[],
    opcoesAnuncio: [] as string[],
  }), []);

  const filteredResumo = useMemo(() => {
    if (!data) return emptyResumo;
    /** Parseia data em vários formatos (dd/mm/yyyy, yyyy-mm-dd, etc.) */
    const parseDate = (raw: string): Date | null => {
      const s = String(raw || '').trim();
      if (!s) return null;
      const iso = /^\d{4}-\d{2}-\d{2}/.exec(s);
      if (iso) {
        const d = new Date(s);
        return Number.isNaN(d.getTime()) ? null : d;
      }
      const parts = s.split(/[/\-.]/);
      if (parts.length >= 3) {
        if (parts[0].length === 4) {
          const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          return Number.isNaN(d.getTime()) ? null : d;
        }
        const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
        return Number.isNaN(d.getTime()) ? null : d;
      }
      const d = new Date(s);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    const vendasHeaders = data.listaVendas?.headers ?? [];
    const vendasRows = data.listaVendas?.rows ?? [];
    const gastosHeaders = data.gastosTrafico?.headers ?? [];
    const gastosRows = data.gastosTrafico?.rows ?? [];
    const pagina1Headers = data.pagina1?.headers ?? [];
    const pagina1Rows = data.pagina1?.rows ?? [];
    const leadsAutomacaoHeaders = data.leadsAutomacao?.headers ?? [];
    const leadsAutomacaoRows = data.leadsAutomacao?.rows ?? [];

    const vendasDateIdx = findColumnIndex(vendasHeaders, 'data', 'date', 'Data', 'DATA', 'dia');
    const vendasCampanhaIdx = findColumnIndex(vendasHeaders, 'utm_campaign', 'campaign', 'campanha', 'Campanha');
    const vendasCampanhaIdxRes = vendasCampanhaIdx >= 0 ? vendasCampanhaIdx : 13;
    const vendasConjuntoIdx = findColumnIndex(vendasHeaders, 'utm_content', 'adset', 'conjunto', 'Ad Set');
    const vendasAnuncioIdx = findColumnIndex(vendasHeaders, 'utm_term', 'ad_name', 'anúncio', 'Ad Name');

    const gastosDateIdx = findColumnIndex(gastosHeaders, 'date', 'data', 'Data', 'Day', 'reporting_date');
    const gastosCampanhaIdx = findColumnIndex(gastosHeaders, 'campaign name', 'campaign', 'campanha', 'Campaign Name');
    const gastosConjuntoIdx = findColumnIndex(gastosHeaders, 'ad set name', 'adset', 'conjunto', 'Ad Set Name');
    const gastosAnuncioIdx = findColumnIndex(gastosHeaders, 'ad name', 'ad', 'anúncio', 'Ad Name');

    const dateFrom = filterDateFrom ? new Date(filterDateFrom) : null;
    const dateTo = filterDateTo ? new Date(filterDateTo) : null;
    if (dateTo) dateTo.setHours(23, 59, 59, 999);

    const filterVendasRow = (row: string[]): boolean => {
      if (dateFrom || dateTo) {
        const idx = vendasDateIdx >= 0 ? vendasDateIdx : 0;
        const d = parseDate(row[idx]);
        if (d) {
          if (dateFrom && d < dateFrom) return false;
          if (dateTo && d > dateTo) return false;
        }
      }
      if (filterCampanha && vendasCampanhaIdxRes >= 0) {
        const val = String(row[vendasCampanhaIdxRes] ?? '').trim();
        if (val !== filterCampanha) return false;
      }
      if (filterConjunto && vendasConjuntoIdx >= 0) {
        const val = String(row[vendasConjuntoIdx] ?? '').trim();
        if (val !== filterConjunto) return false;
      }
      if (filterAnuncio && vendasAnuncioIdx >= 0) {
        const val = String(row[vendasAnuncioIdx] ?? '').trim();
        if (val !== filterAnuncio) return false;
      }
      return true;
    };

    const filterGastosRow = (row: string[]): boolean => {
      if (dateFrom || dateTo) {
        const idx = gastosDateIdx >= 0 ? gastosDateIdx : 0;
        const d = parseDate(row[idx]);
        if (d) {
          if (dateFrom && d < dateFrom) return false;
          if (dateTo && d > dateTo) return false;
        }
      }
      if (filterCampanha && gastosCampanhaIdx >= 0) {
        const val = String(row[gastosCampanhaIdx] ?? '').trim();
        if (val !== filterCampanha) return false;
      }
      if (filterConjunto && gastosConjuntoIdx >= 0) {
        const val = String(row[gastosConjuntoIdx] ?? '').trim();
        if (val !== filterConjunto) return false;
      }
      if (filterAnuncio && gastosAnuncioIdx >= 0) {
        const val = String(row[gastosAnuncioIdx] ?? '').trim();
        if (val !== filterAnuncio) return false;
      }
      return true;
    };

    const pagina1DateIdx = findColumnIndex(pagina1Headers, 'data', 'date', 'Data', 'DATA', 'dia');
    const pagina1CampanhaIdx = findColumnIndex(pagina1Headers, 'utm_campaign', 'campaign', 'campanha', 'Campanha');
    const pagina1ConjuntoIdx = findColumnIndex(pagina1Headers, 'utm_content', 'adset', 'conjunto', 'Ad Set');
    const pagina1AnuncioIdx = findColumnIndex(pagina1Headers, 'utm_term', 'ad_name', 'anúncio', 'Ad Name');

    const filterPagina1Row = (row: string[]): boolean => {
      if (dateFrom || dateTo) {
        const idx = pagina1DateIdx >= 0 ? pagina1DateIdx : 0;
        const d = parseDate(row[idx]);
        if (d) {
          if (dateFrom && d < dateFrom) return false;
          if (dateTo && d > dateTo) return false;
        }
      }
      if (filterCampanha && pagina1CampanhaIdx >= 0) {
        const val = String(row[pagina1CampanhaIdx] ?? '').trim();
        if (val !== filterCampanha) return false;
      }
      if (filterConjunto && pagina1ConjuntoIdx >= 0) {
        const val = String(row[pagina1ConjuntoIdx] ?? '').trim();
        if (val !== filterConjunto) return false;
      }
      if (filterAnuncio && pagina1AnuncioIdx >= 0) {
        const val = String(row[pagina1AnuncioIdx] ?? '').trim();
        if (val !== filterAnuncio) return false;
      }
      return true;
    };

    const leadsAutomacaoDateIdx = findColumnIndex(leadsAutomacaoHeaders, 'data', 'date', 'Data', 'DATA', 'dia');
    const leadsAutomacaoCampanhaIdx = findColumnIndex(leadsAutomacaoHeaders, 'utm_campaign', 'campaign', 'campanha', 'Campanha');
    const leadsAutomacaoConjuntoIdx = findColumnIndex(leadsAutomacaoHeaders, 'utm_content', 'adset', 'conjunto', 'Ad Set');
    const leadsAutomacaoAnuncioIdx = findColumnIndex(leadsAutomacaoHeaders, 'utm_term', 'ad_name', 'anúncio', 'Ad Name');

    const filterLeadsAutomacaoRow = (row: string[]): boolean => {
      if (dateFrom || dateTo) {
        const idx = leadsAutomacaoDateIdx >= 0 ? leadsAutomacaoDateIdx : 0;
        const d = parseDate(row[idx]);
        if (d) {
          if (dateFrom && d < dateFrom) return false;
          if (dateTo && d > dateTo) return false;
        }
      }
      if (filterCampanha && leadsAutomacaoCampanhaIdx >= 0) {
        const val = String(row[leadsAutomacaoCampanhaIdx] ?? '').trim();
        if (val !== filterCampanha) return false;
      }
      if (filterConjunto && leadsAutomacaoConjuntoIdx >= 0) {
        const val = String(row[leadsAutomacaoConjuntoIdx] ?? '').trim();
        if (val !== filterConjunto) return false;
      }
      if (filterAnuncio && leadsAutomacaoAnuncioIdx >= 0) {
        const val = String(row[leadsAutomacaoAnuncioIdx] ?? '').trim();
        if (val !== filterAnuncio) return false;
      }
      return true;
    };

    const filteredVendas = vendasRows.filter(filterVendasRow);
    const filteredGastos = gastosRows.filter(filterGastosRow);
    const filteredPagina1 = pagina1Rows.filter(filterPagina1Row);
    const filteredLeadsAutomacao = leadsAutomacaoRows.filter(filterLeadsAutomacaoRow);

    const filteredLeadsCount = filteredPagina1.length;
    const filteredLeadsAutomacaoCount = filteredLeadsAutomacao.length;
    const filteredPurchasedCount = filteredLeadsAutomacao.filter(
      (row) => String(row[5] || '').toLowerCase() === 'true'
    ).length;
    const filteredZaiaCount = filteredLeadsAutomacao.filter(
      (row) => String(row[6] || '').toLowerCase() === 'true'
    ).length;

    // Funil do quiz (baseado na aba Página1)
    const quizSteps = [
      { name: 'Gênero', test: (row: string[]) => !!row[2] },
      { name: 'Treinos/semana', test: (row: string[]) => !!row[3] },
      { name: 'Já usou apps', test: (row: string[]) => !!row[4] },
      { name: 'Contato (nome)', test: (row: string[]) => !!row[5] },
      { name: 'Contato (email/telefone)', test: (row: string[]) => !!row[6] || !!row[7] },
      { name: 'Altura e peso', test: (row: string[]) => !!row[8] && !!row[9] },
      { name: 'Nascimento', test: (row: string[]) => !!row[11] },
      { name: 'Objetivo', test: (row: string[]) => !!row[15] },
      { name: 'Obstáculos', test: (row: string[]) => !!row[18] },
      { name: 'Tipo de dieta', test: (row: string[]) => !!row[19] },
      { name: 'Conquistas', test: (row: string[]) => !!row[20] },
      { name: 'Checkout gerado', test: (row: string[]) => !!row[23] },
    ];

    const quizFunnelData = quizSteps.map((step) => ({
      name: step.name,
      value: filteredPagina1.filter((row) => step.test(row)).length,
    }));

    const totalVendasValue = filteredVendas.reduce((acc, row) => {
      const raw = String(row[5] || '').replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
      const num = parseFloat(raw);
      return acc + (Number.isNaN(num) ? 0 : num);
    }, 0);
    const totalVendasLiquido = filteredVendas.reduce((acc, row) => {
      const raw = String(row[6] || '').replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
      const num = parseFloat(raw);
      return acc + (Number.isNaN(num) ? 0 : num);
    }, 0);
    const vendasPorCheckout = filteredVendas.reduce((acc, row) => {
      const checkout = String(row[2] || '').toUpperCase();
      if (checkout === 'HUBLA' || checkout === 'CAKTO') acc[checkout] = (acc[checkout] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const PLANO_INV = /^plano(\s*1)?$/i;
    const vendasPorPlano = filteredVendas.reduce((acc, row) => {
      const plano = String(row[4] || '').trim();
      if (plano && !PLANO_INV.test(plano)) acc[plano] = (acc[plano] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const vendasPorPlanoExibir = Object.entries(vendasPorPlano).filter(([p]) => !PLANO_INV.test(String(p).trim()));
    const vendasPorCampanha = filteredVendas.reduce((acc, row) => {
      const campanha = String(row[vendasCampanhaIdxRes] ?? '').trim();
      if (campanha) acc[campanha] = (acc[campanha] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const indiceForma = findColumnIndex(vendasHeaders, 'forma de pagamento', 'forma pagamento', 'payment');
    const indiceFormaRes = indiceForma >= 0 ? indiceForma : 7;
    const vendasPorFormaPagamento = filteredVendas.reduce((acc, row) => {
      const raw = String(row[indiceFormaRes] ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (raw.includes('pix')) acc.pix += 1;
      else if (raw.includes('credito') || raw.includes('credit') || (raw.includes('cartao') && !raw.includes('debito'))) acc.cartaoCredito += 1;
      return acc;
    }, { pix: 0, cartaoCredito: 0 });

    const amountSpentIdx = gastosHeaders.findIndex((h) => normalizeHeader(h) === 'amount spent' || normalizeHeader(h).includes('amount'));
    const amountSpentTotal = amountSpentIdx >= 0 ? filteredGastos.reduce((acc, row) => {
      const raw = String(row[amountSpentIdx] || '').replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
      const num = parseFloat(raw);
      return acc + (Number.isNaN(num) ? 0 : num);
    }, 0) : 0;

    const roi = amountSpentTotal > 0
      ? ((totalVendasValue - amountSpentTotal) / amountSpentTotal) * 100
      : null;

    const allCampanhas = new Set<string>();
    vendasRows.forEach((r) => { const v = vendasCampanhaIdxRes >= 0 ? String(r[vendasCampanhaIdxRes] ?? '').trim() : ''; if (v) allCampanhas.add(v); });
    gastosRows.forEach((r) => { const v = gastosCampanhaIdx >= 0 ? String(r[gastosCampanhaIdx] ?? '').trim() : ''; if (v) allCampanhas.add(v); });
    const allConjuntos = new Set<string>();
    vendasRows.forEach((r) => { if (vendasConjuntoIdx >= 0) { const v = String(r[vendasConjuntoIdx] ?? '').trim(); if (v) allConjuntos.add(v); } });
    gastosRows.forEach((r) => { if (gastosConjuntoIdx >= 0) { const v = String(r[gastosConjuntoIdx] ?? '').trim(); if (v) allConjuntos.add(v); } });
    const allAnuncios = new Set<string>();
    vendasRows.forEach((r) => { if (vendasAnuncioIdx >= 0) { const v = String(r[vendasAnuncioIdx] ?? '').trim(); if (v) allAnuncios.add(v); } });
    gastosRows.forEach((r) => { if (gastosAnuncioIdx >= 0) { const v = String(r[gastosAnuncioIdx] ?? '').trim(); if (v) allAnuncios.add(v); } });

    return {
      filteredVendas,
      totalVendasValue,
      totalVendasLiquido,
      vendasPorCheckout,
      vendasPorPlanoExibir,
      vendasPorCampanha,
      vendasPorFormaPagamento,
      amountSpentTotal,
      roi,
      filteredLeadsCount,
      filteredPurchasedCount,
      filteredZaiaCount,
      filteredLeadsAutomacaoCount,
      filteredGastosCount: filteredGastos.length,
      quizFunnelData,
      opcoesCampanha: Array.from(allCampanhas).sort(),
      opcoesConjunto: Array.from(allConjuntos).sort(),
      opcoesAnuncio: Array.from(allAnuncios).sort(),
    };
  }, [data, filterDateFrom, filterDateTo, filterCampanha, filterConjunto, filterAnuncio, emptyResumo]);

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

  const {
    totalVendasValue,
    totalVendasLiquido,
    vendasPorCheckout,
    vendasPorPlanoExibir,
    vendasPorCampanha,
    vendasPorFormaPagamento,
    amountSpentTotal,
    roi,
    filteredVendas,
    filteredLeadsCount,
    filteredPurchasedCount,
    filteredZaiaCount,
    filteredLeadsAutomacaoCount,
    filteredGastosCount,
    quizFunnelData,
    opcoesCampanha,
    opcoesConjunto,
    opcoesAnuncio,
  } = filteredResumo;

  const conversionRate = filteredLeadsAutomacaoCount > 0
    ? (filteredPurchasedCount / filteredLeadsAutomacaoCount * 100).toFixed(1)
    : '0.0';

  const melhorAnuncio = (() => {
    const entries = Object.entries(vendasPorCampanha);
    if (entries.length === 0) return null;
    let best = entries[0];
    for (let i = 1; i < entries.length; i++) {
      if (entries[i][1] > best[1]) best = entries[i];
    }
    return { nome: best[0], vendas: best[1] };
  })();

  const hasActiveFilters = filterDateFrom || filterDateTo || filterCampanha || filterConjunto || filterAnuncio;
  const clearFilters = () => {
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterCampanha('');
    setFilterConjunto('');
    setFilterAnuncio('');
  };

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
            {/* Filtros */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-visible" lang="pt-BR">
              <button
                type="button"
                onClick={() => setFilterOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-white font-medium hover:bg-slate-700/30 transition-colors"
                aria-expanded={filterOpen}
                aria-controls="painel-filtros-dashboard"
              >
                <span className="inline-flex items-center gap-2">
                  <IconFilter className="w-5 h-5 text-sky-400" />
                  Filtros
                  {hasActiveFilters && (
                    <span className="text-xs bg-sky-500/30 text-sky-300 px-2 py-0.5 rounded-full">
                      ativos
                    </span>
                  )}
                </span>
                <span className="text-slate-400 text-sm">{filteredVendas.length} vendas no período</span>
              </button>
              {filterOpen && (
                <div id="painel-filtros-dashboard" className="px-4 pb-4 pt-0 border-t border-slate-700/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <DatePicker
                    id="filtro-data-inicio"
                    label="Data de início"
                    value={filterDateFrom}
                    onChange={setFilterDateFrom}
                    title="Selecione a data de início do período"
                    placeholder="Selecione a data"
                  />
                  <DatePicker
                    id="filtro-data-fim"
                    label="Data de fim"
                    value={filterDateTo}
                    onChange={setFilterDateTo}
                    title="Selecione a data de fim do período"
                    placeholder="Selecione a data"
                  />
                  <div>
                    <label htmlFor="filtro-campanha" className="block text-xs font-medium text-slate-400 mb-1">Campanha</label>
                    <select
                      id="filtro-campanha"
                      value={filterCampanha}
                      onChange={(e) => setFilterCampanha(e.target.value)}
                      title="Filtrar por campanha"
                      className="w-full rounded-lg bg-slate-700/50 border border-slate-600 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="">Todas as campanhas</option>
                      {opcoesCampanha.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="filtro-conjunto" className="block text-xs font-medium text-slate-400 mb-1">Conjunto de anúncios</label>
                    <select
                      id="filtro-conjunto"
                      value={filterConjunto}
                      onChange={(e) => setFilterConjunto(e.target.value)}
                      title="Filtrar por conjunto de anúncios"
                      className="w-full rounded-lg bg-slate-700/50 border border-slate-600 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="">Todos os conjuntos</option>
                      {opcoesConjunto.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="filtro-anuncio" className="block text-xs font-medium text-slate-400 mb-1">Anúncio</label>
                    <select
                      id="filtro-anuncio"
                      value={filterAnuncio}
                      onChange={(e) => setFilterAnuncio(e.target.value)}
                      title="Filtrar por anúncio"
                      className="w-full rounded-lg bg-slate-700/50 border border-slate-600 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="">Todos os anúncios</option>
                      {opcoesAnuncio.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                  {hasActiveFilters && (
                    <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
                      <button
                        type="button"
                        onClick={clearFilters}
                        title="Remover todos os filtros"
                        className="inline-flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white text-sm font-medium rounded-lg border border-slate-600 hover:bg-slate-700/50 transition-colors"
                      >
                        <IconX className="w-4 h-4" />
                        Limpar filtros
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hero - Receita em Destaque */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 sm:p-8">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGMxLjI1NCAwIDIuNDgtLjEyOCAzLjY2LS4zNzEiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
              <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <p className="text-emerald-100 text-sm font-medium mb-1">Receita Total {hasActiveFilters && '(filtrado)'}</p>
                  <p className="text-white text-4xl sm:text-5xl font-bold tracking-tight">
                    {totalVendasValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p className="text-emerald-100 text-sm mt-2">
                    Líquido: <span className="font-semibold text-white">{totalVendasLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    {roi !== null && (
                      <span className="ml-3 text-emerald-200">
                        ROI: <span className="font-semibold text-white">{roi >= 0 ? '+' : ''}{roi.toFixed(1)}%</span>
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <IconCart className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">{filteredVendas.length} vendas</span>
                </div>
              </div>
            </div>

            {/* Cards principais em grid (inclui ROI) */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl border border-slate-700/50 p-5 hover:border-sky-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                    <IconUsers className="w-5 h-5 text-sky-400" />
                  </div>
                </div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Leads</p>
                <p className="text-white text-2xl font-bold mt-1">{filteredLeadsCount}</p>
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
                <p className="text-white text-2xl font-bold mt-1">{filteredPurchasedCount}</p>
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
                <p className="text-slate-500 text-xs mt-2">{filteredGastosCount} campanhas</p>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl border border-slate-700/50 p-5 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <IconCog className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Automação</p>
                <p className="text-white text-2xl font-bold mt-1">{filteredZaiaCount}</p>
                <p className="text-slate-500 text-xs mt-2">enviados Zaia</p>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl border border-slate-700/50 p-5 hover:border-amber-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <IconTrending className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">ROI</p>
                <p className="text-white text-2xl font-bold mt-1">
                  {roi !== null ? `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%` : '—'}
                </p>
                <p className="text-slate-500 text-xs mt-2">
                  Investido: {amountSpentTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </p>
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

            {/* Funil do Quiz - Design Premium */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800/95 to-slate-900 border border-slate-700/60 shadow-2xl">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgb(148 163 184) 1px, transparent 0)`,
                  backgroundSize: '32px 32px'
                }} />
              </div>
              
              <div className="relative p-6 border-b border-slate-700/50">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 border border-sky-500/30">
                      <IconChart className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-2xl mb-1">Funil do Quiz</h3>
                      <p className="text-slate-400 text-sm">Analise a jornada completa dos leads</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 px-4 py-3">
                      <p className="text-slate-400 text-xs mb-1">Leads iniciaram</p>
                      <p className="text-white text-2xl font-bold">{quizFunnelData[0]?.value?.toLocaleString('pt-BR') || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/40 rounded-xl px-4 py-3">
                      <p className="text-emerald-300 text-xs mb-1">Taxa de conclusão</p>
                      <p className="text-white text-2xl font-bold">
                        {quizFunnelData.length > 1 && quizFunnelData[0].value > 0
                          ? ((quizFunnelData[quizFunnelData.length - 1].value / quizFunnelData[0].value) * 100).toFixed(1)
                          : '0.0'}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {(() => {
                const palette = ['#0ea5e9', '#22c55e', '#a855f7', '#f59e0b', '#38bdf8', '#e879f9', '#10b981', '#f97316', '#6366f1', '#14b8a6', '#ef4444', '#84cc16'];
                const funnelData = quizFunnelData.map((item, idx) => ({
                  ...item,
                  fill: palette[idx % palette.length],
                }));
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
                
                // Calcular taxas por etapa
                const funnelWithRates = funnelData.map((item, idx) => {
                  const prev = idx > 0 ? funnelData[idx - 1].value : item.value;
                  const rate = prev > 0 ? ((item.value / prev) * 100) : 100;
                  const totalRate = funnelData[0]?.value > 0 ? ((item.value / funnelData[0].value) * 100) : 0;
                  return { ...item, rate, totalRate };
                });

                return (
                  <div className="relative p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Funil visual aprimorado */}
                      <div className="relative">
                        <div className="absolute -top-2 -left-2 w-20 h-20 bg-sky-500/10 rounded-full blur-2xl" />
                        <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl" />
                        <div className="relative h-[500px] rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/40 p-6 backdrop-blur-sm">
                          <ResponsiveContainer width="100%" height="100%">
                            <FunnelChart>
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (!active || !payload?.length) return null;
                                  const p = payload[0].payload;
                                  const item = funnelWithRates.find((d) => d.name === p.name);
                                  if (!item) return null;
                                  const idx = funnelData.findIndex((d) => d.name === item.name);
                                  return (
                                    <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl px-5 py-4 shadow-2xl min-w-[240px]">
                                      <div className="flex items-center gap-2 mb-3">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold">
                                          {idx + 1}
                                        </span>
                                        <p className="text-white font-bold text-base">{p.name}</p>
                                      </div>
                                      <div className="space-y-3">
                                        <div className="flex items-baseline gap-2">
                                          <p className="text-white text-3xl font-bold">{p.value.toLocaleString('pt-BR')}</p>
                                          <span className="text-slate-400 text-sm">pessoas</span>
                                        </div>
                                        <div className="space-y-2 pt-3 border-t border-slate-700">
                                          <div className="flex items-center justify-between">
                                            <span className="text-slate-400 text-xs">Taxa da etapa</span>
                                            <span className="text-emerald-400 font-bold text-sm">{item.rate.toFixed(1)}%</span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className="text-slate-400 text-xs">Do total inicial</span>
                                            <span className="text-sky-400 font-semibold text-sm">{item.totalRate.toFixed(1)}%</span>
                                          </div>
                                          {idx > 0 && (
                                            <div className="flex items-center justify-between">
                                              <span className="text-slate-400 text-xs">Abandonaram</span>
                                              <span className="text-amber-400 font-semibold text-sm">{(100 - item.rate).toFixed(1)}%</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }}
                              />
                              <Funnel 
                                dataKey="value" 
                                data={funnelData} 
                                isAnimationActive
                                animationDuration={1000}
                              >
                                <LabelList 
                                  position="center" 
                                  fill="#fff" 
                                  stroke="none" 
                                  dataKey="name" 
                                  className="text-sm font-bold drop-shadow-lg"
                                  style={{ fontSize: '14px', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                                />
                                <LabelList 
                                  position="right" 
                                  fill="#e2e8f0" 
                                  stroke="none" 
                                  dataKey="value" 
                                  formatter={(value: unknown) => typeof value === 'number' ? value.toLocaleString('pt-BR') : String(value ?? '')}
                                  style={{ fontSize: '14px', fontWeight: 600 }}
                                />
                              </Funnel>
                            </FunnelChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Análise de etapas */}
                      <div className="space-y-4">
                        {/* Resumo geral */}
                        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/60 rounded-2xl border border-slate-700/50 p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-sky-500/10">
                              <IconUsers className="w-5 h-5 text-sky-400" />
                            </div>
                            <h4 className="text-white font-semibold">Resumo de conversão</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-slate-400 text-xs mb-1">Taxa média</p>
                              <p className="text-white text-xl font-bold">
                                {funnelWithRates.length > 0
                                  ? (funnelWithRates.reduce((acc, item) => acc + item.rate, 0) / funnelWithRates.length).toFixed(1)
                                  : '0.0'}%
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-xs mb-1">Maior queda</p>
                              <p className="text-amber-400 text-xl font-bold">
                                {funnelWithRates.length > 1
                                  ? Math.max(...funnelWithRates.slice(1).map((item) => 100 - item.rate)).toFixed(1)
                                  : '0.0'}%
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Lista de etapas com design melhorado */}
                        <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide pr-1">
                          {funnelWithRates.map((item, idx) => {
                            const drop = 100 - item.rate;
                            const isCritical = drop > 30;
                            const isGood = item.rate >= 90;
                            return (
                              <div 
                                key={item.name} 
                                className="group bg-slate-800/60 hover:bg-slate-800/80 rounded-xl border border-slate-700/50 hover:border-slate-600 p-4 transition-all hover:shadow-lg"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                                      isGood ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                      isCritical ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                      'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                    }`}>
                                      {idx + 1}
                                    </span>
                                    <div>
                                      <p className="text-white text-sm font-semibold">{item.name}</p>
                                      {isCritical && (
                                        <span className="inline-flex items-center gap-1 mt-1 text-xs text-amber-400">
                                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                          </svg>
                                          Crítico
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-white text-xl font-bold">{item.value.toLocaleString('pt-BR')}</p>
                                    <p className="text-slate-400 text-xs">pessoas</p>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-slate-400">Avançaram da etapa anterior</span>
                                    <span className={`font-bold ${
                                      isGood ? 'text-emerald-400' :
                                      isCritical ? 'text-amber-400' :
                                      'text-sky-400'
                                    }`}>
                                      {item.rate.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="h-2.5 rounded-full bg-slate-900/60 overflow-hidden border border-slate-700/50">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        isGood ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                                        isCritical ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                                        'bg-gradient-to-r from-sky-500 to-sky-400'
                                      }`}
                                      style={{ width: `${Math.min(100, Math.max(0, item.rate))}%` }}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between text-xs pt-1">
                                    <span className="text-slate-500">Do início: {item.totalRate.toFixed(1)}%</span>
                                    {idx > 0 && <span className="text-slate-500">Perdidos: {drop.toFixed(1)}%</span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
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
