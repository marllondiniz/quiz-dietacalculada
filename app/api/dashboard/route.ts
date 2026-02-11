import { NextResponse } from 'next/server';
import { getGoogleSheetsInstance } from '@/lib/leadsAutomation';

// Força a rota a ser dinâmica (não cachear)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SheetsInstance = Awaited<ReturnType<typeof getGoogleSheetsInstance>>['sheets'];

const KEYS = ['pagina1', 'listaVendas', 'leadsAutomacao', 'gastosTrafico'] as const;

const SHEETS: Array<{ key: (typeof KEYS)[number]; name: string | null; range: string }> = [
  { key: 'pagina1', name: null, range: 'A:AK' }, // primeira aba (Quiz)
  { key: 'listaVendas', name: 'Lista Vendas', range: 'A:S' },
  { key: 'leadsAutomacao', name: 'Leads_Automacao', range: 'A:I' },
  { key: 'gastosTrafico', name: 'Gastos Tráfego', range: 'A:Z' },
];

export type DashboardSheetData = {
  headers: string[];
  rows: string[][];
  totalRows: number;
};

export type DashboardData = {
  [K in (typeof KEYS)[number]]: DashboardSheetData;
} & {
  _meta?: { fetchedAt: string };
};

/** Normaliza nome para comparação: minúsculo, sem acentos, espaços/hífens unificados */
function normalizeSheetName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s\-_]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Encontra o título real da aba na planilha (tolera variações de nome) */
function findSheetTitle(
  expectedName: string,
  actualTitles: string[]
): string | null {
  const normalized = normalizeSheetName(expectedName);
  const exact = actualTitles.find((t) => normalizeSheetName(t) === normalized);
  if (exact) return exact;
  const partial = actualTitles.find((t) =>
    normalizeSheetName(t).includes(normalized) || normalized.includes(normalizeSheetName(t))
  );
  return partial ?? null;
}

async function fetchSheet(
  sheets: SheetsInstance,
  spreadsheetId: string,
  sheetName: string | null,
  range: string
): Promise<DashboardSheetData> {
  const escaped = sheetName ? sheetName.replace(/'/g, "''") : '';
  const fullRange = sheetName ? `'${escaped}'!${range}` : range;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: fullRange,
  });
  const values = response.data.values || [];
  const headers = values[0] || [];
  const rows = values.slice(1); // Remove a primeira linha (header)
  
  console.log(`[Dashboard] ${sheetName || 'Primeira aba'}: ${values.length} linhas total, ${rows.length} linhas de dados (headers removidos)`);
  
  return {
    headers,
    rows,
    totalRows: rows.length,
  };
}

export async function GET() {
  try {
    const { sheets, spreadsheetId } = await getGoogleSheetsInstance();

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const actualTitles =
      spreadsheet.data.sheets?.map((s) => s.properties?.title ?? '') ?? [];

    const resolveSheetName = (expected: string | null): string | null => {
      if (!expected) return null;
      return findSheetTitle(expected, actualTitles);
    };

    const results = await Promise.allSettled(
      SHEETS.map(async (s) => {
        let data: DashboardSheetData;
        if (s.key === 'pagina1' && s.name === null) {
          const firstTitle = actualTitles[0] || null;
          try {
            data = await fetchSheet(sheets, spreadsheetId, firstTitle, s.range);
          } catch {
            try {
              data = await fetchSheet(sheets, spreadsheetId, null, s.range);
            } catch {
              data = await fetchSheet(sheets, spreadsheetId, 'Página1', s.range);
            }
          }
        } else {
          const sheetTitle = resolveSheetName(s.name);
          if (!sheetTitle) {
            console.warn(`[dashboard] Aba não encontrada na planilha: "${s.name}". Abas existentes: ${actualTitles.join(', ')}`);
            data = { headers: [], rows: [], totalRows: 0 };
          } else {
            data = await fetchSheet(sheets, spreadsheetId, sheetTitle, s.range);
          }
        }
        return { key: s.key, data };
      })
    );

    const body: DashboardData = {} as DashboardData;

    SHEETS.forEach((s, i) => {
      const result = results[i];
      if (result.status === 'fulfilled') {
        body[s.key] = result.value.data;
      } else {
        body[s.key] = {
          headers: [],
          rows: [],
          totalRows: 0,
        };
        console.warn(`[dashboard] Aba "${s.name ?? 'primeira'}" erro:`, result.reason?.message);
      }
    });

    body._meta = { fetchedAt: new Date().toISOString() };

    return NextResponse.json(body, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao carregar dados do dashboard';
    console.error('[dashboard]', message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
