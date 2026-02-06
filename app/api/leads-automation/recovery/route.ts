import { NextRequest, NextResponse } from 'next/server';
import { 
  getLeadsForRecoveryMessage, 
  sendRecoveryWhatsApp, 
  markLeadAsRecoverySent,
  markAllLeadsWithPhoneAsRecoverySent,
} from '@/lib/leadsAutomation';

// Força execução dinâmica
export const dynamic = 'force-dynamic';

/**
 * CRON - Processa leads para recuperação do quiz via WhatsApp
 * 
 * Executado periodicamente (recomendado: a cada 5-10 minutos via Vercel Cron).
 * Envia mensagem de recuperação para leads que:
 * - purchased = false (não compraram)
 * - recovery_msg01_sent_at está vazio (não receberam a mensagem)
 * - created_at >= 20 minutos atrás (tempo configurável)
 * 
 * GET/POST /api/leads-automation/recovery
 * 
 * Query params:
 * - minutes: tempo mínimo em minutos desde a criação (padrão: 20)
 * - secret: chave secreta para autorização (opcional, recomendado em produção)
 * 
 * Exemplo:
 * GET /api/leads-automation/recovery?minutes=20&secret=sua-chave-secreta
 */
export async function GET(request: NextRequest) {
  return processRecovery(request);
}

export async function POST(request: NextRequest) {
  return processRecovery(request);
}

async function processRecovery(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🚀 [RECOVERY] Iniciando processamento de recuperação de quiz...');

    // Verificar autorização (opcional mas recomendado)
    const secretParam = request.nextUrl.searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && secretParam !== cronSecret) {
      console.error('❌ [RECOVERY] Não autorizado - secret inválido');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Obter threshold de minutos (padrão: 20)
    const minutesParam = request.nextUrl.searchParams.get('minutes');
    const minutes =
      minutesParam && !Number.isNaN(Number(minutesParam)) ? Number(minutesParam) : 20;

    console.log(`⏱️ [RECOVERY] Threshold configurado: ${minutes} minutos`);

    // Buscar leads elegíveis
    const eligibleLeads = await getLeadsForRecoveryMessage(minutes);

    if (eligibleLeads.length === 0) {
      console.log('✅ [RECOVERY] Nenhum lead elegível para recuperação');
      return NextResponse.json({
        success: true,
        message: 'Nenhum lead elegível para recuperação',
        processed: 0,
        sent: 0,
        failed: 0,
      });
    }

    console.log(`📋 [RECOVERY] ${eligibleLeads.length} lead(s) elegível(is) encontrado(s)`);

    let sent = 0;
    let failed = 0;

    // Processar cada lead
    for (const { lead, rowIndex } of eligibleLeads) {
      try {
        console.log(`📱 [RECOVERY] Processando: ${lead.FirstName} (${lead.phone})...`);

        // Enviar mensagem via WhatsApp
        const success = await sendRecoveryWhatsApp(lead);

        if (success) {
          // Marcar como enviado
          await markLeadAsRecoverySent(rowIndex);
          
          // Marcar todos os leads com o mesmo telefone
          await markAllLeadsWithPhoneAsRecoverySent(lead.phone);
          
          sent++;
          console.log(`✅ [RECOVERY] Enviado com sucesso: ${lead.FirstName}`);
        } else {
          failed++;
          console.error(`❌ [RECOVERY] Falha ao enviar: ${lead.FirstName}`);
        }
      } catch (error: any) {
        console.error(`❌ [RECOVERY] Erro ao processar ${lead.FirstName}:`, error.message);
        failed++;
      }

      // Aguardar 200ms entre envios (rate limiting)
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    const result = {
      success: true,
      message: 'Processamento de recuperação concluído',
      processed: eligibleLeads.length,
      sent,
      failed,
      threshold_minutes: minutes,
    };

    console.log('✅ [RECOVERY] Processamento concluído:', result);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ [RECOVERY] Erro no cron de recuperação:', error);

    return NextResponse.json({
      error: 'Erro ao processar recuperação',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}
