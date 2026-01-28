import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { upsertLead } from '@/lib/leadsAutomation';

/**
 * API de Checkout - 100% Hubla
 * 
 * Todos os usuários são direcionados para Hubla
 */

export type CheckoutVariant = 'hubla' | 'cakto';
export type PlanType = 'annual' | 'monthly';

const CHECKOUT_VERSION = '100_hubla_v2';
const DATA_SHEET_NAME = 'Página1';

// URLs de checkout - Split 50/50 entre Hubla e Cakto
const CHECKOUT_URLS = {
  hubla: {
    annual: 'https://pay.hub.la/LG07vLA6urwSwXjGiTm3',
    monthly: 'https://pay.hub.la/kDORNq8Jp0xTWlsJtEB0',
  },
  cakto: {
    annual: 'https://pay.cakto.com.br/kvar8c2_742083',
    monthly: 'https://pay.cakto.com.br/bigpf3i',
  },
};

interface CheckoutSuccessResponse {
  success: true;
  checkout_variant: CheckoutVariant;
  checkout_plan: PlanType;
  checkout_url: string;
  checkout_version: string;
}

interface CheckoutErrorResponse {
  success: false;
  error: string;
  details?: string;
}

type CheckoutResponse = CheckoutSuccessResponse | CheckoutErrorResponse;

async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}


