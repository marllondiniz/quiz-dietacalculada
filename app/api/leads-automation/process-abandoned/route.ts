import { NextRequest, NextResponse } from 'next/server';
import { 
  getAbandonedLeads, 
  sendToZaia, 
  markLeadAsZaiaSent 
} from '@/lib/leadsAutomation';

// Força execução dinâmica (não gerar página estática)
export const dynamic = 'force-dynamic';

/**
 * Rotina automática de abandono (5 minutos)
 * 
 * Endpoint para executar periodicamente (via cron/worker) e:
 * - Buscar leads onde: purchased = false, zaia_sent = false, created_at >= 5 minutos
 * - Enviar HTTP POST para webhook da Zaia com FirstName e phone
 * - Marcar zaia_sent = true após envio bem-sucedido
 * 
 * Este endpoint deve ser chamado via cron job (ex: a cada 1 minuto)
 * 
 * POST /api/leads-automation/process-abandoned
 * 
 * Para proteção, pode-se usar uma chave secreta via header ou query param:
 * Authorization: Bearer <CRON_SECRET>
 * ou
 * ?secret=<CRON_SECRET>
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autorização (opcional mas recomendado)
    const authHeader = request.headers.get('authorization');
    const secretParam = request.nextUrl.searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    // Se CRON_SECRET estiver configurado, validar
    if (cronSecret) {
      const providedSecret = 
        authHeader?.replace('Bearer ', '') || 
        secretParam;

      if (providedSecret !== cronSecret) {
        console.warn('⚠️ Tentativa de acesso não autorizado ao cron');
        return NextResponse.json(
          { error: 'Não autorizado' },
          { status: 401 }
        );
      }
    }

    console.log('🔄 Iniciando processamento de leads abandonados...');

    // Buscar leads elegíveis (5+ minutos sem compra e não enviados)
    const abandonedLeads = await getAbandonedLeads(5);

    console.log(`📊 Encontrados ${abandonedLeads.length} leads abandonados`);

    if (abandonedLeads.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum lead abandonado para processar',
        processed: 0,
        sent: 0,
        failed: 0,
      });
    }

    let sent = 0;
    let failed = 0;
    const results: Array<{
      lead_id: string;
      FirstName: string;
      phone: string;
      success: boolean;
      error?: string;
    }> = [];

    // Processar cada lead
    for (const { lead, rowIndex } of abandonedLeads) {
      console.log(`📤 Processando lead: ${lead.FirstName} (${lead.phone})`);

      try {
        // Enviar para Zaia
        const success = await sendToZaia(lead);

        if (success) {
          // Marcar como enviado
          await markLeadAsZaiaSent(rowIndex);
          sent++;
          results.push({
            lead_id: lead.lead_id,
            FirstName: lead.FirstName,
            phone: lead.phone,
            success: true,
          });
        } else {
          failed++;
          results.push({
            lead_id: lead.lead_id,
            FirstName: lead.FirstName,
            phone: lead.phone,
            success: false,
            error: 'Falha no envio para Zaia',
          });
        }
      } catch (error: any) {
        console.error(`❌ Erro ao processar lead ${lead.lead_id}:`, error);
        failed++;
        results.push({
          lead_id: lead.lead_id,
          FirstName: lead.FirstName,
          phone: lead.phone,
          success: false,
          error: error.message,
        });
      }

      // Pequeno delay entre envios para não sobrecarregar
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`✅ Processamento concluído: ${sent} enviados, ${failed} falhas`);

    return NextResponse.json({
      success: true,
      message: 'Processamento concluído',
      processed: abandonedLeads.length,
      sent,
      failed,
      results: process.env.NODE_ENV === 'development' ? results : undefined,
    });

  } catch (error: any) {
    console.error('❌ Erro no processamento de abandonados:', error);

    return NextResponse.json(
      {
        error: 'Erro ao processar leads abandonados',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno',
      },
      { status: 500 }
    );
  }
}

/**
 * GET para executar manualmente ou via cron simples
 * Útil para testes e para serviços de cron que usam GET
 */
export async function GET(request: NextRequest) {
  // Verificar autorização
  const secretParam = request.nextUrl.searchParams.get('secret');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && secretParam !== cronSecret) {
    return NextResponse.json({
      status: 'ok',
      endpoint: 'leads-automation/process-abandoned',
      description: 'Rotina de processamento de leads abandonados (requer autorização)',
      note: 'Use POST com autorização para executar',
    });
  }

  // Se autorizado ou sem CRON_SECRET, executar
  return POST(request);
}
