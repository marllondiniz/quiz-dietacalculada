import { NextResponse } from 'next/server';
import { ensureAutomationSheetExists, AUTOMATION_SHEET_NAME } from '@/lib/leadsAutomation';

// Força execução dinâmica (não gerar página estática)
export const dynamic = 'force-dynamic';

/**
 * Endpoint para inicializar a aba Leads_Automacao
 * 
 * Cria a aba com headers se ainda não existir
 * 
 * POST /api/leads-automation/init
 */
export async function POST() {
  try {
    console.log('🔧 Inicializando aba de automação...');

    await ensureAutomationSheetExists();

    console.log(`✅ Aba ${AUTOMATION_SHEET_NAME} verificada/criada`);

    return NextResponse.json({
      success: true,
      message: `Aba ${AUTOMATION_SHEET_NAME} está pronta para uso`,
      sheetName: AUTOMATION_SHEET_NAME,
      columns: [
        'lead_id',
        'FirstName',
        'email',
        'phone',
        'created_at',
        'purchased',
        'zaia_sent',
        'checkout_source',
        'purchase_at',
      ],
    });

  } catch (error: any) {
    console.error('❌ Erro ao inicializar aba:', error);

    return NextResponse.json(
      {
        error: 'Erro ao inicializar aba de automação',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno',
      },
      { status: 500 }
    );
  }
}

/**
 * GET para verificar status da inicialização
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'leads-automation/init',
    description: 'Use POST para inicializar a aba Leads_Automacao no Google Sheets',
    sheetName: AUTOMATION_SHEET_NAME,
  });
}
