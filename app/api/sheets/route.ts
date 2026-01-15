import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body || typeof body !== 'object') {
      console.error('❌ Dados inválidos recebidos');
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Verificar variáveis de ambiente
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    console.log('🔍 Verificando variáveis de ambiente...');
    console.log('Email configurado:', serviceAccountEmail ? '✅ Sim' : '❌ Não');
    console.log('Private Key configurada:', privateKey ? '✅ Sim' : '❌ Não');
    console.log('Sheet ID configurado:', spreadsheetId ? '✅ Sim' : '❌ Não');

    if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
      console.error('❌ Variáveis de ambiente não configuradas corretamente');
      return NextResponse.json(
        { 
          error: 'Configuração incompleta',
          details: {
            hasEmail: !!serviceAccountEmail,
            hasKey: !!privateKey,
            hasSheetId: !!spreadsheetId,
          }
        },
        { status: 500 }
      );
    }

    // Configuração do Google Sheets
    console.log('🔐 Configurando autenticação Google...');
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Autenticação configurada');

    // Preparar dados para inserção
    const timestamp = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    });

    // Formatar arrays como strings
    const achievements = Array.isArray(body.achievements) 
      ? body.achievements.join(', ') 
      : body.achievements || '';
    
    const obstacles = Array.isArray(body.obstacles) 
      ? body.obstacles.join(', ') 
      : body.obstacles || '';

    // Mapear opção de treinador para texto legível
    const trainerOptionMap: Record<string, string> = {
      'nao-treino': 'Não treino',
      'ajuda-academia': 'Treino da academia',
      'montar-proprios': 'Faço do meu jeito',
      'plano-online': 'Assino um plano online',
      'personal-online': 'Tenho personal online',
      'personal-presencial': 'Tenho personal presencial',
    };
    const trainerOption = body.hasTrainer 
      ? (trainerOptionMap[body.hasTrainer] || body.hasTrainer)
      : '';

    // Mapear opção de auxílio na dieta para texto legível
    const dietHelperOptionMap: Record<string, string> = {
      'nao-faco-dieta': 'Não faço dieta',
      'montar-propria': 'Faço do meu jeito',
      'plano-online': 'Assino um plano online',
      'nutricionista-online': 'Tenho nutricionista online',
      'nutricionista-presencial': 'Tenho nutricionista presencial',
    };
    const dietHelperOption = body.dietHelper 
      ? (dietHelperOptionMap[body.dietHelper] || body.dietHelper)
      : '';

    // Formatar data de nascimento e calcular idade
    let birthDate = '';
    let age = '';
    
    if (body.birthDate) {
      try {
        const birthDateObj = new Date(body.birthDate);
        birthDate = birthDateObj.toLocaleDateString('pt-BR');
        age = String(new Date().getFullYear() - birthDateObj.getFullYear());
        console.log(`📅 Data nascimento: ${birthDate}, Idade: ${age} anos`);
      } catch (error) {
        console.error('❌ Erro ao processar data de nascimento:', error);
      }
    }

    // Linha de dados - ORDEM EXATA DO QUIZ
    const values = [[
      timestamp,                                    // A - Data/Hora
      body.leadId || '',                            // B - Lead ID
      body.gender || '',                            // C - Step 0: Gênero
      body.workoutsPerWeek || '',                   // D - Step 1: Treinos/Semana
      body.triedOtherApps ? 'Sim' : 'Não',          // E - Step 2: Já Usou Apps
      body.name || '',                              // F - Step 4: Nome
      body.email || '',                             // G - Step 4: Email
      body.phone || '',                             // H - Step 4: Telefone
      body.heightCm || '',                          // I - Step 5: Altura
      body.weightKg || '',                          // J - Step 5: Peso
      body.unit || 'metric',                        // K - Step 5: Unidade
      birthDate,                                    // L - Step 6: Data Nascimento
      age,                                          // M - Step 6: Idade
      trainerOption,                                // N - Step 7: Auxílio Treinos
      dietHelperOption,                             // O - Step 8: Auxílio Dieta
      body.goal || '',                              // P - Step 9: Objetivo
      body.desiredWeightKg || '',                   // Q - Step 10: Peso Desejado
      body.weightSpeedPerWeek || '',                // R - Step 13: Velocidade
      obstacles,                                    // S - Step 15: Obstáculos
      body.dietType || '',                          // T - Step 16: Tipo Dieta
      achievements,                                 // U - Step 17: Conquistas
      body.checkout_variant || '',                  // V - Step 23: Checkout Variant
      body.checkout_plan || '',                     // W - Step 23: Checkout Plan
      body.checkout_url || '',                      // X - Step 23: Checkout URL
      body.split_version || '',                     // Y - Step 23: Split Version
      body.referralCode || '',                      // Z - Código Referência
      body.heardFrom || '',                         // AA - Onde Ouviu
      body.addBurnedCalories ? 'Sim' : 'Não',      // AB - Add Calorias
      body.transferExtraCalories ? 'Sim' : 'Não',  // AC - Transf. Calorias
      body.utm_source || '',                        // AD - UTM Source
      body.utm_medium || '',                        // AE - UTM Medium
      body.utm_campaign || '',                      // AF - UTM Campaign
      body.utm_term || '',                          // AG - UTM Term
      body.utm_content || '',                       // AH - UTM Content
      body.referrer || '',                          // AI - Referrer
      body.landingPage || '',                       // AJ - Landing Page
      body.userAgent || '',                         // AK - User Agent
    ]];

    // Inserir dados na planilha
    console.log('📊 Enviando dados para a planilha...');
    console.log('Sheet ID:', spreadsheetId);
    console.log('Dados a enviar:', JSON.stringify(values[0], null, 2));
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A:AK', // Expandido para incluir Lead ID e checkout split (até coluna AK)
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values,
      },
    });

    console.log('✅ Dados enviados com sucesso!');
    console.log('Resposta:', response.data);

    return NextResponse.json(
      { success: true, message: 'Dados enviados com sucesso!' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Erro ao enviar dados para Google Sheets:');
    console.error('Tipo do erro:', error.constructor.name);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    
    // Mensagens de erro mais específicas
    let errorMessage = 'Erro ao enviar dados';
    if (error.message?.includes('PERMISSION_DENIED')) {
      errorMessage = 'Permissão negada. Verifique se a planilha foi compartilhada com a service account.';
    } else if (error.message?.includes('NOT_FOUND')) {
      errorMessage = 'Planilha não encontrada. Verifique o ID da planilha.';
    } else if (error.message?.includes('UNAUTHENTICATED')) {
      errorMessage = 'Erro de autenticação. Verifique as credenciais.';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code,
        } : undefined 
      },
      { status: 500 }
    );
  }
}

