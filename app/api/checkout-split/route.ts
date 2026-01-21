import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { upsertLead } from '@/lib/leadsAutomation';

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
      SPLIT_VERSION,                                // Y - Step 23: Split Version
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
          checkout_source: variant === 'hubla' ? 'hubla' : 'proprio',
        });
        console.log('✅ Sincronizado com Leads_Automacao:', syncResult);
      } catch (syncError) {
        console.error('⚠️ Erro ao sincronizar com Leads_Automacao (não bloqueante):', syncError);
      }
    }

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
