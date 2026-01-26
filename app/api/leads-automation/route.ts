import { NextRequest, NextResponse } from 'next/server';
import { 
  upsertLead, 
  markLeadAsPurchased, 
  getAllLeads,
  ensureAutomationSheetExists,
  AUTOMATION_SHEET_NAME,
  AUTOMATION_HEADERS,
  CheckoutSource 
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
  
  // Prioridade: lead > customer
  const source = lead.email ? lead : customer;

  // Extrair primeiro nome do fullName
  const fullName = source.fullName || source.full_name || source.name || source.nome || '';
  const firstName = fullName.split(' ')[0] || fullName;

  return {
    lead_id: lead.id || source.id,
    FirstName: firstName,
    email: (source.email || '').trim().toLowerCase() || undefined,
    phone: normalizePhone(source.phone || source.telefone),
  };
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
    const result = await markLeadAsPurchased(
      validatedData.email, 
      validatedData.phone, 
      checkoutSource
    );

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.message,
        source,
        event: 'sale_approved',
        note: 'Lead não encontrado na aba de automação',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Venda registrada',
      checkout_source: checkoutSource,
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
