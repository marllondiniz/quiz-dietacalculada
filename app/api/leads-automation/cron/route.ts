import { NextRequest, NextResponse } from 'next/server';
import { 
  getAbandonedLeads, 
  sendToZaia, 
  markLeadAsZaiaSent,
  markAllLeadsWithPhoneAsZaiaSent
} from '@/lib/leadsAutomation';

// Força execução dinâmica
export const dynamic = 'force-dynamic';

/**
 * CRON - Processa leads abandonados
 * 
 * Executado periodicamente (a cada 1 minuto via Vercel Cron).
 * Envia para Zaia leads que:
 * - purchased = false
 * - zaia_sent = false  
 * - created_at >= 5 minutos atrás
 * 
 * GET/POST /api/leads-automation/cron
 */
export async function GET(request: NextRequest) {
  return processAbandoned(request);
}

export async function POST(request: NextRequest) {
  return processAbandoned(request);
}

async function processAbandoned(request: NextRequest): Promise<NextResponse> {
  try {
    // Verificar autorização (opcional)
    const secretParam = request.nextUrl.searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && secretParam !== cronSecret) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const minutesParam = request.nextUrl.searchParams.get('minutes');
    const minutes =
      minutesParam && !Number.isNaN(Number(minutesParam)) ? Number(minutesParam) : 5;

    const abandonedLeads = await getAbandonedLeads(minutes);

    if (abandonedLeads.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum lead abandonado',
        processed: 0,
      });
    }

    let sent = 0;
    let failed = 0;

    for (const { lead, rowIndex } of abandonedLeads) {
      try {
        const success = await sendToZaia(lead);

        if (success) {
          await markLeadAsZaiaSent(rowIndex);
          await markAllLeadsWithPhoneAsZaiaSent(lead.phone);
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`❌ Erro: ${lead.lead_id}`, error);
        failed++;
      }

      await new Promise((r) => setTimeout(r, 100));
    }

    return NextResponse.json({
      success: true,
      processed: abandonedLeads.length,
      sent,
      failed,
    });

  } catch (error: any) {
    console.error('❌ Erro no cron:', error);

    return NextResponse.json({
      error: 'Erro ao processar',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}
