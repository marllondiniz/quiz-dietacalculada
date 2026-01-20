import { NextRequest, NextResponse } from 'next/server';
import { markLeadAsPurchased } from '@/lib/leadsAutomation';

// Força execução dinâmica (não gerar página estática)
export const dynamic = 'force-dynamic';

/**
 * Webhook de venda aprovada — Hubla
 * 
 * Endpoint público para receber webhook de pagamento aprovado da Hubla.
 * Localiza o lead na aba Leads_Automacao por email (prioritário) ou phone e atualiza:
 * - purchased = true
 * - checkout_source = hubla
 * - purchase_at = data/hora do evento
 * 
 * POST /api/leads-automation/webhook/hubla
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('📥 Webhook Hubla recebido:', JSON.stringify(body, null, 2));

    // Extrair dados do webhook da Hubla
    // A estrutura pode variar, adapte conforme documentação da Hubla
    const email = extractEmail(body);
    const phone = extractPhone(body);

    if (!email && !phone) {
      console.warn('⚠️ Webhook Hubla sem email ou phone válido');
      return NextResponse.json(
        {
          error: 'Dados insuficientes',
          message: 'Não foi possível identificar o cliente pelo email ou telefone',
        },
        { status: 400 }
      );
    }

    console.log('🔍 Buscando lead:', { email, phone });

    // Marcar lead como comprado
    const result = await markLeadAsPurchased(email, phone, 'hubla');

    if (!result.success) {
      console.warn('⚠️ Lead não encontrado para webhook Hubla:', { email, phone });
      // Retornar 200 mesmo se não encontrar, para não reprocessar
      return NextResponse.json({
        success: false,
        message: result.message,
        note: 'Lead não encontrado na aba de automação',
      });
    }

    console.log('✅ Venda Hubla processada:', { email, phone });

    return NextResponse.json({
      success: true,
      message: 'Venda registrada com sucesso',
      checkout_source: 'hubla',
    });

  } catch (error: any) {
    console.error('❌ Erro ao processar webhook Hubla:', error);

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
 * Extrai email do payload do webhook da Hubla
 * Adapte conforme a estrutura real do webhook
 */
function extractEmail(body: any): string | undefined {
  // Tentar diferentes caminhos comuns para o email
  const possiblePaths = [
    body?.email,
    body?.customer?.email,
    body?.buyer?.email,
    body?.data?.email,
    body?.data?.customer?.email,
    body?.data?.buyer?.email,
    body?.payload?.email,
    body?.payload?.customer?.email,
    body?.user?.email,
  ];

  for (const email of possiblePaths) {
    if (email && typeof email === 'string' && email.includes('@')) {
      return email.trim().toLowerCase();
    }
  }

  return undefined;
}

/**
 * Extrai telefone do payload do webhook da Hubla
 * Adapte conforme a estrutura real do webhook
 */
function extractPhone(body: any): string | undefined {
  const possiblePaths = [
    body?.phone,
    body?.telefone,
    body?.customer?.phone,
    body?.customer?.telefone,
    body?.buyer?.phone,
    body?.buyer?.telefone,
    body?.data?.phone,
    body?.data?.telefone,
    body?.data?.customer?.phone,
    body?.data?.buyer?.phone,
    body?.payload?.phone,
    body?.payload?.telefone,
    body?.user?.phone,
  ];

  for (const phone of possiblePaths) {
    if (phone && typeof phone === 'string') {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length >= 8) {
        return cleaned;
      }
    }
  }

  return undefined;
}

/**
 * GET para verificar se o endpoint está funcionando
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'leads-automation/webhook/hubla',
    description: 'Webhook de venda aprovada da Hubla',
  });
}
