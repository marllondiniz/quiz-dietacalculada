import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

/**
 * API de Checkout Split Controlado Globalmente
 * 
 * Estratégia: Contador global no Google Sheets
 * - Exatamente 2 em cada 10 vão para "proprio"
 * - 8 em cada 10 vão para "hubla"
 * - Slots fixos: posições 3 e 7 (0-indexed: 2 e 6) são "proprio"
 */

export type CheckoutVariant = 'hubla' | 'proprio';
export type PlanType = 'annual' | 'monthly';

const SPLIT_VERSION = '80_20_controlado_v1';
const CONFIG_SHEET_NAME = 'Config';
const DATA_SHEET_NAME = 'Página1';

// Slots fixos para "proprio" (0-indexed): posições 3 e 7 no ciclo de 10
const PROPRIO_SLOTS = [2, 6]; // 0-indexed: slots 3 e 7
const CYCLE_SIZE = 10;

// URLs de checkout
const CHECKOUT_URLS = {
  hubla: {
    annual: 'https://pay.hub.la/9uz9SIpLP3pZ0f12ydsD',
    monthly: 'https://pay.hub.la/QnE0thkRCtKbXLmS5yPy',
  },
  proprio: {
    annual: 'https://checkout.dietacalculada.com?plan=annual',
    monthly: 'https://checkout.dietacalculada.com?plan=monthly',
  },
};

interface CycleState {
  cycle_index: number;      // 0-9: posição atual no ciclo
  locked: boolean;          // Se está sendo processado
  last_update: string;      // Timestamp da última atualização
}

interface CheckoutSuccessResponse {
  success: true;
  checkout_variant: CheckoutVariant;
  checkout_plan: PlanType;
  checkout_url: string;
  split_version: string;
  cycle_info?: {
    cycle_index: number;
    is_proprio_slot: boolean;
  };
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

async function ensureConfigSheet(sheets: any, spreadsheetId: string): Promise<void> {
  try {
    // Verificar se a aba Config existe
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const configSheet = spreadsheet.data.sheets?.find(
      (s: any) => s.properties?.title === CONFIG_SHEET_NAME
    );

    if (!configSheet) {
      console.log('📋 Criando aba Config...');
      
      // Criar a aba Config
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: CONFIG_SHEET_NAME,
              },
            },
          }],
        },
      });

      // Inicializar com valores padrão
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${CONFIG_SHEET_NAME}!A1:B4`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            ['cycle_index', '0'],
            ['locked', 'FALSE'],
            ['last_update', new Date().toISOString()],
            ['split_version', SPLIT_VERSION],
          ],
        },
      });

      console.log('✅ Aba Config criada e inicializada');
    }
  } catch (error) {
    console.error('Erro ao verificar/criar aba Config:', error);
    throw error;
  }
}

async function getCycleState(sheets: any, spreadsheetId: string): Promise<CycleState> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${CONFIG_SHEET_NAME}!A1:B4`,
  });

  const rows = response.data.values || [];
  const state: CycleState = {
    cycle_index: 0,
    locked: false,
    last_update: new Date().toISOString(),
  };

  rows.forEach((row: string[]) => {
    if (row[0] === 'cycle_index') state.cycle_index = parseInt(row[1]) || 0;
    if (row[0] === 'locked') state.locked = row[1] === 'TRUE';
    if (row[0] === 'last_update') state.last_update = row[1];
  });

  return state;
}

async function acquireLock(sheets: any, spreadsheetId: string, maxRetries = 5): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    const state = await getCycleState(sheets, spreadsheetId);
    
    // Verificar se o lock está "preso" (mais de 30 segundos)
    const lastUpdate = new Date(state.last_update).getTime();
    const now = Date.now();
    const lockStale = (now - lastUpdate) > 30000; // 30 segundos
    
    if (!state.locked || lockStale) {
      // Tentar adquirir o lock
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${CONFIG_SHEET_NAME}!B2:B3`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            ['TRUE'],
            [new Date().toISOString()],
          ],
        },
      });
      
      // Verificar se conseguimos o lock (double-check)
      await new Promise(resolve => setTimeout(resolve, 100));
      const checkState = await getCycleState(sheets, spreadsheetId);
      
      if (checkState.locked) {
        console.log('🔒 Lock adquirido');
        return true;
      }
    }
    
    // Esperar antes de tentar novamente
    console.log(`⏳ Lock ocupado, tentativa ${i + 1}/${maxRetries}...`);
    await new Promise(resolve => setTimeout(resolve, 200 * (i + 1)));
  }
  
  return false;
}

async function releaseLock(sheets: any, spreadsheetId: string): Promise<void> {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${CONFIG_SHEET_NAME}!B2:B3`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        ['FALSE'],
        [new Date().toISOString()],
      ],
    },
  });
  console.log('🔓 Lock liberado');
}

async function updateCycleIndex(sheets: any, spreadsheetId: string, newIndex: number): Promise<void> {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${CONFIG_SHEET_NAME}!B1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[newIndex.toString()]],
    },
  });
}

