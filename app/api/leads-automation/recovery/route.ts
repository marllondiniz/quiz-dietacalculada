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
 * CRON - Processa leads para recuperação do quiz via WhatsApp (única automação)
 * 
 * Executado a cada 1 minuto via Vercel Cron.
 * Envia mensagem de recuperação (template Sabrina) para leads que:
 * - purchased = false (não compraram)
 * - recovery_msg01_sent_at está vazio (não receberam a mensagem)
 * - created_at >= 5 minutos atrás (mesma lógica que era usada na Zaia)
 * 
 * GET/POST /api/leads-automation/recovery
 * 
 * Query params:
 * - minutes: tempo mínimo em minutos desde a criação (padrão: 5)
 * - secret: chave secreta para autorização (opcional, recomendado em produção)
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

    // Verificar autorização: Vercel envia CRON_SECRET no header Authorization (Bearer),
    // mas também aceitamos ?secret= para testes manuais
    const authHeader = request.headers.get('authorization');
    const secretParam = request.nextUrl.searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    const bearerSecret = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : null;
    const isValidSecret =
      cronSecret &&
      (secretParam === cronSecret || bearerSecret === cronSecret);

    if (cronSecret && !isValidSecret) {
      console.error('❌ [RECOVERY] Não autorizado - secret inválido');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Obter threshold de minutos (padrão: 5 — mesma lógica que era usada na Zaia)
    const minutesParam = request.nextUrl.searchParams.get('minutes');
    const minutes =
      minutesParam && !Number.isNaN(Number(minutesParam)) ? Number(minutesParam) : 5;

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
    const TEMPLATE_PAUSED_CODE = 132015;
    let templatePaused = false;

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
        if (error?.whatsappCode === TEMPLATE_PAUSED_CODE) {
          templatePaused = true;
          console.error(
            '❌ [RECOVERY] Template de recuperação pausado no Meta (erro 132015 - low quality). ' +
            'Abortando lote. Reative o template no Meta ou defina WA_RECOVERY_TEMPLATE_NAME com outro template aprovado.'
          );
          failed = eligibleLeads.length - sent; // este + todos não processados
          break;
        }
        console.error(`❌ [RECOVERY] Erro ao processar ${lead.FirstName}:`, error.message);
        failed++;
      }

      if (templatePaused) break;

      // Aguardar 200ms entre envios (rate limiting)
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    const maxAgeHours = process.env.RECOVERY_MAX_AGE_HOURS ? Number(process.env.RECOVERY_MAX_AGE_HOURS) : 48;
    const result = {
      success: true,
      message: templatePaused
        ? 'Processamento interrompido: template WhatsApp pausado no Meta (132015). Reative no Meta ou use WA_RECOVERY_TEMPLATE_NAME.'
        : 'Processamento de recuperação concluído',
      processed: eligibleLeads.length,
      sent,
      failed,
      threshold_minutes: minutes,
      max_age_hours: maxAgeHours,
      ...(templatePaused && { template_paused: true }),
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
