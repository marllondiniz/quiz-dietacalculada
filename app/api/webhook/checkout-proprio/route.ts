import { NextRequest, NextResponse } from 'next/server';

/**
 * WEBHOOK DO CHECKOUT PRÓPRIO
 * 
 * Recebe notificação de pagamento aprovado do checkout.dietacalculada.com
 * e marca o lead como comprado na automação.
 * 
 * POST /api/webhook/checkout-proprio
 * 
 * Body esperado:
 * {
 *   "email": "cliente@email.com",
 *   "phone": "11999999999",
 *   "transaction_id": "tx_123",
 *   "amount": 99.90,
 *   "plan": "annual"
 * }
 */

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 Webhook checkout próprio recebido:', body);

    // Validar campos obrigatórios
    const { email, phone } = body;
    
    if (!email && !phone) {
      return NextResponse.json({
        success: false,
        error: 'Email ou telefone é obrigatório',
      }, { status: 400 });
    }

    // Chamar o endpoint de automação para marcar como venda
    const automationUrl = new URL('/api/leads-automation', request.url);
    
    const response = await fetch(automationUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'sale',
        email: email || '',
        phone: phone || '',
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Erro ao registrar venda:', result);
      return NextResponse.json({
        success: false,
        error: 'Erro ao registrar venda',
        details: result,
      }, { status: 500 });
    }

    console.log('✅ Venda registrada com sucesso:', result);

    return NextResponse.json({
      success: true,
      message: 'Venda registrada com sucesso',
      data: result,
    });

  } catch (error: any) {
    console.error('❌ Erro no webhook checkout próprio:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar webhook',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}

// GET para documentação
export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/webhook/checkout-proprio',
    description: 'Webhook para notificação de pagamento aprovado do checkout próprio',
    required_fields: {
      email: 'Email do cliente (string)',
      phone: 'Telefone do cliente (string)',
    },
    optional_fields: {
      transaction_id: 'ID da transação (string)',
      amount: 'Valor pago (number)',
      plan: 'Plano contratado (string)',
    },
    example: {
      email: 'cliente@email.com',
      phone: '11999999999',
      transaction_id: 'tx_123',
      amount: 99.90,
      plan: 'annual',
    },
    usage: 'Configure este endpoint no webhook do seu gateway de pagamento ou no callback de sucesso do checkout próprio',
  });
}