function buildCheckoutUrl(variant: CheckoutVariant, plan: PlanType, utmParams: Record<string, string>): string {
  const baseUrl = CHECKOUT_URLS[variant][plan];
  
  const params = new URLSearchParams();
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });
  
  const queryString = params.toString();
  if (!queryString) {
    return baseUrl;
  }
  
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${queryString}`;
}

export async function POST(request: NextRequest) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  
  if (!spreadsheetId) {
    return NextResponse.json(
      { success: false, error: 'Sheet ID não configurado' } as CheckoutResponse,
      { status: 500 }
    );
  }

  let sheets: any;

  try {
    const body = await request.json();
    const { plan, utmParams = {}, quizData = {} } = body;

    if (!plan || !['annual', 'monthly'].includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Plano inválido' } as CheckoutResponse,
        { status: 400 }
      );
    }

    sheets = await getGoogleSheetsClient();
    
    // ✅ 100% HUBLA - Todos usuários direcionados para Hubla
    const variant: CheckoutVariant = 'hubla';
    
    const checkoutUrl = buildCheckoutUrl(variant, plan, utmParams);
    
    console.log(`🎯 Checkout ${variant.toUpperCase()} (100% Hubla) - Plano: ${plan}`);
    
    // Preparar dados para salvar na planilha principal
    const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    
    // Mapear dados do quiz
    const trainerOptionMap: Record<string, string> = {
      'nao-treino': 'Não treino',
      'ajuda-academia': 'Treino da academia',
      'montar-proprios': 'Faço do meu jeito',
      'plano-online': 'Assino um plano online',
      'personal-online': 'Tenho personal online',
      'personal-presencial': 'Tenho personal presencial',
    };
    
    const dietHelperOptionMap: Record<string, string> = {
      'nao-faco-dieta': 'Não faço dieta',
      'montar-propria': 'Faço do meu jeito',
      'plano-online': 'Assino um plano online',
      'nutricionista-online': 'Tenho nutricionista online',
      'nutricionista-presencial': 'Tenho nutricionista presencial',
    };

    // Formatar data de nascimento e calcular idade
    let birthDate = '';
    let age = '';
    
    if (quizData.birthDate) {
      try {
        const birthDateObj = new Date(quizData.birthDate);
        birthDate = birthDateObj.toLocaleDateString('pt-BR');
        age = String(new Date().getFullYear() - birthDateObj.getFullYear());
        console.log(`📅 Data nascimento: ${birthDate}, Idade: ${age} anos`);
      } catch (error) {
        console.error('❌ Erro ao processar data de nascimento:', error);
      }
    }

    const achievements = Array.isArray(quizData.achievements) 
      ? quizData.achievements.join(', ') 
      : quizData.achievements || '';
    
    const obstacles = Array.isArray(quizData.obstacles) 
      ? quizData.obstacles.join(', ') 
      : quizData.obstacles || '';

    const trainerOption = quizData.hasTrainer 
      ? (trainerOptionMap[quizData.hasTrainer] || quizData.hasTrainer)
      : '';

    const dietHelperOption = quizData.dietHelper 
      ? (dietHelperOptionMap[quizData.dietHelper] || quizData.dietHelper)
      : '';

    // Verificar se já existe linha com este leadId para evitar duplicação
    const leadIdToCheck = quizData.leadId || '';
    let existingRowIndex = -1;
    
    if (leadIdToCheck) {
      try {
        const allRows = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'A:B', // Buscar apenas colunas A (Data/Hora) e B (Lead ID)
        });
        
        const rows = allRows.data.values || [];
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][1] === leadIdToCheck) {
            existingRowIndex = i + 1; // +1 porque a planilha começa em 1
            console.log(`📍 Linha existente encontrada no índice: ${existingRowIndex} para leadId: ${leadIdToCheck}`);
            break;
          }
        }
      } catch (error) {
        console.error('⚠️ Erro ao verificar linha existente:', error);
      }
    }

    // Linha de dados - ORDEM EXATA DO QUIZ (37 colunas: A-AK)
    const values = [[
      timestamp,                                    // A - Data/Hora
      quizData.leadId || '',                        // B - Lead ID
      quizData.gender || '',                        // C - Step 0: Gênero
      quizData.workoutsPerWeek || '',               // D - Step 1: Treinos/Semana
      quizData.triedOtherApps ? 'Sim' : 'Não',      // E - Step 2: Já Usou Apps
      quizData.name || '',                          // F - Step 4: Nome
      quizData.email || '',                         // G - Step 4: Email
      quizData.phone || '',                         // H - Step 4: Telefone
      quizData.heightCm || '',                      // I - Step 5: Altura
      quizData.weightKg || '',                      // J - Step 5: Peso
      quizData.unit || 'metric',                    // K - Step 5: Unidade
      birthDate,                                    // L - Step 6: Data Nascimento
      age,                                          // M - Step 6: Idade
      trainerOption,                                // N - Step 7: Auxílio Treinos
      dietHelperOption,                             // O - Step 8: Auxílio Dieta
      quizData.goal || '',                          // P - Step 9: Objetivo
      quizData.desiredWeightKg || '',               // Q - Step 10: Peso Desejado
      quizData.weightSpeedPerWeek || '',            // R - Step 13: Velocidade
      obstacles,                                    // S - Step 15: Obstáculos
      quizData.dietType || '',                      // T - Step 16: Tipo Dieta
      achievements,                                 // U - Step 17: Conquistas
      variant,                                      // V - Step 23: Checkout Variant
      plan,                                         // W - Step 23: Checkout Plan
      checkoutUrl,                                  // X - Step 23: Checkout URL
      CHECKOUT_VERSION,                             // Y - Step 23: Checkout Version
      quizData.referralCode || '',                  // Z - Código Referência
      quizData.heardFrom || '',                     // AA - Onde Ouviu
      quizData.addBurnedCalories ? 'Sim' : 'Não',   // AB - Add Calorias
      quizData.transferExtraCalories ? 'Sim' : 'Não', // AC - Transf. Calorias
      utmParams.utm_source || '',                   // AD - UTM Source
      utmParams.utm_medium || '',                   // AE - UTM Medium
      utmParams.utm_campaign || '',                 // AF - UTM Campaign
      utmParams.utm_term || '',                     // AG - UTM Term
      utmParams.utm_content || '',                  // AH - UTM Content
      quizData.referrer || '',                      // AI - Referrer
      quizData.landingPage || '',                   // AJ - Landing Page
      quizData.userAgent || '',                     // AK - User Agent
    ]];

    // Atualizar linha existente OU criar nova se não existir
    if (existingRowIndex > 0) {
      console.log(`🔄 Atualizando linha existente ${existingRowIndex} com dados de checkout`);
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `A${existingRowIndex}:AK${existingRowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });
      console.log('✅ Linha atualizada com sucesso (evitou duplicação)');
    } else {
      console.log('➕ Criando nova linha (leadId não encontrado ou não fornecido)');
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'A:AK',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values },
      });
      console.log('✅ Nova linha criada com sucesso');
    }

    // ✅ SINCRONIZAR COM LEADS_AUTOMACAO (para automação da Zaia)
    // Garante que quem completou o quiz também entra na aba de automação
    if (quizData.name && (quizData.email || quizData.phone)) {
      try {
        const syncResult = await upsertLead({
          lead_id: quizData.leadId || undefined,
          FirstName: quizData.name,
          email: quizData.email || '',
          phone: quizData.phone || '',
          checkout_source: variant,
        });
        console.log(`✅ Sincronizado com Leads_Automacao (${variant}):`, syncResult);
      } catch (syncError) {
        console.error('⚠️ Erro ao sincronizar com Leads_Automacao (não bloqueante):', syncError);
      }
    }

    return NextResponse.json({
      success: true,
      checkout_variant: variant,
      checkout_plan: plan,
      checkout_url: checkoutUrl,
      checkout_version: CHECKOUT_VERSION,
    } as CheckoutResponse);

  } catch (error: any) {
    console.error('❌ Erro no checkout:', error);

    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao processar checkout',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      } as CheckoutResponse,
      { status: 500 }
    );
  }
}
