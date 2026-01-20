import { NextRequest, NextResponse } from 'next/server';
import { getAllLeads, AUTOMATION_SHEET_NAME } from '@/lib/leadsAutomation';

// Força execução dinâmica (não gerar página estática)
export const dynamic = 'force-dynamic';

/**
 * Endpoint de status da automação
 * 
 * Retorna estatísticas sobre os leads na aba de automação
 * 
 * GET /api/leads-automation/status
 */
export async function GET(request: NextRequest) {
  try {
    const leads = await getAllLeads();

    const stats = {
      total: leads.length,
      purchased: leads.filter((l) => l.purchased).length,
      notPurchased: leads.filter((l) => !l.purchased).length,
      zaiaSent: leads.filter((l) => l.zaia_sent).length,
      zaiaNotSent: leads.filter((l) => !l.zaia_sent).length,
      pendingZaia: leads.filter((l) => !l.purchased && !l.zaia_sent).length,
      byCheckoutSource: {
        hubla: leads.filter((l) => l.checkout_source === 'hubla').length,
        proprio: leads.filter((l) => l.checkout_source === 'proprio').length,
        none: leads.filter((l) => !l.checkout_source).length,
      },
    };

    return NextResponse.json({
      success: true,
      sheetName: AUTOMATION_SHEET_NAME,
      stats,
      endpoints: {
        capture: '/api/leads-automation/capture',
        webhookHubla: '/api/leads-automation/webhook/hubla',
        webhookCheckout: '/api/leads-automation/webhook/checkout',
        processAbandoned: '/api/leads-automation/process-abandoned',
        status: '/api/leads-automation/status',
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erro ao obter status:', error);

    return NextResponse.json(
      {
        error: 'Erro ao obter status',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno',
      },
      { status: 500 }
    );
  }
}
