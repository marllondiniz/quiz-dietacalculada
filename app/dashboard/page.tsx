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
  ComposedChart,
  Area,
  Line,
  Legend,
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

const TimelineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  const leads = payload.find((item: any) => item.dataKey === 'leads')?.value ?? 0;
  const automacao = payload.find((item: any) => item.dataKey === 'automacao')?.value ?? 0;
  const vendas = payload.find((item: any) => item.dataKey === 'vendas')?.value ?? 0;
  const gasto = payload.find((item: any) => item.dataKey === 'gasto')?.value ?? 0;

  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3 shadow-xl min-w-[180px]">
      <p className="text-slate-300 text-xs mb-3">{label}</p>
      <div className="space-y-1 text-xs">
        <p className="flex items-center justify-between">
          <span className="text-sky-300">Leads</span>
          <span className="text-white font-semibold">{Number(leads).toLocaleString('pt-BR')}</span>
        </p>
        <p className="flex items-center justify-between">
          <span className="text-purple-300">Automação</span>
          <span className="text-white font-semibold">{Number(automacao).toLocaleString('pt-BR')}</span>
        </p>
        <p className="flex items-center justify-between">
          <span className="text-emerald-300">Vendas</span>
          <span className="text-white font-semibold">{Number(vendas).toLocaleString('pt-BR')}</span>
        </p>
        <p className="flex items-center justify-between">
          <span className="text-amber-300">Investido</span>
          <span className="text-white font-semibold">
            {Number(gasto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </p>
      </div>
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
  const [timelineView, setTimelineView] = useState<'daily' | 'weekly'>('daily');
  // Estados para controlar expansão das tabelas de performance
  const [expandedSections, setExpandedSections] = useState<{
    campanhas: boolean;
    conjuntos: boolean;
    anuncios: boolean;
  }>({
    campanhas: false,
    conjuntos: false,
    anuncios: false,
  });
  // Estado para controlar expansão das perguntas do quiz
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

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
    lucro: 0,
    roi: null as number | null,
    roas: null as number | null,
    funnelResumo: {
      leads: 0,
      automacao: 0,
      vendas: 0,
      leadToAutomationRate: null as number | null,
      automationToSaleRate: null as number | null,
      leadToSaleRate: null as number | null,
      tempoMedioConversaoDias: null as number | null,
      tempoMedioConversaoHoras: null as number | null,
    },
    filteredLeadsCount: 0,
    filteredPurchasedCount: 0,
    filteredZaiaCount: 0,
    filteredLeadsAutomacaoCount: 0,
    filteredGastosCount: 0,
    filteredPagina1: [] as string[][],
    timelineDaily: [] as Array<{ key: string; label: string; leads: number; automacao: number; vendas: number; gasto: number; faturamentoLiquido: number; lucro: number }>,
    timelineWeekly: [] as Array<{ key: string; label: string; leads: number; automacao: number; vendas: number; gasto: number; faturamentoLiquido: number; lucro: number }>,
    segmentacaoOrigem: [] as Array<{ label: string; leads: number; automacao: number; vendas: number; gasto: number }>,
    segmentacaoDispositivo: [] as Array<{ label: string; leads: number; automacao: number; vendas: number }>,
    performanceCampanhas: [] as Array<{
      nome: string;
      leads: number;
      vendas: number;
      gasto: number;
      receita: number;
      roi: number | null;
      cpl: number | null;
      cpa: number | null;
    }>,
    performanceConjuntos: [] as Array<{
      nome: string;
      leads: number;
      vendas: number;
      gasto: number;
      receita: number;
      roi: number | null;
      cpl: number | null;
      cpa: number | null;
    }>,
    performanceAnuncios: [] as Array<{
      nome: string;
      leads: number;
      vendas: number;
      gasto: number;
      receita: number;
      roi: number | null;
      cpl: number | null;
      cpa: number | null;
    }>,
    cpl: null as number | null,
    cpa: null as number | null,
    custoPorVenda: null as number | null,
    ticketMedioBruto: null as number | null,
    ticketMedioLiquido: null as number | null,
    automationMetrics: {
      leadToAutomationRate: null as number | null,
      automationToSaleRate: null as number | null,
      leadToSaleRate: null as number | null,
      tempoMedioConversaoDias: null as number | null,
      tempoMedioConversaoHoras: null as number | null,
      processedRate: null as number | null,
      zaiaParticipation: null as number | null,
    },
    alerts: [] as Array<{ tipo: 'info' | 'warning' | 'danger'; mensagem: string }>,
    quizFunnelData: [] as Array<{ name: string; value: number }>,
    opcoesCampanha: [] as string[],
    opcoesConjunto: [] as string[],
    opcoesAnuncio: [] as string[],
    // Métricas de tráfego
    totalReach: 0,
    totalImpressions: 0,
    totalLandingPageViews: 0,
    avgFrequency: 0,
    avgCTR: 0,
    avgCPC: 0,
    totalClicks: 0,
    cpm: null as number | null,
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
    const vendasRows = (data.listaVendas?.rows ?? []).filter((row, idx) => {
      // Garantir que não conta a linha de header caso tenha vindo nas rows
      if (idx === 0 && row.length > 0) {
        const firstCell = String(row[0] || '').toLowerCase().trim();
        // Se a primeira célula contém palavras típicas de header, ignorar
        if (firstCell.includes('data') || firstCell.includes('date') || firstCell === 'a') {
          return false;
        }
      }
      return true;
    });
    const gastosHeaders = data.gastosTrafico?.headers ?? [];
    const gastosRows = (data.gastosTrafico?.rows ?? []).filter((row, idx) => {
      if (idx === 0 && row.length > 0) {
        const firstCell = String(row[0] || '').toLowerCase().trim();
        if (firstCell.includes('data') || firstCell.includes('date') || firstCell === 'a') {
          return false;
        }
      }
      return true;
    });
    const pagina1Headers = data.pagina1?.headers ?? [];
    const pagina1Rows = (data.pagina1?.rows ?? []).filter((row, idx) => {
      if (idx === 0 && row.length > 0) {
        const firstCell = String(row[0] || '').toLowerCase().trim();
        if (firstCell.includes('data') || firstCell.includes('date') || firstCell === 'a') {
          return false;
        }
      }
      return true;
    });
    const leadsAutomacaoHeaders = data.leadsAutomacao?.headers ?? [];
    const leadsAutomacaoRows = (data.leadsAutomacao?.rows ?? []).filter((row, idx) => {
      if (idx === 0 && row.length > 0) {
        const firstCell = String(row[0] || '').toLowerCase().trim();
        if (firstCell.includes('lead') || firstCell.includes('id') || firstCell === 'a') {
          return false;
        }
      }
      return true;
    });

    const resolveIndex = (idx: number, fallback?: number) => (idx >= 0 ? idx : fallback ?? -1);
    const parseMoney = (value: unknown): number => {
      if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
      const raw = String(value ?? '')
        .replace(/[^\d.,-]/g, '')
        .replace(/\.(?=\d{3}(?:[^\d]|$))/g, '')
        .replace(',', '.');
      const num = parseFloat(raw);
      return Number.isNaN(num) ? 0 : num;
    };
    const toDateKey = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const formatDayMonth = (date: Date) =>
      date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const getWeekStart = (date: Date) => {
      const weekStart = new Date(date);
      weekStart.setHours(0, 0, 0, 0);
      const day = weekStart.getDay(); // 0 (domingo) - 6 (sábado)
      const offset = day === 0 ? -6 : 1 - day; // Ajusta para segunda-feira
      weekStart.setDate(weekStart.getDate() + offset);
      return weekStart;
    };
    const toWeekKey = (date: Date) => {
      const weekStart = getWeekStart(date);
      return toDateKey(weekStart);
    };
    const normalizeEmail = (value: unknown) => String(value ?? '').trim().toLowerCase();
    const normalizePhone = (value: unknown) => String(value ?? '').replace(/\D/g, '');
    const normalizeLabel = (value: unknown, fallback = 'Indefinido') => {
      const text = String(value ?? '').trim();
      return text || fallback;
    };
    const extractIdentifiers = (
      row: string[],
      opts: { emailIdx?: number; phoneIdx?: number; leadIdIdx?: number }
    ): string[] => {
      const ids: string[] = [];
      if (opts.leadIdIdx !== undefined && opts.leadIdIdx >= 0) {
        const leadId = String(row[opts.leadIdIdx] ?? '').trim();
        if (leadId) ids.push(`lead:${leadId}`);
      }
      if (opts.emailIdx !== undefined && opts.emailIdx >= 0) {
        const email = normalizeEmail(row[opts.emailIdx]);
        if (email) ids.push(`email:${email}`);
      }
      if (opts.phoneIdx !== undefined && opts.phoneIdx >= 0) {
        const phone = normalizePhone(row[opts.phoneIdx]);
        if (phone) ids.push(`phone:${phone}`);
      }
      return ids;
    };

    const vendasDateIdx = findColumnIndex(vendasHeaders, 'data', 'date', 'dia', 'created_at', 'order date');
    const vendasValorBrutoIdx = findColumnIndex(
      vendasHeaders,
      'valor bruto',
      'valor total',
      'total',
      'gross value',
      'valor',
      'amount',
      'price'
    );
    const vendasValorLiquidoIdx = findColumnIndex(
      vendasHeaders,
      'valor liquido',
      'líquido',
      'liquido',
      'net value',
      'received',
      'neto'
    );
    const vendasPlanoIdx = findColumnIndex(vendasHeaders, 'plano', 'produto', 'offer', 'nome plano', 'plano contratado');
    const vendasCheckoutIdx = findColumnIndex(vendasHeaders, 'checkout', 'origem', 'origem da venda', 'gateway');
    const vendasCampanhaIdx = findColumnIndex(vendasHeaders, 'utm_campaign', 'campaign', 'campanha', 'Campaign', 'campanha nome');
    const vendasCampanhaIdxRes = resolveIndex(vendasCampanhaIdx);
    const vendasConjuntoIdx = findColumnIndex(vendasHeaders, 'utm_content', 'adset', 'conjunto', 'ad set', 'adset name', 'conjunto anuncio');
    const vendasConjuntoIdxRes = resolveIndex(vendasConjuntoIdx);
    const vendasAnuncioIdx = findColumnIndex(vendasHeaders, 'utm_term', 'ad_name', 'anúncio', 'ad name', 'anuncio');
    const vendasSourceIdx = findColumnIndex(vendasHeaders, 'utm_source', 'source', 'origem');
    const vendasMediumIdx = findColumnIndex(vendasHeaders, 'utm_medium', 'medium', 'meio');
    // Coluna FORMA DE PAGAMENTO:
    // o usuário solicitou explicitamente usar SEMPRE a coluna H da planilha Lista Vendas,
    // que corresponde ao índice 7 (0-based) no array de dados retornado pelo Google Sheets.
    // Assim garantimos que os valores \"PIX\" e \"Cartão de Crédito\" da coluna H
    // aparecem exatamente no card \"Forma de Pagamento\" do dashboard.
    const vendasEmailIdx = findColumnIndex(vendasHeaders, 'email', 'e-mail', 'email cliente');
    const vendasTelefoneIdx = findColumnIndex(vendasHeaders, 'telefone', 'phone', 'celular');
    const vendasLeadIdIdx = findColumnIndex(vendasHeaders, 'lead id', 'id lead', 'lead');
    const vendasPedidoIdx = findColumnIndex(vendasHeaders, 'pedido', 'order id', 'invoice id', 'transaction id');
    const vendasStatusIdx = findColumnIndex(vendasHeaders, 'status', 'reembolso', 'situação', 'situacao', 'refund');

    const gastosDateIdx = findColumnIndex(gastosHeaders, 'date', 'data', 'dia', 'Day', 'reporting_date');
    const gastosCampanhaIdx = findColumnIndex(gastosHeaders, 'campaign name', 'campaign', 'campanha', 'Campaign Name');
    const gastosConjuntoIdx = findColumnIndex(gastosHeaders, 'ad set name', 'adset', 'conjunto', 'Ad Set Name');
    const gastosAnuncioIdx = findColumnIndex(gastosHeaders, 'ad name', 'ad', 'anúncio', 'Ad Name');
    const gastosCanalIdx = findColumnIndex(gastosHeaders, 'utm_source', 'source', 'origem', 'channel');
    const gastosDeviceIdx = findColumnIndex(gastosHeaders, 'device', 'dispositivo', 'platform');
    const gastosAmountIdx = findColumnIndex(gastosHeaders, 'amount spent', 'valor gasto', 'spent', 'custo');
    // Métricas de tráfego
    const gastosReachIdx = findColumnIndex(gastosHeaders, 'reach', 'alcance', 'Reach');
    const gastosFrequencyIdx = findColumnIndex(gastosHeaders, 'frequency', 'frequência', 'freq', 'Frequency');
    const gastosImpressionsIdx = findColumnIndex(gastosHeaders, 'impressions', 'impressões', 'imp', 'Impressions');
    const gastosLandingPageViewsIdx = findColumnIndex(gastosHeaders, 'landing page views', 'visualizações página', 'landing page', 'Landing Page Views', 'page views');
    const gastosCTRIdx = findColumnIndex(gastosHeaders, 'ctr', 'link click-through rate', 'click-through rate', 'CTR', 'Link CTR');
    const gastosCPCIdx = findColumnIndex(gastosHeaders, 'cpc', 'cost per link click', 'cost per click', 'CPC', 'Link CPC');

    const pagina1DateIdx = findColumnIndex(pagina1Headers, 'data', 'date', 'dia', 'created_at', 'timestamp');
    const pagina1CampanhaIdx = findColumnIndex(pagina1Headers, 'utm_campaign', 'campaign', 'campanha', 'Campanha');
    const pagina1ConjuntoIdx = findColumnIndex(pagina1Headers, 'utm_content', 'adset', 'conjunto', 'Ad Set');
    const pagina1AnuncioIdx = findColumnIndex(pagina1Headers, 'utm_term', 'ad_name', 'anúncio', 'Ad Name');
    const pagina1SourceIdx = findColumnIndex(pagina1Headers, 'utm_source', 'source', 'origem');
    const pagina1MediumIdx = findColumnIndex(pagina1Headers, 'utm_medium', 'medium', 'meio');
    const pagina1DeviceIdx = findColumnIndex(pagina1Headers, 'device', 'dispositivo', 'plataforma');
    const pagina1EmailIdx = findColumnIndex(pagina1Headers, 'email', 'e-mail', 'Email');
    const pagina1TelefoneIdx = findColumnIndex(pagina1Headers, 'telefone', 'phone', 'celular');
    const pagina1LeadIdIdx = findColumnIndex(pagina1Headers, 'lead id', 'id', 'id lead');

    const leadsAutomacaoDateIdx = findColumnIndex(leadsAutomacaoHeaders, 'data', 'date', 'dia', 'created_at', 'timestamp');
    const leadsAutomacaoCampanhaIdx = findColumnIndex(leadsAutomacaoHeaders, 'utm_campaign', 'campaign', 'campanha', 'Campanha');
    const leadsAutomacaoConjuntoIdx = findColumnIndex(leadsAutomacaoHeaders, 'utm_content', 'adset', 'conjunto', 'Ad Set');
    const leadsAutomacaoAnuncioIdx = findColumnIndex(leadsAutomacaoHeaders, 'utm_term', 'ad_name', 'anúncio', 'Ad Name');
    const leadsAutomacaoSourceIdx = findColumnIndex(leadsAutomacaoHeaders, 'utm_source', 'source', 'origem');
    const leadsAutomacaoMediumIdx = findColumnIndex(leadsAutomacaoHeaders, 'utm_medium', 'medium', 'meio');
    const leadsAutomacaoDeviceIdx = findColumnIndex(leadsAutomacaoHeaders, 'device', 'dispositivo', 'plataforma');
    const leadsAutomacaoEmailIdx = findColumnIndex(leadsAutomacaoHeaders, 'email', 'e-mail');
    const leadsAutomacaoTelefoneIdx = findColumnIndex(leadsAutomacaoHeaders, 'telefone', 'phone', 'celular');
    const leadsAutomacaoLeadIdIdx = findColumnIndex(leadsAutomacaoHeaders, 'lead id', 'id lead', 'lead');

    const vendasDateIdxRes = resolveIndex(vendasDateIdx, 0);
    const vendasAnuncioIdxRes = resolveIndex(vendasAnuncioIdx);
    const vendasSourceIdxRes = resolveIndex(vendasSourceIdx);
    const vendasMediumIdxRes = resolveIndex(vendasMediumIdx);
    
    // Força índices fixos para VALOR BRUTO (coluna F = índice 5) e VALOR LÍQUIDO (coluna G = índice 6)
    // pois sabemos a estrutura exata da planilha Lista Vendas
    const vendasValorBrutoIdxRes = 5;  // Coluna F: VALOR BRUTO
    const vendasValorLiquidoIdxRes = 6; // Coluna G: VALOR LÍQUIDO
    const vendasPlanoIdxRes = resolveIndex(vendasPlanoIdx);
    const vendasCheckoutIdxRes = resolveIndex(vendasCheckoutIdx, 2);
    // Força a usar SEMPRE a coluna H (índice 7) como \"Forma de Pagamento\"
    const vendasFormaPagamentoIdxRes = vendasHeaders.length > 7 ? 7 : -1;
    
    // Log de debug dos índices das colunas
    console.log('[Dashboard] Índices das colunas de vendas:', {
      campanha: vendasCampanhaIdxRes,
      conjunto: vendasConjuntoIdxRes,
      anuncio: vendasAnuncioIdxRes,
      plano: vendasPlanoIdxRes,
      formaPagamento: vendasFormaPagamentoIdxRes,
    });
    const vendasEmailIdxRes = resolveIndex(vendasEmailIdx);
    const vendasTelefoneIdxRes = resolveIndex(vendasTelefoneIdx);
    const vendasLeadIdIdxRes = resolveIndex(vendasLeadIdIdx);
    const vendasPedidoIdxRes = resolveIndex(vendasPedidoIdx);
    const vendasStatusIdxRes = resolveIndex(vendasStatusIdx);

    const pagina1DateIdxRes = resolveIndex(pagina1DateIdx, 0);
    const pagina1CampanhaIdxRes = resolveIndex(pagina1CampanhaIdx);
    const pagina1ConjuntoIdxRes = resolveIndex(pagina1ConjuntoIdx);
    const pagina1AnuncioIdxRes = resolveIndex(pagina1AnuncioIdx);
    const pagina1SourceIdxRes = resolveIndex(pagina1SourceIdx);
    const pagina1MediumIdxRes = resolveIndex(pagina1MediumIdx);
    const pagina1DeviceIdxRes = resolveIndex(pagina1DeviceIdx);
    const pagina1EmailIdxRes = resolveIndex(pagina1EmailIdx, 6);
    const pagina1TelefoneIdxRes = resolveIndex(pagina1TelefoneIdx, 7);
    const pagina1LeadIdIdxRes = resolveIndex(pagina1LeadIdIdx);

    const leadsAutomacaoDateIdxRes = resolveIndex(leadsAutomacaoDateIdx, 0);
    const leadsAutomacaoCampanhaIdxRes = resolveIndex(leadsAutomacaoCampanhaIdx);
    const leadsAutomacaoConjuntoIdxRes = resolveIndex(leadsAutomacaoConjuntoIdx);
    const leadsAutomacaoAnuncioIdxRes = resolveIndex(leadsAutomacaoAnuncioIdx);
    const leadsAutomacaoSourceIdxRes = resolveIndex(leadsAutomacaoSourceIdx);
    const leadsAutomacaoMediumIdxRes = resolveIndex(leadsAutomacaoMediumIdx);
    const leadsAutomacaoDeviceIdxRes = resolveIndex(leadsAutomacaoDeviceIdx);
    const leadsAutomacaoEmailIdxRes = resolveIndex(leadsAutomacaoEmailIdx);
    const leadsAutomacaoTelefoneIdxRes = resolveIndex(leadsAutomacaoTelefoneIdx);
    const leadsAutomacaoLeadIdIdxRes = resolveIndex(leadsAutomacaoLeadIdIdx);

    const gastosDateIdxRes = resolveIndex(gastosDateIdx, 0);
    const gastosCampanhaIdxRes = resolveIndex(gastosCampanhaIdx);
    const gastosConjuntoIdxRes = resolveIndex(gastosConjuntoIdx);
    const gastosAnuncioIdxRes = resolveIndex(gastosAnuncioIdx);
    const gastosCanalIdxRes = resolveIndex(gastosCanalIdx);
    const gastosDeviceIdxRes = resolveIndex(gastosDeviceIdx);
    const gastosAmountIdxRes = resolveIndex(gastosAmountIdx);

    const dateFrom = filterDateFrom ? new Date(filterDateFrom) : null;
    const dateTo = filterDateTo ? new Date(filterDateTo) : null;
    if (dateTo) dateTo.setHours(23, 59, 59, 999);

    const filterVendasRow = (row: string[]): boolean => {
      if (dateFrom || dateTo) {
        const d = parseDate(row[vendasDateIdxRes] ?? row[0]);
        if (d) {
          if (dateFrom && d < dateFrom) return false;
          if (dateTo && d > dateTo) return false;
        }
      }
      if (filterCampanha && vendasCampanhaIdxRes >= 0) {
        const val = String(row[vendasCampanhaIdxRes] ?? '').trim();
        if (val !== filterCampanha) return false;
      }
      if (filterConjunto && vendasConjuntoIdxRes >= 0) {
        const val = String(row[vendasConjuntoIdxRes] ?? '').trim();
        if (val !== filterConjunto) return false;
      }
      if (filterAnuncio && vendasAnuncioIdxRes >= 0) {
        const val = String(row[vendasAnuncioIdxRes] ?? '').trim();
        if (val !== filterAnuncio) return false;
      }
      // Excluir vendas reembolsadas: se existir coluna STATUS/REEMBOLSO e valor for "reembolsado", não contar
      if (vendasStatusIdxRes >= 0) {
        const status = String(row[vendasStatusIdxRes] ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (status === 'reembolsado' || status === 'reembolso' || status === 'refund' || status === 'cancelado' || status === 'cancelada') {
          return false;
        }
      }
      return true;
    };

    const filterGastosRow = (row: string[]): boolean => {
      if (dateFrom || dateTo) {
        const d = parseDate(row[gastosDateIdxRes] ?? row[0]);
        if (d) {
          if (dateFrom && d < dateFrom) return false;
          if (dateTo && d > dateTo) return false;
        }
      }
      if (filterCampanha && gastosCampanhaIdxRes >= 0) {
        const val = String(row[gastosCampanhaIdxRes] ?? '').trim();
        if (val !== filterCampanha) return false;
      }
      if (filterConjunto && gastosConjuntoIdxRes >= 0) {
        const val = String(row[gastosConjuntoIdxRes] ?? '').trim();
        if (val !== filterConjunto) return false;
      }
      if (filterAnuncio && gastosAnuncioIdxRes >= 0) {
        const val = String(row[gastosAnuncioIdxRes] ?? '').trim();
        if (val !== filterAnuncio) return false;
      }
      return true;
    };

    const filterPagina1Row = (row: string[]): boolean => {
      if (dateFrom || dateTo) {
        const d = parseDate(row[pagina1DateIdxRes] ?? row[0]);
        if (d) {
          if (dateFrom && d < dateFrom) return false;
          if (dateTo && d > dateTo) return false;
        }
      }
      if (filterCampanha && pagina1CampanhaIdxRes >= 0) {
        const val = String(row[pagina1CampanhaIdxRes] ?? '').trim();
        if (val !== filterCampanha) return false;
      }
      if (filterConjunto && pagina1ConjuntoIdxRes >= 0) {
        const val = String(row[pagina1ConjuntoIdxRes] ?? '').trim();
        if (val !== filterConjunto) return false;
      }
      if (filterAnuncio && pagina1AnuncioIdxRes >= 0) {
        const val = String(row[pagina1AnuncioIdxRes] ?? '').trim();
        if (val !== filterAnuncio) return false;
      }
      return true;
    };

    const filterLeadsAutomacaoRow = (row: string[]): boolean => {
      if (dateFrom || dateTo) {
        const d = parseDate(row[leadsAutomacaoDateIdxRes] ?? row[0]);
        if (d) {
          if (dateFrom && d < dateFrom) return false;
          if (dateTo && d > dateTo) return false;
        }
      }
      if (filterCampanha && leadsAutomacaoCampanhaIdxRes >= 0) {
        const val = String(row[leadsAutomacaoCampanhaIdxRes] ?? '').trim();
        if (val !== filterCampanha) return false;
      }
      if (filterConjunto && leadsAutomacaoConjuntoIdxRes >= 0) {
        const val = String(row[leadsAutomacaoConjuntoIdxRes] ?? '').trim();
        if (val !== filterConjunto) return false;
      }
      if (filterAnuncio && leadsAutomacaoAnuncioIdxRes >= 0) {
        const val = String(row[leadsAutomacaoAnuncioIdxRes] ?? '').trim();
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
    
    // Contar vendas marcadas na tabela de automação (coluna purchased = 'true')
    // Nota: Nem todas as vendas podem estar marcadas aqui, então este é um número aproximado
    const filteredPurchasedCount = filteredLeadsAutomacao.filter(
      (row) => String(row[5] || '').toLowerCase() === 'true'
    ).length;
    
    const filteredZaiaCount = filteredLeadsAutomacao.filter(
      (row) => String(row[6] || '').toLowerCase() === 'true'
    ).length;

    const funnelSnapshot = {
      leads: filteredLeadsCount,
      automacao: filteredLeadsAutomacaoCount,
      vendas: filteredPurchasedCount,
    };

    const dailyMap = new Map<
      string,
      { key: string; date: Date; label: string; leads: number; automacao: number; vendas: number; gasto: number; faturamentoLiquido: number; lucro: number }
    >();
    const weeklyMap = new Map<
      string,
      { key: string; startDate: Date; endDate: Date; label: string; leads: number; automacao: number; vendas: number; gasto: number; faturamentoLiquido: number; lucro: number }
    >();
    const ensureDailyEntry = (key: string, date: Date) => {
      let entry = dailyMap.get(key);
      if (!entry) {
        entry = { key, date, label: formatDayMonth(date), leads: 0, automacao: 0, vendas: 0, gasto: 0, faturamentoLiquido: 0, lucro: 0 };
        dailyMap.set(key, entry);
      }
      return entry;
    };
    const ensureWeeklyEntry = (key: string, startDate: Date) => {
      let entry = weeklyMap.get(key);
      if (!entry) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        entry = {
          key,
          startDate,
          endDate,
          label: `${formatDayMonth(startDate)} - ${formatDayMonth(endDate)}`,
          leads: 0,
          automacao: 0,
          vendas: 0,
          gasto: 0,
          faturamentoLiquido: 0,
          lucro: 0,
        };
        weeklyMap.set(key, entry);
      }
      return entry;
    };

    const addToAccumulator = (map: Map<string, number>, key: string, value: number) => {
      if (!key) return;
      map.set(key, (map.get(key) ?? 0) + value);
    };

    const originMetrics = new Map<string, { label: string; leads: number; automacao: number; vendas: number; gasto: number }>();
    const deviceMetrics = new Map<string, { label: string; leads: number; automacao: number; vendas: number }>();
    const ensureOriginEntry = (label: string) => {
      const key = label || 'Indefinido';
      let entry = originMetrics.get(key);
      if (!entry) {
        entry = { label: key, leads: 0, automacao: 0, vendas: 0, gasto: 0 };
        originMetrics.set(key, entry);
      }
      return entry;
    };
    const ensureDeviceEntry = (label: string) => {
      const key = label || 'Indefinido';
      let entry = deviceMetrics.get(key);
      if (!entry) {
        entry = { label: key, leads: 0, automacao: 0, vendas: 0 };
        deviceMetrics.set(key, entry);
      }
      return entry;
    };

    const leadsPorCampanha = new Map<string, number>();
    const leadsPorConjunto = new Map<string, number>();
    const leadsPorAnuncio = new Map<string, number>();
    const gastosPorCampanha = new Map<string, number>();
    const gastosPorConjunto = new Map<string, number>();
    const gastosPorAnuncio = new Map<string, number>();
    const vendasPorCampanhaMap = new Map<string, number>();
    const vendasPorConjuntoMap = new Map<string, number>();
    const vendasPorAnuncioMap = new Map<string, number>();
    const receitaPorCampanha = new Map<string, number>();
    const receitaLiquidaPorCampanha = new Map<string, number>();
    const receitaPorConjunto = new Map<string, number>();
    const receitaPorAnuncio = new Map<string, number>();

    const leadMeta = new Map<
      string,
      { firstSeen: Date; source?: string; device?: string; campanha?: string; conjunto?: string; anuncio?: string }
    >();
    const registerLeadMeta = (
      identifiers: string[],
      info: { date: Date; source?: string; device?: string; campanha?: string; conjunto?: string; anuncio?: string }
    ) => {
      identifiers.forEach((identifier) => {
        if (!identifier) return;
        const existing = leadMeta.get(identifier);
        if (!existing || info.date < existing.firstSeen) {
          leadMeta.set(identifier, { firstSeen: info.date, ...info });
        } else {
          const merged = { ...existing };
          if (info.source && !merged.source) merged.source = info.source;
          if (info.device && !merged.device) merged.device = info.device;
          if (info.campanha && !merged.campanha) merged.campanha = info.campanha;
          if (info.conjunto && !merged.conjunto) merged.conjunto = info.conjunto;
          if (info.anuncio && !merged.anuncio) merged.anuncio = info.anuncio;
          leadMeta.set(identifier, merged);
        }
      });
    };

    filteredPagina1.forEach((row) => {
      const date = parseDate(pagina1DateIdxRes >= 0 ? row[pagina1DateIdxRes] : row[0]);
      if (!date) return;
      const diario = ensureDailyEntry(toDateKey(date), date);
      diario.leads += 1;
      const semanal = ensureWeeklyEntry(toWeekKey(date), getWeekStart(date));
      semanal.leads += 1;

      const source = pagina1SourceIdxRes >= 0 ? normalizeLabel(row[pagina1SourceIdxRes], 'Sem origem') : 'Sem origem';
      const device = pagina1DeviceIdxRes >= 0 ? normalizeLabel(row[pagina1DeviceIdxRes], 'Sem dispositivo') : 'Sem dispositivo';
      ensureOriginEntry(source).leads += 1;
      ensureDeviceEntry(device).leads += 1;

      const campanha = pagina1CampanhaIdxRes >= 0 ? normalizeLabel(row[pagina1CampanhaIdxRes], '') : '';
      const conjunto = pagina1ConjuntoIdxRes >= 0 ? normalizeLabel(row[pagina1ConjuntoIdxRes], '') : '';
      const anuncio = pagina1AnuncioIdxRes >= 0 ? normalizeLabel(row[pagina1AnuncioIdxRes], '') : '';

      if (campanha) addToAccumulator(leadsPorCampanha, campanha, 1);
      if (conjunto) addToAccumulator(leadsPorConjunto, conjunto, 1);
      if (anuncio) addToAccumulator(leadsPorAnuncio, anuncio, 1);

      const identifiers = extractIdentifiers(row, {
        emailIdx: pagina1EmailIdxRes,
        phoneIdx: pagina1TelefoneIdxRes,
        leadIdIdx: pagina1LeadIdIdxRes,
      });
      if (identifiers.length) {
        registerLeadMeta(identifiers, { date, source, device, campanha, conjunto, anuncio });
      }
    });

    filteredLeadsAutomacao.forEach((row) => {
      const date = parseDate(leadsAutomacaoDateIdxRes >= 0 ? row[leadsAutomacaoDateIdxRes] : row[0]);
      if (date) {
        ensureDailyEntry(toDateKey(date), date).automacao += 1;
        ensureWeeklyEntry(toWeekKey(date), getWeekStart(date)).automacao += 1;
      }
      const source =
        leadsAutomacaoSourceIdxRes >= 0 ? normalizeLabel(row[leadsAutomacaoSourceIdxRes], 'Sem origem') : undefined;
      const device =
        leadsAutomacaoDeviceIdxRes >= 0 ? normalizeLabel(row[leadsAutomacaoDeviceIdxRes], 'Sem dispositivo') : undefined;
      if (source) ensureOriginEntry(source).automacao += 1;
      if (device) ensureDeviceEntry(device).automacao += 1;

      const identifiers = extractIdentifiers(row, {
        emailIdx: leadsAutomacaoEmailIdxRes,
        phoneIdx: leadsAutomacaoTelefoneIdxRes,
        leadIdIdx: leadsAutomacaoLeadIdIdxRes,
      });
      if (identifiers.length) {
        const dateInfo = date ?? new Date();
        registerLeadMeta(identifiers, { date: dateInfo, source, device });
      }
    });

    filteredGastos.forEach((row) => {
      const date = parseDate(gastosDateIdxRes >= 0 ? row[gastosDateIdxRes] : row[0]);
      const amount = gastosAmountIdxRes >= 0 ? parseMoney(row[gastosAmountIdxRes]) : 0;
      if (date) {
        ensureDailyEntry(toDateKey(date), date).gasto += amount;
        ensureWeeklyEntry(toWeekKey(date), getWeekStart(date)).gasto += amount;
      }
      const campanha = gastosCampanhaIdxRes >= 0 ? normalizeLabel(row[gastosCampanhaIdxRes], '') : '';
      const conjunto = gastosConjuntoIdxRes >= 0 ? normalizeLabel(row[gastosConjuntoIdxRes], '') : '';
      const anuncio = gastosAnuncioIdxRes >= 0 ? normalizeLabel(row[gastosAnuncioIdxRes], '') : '';
      const origem = gastosCanalIdxRes >= 0 ? normalizeLabel(row[gastosCanalIdxRes], 'Sem origem') : null;
      const device = gastosDeviceIdxRes >= 0 ? normalizeLabel(row[gastosDeviceIdxRes], 'Sem dispositivo') : null;

      if (campanha) addToAccumulator(gastosPorCampanha, campanha, amount);
      if (conjunto) addToAccumulator(gastosPorConjunto, conjunto, amount);
      if (anuncio) addToAccumulator(gastosPorAnuncio, anuncio, amount);
      if (origem) ensureOriginEntry(origem).gasto += amount;
      if (device) ensureDeviceEntry(device).leads += 0; // garante presença
    });

    const conversionDiffs: number[] = [];
    filteredVendas.forEach((row) => {
      const date = parseDate(vendasDateIdxRes >= 0 ? row[vendasDateIdxRes] : row[0]);
      const valorBruto = parseMoney(vendasValorBrutoIdxRes >= 0 ? row[vendasValorBrutoIdxRes] : row[5]);
      const valorLiquido = parseMoney(vendasValorLiquidoIdxRes >= 0 ? row[vendasValorLiquidoIdxRes] : row[6]);
      
      if (date) {
        const dailyEntry = ensureDailyEntry(toDateKey(date), date);
        dailyEntry.vendas += 1;
        dailyEntry.faturamentoLiquido += valorLiquido;
        
        const weeklyEntry = ensureWeeklyEntry(toWeekKey(date), getWeekStart(date));
        weeklyEntry.vendas += 1;
        weeklyEntry.faturamentoLiquido += valorLiquido;
      }

      let campanha = vendasCampanhaIdxRes >= 0 ? normalizeLabel(row[vendasCampanhaIdxRes], '') : '';
      let conjunto = vendasConjuntoIdxRes >= 0 ? normalizeLabel(row[vendasConjuntoIdxRes], '') : '';
      let anuncio = vendasAnuncioIdxRes >= 0 ? normalizeLabel(row[vendasAnuncioIdxRes], '') : '';
      const origemVenda = vendasSourceIdxRes >= 0 ? normalizeLabel(row[vendasSourceIdxRes], 'Sem origem') : undefined;
      const deviceVenda = vendasMediumIdxRes >= 0 ? normalizeLabel(row[vendasMediumIdxRes], '') : undefined;

      const identifiers = extractIdentifiers(row, {
        emailIdx: vendasEmailIdxRes,
        phoneIdx: vendasTelefoneIdxRes,
        leadIdIdx: vendasLeadIdIdxRes,
      });

      let attributed = false;
      if (identifiers.length) {
        for (const identifier of identifiers) {
          const meta = leadMeta.get(identifier);
          if (!meta || !date) continue;
          attributed = true;
          if (!campanha && meta.campanha) campanha = meta.campanha;
          if (!conjunto && meta.conjunto) conjunto = meta.conjunto;
          if (!anuncio && meta.anuncio) anuncio = meta.anuncio;
          const diffMs = date.getTime() - meta.firstSeen.getTime();
          if (diffMs >= 0) {
            conversionDiffs.push(diffMs / (1000 * 60 * 60 * 24));
          }
          const originLabel = meta.source || origemVenda || 'Sem origem';
          ensureOriginEntry(originLabel).vendas += 1;
          const deviceLabel = meta.device || deviceVenda || 'Sem dispositivo';
          ensureDeviceEntry(deviceLabel).vendas += 1;
          break;
        }
      }

      if (!attributed) {
        if (origemVenda) ensureOriginEntry(origemVenda).vendas += 1;
        if (deviceVenda) ensureDeviceEntry(deviceVenda).vendas += 1;
      }

      const campanhaFinal = campanha || 'Sem campanha';
      const conjuntoFinal = conjunto || 'Sem conjunto';
      const anuncioFinal = anuncio || 'Sem anúncio';
      addToAccumulator(vendasPorCampanhaMap, campanhaFinal, 1);
      addToAccumulator(vendasPorConjuntoMap, conjuntoFinal, 1);
      addToAccumulator(vendasPorAnuncioMap, anuncioFinal, 1);
      addToAccumulator(receitaPorCampanha, campanhaFinal, valorBruto);
      addToAccumulator(receitaLiquidaPorCampanha, campanhaFinal, valorLiquido);
      addToAccumulator(receitaPorConjunto, conjuntoFinal, valorBruto);
      addToAccumulator(receitaPorAnuncio, anuncioFinal, valorBruto);
    });

    const tempoMedioConversaoDias = conversionDiffs.length
      ? conversionDiffs.reduce((acc, curr) => acc + curr, 0) / conversionDiffs.length
      : null;
    const tempoMedioConversaoHoras = tempoMedioConversaoDias !== null ? tempoMedioConversaoDias * 24 : null;

    const timelineDaily = Array.from(dailyMap.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((entry) => ({
        key: entry.key,
        label: entry.label,
        leads: entry.leads,
        automacao: entry.automacao,
        vendas: entry.vendas,
        gasto: Number(entry.gasto.toFixed(2)),
        faturamentoLiquido: Number(entry.faturamentoLiquido.toFixed(2)),
        lucro: Number((entry.faturamentoLiquido - entry.gasto).toFixed(2)),
      }));

    const timelineWeekly = Array.from(weeklyMap.values())
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .map((entry) => ({
        key: entry.key,
        label: entry.label,
        leads: entry.leads,
        automacao: entry.automacao,
        vendas: entry.vendas,
        gasto: Number(entry.gasto.toFixed(2)),
        faturamentoLiquido: Number(entry.faturamentoLiquido.toFixed(2)),
        lucro: Number((entry.faturamentoLiquido - entry.gasto).toFixed(2)),
      }));

    const segmentacaoOrigem = Array.from(originMetrics.values()).map((entry) => ({
      ...entry,
      gasto: Number(entry.gasto.toFixed(2)),
    }));
    const segmentacaoDispositivo = Array.from(deviceMetrics.values());

    const performanceCampanhas = Array.from(
      new Set([
        ...Array.from(leadsPorCampanha.keys()),
        ...Array.from(vendasPorCampanhaMap.keys()),
        ...Array.from(gastosPorCampanha.keys()),
        ...Array.from(receitaPorCampanha.keys()),
      ])
    ).map((nome) => {
      const leads = leadsPorCampanha.get(nome) ?? 0;
      const vendas = vendasPorCampanhaMap.get(nome) ?? 0;
      const gasto = gastosPorCampanha.get(nome) ?? 0;
      const receita = receitaPorCampanha.get(nome) ?? 0;
      const roiCampanha = gasto > 0 ? ((receita - gasto) / gasto) * 100 : null;
      return {
        nome: nome || 'Indefinido',
        leads,
        vendas,
        gasto,
        receita,
        roi: roiCampanha,
        cpl: leads > 0 ? gasto / leads : null,
        cpa: vendas > 0 ? gasto / vendas : null,
      };
    });

    const performanceConjuntos = Array.from(
      new Set([
        ...Array.from(leadsPorConjunto.keys()),
        ...Array.from(vendasPorConjuntoMap.keys()),
        ...Array.from(gastosPorConjunto.keys()),
        ...Array.from(receitaPorConjunto.keys()),
      ])
    ).map((nome) => {
      const leads = leadsPorConjunto.get(nome) ?? 0;
      const vendas = vendasPorConjuntoMap.get(nome) ?? 0;
      const gasto = gastosPorConjunto.get(nome) ?? 0;
      const receita = receitaPorConjunto.get(nome) ?? 0;
      const roiConjunto = gasto > 0 ? ((receita - gasto) / gasto) * 100 : null;
      return {
        nome: nome || 'Indefinido',
        leads,
        vendas,
        gasto,
        receita,
        roi: roiConjunto,
        cpl: leads > 0 ? gasto / leads : null,
        cpa: vendas > 0 ? gasto / vendas : null,
      };
    });

    const performanceAnuncios = Array.from(
      new Set([
        ...Array.from(leadsPorAnuncio.keys()),
        ...Array.from(vendasPorAnuncioMap.keys()),
        ...Array.from(gastosPorAnuncio.keys()),
        ...Array.from(receitaPorAnuncio.keys()),
      ])
    ).map((nome) => {
      const leads = leadsPorAnuncio.get(nome) ?? 0;
      const vendas = vendasPorAnuncioMap.get(nome) ?? 0;
      const gasto = gastosPorAnuncio.get(nome) ?? 0;
      const receita = receitaPorAnuncio.get(nome) ?? 0;
      const roiAnuncio = gasto > 0 ? ((receita - gasto) / gasto) * 100 : null;
      return {
        nome: nome || 'Indefinido',
        leads,
        vendas,
        gasto,
        receita,
        roi: roiAnuncio,
        cpl: leads > 0 ? gasto / leads : null,
        cpa: vendas > 0 ? gasto / vendas : null,
      };
    });

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

    // Somatórios financeiros direto da planilha (VALOR BRUTO / VALOR LÍQUIDO)
    const totalVendasValue = filteredVendas.reduce((acc, row) => {
      const value = row[5]; // Coluna F: VALOR BRUTO
      const parsed = parseMoney(value);
      // Log para debug se vier valor estranho
      if (parsed > 10000) {
        console.warn('[Dashboard] Valor bruto suspeito:', { value, parsed, row: row.slice(0, 8) });
      }
      return acc + parsed;
    }, 0);

    const totalVendasLiquido = filteredVendas.reduce((acc, row) => {
      const value = row[6]; // Coluna G: VALOR LÍQUIDO
      const parsed = parseMoney(value);
      // Log para debug se vier valor estranho
      if (parsed > 10000) {
        console.warn('[Dashboard] Valor líquido suspeito:', { value, parsed, row: row.slice(0, 8) });
      }
      return acc + parsed;
    }, 0);
    const vendasPorCheckout = filteredVendas.reduce((acc, row) => {
      const checkout = String((vendasCheckoutIdxRes >= 0 ? row[vendasCheckoutIdxRes] : row[2]) || '').toUpperCase();
      if (checkout === 'HUBLA') acc[checkout] = (acc[checkout] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const PLANO_INV = /^plano(\s*1)?$/i;
    const vendasPorPlano = filteredVendas.reduce((acc, row) => {
      const plano = String((vendasPlanoIdxRes >= 0 ? row[vendasPlanoIdxRes] : row[4]) || '').trim();
      if (plano && !PLANO_INV.test(plano)) {
        acc[plano] = (acc[plano] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Entradas completas (para uso em textos, se necessário)
    const vendasPorPlanoEntries = Object.entries(vendasPorPlano).filter(
      ([p]) => !PLANO_INV.test(String(p).trim())
    );

    // Limitamos no máximo aos 6 planos mais vendidos para não estourar o layout
    const vendasPorPlanoExibir = vendasPorPlanoEntries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    // Log de debug para ver quais planos foram encontrados quando nada aparece
    if (vendasPorPlanoExibir.length === 0 && filteredVendas.length > 0) {
      console.warn('[Dashboard] Nenhum plano válido encontrado. Primeiras 3 vendas:', 
        filteredVendas.slice(0, 3).map((row) => ({
          planoIdx: vendasPlanoIdxRes,
          planoValue: row[vendasPlanoIdxRes >= 0 ? vendasPlanoIdxRes : 4],
          rowPreview: row.slice(0, 10),
        }))
      );
    }
    const vendasPorCampanha = Object.fromEntries(
      Array.from(vendasPorCampanhaMap.entries()).filter(([nome]) => !!nome)
    );
    
    // Log de debug para ver as campanhas
    console.log('[Dashboard] Campanhas encontradas:', 
      Array.from(vendasPorCampanhaMap.entries()).slice(0, 5).map(([nome, count]) => ({ nome, count }))
    );
    const vendasPorFormaPagamento = filteredVendas.reduce((acc, row) => {
      const cell = vendasFormaPagamentoIdxRes >= 0 ? row[vendasFormaPagamentoIdxRes] : row[7];
      const raw = String(cell ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      if (!raw) return acc;
      if (raw.includes('pix')) acc.pix += 1;
      else if (
        raw.includes('credito') ||
        raw.includes('credit') ||
        (raw.includes('cartao') && !raw.includes('debito'))
      ) acc.cartaoCredito += 1;
      return acc;
    }, { pix: 0, cartaoCredito: 0 });

    const amountSpentTotal = gastosAmountIdxRes >= 0 ? filteredGastos.reduce((acc, row) => {
      const value = row[gastosAmountIdxRes];
      return acc + parseMoney(value);
    }, 0) : 0;

    // Calcular métricas de tráfego agregadas
    const gastosReachIdxRes = resolveIndex(gastosReachIdx);
    const gastosFrequencyIdxRes = resolveIndex(gastosFrequencyIdx);
    const gastosImpressionsIdxRes = resolveIndex(gastosImpressionsIdx);
    const gastosLandingPageViewsIdxRes = resolveIndex(gastosLandingPageViewsIdx);
    const gastosCTRIdxRes = resolveIndex(gastosCTRIdx);
    const gastosCPCIdxRes = resolveIndex(gastosCPCIdx);

    const parseNumber = (value: string | undefined): number => {
      if (!value) return 0;
      const cleaned = String(value).replace(/[^\d.,-]/g, '').replace(',', '.');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    const totalReach = gastosReachIdxRes >= 0 ? filteredGastos.reduce((acc, row) => {
      return acc + parseNumber(row[gastosReachIdxRes]);
    }, 0) : 0;

    const totalFrequency = gastosFrequencyIdxRes >= 0 ? filteredGastos.reduce((acc, row) => {
      return acc + parseNumber(row[gastosFrequencyIdxRes]);
    }, 0) : 0;
    const avgFrequency = filteredGastos.length > 0 ? totalFrequency / filteredGastos.length : 0;

    const totalImpressions = gastosImpressionsIdxRes >= 0 ? filteredGastos.reduce((acc, row) => {
      return acc + parseNumber(row[gastosImpressionsIdxRes]);
    }, 0) : 0;

    const totalLandingPageViews = gastosLandingPageViewsIdxRes >= 0 ? filteredGastos.reduce((acc, row) => {
      return acc + parseNumber(row[gastosLandingPageViewsIdxRes]);
    }, 0) : 0;

    // CTR pode vir como porcentagem (ex: "2.5%") ou decimal (ex: "0.025")
    const parseCTR = (value: string | undefined): number => {
      if (!value) return 0;
      const cleaned = String(value).replace(/[^\d.,-]/g, '').replace(',', '.');
      const num = parseFloat(cleaned);
      if (isNaN(num)) return 0;
      // Se o número é maior que 1, provavelmente está em formato de porcentagem (ex: 2.5 = 2.5%)
      return num > 1 ? num : num * 100;
    };
    const totalCTR = gastosCTRIdxRes >= 0 ? filteredGastos.reduce((acc, row) => {
      return acc + parseCTR(row[gastosCTRIdxRes]);
    }, 0) : 0;
    const avgCTR = filteredGastos.length > 0 ? totalCTR / filteredGastos.length : 0;

    // CPC pode vir como valor monetário (ex: "R$ 0,50" ou "0.50")
    const totalCPC = gastosCPCIdxRes >= 0 ? filteredGastos.reduce((acc, row) => {
      return acc + parseMoney(row[gastosCPCIdxRes] || '0');
    }, 0) : 0;
    const avgCPC = filteredGastos.length > 0 ? totalCPC / filteredGastos.length : 0;

    // Calcular cliques a partir de Impressions e CTR
    const totalClicks = avgCTR > 0 && totalImpressions > 0 
      ? Math.round((totalImpressions * avgCTR) / 100) 
      : 0;

    // Calcular CPM (Cost per 1000 Impressions)
    const cpm = totalImpressions > 0 
      ? (amountSpentTotal / totalImpressions) * 1000 
      : null;

    // Métricas financeiras - usar valor LÍQUIDO (após taxas) para cálculos reais
    const lucro = totalVendasLiquido - amountSpentTotal; // Lucro = Faturamento líquido - Investimento
    const roi = amountSpentTotal > 0
      ? ((totalVendasLiquido - amountSpentTotal) / amountSpentTotal) * 100 // ✅ Usar líquido, não bruto
      : null;
    const roas = amountSpentTotal > 0
      ? totalVendasLiquido / amountSpentTotal // ROAS = Faturamento líquido / Investimento
      : null;

    const cpl = filteredLeadsCount > 0 ? amountSpentTotal / filteredLeadsCount : null;
    const cpa = filteredPurchasedCount > 0 ? amountSpentTotal / filteredPurchasedCount : null;
    const custoPorVenda = filteredPurchasedCount > 0 ? amountSpentTotal / filteredPurchasedCount : null;
    const ticketMedioBruto = filteredPurchasedCount > 0 ? totalVendasValue / filteredPurchasedCount : null;
    const ticketMedioLiquido = filteredPurchasedCount > 0 ? totalVendasLiquido / filteredPurchasedCount : null;
    const leadToAutomationRate = filteredLeadsCount > 0 ? (filteredLeadsAutomacaoCount / filteredLeadsCount) * 100 : null;
    // Checkout → Venda: vendas marcadas na automação (que vieram de checkouts) / total de checkouts
    const automationToSaleRate =
      filteredLeadsAutomacaoCount > 0 ? (filteredPurchasedCount / filteredLeadsAutomacaoCount) * 100 : null;
    const leadToSaleRate = filteredLeadsCount > 0 ? (filteredPurchasedCount / filteredLeadsCount) * 100 : null;

    const automationMetrics = {
      leadToAutomationRate,
      automationToSaleRate,
      leadToSaleRate,
      tempoMedioConversaoDias,
      tempoMedioConversaoHoras,
      processedRate: leadToAutomationRate,
      zaiaParticipation:
        filteredLeadsAutomacaoCount > 0 ? (filteredZaiaCount / filteredLeadsAutomacaoCount) * 100 : null,
    };

    const alerts: Array<{ tipo: 'info' | 'warning' | 'danger'; mensagem: string }> = [];
    if (roi !== null && roi < 0) {
      alerts.push({ tipo: 'danger', mensagem: 'ROI negativo no período selecionado.' });
    }
    if (leadToAutomationRate !== null && leadToAutomationRate < 40) {
      alerts.push({ tipo: 'warning', mensagem: 'Menos de 40% dos leads estão avançando para automação.' });
    }
    if (automationToSaleRate !== null && automationToSaleRate < 5) {
      alerts.push({ tipo: 'warning', mensagem: 'Conversão de automação para vendas abaixo de 5%.' });
    }
    if (timelineDaily.length >= 2) {
      const last = timelineDaily[timelineDaily.length - 1];
      const prev = timelineDaily[timelineDaily.length - 2];
      if (prev.leads > 0) {
        const drop = ((prev.leads - last.leads) / prev.leads) * 100;
        if (drop >= 30) {
          alerts.push({
            tipo: 'warning',
            mensagem: `Queda de ${drop.toFixed(1)}% no volume de leads vs. dia anterior.`,
          });
        }
      }
    }

    const funnelResumo = {
      ...funnelSnapshot,
      leadToAutomationRate,
      automationToSaleRate,
      leadToSaleRate,
      tempoMedioConversaoDias,
      tempoMedioConversaoHoras,
    };

    const allCampanhas = new Set<string>();
    vendasRows.forEach((r) => { const v = vendasCampanhaIdxRes >= 0 ? String(r[vendasCampanhaIdxRes] ?? '').trim() : ''; if (v) allCampanhas.add(v); });
    gastosRows.forEach((r) => { const v = gastosCampanhaIdx >= 0 ? String(r[gastosCampanhaIdx] ?? '').trim() : ''; if (v) allCampanhas.add(v); });
    const allConjuntos = new Set<string>();
    vendasRows.forEach((r) => { if (vendasConjuntoIdxRes >= 0) { const v = String(r[vendasConjuntoIdxRes] ?? '').trim(); if (v) allConjuntos.add(v); } });
    gastosRows.forEach((r) => { if (gastosConjuntoIdxRes >= 0) { const v = String(r[gastosConjuntoIdxRes] ?? '').trim(); if (v) allConjuntos.add(v); } });
    const allAnuncios = new Set<string>();
    vendasRows.forEach((r) => { if (vendasAnuncioIdxRes >= 0) { const v = String(r[vendasAnuncioIdxRes] ?? '').trim(); if (v) allAnuncios.add(v); } });
    gastosRows.forEach((r) => { if (gastosAnuncioIdxRes >= 0) { const v = String(r[gastosAnuncioIdxRes] ?? '').trim(); if (v) allAnuncios.add(v); } });

    return {
      filteredVendas,
      totalVendasValue,
      totalVendasLiquido,
      vendasPorCheckout,
      vendasPorPlanoExibir,
      vendasPorCampanha,
      vendasPorFormaPagamento,
      amountSpentTotal,
      funnelResumo,
      filteredLeadsCount,
      filteredPurchasedCount,
      filteredZaiaCount,
      filteredLeadsAutomacaoCount,
      filteredGastosCount: filteredGastos.length,
      filteredPagina1,
      timelineDaily,
      timelineWeekly,
      segmentacaoOrigem,
      segmentacaoDispositivo,
      performanceCampanhas,
      performanceConjuntos,
      performanceAnuncios,
      lucro,
      roi,
      roas,
      cpl,
      cpa,
      custoPorVenda,
      ticketMedioBruto,
      ticketMedioLiquido,
      automationMetrics,
      alerts,
      quizFunnelData,
      opcoesCampanha: Array.from(allCampanhas).sort(),
      opcoesConjunto: Array.from(allConjuntos).sort(),
      opcoesAnuncio: Array.from(allAnuncios).sort(),
      // Métricas de tráfego
      totalReach,
      totalImpressions,
      totalLandingPageViews,
      avgFrequency,
      avgCTR,
      avgCPC,
      totalClicks,
      cpm,
    };
  }, [data, filterDateFrom, filterDateTo, filterCampanha, filterConjunto, filterAnuncio, emptyResumo]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/40 flex items-center justify-center">
              <IconChart className="w-5 h-5 text-sky-400" />
            </div>
            <div className="text-left">
              <p className="text-slate-200 font-semibold text-lg">Carregando dashboard</p>
              <p className="text-slate-400 text-sm">Buscando dados de vendas, leads e tráfego…</p>
            </div>
          </div>
          <div className="inline-block h-9 w-9 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400" />
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
    lucro,
    roi,
    roas,
    funnelResumo,
    filteredVendas,
    filteredLeadsCount,
    filteredPurchasedCount,
    filteredZaiaCount,
    filteredLeadsAutomacaoCount,
    filteredGastosCount,
    filteredPagina1,
    quizFunnelData,
    opcoesCampanha,
    opcoesConjunto,
    opcoesAnuncio,
    timelineDaily,
    timelineWeekly,
    segmentacaoOrigem,
    segmentacaoDispositivo,
    performanceCampanhas,
    performanceConjuntos,
    performanceAnuncios,
    cpl,
    cpa,
    custoPorVenda,
    ticketMedioBruto,
    ticketMedioLiquido,
    automationMetrics,
    alerts,
    totalReach,
    totalImpressions,
    totalLandingPageViews,
    avgFrequency,
    avgCTR,
    avgCPC,
    totalClicks,
    cpm,
  } = filteredResumo;

  const hasActiveFilters = filterDateFrom || filterDateTo || filterCampanha || filterConjunto || filterAnuncio;
  const clearFilters = () => {
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterCampanha('');
    setFilterConjunto('');
    setFilterAnuncio('');
  };

  const formatCurrency = (value: number | null | undefined, digits = 2) => {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  };

  const formatPercent = (value: number | null | undefined, digits = 1) => {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    return `${value.toFixed(digits)}%`;
  };

  const leadToAutomationRateValue = automationMetrics.leadToAutomationRate ?? null;
  const automationToSaleRateValue = automationMetrics.automationToSaleRate ?? null;
  const leadToSaleRateValue = automationMetrics.leadToSaleRate ?? null;
  const zaiaRateValue = automationMetrics.zaiaParticipation ?? null;
  const leadToAutomationProgress = Math.min(100, Math.max(0, leadToAutomationRateValue ?? 0));
  const automationToSaleProgress = Math.min(100, Math.max(0, automationToSaleRateValue ?? 0));
  const tempoMedioConversaoTexto =
    automationMetrics.tempoMedioConversaoDias !== null && automationMetrics.tempoMedioConversaoDias !== undefined
      ? `${automationMetrics.tempoMedioConversaoDias.toFixed(1)} dias`
      : '—';
  const tempoMedioConversaoHorasTexto =
    automationMetrics.tempoMedioConversaoHoras !== null && automationMetrics.tempoMedioConversaoHoras !== undefined
      ? `${automationMetrics.tempoMedioConversaoHoras.toFixed(1)} h`
      : '—';
  const timelineData = timelineView === 'daily' ? timelineDaily : timelineWeekly;
  const timelineSubtitle = timelineView === 'daily' ? 'Visão diária' : 'Visão semanal';
  const rankingFilter = <T extends { nome: string; leads: number; vendas: number; gasto: number }>(items: T[]) =>
    items.filter((item) => (item.nome && item.nome.trim() !== '') || item.vendas > 0 || item.gasto > 0 || item.leads > 0);
  const topCampanhas = rankingFilter(performanceCampanhas)
    .sort((a, b) => (b.receita ?? 0) - (a.receita ?? 0))
    .slice(0, 5);
  const worstCampanhas = rankingFilter(performanceCampanhas)
    .filter((item) => item.roi !== null && item.roi !== undefined)
    .sort((a, b) => (a.roi ?? 0) - (b.roi ?? 0))
    .slice(0, 5);
  const topConjuntos = rankingFilter(performanceConjuntos)
    .sort((a, b) => (b.receita ?? 0) - (a.receita ?? 0))
    .slice(0, 5);
  const worstConjuntos = rankingFilter(performanceConjuntos)
    .filter((item) => item.roi !== null && item.roi !== undefined)
    .sort((a, b) => (a.roi ?? 0) - (b.roi ?? 0))
    .slice(0, 5);
  const topAnuncios = rankingFilter(performanceAnuncios)
    .sort((a, b) => (b.receita ?? 0) - (a.receita ?? 0))
    .slice(0, 5);
  const worstAnuncios = rankingFilter(performanceAnuncios)
    .filter((item) => item.roi !== null && item.roi !== undefined)
    .sort((a, b) => (a.roi ?? 0) - (b.roi ?? 0))
    .slice(0, 5);
  const rankingConfigs = [
    {
      title: 'Campanhas',
      topLabel: 'Top 5 por receita',
      bottomLabel: 'Precisam de atenção (ROI)',
      top: topCampanhas,
      bottom: worstCampanhas,
    },
    {
      title: 'Conjuntos',
      topLabel: 'Top 5 por receita',
      bottomLabel: 'Precisam de atenção (ROI)',
      top: topConjuntos,
      bottom: worstConjuntos,
    },
    {
      title: 'Anúncios',
      topLabel: 'Top 5 por receita',
      bottomLabel: 'Precisam de atenção (ROI)',
      top: topAnuncios,
      bottom: worstAnuncios,
    },
  ] as const;
  const topOrigens = [...segmentacaoOrigem]
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 6);
  const topDevices = [...segmentacaoDispositivo]
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 5);
  const totalDeviceLeads = segmentacaoDispositivo.reduce((acc, item) => acc + item.leads, 0);
  const alertStyleMap: Record<
    'danger' | 'warning' | 'info',
    { bg: string; border: string; iconBg: string; iconColor: string; label: string }
  > = {
    danger: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-300',
      label: 'Crítico',
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-300',
      label: 'Atenção',
    },
    info: {
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
      iconBg: 'bg-sky-500/20',
      iconColor: 'text-sky-300',
      label: 'Info',
    },
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
          <section className="space-y-10">
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

            {/* ETAPA 1: Métricas Gerais */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-gradient-to-b from-sky-500 to-sky-600 rounded-full"></div>
                  <h2 className="text-white text-2xl font-bold flex items-center gap-2">
                    <IconChart className="w-6 h-6 text-sky-400" />
                    Métricas Gerais
                  </h2>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Faturamento Bruto */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-6 hover:border-slate-600 transition-colors shadow-lg hover:shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center">
                      <IconCurrency className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Faturamento Bruto</p>
                  <p className="text-white text-2xl font-bold">
                    {totalVendasValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>

                {/* Faturamento Líquido */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-6 hover:border-slate-600 transition-colors shadow-lg hover:shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/40 flex items-center justify-center">
                      <IconCurrency className="w-5 h-5 text-teal-400" />
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Faturamento Líquido</p>
                  <p className="text-white text-2xl font-bold">
                    {totalVendasLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>

                {/* Investimento */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-6 hover:border-slate-600 transition-colors shadow-lg hover:shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/40 flex items-center justify-center">
                      <IconMegaphone className="w-5 h-5 text-orange-400" />
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Investimento</p>
                  <p className="text-white text-2xl font-bold">
                    {amountSpentTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>

                {/* Lucro */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-6 hover:border-slate-600 transition-colors shadow-lg hover:shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${lucro >= 0 ? 'bg-green-500/10 border border-green-500/40' : 'bg-red-500/10 border border-red-500/40'}`}>
                      <IconTrending className={`w-5 h-5 ${lucro >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Lucro</p>
                  <p className={`text-2xl font-bold ${lucro >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {lucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>

                {/* ROAS */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-6 hover:border-slate-600 transition-colors shadow-lg hover:shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/40 flex items-center justify-center">
                      <IconChart className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">ROAS</p>
                  <p className="text-white text-2xl font-bold">
                    {roas !== null ? `${roas.toFixed(2)}x` : 'N/A'}
                  </p>
                </div>

                {/* Vendas */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-6 hover:border-slate-600 transition-colors shadow-lg hover:shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/40 flex items-center justify-center">
                      <IconCart className="w-5 h-5 text-sky-400" />
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Vendas</p>
                  <p className="text-white text-2xl font-bold">{filteredVendas.length}</p>
                </div>

                {/* Pagamentos (PIX x Cartão) */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-6 hover:border-slate-600 transition-colors shadow-lg hover:shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center">
                      <IconCurrency className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Compras por forma de pagamento</p>
                  <p className="text-white text-lg font-semibold">
                    PIX: <span className="text-emerald-400">{vendasPorFormaPagamento.pix}</span>
                  </p>
                  <p className="text-white text-lg font-semibold mt-1">
                    Cartão: <span className="text-sky-400">{vendasPorFormaPagamento.cartaoCredito}</span>
                  </p>
                </div>

                {/* Ticket Médio */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-6 hover:border-slate-600 transition-colors shadow-lg hover:shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center">
                      <IconStore className="w-5 h-5 text-indigo-400" />
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Ticket Médio</p>
                  <p className="text-white text-2xl font-bold">
                    {ticketMedioLiquido !== null && ticketMedioLiquido > 0
                      ? ticketMedioLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : 'R$ 0,00'}
                  </p>
                </div>

                {/* ROI */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-6 hover:border-slate-600 transition-colors shadow-lg hover:shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${roi !== null && roi >= 0 ? 'bg-green-500/10 border border-green-500/40' : 'bg-red-500/10 border border-red-500/40'}`}>
                      <IconTrending className={`w-5 h-5 ${roi !== null && roi >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">ROI</p>
                  <p className={`text-2xl font-bold ${roi !== null && roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {roi !== null ? `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {alerts.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {alerts.map((alert, idx) => {
                  const styles = alertStyleMap[alert.tipo];
                  return (
                    <div
                      key={`${alert.tipo}-${idx}`}
                      className={`flex items-start gap-3 rounded-2xl ${styles.bg} border ${styles.border} p-4`}
                    >
                      <div className={`mt-0.5 h-9 w-9 flex items-center justify-center rounded-xl ${styles.iconBg}`}>
                        <IconMegaphone className={`w-5 h-5 ${styles.iconColor}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                            {styles.label}
                          </span>
                          <span className="text-[10px] uppercase text-slate-500">Dashboard</span>
                        </div>
                        <p className="text-slate-200 text-sm mt-1">{alert.mensagem}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Cards principais em grid removidos a pedido do usuário */}

            {/* ETAPA 2: Gráfico Faturamento Líquido vs Investimento vs Lucro */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
                  <h2 className="text-white text-2xl font-bold flex items-center gap-2">
                    <IconChart className="w-6 h-6 text-emerald-400" />
                    Performance Financeira
                  </h2>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/60 p-7 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div>
                    <p className="text-slate-400 text-sm">
                      {timelineView === 'daily' ? 'Evolução diária' : 'Evolução semanal'}
                    </p>
                  </div>
                <div className="inline-flex items-center bg-slate-900/60 rounded-full p-1.5 border border-slate-600/70 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setTimelineView('daily')}
                    className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-all ${
                      timelineView === 'daily'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    Diário
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimelineView('weekly')}
                    className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-all ${
                      timelineView === 'weekly'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    Semanal
                  </button>
                </div>
              </div>
              <div className="h-80">
                {timelineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={timelineData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                      <XAxis 
                        dataKey="label" 
                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                        axisLine={{ stroke: '#475569' }} 
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={{ stroke: '#475569' }}
                        tickLine={false}
                        tickFormatter={(value) =>
                          Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid rgba(71, 85, 105, 0.8)',
                          borderRadius: '12px',
                          padding: '12px',
                        }}
                        labelStyle={{ color: '#e2e8f0', fontWeight: 'bold', marginBottom: '8px' }}
                        formatter={(value: any) => [
                          Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                          '',
                        ]}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: 16 }}
                        formatter={(value) => <span className="text-slate-300 text-sm font-medium">{value}</span>}
                      />
                      {/* Faturamento Líquido em azul (principal) */}
                      <Area
                        type="monotone"
                        dataKey="faturamentoLiquido"
                        name="Faturamento Líquido"
                        stroke="rgb(56 189 248)" // sky-400
                        fill="rgba(56, 189, 248, 0.18)"
                        strokeWidth={2.6}
                        dot={{ r: 4, fill: 'rgb(56 189 248)' }}
                        activeDot={{ r: 6 }}
                      />

                      {/* Investimento em laranja, bem destacado */}
                      <Line
                        type="monotone"
                        dataKey="gasto"
                        name="Investimento"
                        stroke="rgb(249 115 22)" // orange-500
                        strokeWidth={2.4}
                        dot={{ r: 4, fill: 'rgb(249 115 22)' }}
                        activeDot={{ r: 6 }}
                      />

                      {/* Lucro em verde, linha tracejada elegante */}
                      <Line
                        type="monotone"
                        dataKey="lucro"
                        name="Lucro"
                        stroke="rgb(34 197 94)" // green-500
                        strokeWidth={2.4}
                        dot={{ r: 4, fill: 'rgb(34 197 94)' }}
                        activeDot={{ r: 6 }}
                        strokeDasharray="4 4"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                    Sem dados suficientes para exibir o gráfico
                  </div>
                )}
              </div>
              </div>
            </div>

            {/* ETAPA 3: Métricas de Tráfego */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                  <h2 className="text-white text-2xl font-bold flex items-center gap-2">
                    <IconMegaphone className="w-6 h-6 text-orange-400" />
                    Métricas de Tráfego
                  </h2>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 rounded-lg border border-slate-700/60 p-5 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">Investimento</p>
                  <p className="text-white text-lg font-bold">
                    {amountSpentTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-lg border border-slate-700/60 p-5 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">Leads</p>
                  <p className="text-white text-lg font-bold">{filteredLeadsCount.toLocaleString('pt-BR')}</p>
                </div>
                <div className="bg-slate-800/60 rounded-lg border border-slate-700/60 p-5 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">CPL</p>
                  <p className="text-white text-lg font-bold">
                    {cpl !== null ? cpl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-lg border border-slate-700/60 p-5 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">Vendas</p>
                  <p className="text-white text-lg font-bold">{filteredVendas.length}</p>
                </div>
                <div className="bg-slate-800/60 rounded-lg border border-slate-700/60 p-5 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">Custo por Venda</p>
                  <p className="text-white text-lg font-bold">
                    {custoPorVenda !== null ? custoPorVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-lg border border-slate-700/60 p-5 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">Lead → Checkout</p>
                  <p className="text-white text-lg font-bold">
                    {leadToAutomationRateValue !== null ? `${leadToAutomationRateValue.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-lg border border-slate-700/60 p-5 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">Checkout → Venda</p>
                  <p className="text-white text-lg font-bold">
                    {automationToSaleRateValue !== null ? `${automationToSaleRateValue.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-lg border border-slate-700/60 p-5 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">Lead → Venda</p>
                  <p className="text-white text-lg font-bold">
                    {leadToSaleRateValue !== null ? `${leadToSaleRateValue.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-lg border border-slate-700/60 p-5 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">Alcance</p>
                  <p className="text-white text-lg font-bold">
                    {totalReach > 0 ? totalReach.toLocaleString('pt-BR') : 'N/D'}
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-lg border border-slate-700/60 p-5 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">Impressões</p>
                  <p className="text-white text-lg font-bold">
                    {totalImpressions > 0 ? totalImpressions.toLocaleString('pt-BR') : 'N/D'}
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-lg border border-slate-700/60 p-5 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">Cliques</p>
                  <p className="text-white text-lg font-bold">
                    {totalClicks > 0 ? totalClicks.toLocaleString('pt-BR') : 'N/D'}
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-lg border border-slate-700/60 p-5 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">CTR</p>
                  <p className="text-white text-lg font-bold">
                    {avgCTR > 0 ? `${avgCTR.toFixed(2)}%` : 'N/D'}
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-lg border border-slate-700/60 p-5 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">CPC</p>
                  <p className="text-white text-lg font-bold">
                    {avgCPC > 0 ? avgCPC.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/D'}
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-lg border border-slate-700/60 p-5 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">CPM</p>
                  <p className="text-white text-lg font-bold">
                    {cpm !== null && cpm > 0 ? cpm.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/D'}
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-lg border border-slate-700/60 p-5 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">Frequência</p>
                  <p className="text-white text-lg font-bold">
                    {avgFrequency > 0 ? avgFrequency.toFixed(2) : 'N/D'}
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-lg border border-slate-700/60 p-5 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">Visualizações Página</p>
                  <p className="text-white text-lg font-bold">
                    {totalLandingPageViews > 0 ? totalLandingPageViews.toLocaleString('pt-BR') : 'N/D'}
                  </p>
                </div>
              </div>
            </div>


            {/* (Bloco de \"Análise de Vendas\" e \"Top Campanhas\" removido a pedido do usuário) */}

            {/* Funil do Quiz */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-gradient-to-b from-sky-500 to-emerald-500 rounded-full"></div>
                  <h2 className="text-white text-2xl font-bold flex items-center gap-2">
                    <IconChart className="w-6 h-6 text-sky-400" />
                    Funil do Quiz
                  </h2>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
              </div>
              
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
                    <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 px-5 py-4 shadow-lg">
                      <p className="text-slate-400 text-xs mb-1.5">Leads iniciaram</p>
                      <p className="text-white text-2xl font-bold">{quizFunnelData[0]?.value?.toLocaleString('pt-BR') || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/40 rounded-xl px-5 py-4 shadow-lg shadow-emerald-500/20">
                      <p className="text-emerald-300 text-xs mb-1.5">Taxa de conclusão</p>
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
                const worstStep = funnelWithRates.slice(1).reduce<null | { name: string; drop: number }>((acc, item) => {
                  const drop = 100 - item.rate;
                  if (!acc || drop > acc.drop) return { name: item.name, drop };
                  return acc;
                }, null);

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
                                {worstStep ? worstStep.drop.toFixed(1) : '0.0'}%
                              </p>
                              {worstStep && (
                                <p className="text-slate-500 text-[11px]">Etapa: {worstStep.name}</p>
                              )}
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
            </div>

            {/* ETAPA 5: Métricas do Quiz - Análise Detalhada */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                  <h2 className="text-white text-2xl font-bold flex items-center gap-2">
                    <IconChart className="w-6 h-6 text-purple-400" />
                    Análise do Questionário
                  </h2>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
              </div>
              
              {/* Métricas Gerais do Quiz */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/60 p-8 shadow-xl">
                <h3 className="text-white font-semibold text-lg mb-6 pb-4 border-b border-slate-700/40">Visão Geral do Funil</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/50 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                    <p className="text-slate-400 text-xs mb-1">Iniciaram</p>
                    <p className="text-white text-2xl font-bold">{filteredPagina1.length.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/50 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                    <p className="text-slate-400 text-xs mb-1">Viraram Lead</p>
                    <p className="text-white text-2xl font-bold">{filteredLeadsCount.toLocaleString('pt-BR')}</p>
                    <p className="text-emerald-400 text-xs mt-1">
                      {filteredPagina1.length > 0 ? ((filteredLeadsCount / filteredPagina1.length) * 100).toFixed(1) : '0.0'}%
                    </p>
                  </div>
                  <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/50 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                    <p className="text-slate-400 text-xs mb-1">Viram Preço</p>
                    <p className="text-white text-2xl font-bold">{filteredZaiaCount.toLocaleString('pt-BR')}</p>
                    <p className="text-emerald-400 text-xs mt-1">
                      {filteredLeadsCount > 0 ? ((filteredZaiaCount / filteredLeadsCount) * 100).toFixed(1) : '0.0'}%
                    </p>
                  </div>
                  <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/50 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                    <p className="text-slate-400 text-xs mb-1">Geraram Checkout</p>
                    <p className="text-white text-2xl font-bold">{filteredLeadsAutomacaoCount.toLocaleString('pt-BR')}</p>
                    <p className="text-emerald-400 text-xs mt-1">
                      {filteredLeadsCount > 0 ? ((filteredLeadsAutomacaoCount / filteredLeadsCount) * 100).toFixed(1) : '0.0'}%
                    </p>
                  </div>
                  <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/50 shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                    <p className="text-slate-400 text-xs mb-1">Compraram</p>
                    <p className="text-white text-2xl font-bold">{filteredPurchasedCount.toLocaleString('pt-BR')}</p>
                    <p className="text-emerald-400 text-xs mt-1">
                      {filteredLeadsAutomacaoCount > 0 ? ((filteredPurchasedCount / filteredLeadsAutomacaoCount) * 100).toFixed(1) : '0.0'}%
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/40 rounded-lg p-4">
                    <p className="text-emerald-300 text-xs mb-1">Lead → Compra</p>
                    <p className="text-white text-2xl font-bold">
                      {leadToSaleRateValue !== null ? `${leadToSaleRateValue.toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Análise por Pergunta do Quiz */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/60 p-8 shadow-xl">
                <h3 className="text-white font-semibold text-lg mb-6 pb-4 border-b border-slate-700/40">Análise por Pergunta</h3>
                <div className="space-y-4">
                  {(() => {
                    // Mapear as perguntas do quiz com os índices de coluna (baseado em quizSteps)
                    const quizQuestions = [
                      { 
                        pergunta: 'Gênero', 
                        colIdx: 2,
                        key: 'genero'
                      },
                      { 
                        pergunta: 'Treinos/semana', 
                        colIdx: 3,
                        key: 'treinos'
                      },
                      { 
                        pergunta: 'Já usou apps', 
                        colIdx: 4,
                        key: 'apps'
                      },
                      { 
                        pergunta: 'Contato (nome)', 
                        colIdx: 5,
                        key: 'nome'
                      },
                      { 
                        pergunta: 'Peso (kg)', 
                        colIdx: 8,
                        key: 'peso'
                      },
                      { 
                        pergunta: 'Altura (cm)', 
                        colIdx: 9,
                        key: 'altura'
                      },
                      { 
                        pergunta: 'Data de Nascimento', 
                        colIdx: 11,
                        key: 'nascimento'
                      },
                      { 
                        pergunta: 'Objetivo', 
                        colIdx: 15,
                        key: 'objetivo'
                      },
                      { 
                        pergunta: 'Obstáculos', 
                        colIdx: 18,
                        key: 'obstaculos'
                      },
                      { 
                        pergunta: 'Tipo de dieta', 
                        colIdx: 19,
                        key: 'tipoDieta'
                      },
                      { 
                        pergunta: 'Conquistas desejadas', 
                        colIdx: 20,
                        key: 'conquistas'
                      },
                    ];

                    return quizQuestions.map(({ pergunta, colIdx, key }) => {
                      if (colIdx < 0) return null;
                      
                      // Agrupar respostas
                      const respostaMap = new Map<string, number>();
                      filteredPagina1.forEach(row => {
                        const resposta = String(row[colIdx] ?? '').trim();
                        if (resposta) {
                          respostaMap.set(resposta, (respostaMap.get(resposta) || 0) + 1);
                        }
                      });

                      const respostas = Array.from(respostaMap.entries())
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5); // Top 5 respostas

                      if (respostas.length === 0) return null;

                      const total = respostas.reduce((sum, [, count]) => sum + count, 0);

                      const isExpanded = expandedQuestions[key] || false;
                      const totalRespostas = respostaMap.size;

                      return (
                        <div key={key} className="bg-slate-900/40 rounded-xl border border-slate-700/50 overflow-hidden shadow-md hover:shadow-lg transition-all hover:border-slate-600">
                          <button
                            type="button"
                            onClick={() => setExpandedQuestions(prev => ({ ...prev, [key]: !prev[key] }))}
                            className="w-full px-5 py-4 hover:bg-slate-800/50 transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''} p-1.5 rounded-lg group-hover:bg-purple-500/10`}>
                                <svg className="w-4 h-4 text-purple-400 group-hover:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                              <div className="text-left">
                                <h4 className="text-white font-semibold text-base group-hover:text-purple-300 transition-colors">{pergunta}</h4>
                                <p className="text-slate-400 text-xs mt-1">
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400/60"></span>
                                    {totalRespostas} resposta{totalRespostas !== 1 ? 's' : ''} diferentes
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                              <span className="hidden sm:inline">{isExpanded ? 'Fechar' : 'Expandir'}</span>
                            </div>
                          </button>
                          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="px-5 pb-5 pt-3 space-y-3 bg-slate-900/20">
                              {respostas.map(([resposta, count]) => {
                                const porcentagem = ((count / total) * 100).toFixed(1);
                                return (
                                  <div key={resposta} className="group">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-slate-300 text-sm font-medium truncate group-hover:text-white transition-colors">{resposta}</span>
                                      <span className="text-slate-400 text-xs ml-3 font-medium">
                                        <span className="text-white">{count}</span> ({porcentagem}%)
                                      </span>
                                    </div>
                                    <div className="h-2.5 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/30 shadow-inner">
                                      <div 
                                        className="h-full bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500 rounded-full transition-all duration-700 ease-out group-hover:shadow-lg group-hover:shadow-purple-500/30"
                                        style={{ width: `${porcentagem}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    }).filter(Boolean);
                  })()}
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
