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

    console.log('🔄 Processando leads abandonados...');

    // Buscar leads elegíveis (5+ minutos)
    const abandonedLeads = await getAbandonedLeads(5);

    console.log(`📊 ${abandonedLeads.length} leads abandonados encontrados`);

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
          // Marcar o lead atual
          await markLeadAsZaiaSent(rowIndex);
          
          // Marcar TODOS os outros leads com o mesmo telefone (evitar duplicatas)
          await markAllLeadsWithPhoneAsZaiaSent(lead.phone);
          
          sent++;
          console.log(`✅ Enviado: ${lead.FirstName} (${lead.phone})`);
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`❌ Erro: ${lead.lead_id}`, error);
        failed++;
      }

      // Delay entre envios
      await new Promise((r) => setTimeout(r, 100));
    }

    console.log(`✅ Concluído: ${sent} enviados, ${failed} falhas`);

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
