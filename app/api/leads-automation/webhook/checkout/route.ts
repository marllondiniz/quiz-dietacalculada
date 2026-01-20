import { NextRequest, NextResponse } from 'next/server';
import { markLeadAsPurchased } from '@/lib/leadsAutomation';

// Força execução dinâmica (não gerar página estática)
export const dynamic = 'force-dynamic';

/**
 * Webhook de venda aprovada — Checkout próprio
 * 
 * Endpoint público para receber webhook de pagamento aprovado do checkout próprio.
 * Localiza o lead na aba Leads_Automacao por email (prioritário) ou phone e atualiza:
 * - purchased = true
 * - checkout_source = proprio
 * - purchase_at = data/hora do evento
 * 
 * POST /api/leads-automation/webhook/checkout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('📥 Webhook Checkout próprio recebido:', JSON.stringify(body, null, 2));

    // Extrair dados do webhook
    const email = body?.email?.trim().toLowerCase() || undefined;
    const phone = body?.phone?.replace(/\D/g, '') || body?.telefone?.replace(/\D/g, '') || undefined;

    if (!email && !phone) {
      console.warn('⚠️ Webhook Checkout próprio sem email ou phone válido');
      return NextResponse.json(
        {
          error: 'Dados insuficientes',
          message: 'É necessário fornecer email ou phone para identificar o lead',
        },
        { status: 400 }
      );
    }

    console.log('🔍 Buscando lead:', { email, phone });

    // Marcar lead como comprado
    const result = await markLeadAsPurchased(email, phone, 'proprio');

    if (!result.success) {
      console.warn('⚠️ Lead não encontrado para webhook Checkout:', { email, phone });
      // Retornar 200 mesmo se não encontrar, para não reprocessar
      return NextResponse.json({
        success: false,
        message: result.message,
        note: 'Lead não encontrado na aba de automação',
      });
    }

    console.log('✅ Venda Checkout próprio processada:', { email, phone });

    return NextResponse.json({
      success: true,
      message: 'Venda registrada com sucesso',
      checkout_source: 'proprio',
    });

  } catch (error: any) {
    console.error('❌ Erro ao processar webhook Checkout:', error);

    return NextResponse.json(
      {
        error: 'Erro ao processar webhook',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno',
      },
      { status: 500 }
    );
  }
}

/**
 * GET para verificar se o endpoint está funcionando
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'leads-automation/webhook/checkout',
    description: 'Webhook de venda aprovada do checkout próprio',
  });
}
