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
  SaleData,
  findLeadByEmailOrPhone
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

    // Detectar origem pelos HEADERS da Hubla ou pelo body
    const isHubla = isRequestFromHubla(request);
    const isCakto = isRequestFromCakto(request, body);
    
    let source: 'hubla' | 'cakto' = isHubla ? 'hubla' : 'cakto';
    
    // Se veio explicitamente no body, usar isso
    if (body.checkout_source && ['hubla', 'cakto'].includes(body.checkout_source)) {
      source = body.checkout_source;
    }

    await ensureAutomationSheetExists();

    const { eventType, data } = detectEventType(body, source);

    // Executar ação baseada no tipo de evento
    switch (eventType) {
      case 'lead_capture':
        return handleLeadCapture(data, source);
      
      case 'sale_approved':
        return handleSaleApproved(data, source);
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Tipo de evento não reconhecido',
          detected_source: source,
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
 * GET - Retorna status e documentação do endpoint
 */
export async function GET() {
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
        cakto: leads.filter((l) => l.checkout_source === 'cakto').length,
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
          cakto: {
            lead_capture: '{ action: "capture", FirstName, email, phone, checkout_source: "cakto" }',
            sale_approved: '{ action: "sale", email, phone, checkout_source: "cakto" }',
          },
        },
      },
      cron_endpoint: '/api/leads-automation/cron',
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

/**
 * Verifica se a requisição vem do Cakto
 */
function isRequestFromCakto(request: NextRequest, body: any): boolean {
  // Headers específicos do Cakto (se houver)
  const caktoToken = request.headers.get('x-cakto-token');
  
  // Ou verificar no body se tem identificador do Cakto
  const hasCaktoIndicator = body.checkout_source === 'cakto' || 
                           body.source === 'cakto' ||
                           (body.checkout_url && body.checkout_url.includes('cakto.com.br'));
  
  return !!(caktoToken || hasCaktoIndicator);
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

function detectEventType(body: any, source: 'hubla' | 'cakto'): DetectedEventData {
  if (source === 'hubla') {
    return detectHublaEventType(body);
  }
  return detectCaktoEventType(body);
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

function detectCaktoEventType(body: any): DetectedEventData {
  const action = (body.action || '').toLowerCase();

  // Venda aprovada
  if (action === 'sale' || action === 'venda' || action === 'purchase') {
    return {
      eventType: 'sale_approved',
      data: {
        email: body.email?.trim().toLowerCase(),
        phone: normalizePhone(body.phone || body.telefone),
      },
    };
  }

  // Default: captura de lead
  return {
    eventType: 'lead_capture',
    data: {
      lead_id: body.lead_id,
      FirstName: body.FirstName || body.firstName || body.name || body.nome,
      email: body.email?.trim().toLowerCase(),
      phone: normalizePhone(body.phone || body.telefone),
    },
  };
}

function extractHublaData(body: any): DetectedEventData['data'] {
  const event = body.event || {};
  const lead = event.lead || {};
  const customer = event.customer || event.buyer || event.user || {};
  const invoice = event.invoice || {};
  const payment = event.payment || invoice.payment || {};
  const offer = event.offer || event.product || {};
  const subscription = event.subscription || {};
  const utm = event.utm || customer.utm || {};
  
  // Prioridade: lead > customer
  const source = lead.email ? lead : customer;

  // Extrair primeiro nome do fullName
  const fullName = source.fullName || source.full_name || source.name || source.nome || '';
  const firstName = fullName.split(' ')[0] || fullName;

  // Extrair valores
  const grossValue = invoice.total || invoice.amount || payment.amount || event.amount || event.total;
  const netValue = invoice.netAmount || invoice.net_amount || payment.netAmount || payment.net_amount;

  // Extrair forma de pagamento
  let paymentMethod = payment.method || payment.payment_method || invoice.paymentMethod || '';
  if (paymentMethod) {
    paymentMethod = mapPaymentMethod(paymentMethod);
  }

  // Extrair plano (anual/mensal)
  let plan = offer.name || subscription.plan || event.plan || '';
  if (!plan && grossValue) {
    // Inferir plano pelo valor (R$ 99 = anual, R$ 27,90 ou R$ 30,90 = mensal)
    if (grossValue >= 90) {
      plan = 'annual';
    } else {
      plan = 'monthly';
    }
  }

  return {
    lead_id: lead.id || source.id,
    FirstName: firstName,
    email: (source.email || '').trim().toLowerCase() || undefined,
    phone: normalizePhone(source.phone || source.telefone),
    // Dados de venda
    transactionId: invoice.id || payment.id || event.id || body.id,
    plan: plan,
    grossValue: typeof grossValue === 'number' ? grossValue : parseFloat(grossValue) || undefined,
    netValue: typeof netValue === 'number' ? netValue : parseFloat(netValue) || undefined,
    paymentMethod: paymentMethod,
    offerName: offer.name || offer.title || subscription.name || '',
    purchaseDate: event.createdAt || event.created_at || invoice.createdAt || body.createdAt,
    paymentDate: payment.paidAt || payment.paid_at || invoice.paidAt || event.paidAt,
    // UTMs
    utmSource: utm.source || utm.utm_source || '',
    utmCampaign: utm.campaign || utm.utm_campaign || '',
    utmMedium: utm.medium || utm.utm_medium || '',
    utmContent: utm.content || utm.utm_content || '',
    utmTerm: utm.term || utm.utm_term || '',
    coupon: invoice.coupon || payment.coupon || event.coupon || '',
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

// ==========================================
// HANDLERS
// ==========================================

async function handleLeadCapture(
  data: DetectedEventData['data'],
  source: 'hubla' | 'cakto'
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
  source: 'hubla' | 'cakto'
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
