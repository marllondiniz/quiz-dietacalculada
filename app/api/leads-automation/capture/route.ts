import { NextRequest, NextResponse } from 'next/server';
import { upsertLead } from '@/lib/leadsAutomation';

// Força execução dinâmica (não gerar página estática)
export const dynamic = 'force-dynamic';

/**
 * Endpoint de captura inicial do lead (quiz)
 * 
 * Recebe FirstName, email, phone e lead_id (quando existir).
 * Registra ou atualiza o lead exclusivamente na nova aba Leads_Automacao.
 * Se o lead já existir (match por email prioritário ou phone), apenas atualiza dados faltantes.
 * 
 * POST /api/leads-automation/capture
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { FirstName, email, phone, lead_id } = body;

    // Validação: pelo menos email ou phone é obrigatório
    if (!email && !phone) {
      return NextResponse.json(
        { 
          error: 'Dados insuficientes',
          message: 'É necessário fornecer pelo menos email ou phone' 
        },
        { status: 400 }
      );
    }

    // Validação: FirstName é obrigatório
    if (!FirstName || typeof FirstName !== 'string' || FirstName.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Dados insuficientes',
          message: 'FirstName é obrigatório' 
        },
        { status: 400 }
      );
    }

    console.log('📥 Capturando lead:', { FirstName, email, phone, lead_id });

    // Criar ou atualizar lead na aba Leads_Automacao
    const result = await upsertLead({
      lead_id,
      FirstName: FirstName.trim(),
      email: email?.trim().toLowerCase() || '',
      phone: phone?.trim() || '',
    });

    console.log('✅ Lead capturado:', result);

    return NextResponse.json({
      success: true,
      message: result.isNew ? 'Lead criado com sucesso' : 'Lead atualizado com sucesso',
      lead_id: result.lead_id,
      isNew: result.isNew,
    });

  } catch (error: any) {
    console.error('❌ Erro ao capturar lead:', error);

    return NextResponse.json(
      {
        error: 'Erro ao capturar lead',
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
    endpoint: 'leads-automation/capture',
    description: 'Endpoint de captura inicial do lead do quiz',
  });
}
