import { NextRequest, NextResponse } from 'next/server';
import { 
  upsertLead, 
  markLeadAsPurchased, 
  getAllLeads,
  ensureAutomationSheetExists,
  AUTOMATION_SHEET_NAME,
  AUTOMATION_HEADERS,
  CheckoutSource,
  saveSaleToSalesSheet,
  buildSalesRow,
  SaleData,
  SALES_HEADERS,
  findLeadByEmailOrPhone,
  findLeadUTMsInMainSheet,
} from '@/lib/leadsAutomation';
import { 
  leadCaptureSchema, 
  saleApprovedSchema, 
  hublaWebhookSchema 
} from '@/lib/validations';
import { ZodError } from 'zod';

// Força execução dinâmica
export const dynamic = 'force-dynamic';

/**
 * ENDPOINT UNIFICADO DE AUTOMAÇÃO DE LEADS
 * 
 * Detecta automaticamente:
 * 1. Origem: Hubla vs Sistema próprio (pelo formato do payload)
 * 2. Tipo de evento: Captura de lead vs Venda aprovada (pelo campo "type" ou estrutura)
 * 
 * ==========================================
 * EVENTOS HUBLA (detectados pelo campo "type"):
 * ==========================================
 * - lead.created / lead.abandoned_checkout → Captura de lead
 * - invoice.payment.approved / sale.created → Venda aprovada
 * 
 * ==========================================
 * EVENTOS PRÓPRIOS (detectados pela estrutura):
 * ==========================================
 * - { action: "capture", ... } → Captura de lead
 * - { action: "sale", ... } → Venda aprovada
 * - { FirstName, email, phone } (sem action) → Captura de lead (default)
 * 
 * POST /api/leads-automation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar payload com Zod
    try {
      if (body.type && body.event) {
        hublaWebhookSchema.parse(body);
      }
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        return NextResponse.json({
          success: false,
          error: 'Dados inválidos',
          details: validationError.issues,
        }, { status: 400 });
      }
    }

    // Apenas Hubla é suportado no momento
    const isHubla = isRequestFromHubla(request);
    if (!isHubla) {
      return NextResponse.json({
        success: false,
        error: 'Apenas webhooks da Hubla são suportados no momento',
      }, { status: 400 });
    }

    const { eventType, data } = detectEventType(body);

    await ensureAutomationSheetExists();

    // Executar ação baseada no tipo de evento
    switch (eventType) {
      case 'lead_capture':
        return handleLeadCapture(data, 'hubla');
      
      case 'sale_approved':
        return handleSaleApproved(data, 'hubla');
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Tipo de evento não reconhecido',
          detected_source: 'hubla',
          detected_event: eventType,
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Erro no endpoint de automação:', error);

    return NextResponse.json({
      error: 'Erro ao processar requisição',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}

/**
 * GET - Retorna status e documentação do endpoint.
 * GET ?test=sheet - Dry-run: testa extração Hubla e a linha que seria enviada à planilha (sem gravar).
 */