function determineVariant(cycleIndex: number): CheckoutVariant {
  // Slots fixos para "proprio": posições 2 e 6 (0-indexed)
  // Isso garante EXATAMENTE 2 em cada 10
  if (PROPRIO_SLOTS.includes(cycleIndex)) {
    return 'proprio';
  }
  return 'hubla';
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

  let lockAcquired = false;
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
    
    // Garantir que a aba Config existe
    await ensureConfigSheet(sheets, spreadsheetId);
    
    // Adquirir lock para evitar condição de corrida
    lockAcquired = await acquireLock(sheets, spreadsheetId);
    
    if (!lockAcquired) {
      console.error('❌ Não foi possível adquirir lock após várias tentativas');
      // Em caso de falha no lock, usar fallback aleatório
      const fallbackVariant: CheckoutVariant = Math.random() < 0.8 ? 'hubla' : 'proprio';
      const fallbackUrl = buildCheckoutUrl(fallbackVariant, plan, utmParams);
      
      return NextResponse.json({
        success: true,
        checkout_variant: fallbackVariant,
        checkout_plan: plan,
        checkout_url: fallbackUrl,
        split_version: SPLIT_VERSION + '_fallback',
      } as CheckoutResponse);
    }

    // Ler estado atual do ciclo
    const state = await getCycleState(sheets, spreadsheetId);
    const currentIndex = state.cycle_index;
    
    // Determinar variante baseada no slot atual
    const variant = determineVariant(currentIndex);
    const checkoutUrl = buildCheckoutUrl(variant, plan, utmParams);
    
    console.log(`🎯 Ciclo ${currentIndex}/${CYCLE_SIZE} => ${variant} (slots proprio: ${PROPRIO_SLOTS.join(', ')})`);
    
    // Incrementar o índice do ciclo (0-9, depois volta para 0)
    const nextIndex = (currentIndex + 1) % CYCLE_SIZE;
    await updateCycleIndex(sheets, spreadsheetId, nextIndex);
    
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

    const birthDate = quizData.birthDate 
      ? new Date(quizData.birthDate).toLocaleDateString('pt-BR')
      : '';
    
    const age = birthDate && quizData.birthDate 
      ? new Date().getFullYear() - new Date(quizData.birthDate).getFullYear()
      : '';

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

    // Linha de dados para inserir (36 colunas: A-AJ)
    const values = [[
      timestamp,                                    // A - Data/Hora
      quizData.name || '',                          // B - Nome
      quizData.email || '',                         // C - Email
      quizData.phone || '',                         // D - Telefone
      quizData.gender || '',                        // E - Gênero
      birthDate,                                    // F - Data de Nascimento
      age,                                          // G - Idade
      quizData.heightCm || '',                      // H - Altura (cm)
      quizData.weightKg || '',                      // I - Peso (kg)
      quizData.desiredWeightKg || '',               // J - Peso Desejado (kg)
      quizData.goal || '',                          // K - Objetivo
      quizData.weightSpeedPerWeek || '',            // L - Velocidade Semanal
      quizData.dietType || '',                      // M - Tipo de Dieta
      quizData.workoutsPerWeek || '',               // N - Treinos por Semana
      trainerOption,                                // O - Auxílio em Treinos
      dietHelperOption,                             // P - Auxílio na Dieta
      achievements,                                 // Q - Conquistas
      obstacles,                                    // R - Obstáculos
      quizData.heardFrom || '',                     // S - Onde Ouviu
      quizData.triedOtherApps ? 'Sim' : 'Não',      // T - Já Usou Apps
      quizData.referralCode || '',                  // U - Código Referência
      utmParams.utm_source || '',                   // V - UTM Source
      utmParams.utm_medium || '',                   // W - UTM Medium
      utmParams.utm_campaign || '',                 // X - UTM Campaign
      utmParams.utm_term || '',                     // Y - UTM Term
      utmParams.utm_content || '',                  // Z - UTM Content
      quizData.referrer || '',                      // AA - Referrer
      quizData.landingPage || '',                   // AB - Landing Page
      quizData.userAgent || '',                     // AC - User Agent
      quizData.unit || 'metric',                    // AD - Unidade
      quizData.addBurnedCalories ? 'Sim' : 'Não',   // AE - Add Calorias
      quizData.transferExtraCalories ? 'Sim' : 'Não', // AF - Transf. Calorias
      variant,                                      // AG - Checkout Variant
      plan,                                         // AH - Checkout Plan
      checkoutUrl,                                  // AI - Checkout URL
      SPLIT_VERSION,                                // AJ - Split Version
    ]];

    // Salvar dados na planilha principal
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${DATA_SHEET_NAME}!A:AJ`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });

    console.log('✅ Dados salvos com sucesso');

    // Liberar lock
    await releaseLock(sheets, spreadsheetId);
    lockAcquired = false;

    return NextResponse.json({
      success: true,
      checkout_variant: variant,
      checkout_plan: plan,
      checkout_url: checkoutUrl,
      split_version: SPLIT_VERSION,
      cycle_info: {
        cycle_index: currentIndex,
        is_proprio_slot: PROPRIO_SLOTS.includes(currentIndex),
      },
    } as CheckoutResponse);

  } catch (error: any) {
    console.error('❌ Erro no checkout split:', error);
    
    // Garantir que o lock seja liberado em caso de erro
    if (lockAcquired && sheets) {
      try {
        await releaseLock(sheets, spreadsheetId);
      } catch (e) {
        console.error('Erro ao liberar lock:', e);
      }
    }

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
