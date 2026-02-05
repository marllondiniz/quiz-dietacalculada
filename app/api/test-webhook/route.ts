import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * ENDPOINT DE TESTE PARA WEBHOOK
 * POST /api/test-webhook
 * 
 * Use para testar a extração de valores sem precisar de webhooks reais
 * 
 * Exemplo de uso:
 * POST /api/test-webhook
 * Body: cole o payload JSON que você recebeu da Hubla
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🧪 [TEST] Payload recebido:', JSON.stringify(body, null, 2));
    
    // Simular o mesmo processamento do webhook real
    const event = body.event || body.data || body.payload || body;
    const data = body.data || body.event || {};
    const lead = event.lead || body.lead || {};
    const customer = event.customer || event.buyer || event.user || body.customer || body.buyer || {};
    const invoice = event.invoice || body.invoice || {};
    const payment = event.payment || invoice.payment || body.payment || {};
    
    const parseNum = (v: unknown): number | undefined => {
      if (v == null) return undefined;
      const n = typeof v === 'number' ? v : parseFloat(String(v));
      return Number.isFinite(n) ? n : undefined;
    };
    
    // Valor bruto
    const invoiceTotalCents =
      invoice.amount?.totalCents ?? invoice.amount?.total_cents ?? invoice.amount?.total ?? undefined;
    const parsedCents = invoiceTotalCents != null ? parseNum(invoiceTotalCents) : undefined;
    const invoiceTotalReais = parsedCents != null ? parsedCents / 100 : undefined;
    
    const grossValueRaw =
      invoiceTotalReais ??
      invoice.total ?? invoice.amount ?? invoice.value ??
      payment.amount ?? payment.value ?? payment.total ??
      event.amount ?? event.total ?? event.value ??
      data.amount ?? data.total ?? data.value ?? data.valor_bruto ?? data.valorBruto ??
      body.amount ?? body.total ?? body.value ?? body.valor_bruto ?? body.valorBruto;
    let grossValue = parseNum(grossValueRaw);
    
    if (grossValue != null && grossValue > 1000 && grossValue < 1000000 && Number.isInteger(grossValue)) {
      const asReais = grossValue / 100;
      if (asReais >= 10 && asReais <= 5000) {
        grossValue = asReais;
      }
    }
    
    // Valor líquido: pegar direto do receiver do vendedor (role "seller")
    const receiverTotalCents = (() => {
      if (!Array.isArray(invoice.receivers) || invoice.receivers.length === 0) {
        return undefined;
      }
      
      // 1. Procurar pelo ID específico da Dieta Calculada
      const dietaCalcReceiver = invoice.receivers.find((r: any) => 
        r.id === 'i98pEhLWL2XxVUecOrInN9Jwq7H3'
      );
      if (dietaCalcReceiver) {
        return dietaCalcReceiver.totalCents ?? dietaCalcReceiver.total_cents;
      }
      
      // 2. Procurar receiver com role "seller" ou paysForFees = true (vendedor)
      const sellerReceiver = invoice.receivers.find((r: any) => 
        r.role === 'seller' || r.role === 'producer' || r.paysForFees === true
      );
      if (sellerReceiver) {
        return sellerReceiver.totalCents ?? sellerReceiver.total_cents;
      }
      
      // 3. Fallback: pegar o último (geralmente é o vendedor)
      const lastReceiver = invoice.receivers[invoice.receivers.length - 1];
      return lastReceiver?.totalCents ?? lastReceiver?.total_cents;
    })();
    
    // Converter de centavos para reais
    const parsedReceiverCents = receiverTotalCents != null ? parseNum(receiverTotalCents) : undefined;
    let netValue = parsedReceiverCents != null ? parsedReceiverCents / 100 : undefined;
    
    // Se ainda não encontrou, tentar outras fontes (para compatibilidade)
    if (netValue == null) {
      const netValueRaw =
        invoice.netAmount ?? invoice.net_amount ?? invoice.netValue ??
        payment.netAmount ?? payment.net_amount ?? payment.netValue ?? payment.net_value ??
        event.netAmount ?? event.net_amount ?? event.netValue ?? event.net_value ??
        data.netAmount ?? data.net_amount ?? data.netValue ?? data.valor_liquido ?? data.valorLiquido ??
        body.netAmount ?? body.net_amount ?? body.netValue ?? body.valor_liquido ?? body.valorLiquido;
      netValue = parseNum(netValueRaw);
      
      if (netValue != null && netValue > 1000 && netValue < 1000000 && Number.isInteger(netValue)) {
        const asReais = netValue / 100;
        if (asReais >= 10 && asReais <= 5000) {
          netValue = asReais;
        }
      }
    }
    
    if (netValue != null && grossValue != null && netValue > grossValue) {
      netValue = grossValue;
    }
    
    // Identificar qual receiver foi selecionado
    const selectedReceiver = (() => {
      if (!Array.isArray(invoice.receivers) || invoice.receivers.length === 0) {
        return null;
      }
      const dietaCalc = invoice.receivers.find((r: any) => r.id === 'i98pEhLWL2XxVUecOrInN9Jwq7H3');
      if (dietaCalc) return { ...dietaCalc, selectedBy: 'ID específico (Dieta Calculada)' };
      
      const seller = invoice.receivers.find((r: any) => r.role === 'seller' || r.role === 'producer' || r.paysForFees === true);
      if (seller) return { ...seller, selectedBy: 'role: seller ou paysForFees: true' };
      
      const last = invoice.receivers[invoice.receivers.length - 1];
      return { ...last, selectedBy: 'último receiver (fallback)' };
    })();
    
    return NextResponse.json({
      success: true,
      message: 'Teste de extração concluído',
      extracted: {
        // Valores brutos consultados
        invoiceTotalCents,
        invoiceTotalReais,
        grossValueRaw,
        grossValueFinal: grossValue,
        // Valores líquidos consultados
        receiverTotalCents,
        netValueFinal: netValue,
        // Receiver selecionado
        selectedReceiver,
        // Informações da estrutura
        hasInvoice: !!invoice,
        hasInvoiceAmount: !!invoice.amount,
        hasInvoiceReceivers: Array.isArray(invoice.receivers) && invoice.receivers.length > 0,
        totalReceivers: Array.isArray(invoice.receivers) ? invoice.receivers.length : 0,
        // Valores formatados como irão para a planilha
        grossFormatted: grossValue != null ? `R$ ${grossValue.toFixed(2).replace('.', ',')}` : '',
        netFormatted: netValue != null ? `R$ ${netValue.toFixed(2).replace('.', ',')}` : '',
      },
      allReceivers: invoice.receivers || [],
      rawStructure: {
        hasEvent: !!body.event,
        hasData: !!body.data,
        hasInvoice: !!invoice,
        hasPayment: !!payment,
        invoiceKeys: invoice ? Object.keys(invoice) : [],
        paymentKeys: payment ? Object.keys(payment) : [],
      },
    });
    
  } catch (error: any) {
    console.error('❌ Erro no teste de webhook:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de teste de webhook',
    usage: 'POST /api/test-webhook com o payload JSON da Hubla no body',
    examples: [
      {
        name: 'Valor em centavos (invoice.amount.totalCents)',
        payload: {
          type: 'invoice.payment.approved',
          event: {
            invoice: {
              amount: {
                totalCents: 9700,
              },
              receivers: [
                {
                  totalCents: 8900,
                },
              ],
            },
          },
        },
      },
      {
        name: 'Valor em reais (invoice.total)',
        payload: {
          type: 'sale.created',
          event: {
            invoice: {
              total: 97,
              netAmount: 89,
            },
          },
        },
      },
    ],
  });
}