export async function GET(request: NextRequest) {
  const testSheet = request.nextUrl.searchParams.get('test') === 'sheet';
  if (testSheet) {
    return runSheetDryRunTest();
  }
  try {
    const leads = await getAllLeads();

    const stats = {
      total: leads.length,
      purchased: leads.filter((l) => l.purchased).length,
      notPurchased: leads.filter((l) => !l.purchased).length,
      zaiaSent: leads.filter((l) => l.zaia_sent).length,
      pendingZaia: leads.filter((l) => !l.purchased && !l.zaia_sent).length,
      bySource: {
        hubla: leads.filter((l) => l.checkout_source === 'hubla').length,
      },
    };

    return NextResponse.json({
      status: 'ok',
      sheetName: AUTOMATION_SHEET_NAME,
      columns: AUTOMATION_HEADERS,
      stats,
      documentation: {
        endpoint: 'POST /api/leads-automation',
        description: 'Endpoint unificado - detecta origem e tipo de evento automaticamente',
        events: {
          hubla: {
            lead_capture: ['lead.created', 'lead.abandoned_checkout'],
            sale_approved: ['invoice.payment.approved', 'sale.created', 'purchase.approved'],
          },
        },
      },
      cron_endpoint: '/api/leads-automation/recovery',
      cron_description: 'Recuperação via WhatsApp (a cada 1 min, leads 5+ min sem compra)',
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'ok',
      error: 'Não foi possível obter estatísticas',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

// ==========================================
// DETECÇÃO DE ORIGEM (pelos headers)
// ==========================================

/**
 * Verifica se a requisição vem da Hubla pelos headers
 */
function isRequestFromHubla(request: NextRequest): boolean {
  const hublaToken = request.headers.get('x-hubla-token');
  const hublaIdempotency = request.headers.get('x-hubla-idempotency');
  
  return !!(hublaToken || hublaIdempotency);
}

// ==========================================
// DETECÇÃO DE TIPO DE EVENTO (pelo body)
// ==========================================

type EventType = 'lead_capture' | 'sale_approved' | 'unknown';

interface DetectedEventData {
  eventType: EventType;
  data: {
    lead_id?: string;
    FirstName?: string;
    email?: string;
    phone?: string;
    // Dados adicionais para vendas
    transactionId?: string;
    plan?: string;
    grossValue?: number;
    netValue?: number;
    paymentMethod?: string;
    offerName?: string;
    purchaseDate?: string;
    paymentDate?: string;
    utmSource?: string;
    utmCampaign?: string;
    utmMedium?: string;
    utmContent?: string;
    utmTerm?: string;
    coupon?: string;
  };
}

function detectEventType(body: any): DetectedEventData {
  return detectHublaEventType(body);
}

function detectHublaEventType(body: any): DetectedEventData {
  const hublaType = (body.type || '').toLowerCase();
  
  // Tipos de evento da Hubla para CAPTURA DE LEAD
  const isLeadCapture = 
    hublaType.includes('lead') ||
    hublaType.includes('abandoned');

  // Tipos de evento da Hubla para VENDA APROVADA
  const isSaleApproved = 
    hublaType.includes('payment') ||
    hublaType.includes('invoice') ||
    hublaType.includes('sale') ||
    hublaType.includes('purchase') ||
    hublaType.includes('subscription');

  // Extrair dados
  const data = extractHublaData(body);

  let eventType: EventType = 'unknown';
  if (isLeadCapture) {
    eventType = 'lead_capture';
  } else if (isSaleApproved) {
    eventType = 'sale_approved';
  }

  return { eventType, data };
}

function extractHublaData(body: any): DetectedEventData['data'] {
  // Suporte a múltiplas estruturas: body.event (padrão), body.data, body.payload ou top-level
  const event = body.event || body.data || body.payload || body;
  const data = body.data || body.event || {};
  const lead = event.lead || body.lead || {};
  const customer = event.customer || event.buyer || event.user || body.customer || body.buyer || {};
  const invoice = event.invoice || body.invoice || {};
  const payment = event.payment || invoice.payment || body.payment || {};
  const offer = event.offer || event.product || body.offer || body.product || data.offer || data.product || {};
  const products = event.products || body.products || data.products || [];
  const firstProduct = Array.isArray(products) ? products[0] : undefined;
  const firstOfferFromProducts = firstProduct?.offers?.[0] || {};
  const subscription = event.subscription || body.subscription || {};
  const utm = event.utm || customer.utm || body.utm || {};

  // Prioridade: lead > customer
  const source = lead.email ? lead : customer;

  // Extrair primeiro nome do fullName
  const fullName = source.fullName || source.full_name || source.name || source.nome || body.name || body.nome || '';
  const firstName = fullName.split(' ')[0] || fullName;

  const parseNum = (v: unknown): number | undefined => {
    if (v == null) return undefined;
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : undefined;
  };

  // Valor bruto: invoice, payment, event, body.data e body (Hubla pode enviar em data.amount, data.total, valor_bruto, etc.)
  const invoiceTotalCents =
    invoice.amount?.totalCents ?? invoice.amount?.total_cents ?? invoice.amount?.total ?? undefined;
  
  // Se invoiceTotalCents existe, está em CENTAVOS - converter para REAIS antes de usar
  const invoiceTotalReais = invoiceTotalCents != null && parseNum(invoiceTotalCents) != null 
    ? (parseNum(invoiceTotalCents) as number) / 100 
    : undefined;
  
  const grossValueRaw =
    invoiceTotalReais ??
    invoice.total ?? invoice.amount ?? invoice.value ??
    payment.amount ?? payment.value ?? payment.total ??
    event.amount ?? event.total ?? event.value ??
    data.amount ?? data.total ?? data.value ?? data.valor_bruto ?? data.valorBruto ??
    body.amount ?? body.total ?? body.value ?? body.valor_bruto ?? body.valorBruto;
  let grossValue = parseNum(grossValueRaw);
  
  // Se valor vier em centavos (ex.: 9700 para R$ 97,00), converter para reais
  // Verifica se parece ser centavos: inteiro entre 1000 e 1000000 que, dividido por 100, resulta em valor razoável
  if (grossValue != null && grossValue > 1000 && grossValue < 1000000 && Number.isInteger(grossValue)) {
    const asReais = grossValue / 100;
    // Valores típicos: entre R$ 10 e R$ 5000
    if (asReais >= 10 && asReais <= 5000) {
      grossValue = asReais;
    }
  }

  // Valor líquido: pegar direto do receiver do vendedor (role "seller")
  // O valor já vem líquido (após descontar taxas da plataforma) no totalCents do seller
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
  let netValue = receiverTotalCents != null && parseNum(receiverTotalCents) != null
    ? (parseNum(receiverTotalCents) as number) / 100
    : undefined;
  
  // Se ainda não encontrou, tentar outras fontes (para compatibilidade com outros checkouts)
  if (netValue == null) {
    const netValueRaw =
      invoice.netAmount ?? invoice.net_amount ?? invoice.netValue ??
      payment.netAmount ?? payment.net_amount ?? payment.netValue ?? payment.net_value ??
      event.netAmount ?? event.net_amount ?? event.netValue ?? event.net_value ??
      data.netAmount ?? data.net_amount ?? data.netValue ?? data.valor_liquido ?? data.valorLiquido ??
      body.netAmount ?? body.net_amount ?? body.netValue ?? body.valor_liquido ?? body.valorLiquido;
    netValue = parseNum(netValueRaw);
    
    // Se valor vier em centavos, converter
    if (netValue != null && netValue > 1000 && netValue < 1000000 && Number.isInteger(netValue)) {
      const asReais = netValue / 100;
      if (asReais >= 10 && asReais <= 5000) {
        netValue = asReais;
      }
    }
  }
  
  // Garantir que valor líquido não seja maior que o bruto
  if (netValue != null && grossValue != null && netValue > grossValue) {
    console.warn(`⚠️ Valor líquido (${netValue}) maior que bruto (${grossValue}). Ajustando para igual ao bruto.`);
    netValue = grossValue;
  }
  
  // Log detalhado para debug de valores
  console.log('💰 [DEBUG] Extração de valores:', {
    // Valores brutos originais
    invoiceTotalCents,
    invoiceTotalReais,
    grossValueRaw,
    grossValueFinal: grossValue,
    // Valores líquidos originais
    receiverTotalCents,
    netValueFinal: netValue,
    // Estruturas consultadas
    hasInvoice: !!invoice,
    hasPayment: !!payment,
    hasReceivers: Array.isArray(invoice.receivers) && invoice.receivers.length > 0,
    totalReceivers: Array.isArray(invoice.receivers) ? invoice.receivers.length : 0,
  });

  // Extrair forma de pagamento
  let paymentMethod = payment.method || payment.payment_method || invoice.paymentMethod || body.paymentMethod || '';
  if (paymentMethod) {
    paymentMethod = mapPaymentMethod(paymentMethod);
  }

  // Extrair plano: offer.name, products[0].offers[0].name, subscription.plan, data.plan, body.plan
  let plan = (
    firstOfferFromProducts.name ?? firstOfferFromProducts.title ??
    offer.name ?? offer.title ??
    subscription.plan ?? subscription.name ??
    event.plan ?? event.product?.name ??
    data.plan ?? data.product?.name ?? data.offer?.name ??
    body.plan ?? body.product?.name ??
    ''
  ).toString().trim();
  const planLower = plan.toLowerCase();
  const isPlanType = planLower.includes('annual') || planLower.includes('anual') || planLower.includes('monthly') || planLower.includes('mensal');
  if (grossValue != null) {
    if (!isPlanType || !plan) {
      // Nome de produto (ex: "Dieta Calculada") ou plano vazio: inferir pelo valor (R$ ~97 anual, ~47 mensal)
      plan = grossValue >= 90 ? 'annual' : 'monthly';
    }
  } else if (!plan) {
    plan = '';
  }

  return {
    lead_id: lead.id || source.id || body.lead_id,
    FirstName: firstName,
    email: (source.email || body.email || '').toString().trim().toLowerCase() || undefined,
    phone: normalizePhone(source.phone || source.telefone || body.phone || body.telefone),
    // Dados de venda (incluir data.id para payloads tipo { type, data: { id, amount, ... } })
    transactionId: invoice.id || payment.id || event.id || data.id || body.id,
    plan: plan || undefined,
    grossValue: grossValue ?? undefined,
    netValue: netValue ?? undefined,
    paymentMethod: paymentMethod,
    offerName: firstOfferFromProducts.name || firstOfferFromProducts.title || offer.name || offer.title || subscription.name || data.offer?.name || '',
    purchaseDate: event.createdAt || event.created_at || invoice.createdAt || body.createdAt,
    paymentDate: payment.paidAt || payment.paid_at || invoice.paidAt || event.paidAt,
    // UTMs (vários caminhos: event, customer, top-level)
    utmSource: (utm.source || utm.utm_source || body.utm_source || '').toString().trim(),
    utmCampaign: (utm.campaign || utm.utm_campaign || body.utm_campaign || '').toString().trim(),
    utmMedium: (utm.medium || utm.utm_medium || body.utm_medium || '').toString().trim(),
    utmContent: (utm.content || utm.utm_content || body.utm_content || '').toString().trim(),
    utmTerm: (utm.term || utm.utm_term || body.utm_term || '').toString().trim(),
    coupon: invoice.coupon || payment.coupon || event.coupon || body.coupon || '',
  };
}

/**
 * Mapeia método de pagamento para português
 */
function mapPaymentMethod(method: string): string {
  const methodLower = method.toLowerCase();
  if (methodLower.includes('pix')) return 'PIX';
  if (methodLower.includes('credit') || methodLower.includes('credito') || methodLower.includes('card')) return 'Cartão de Crédito';
  if (methodLower.includes('boleto') || methodLower.includes('billet')) return 'Boleto';
  if (methodLower.includes('debit') || methodLower.includes('debito')) return 'Cartão de Débito';
  return method;
}

function normalizePhone(phone: any): string | undefined {
  if (!phone || typeof phone !== 'string') return undefined;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 8 ? cleaned : undefined;
}

/**
 * Teste dry-run: simula payloads Hubla, extrai dados e monta a linha da planilha (sem gravar).
 * GET /api/leads-automation?test=sheet
 */
function runSheetDryRunTest(): NextResponse {
  const mockPayloads: Array<{ name: string; body: any }> = [
    {
      name: 'Hubla data.amount (centavos)',
      body: {
        type: 'payment.succeeded',
        data: {
          id: 'pay-test-123',
          amount: 9700,
          currency: 'BRL',
          method: 'pix',
        },
      },
    },
    {
      name: 'Hubla body.amount + oferta',
      body: {
        type: 'invoice.payment.approved',
        amount: 97,
        total: 97,
        plan: 'Dieta Calculada',
        offer: { name: 'Dieta Calculada' },
        event: { lead: { name: 'Maria Teste', email: 'maria@teste.com', phone: '11999999999' } },
      },
    },
    {
      name: 'Hubla valor em reais + netAmount',
      body: {
        type: 'sale.created',
        amount: 47,
        total: 47,
        netAmount: 44,
        net_amount: 44,
        offer: { name: 'Dieta Calculada' },
        event: { customer: { fullName: 'João Teste', email: 'joao@teste.com' } },
      },
    },
  ];

  const results: Array<{
    name: string;
    eventType: string;
    extracted?: { plan?: string; grossValue?: number; netValue?: number; transactionId?: string };
    saleData?: Partial<SaleData>;
    rowForSheet?: string[];
    error?: string;
  }> = [];

  for (const { name, body } of mockPayloads) {
    try {
      const { eventType, data } = detectEventType(body);
      if (eventType !== 'sale_approved') {
        results.push({ name, eventType, error: 'Não detectado como sale_approved' });
        continue;
      }
      const saleData: SaleData = {
        purchaseDate: data.purchaseDate,
        paymentDate: data.paymentDate,
        checkout: 'hubla',
        transactionId: data.transactionId,
        plan: data.plan,
        grossValue: data.grossValue,
        netValue: data.netValue,
        paymentMethod: data.paymentMethod,
        name: data.FirstName || 'Teste',
        email: data.email || 'teste@teste.com',
        phone: data.phone || '',
        offerName: data.offerName,
        utmSource: data.utmSource,
        utmCampaign: data.utmCampaign,
        utmMedium: data.utmMedium,
        utmContent: data.utmContent,
        utmTerm: data.utmTerm,
        coupon: data.coupon,
      };
      const rowForSheet = buildSalesRow(saleData);
      results.push({
        name,
        eventType,
        extracted: {
          plan: data.plan,
          grossValue: data.grossValue,
          netValue: data.netValue,
          transactionId: data.transactionId,
        },
        saleData: {
          plan: saleData.plan,
          grossValue: saleData.grossValue,
          netValue: saleData.netValue,
          paymentMethod: saleData.paymentMethod,
          name: saleData.name,
        },
        rowForSheet,
      });
    } catch (err: any) {
      results.push({ name, eventType: 'error', error: err?.message || String(err) });
    }
  }

  return NextResponse.json({
    test: 'sheet',
    description: 'Dry-run: dados extraídos e linha que seria enviada à aba "Lista Vendas" (não grava na planilha)',
    columnHeaders: SALES_HEADERS,
    results,
  });
}

// ==========================================
// HANDLERS
// ==========================================

async function handleLeadCapture(
  data: DetectedEventData['data'],
  source: 'hubla'
): Promise<NextResponse> {
  const { lead_id, FirstName, email, phone } = data;

  // Validar dados com Zod
  try {
    const validatedData = leadCaptureSchema.parse({
      lead_id,
      FirstName,
      email,
      phone,
      checkout_source: source,
    });

    const result = await upsertLead({
      lead_id: validatedData.lead_id,
      FirstName: validatedData.FirstName.trim(),
      email: validatedData.email || '',
      phone: validatedData.phone || '',
      checkout_source: source,
    });

    return NextResponse.json({
      success: true,
      message: result.isNew ? 'Lead criado' : 'Lead atualizado',
      lead_id: result.lead_id,
      isNew: result.isNew,
      source,
      event: 'lead_capture',
    });
    
  } catch (validationError) {
    if (validationError instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        message: validationError.issues[0].message,
        details: validationError.issues,
        source,
        event: 'lead_capture',
      }, { status: 400 });
    }
    throw validationError;
  }
}

async function handleSaleApproved(
  data: DetectedEventData['data'],
  source: 'hubla'
): Promise<NextResponse> {
  const { email, phone } = data;

  // Validar dados com Zod
  try {
    const validatedData = saleApprovedSchema.parse({
      email,
      phone,
      checkout_source: source,
    });

    const checkoutSource: CheckoutSource = source;
    
    // 1. Marcar lead como comprado na aba de automação
    const result = await markLeadAsPurchased(
      validatedData.email, 
      validatedData.phone, 
      checkoutSource
    );

    // 2. Buscar dados do lead para pegar nome e UTMs
    let leadName = data.FirstName || '';
    let utmSource = data.utmSource || '';
    let utmCampaign = data.utmCampaign || '';
    let utmMedium = data.utmMedium || '';
    let utmContent = data.utmContent || '';
    let utmTerm = data.utmTerm || '';

    // Buscar dados do lead existente se não tiver nome
    if (!leadName && (validatedData.email || validatedData.phone)) {
      try {
        const { lead } = await findLeadByEmailOrPhone(validatedData.email, validatedData.phone);
        if (lead) {
          leadName = lead.FirstName || '';
        }
      } catch (err) {
        console.error('⚠️ Erro ao buscar lead para nome:', err);
      }
    }

    // Se algum UTM está faltando, buscar na planilha principal (Página1) para completar (não sobrescreve os já preenchidos)
    const hasAnyMissingUtm = !utmSource || !utmCampaign || !utmMedium || !utmContent || !utmTerm;
    if (hasAnyMissingUtm && (validatedData.email || validatedData.phone)) {
      try {
        const utmsFromSheet = await findLeadUTMsInMainSheet(validatedData.email, validatedData.phone);
        if (utmsFromSheet && (utmsFromSheet.utmSource || utmsFromSheet.utmCampaign || utmsFromSheet.utmMedium)) {
          utmSource = utmsFromSheet.utmSource || utmSource;
          utmCampaign = utmsFromSheet.utmCampaign || utmCampaign;
          utmMedium = utmsFromSheet.utmMedium || utmMedium;
          utmContent = utmsFromSheet.utmContent || utmContent;
          utmTerm = utmsFromSheet.utmTerm || utmTerm;
        }
      } catch (err) {
        console.error('⚠️ Erro ao buscar UTMs na planilha principal:', err);
      }
    }

    // 3. Salvar na aba "Lista Vendas"
    const saleData: SaleData = {
      purchaseDate: data.purchaseDate,
      paymentDate: data.paymentDate,
      checkout: checkoutSource,
      transactionId: data.transactionId,
      plan: data.plan,
      grossValue: data.grossValue,
      netValue: data.netValue,
      paymentMethod: data.paymentMethod,
      name: leadName,
      email: validatedData.email || '',
      phone: validatedData.phone || '',
      offerName: data.offerName,
      utmSource: utmSource,
      utmCampaign: utmCampaign,
      utmMedium: utmMedium,
      utmContent: utmContent,
      utmTerm: utmTerm,
      coupon: data.coupon,
    };

    console.log('📊 [DEBUG] Dados da venda antes de salvar na planilha:', {
      grossValue: saleData.grossValue,
      netValue: saleData.netValue,
      plan: saleData.plan,
      transactionId: saleData.transactionId,
    });
    
    const salesResult = await saveSaleToSalesSheet(saleData);
    console.log(`📊 Venda salva na aba "Lista Vendas": ${salesResult.success ? '✅' : '❌'}`);

    if (!result.success) {
      return NextResponse.json({
        success: true, // Ainda retorna sucesso pois salvou na Lista Vendas
        message: 'Venda salva na Lista Vendas (lead não encontrado na automação)',
        salesSheetSaved: salesResult.success,
        source,
        event: 'sale_approved',
        note: result.message,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Venda registrada',
      checkout_source: checkoutSource,
      salesSheetSaved: salesResult.success,
      source,
      event: 'sale_approved',
    });
    
  } catch (validationError) {
    if (validationError instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        message: validationError.issues[0].message,
        details: validationError.issues,
        source,
        event: 'sale_approved',
      }, { status: 400 });
    }
    throw validationError;
  }
}
