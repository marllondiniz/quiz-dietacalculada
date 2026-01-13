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

    // Formatar data de nascimento
    const birthDate = body.birthDate 
      ? new Date(body.birthDate).toLocaleDateString('pt-BR')
      : '';

    // Calcular idade se tiver data de nascimento
    const age = birthDate && body.birthDate 
      ? new Date().getFullYear() - new Date(body.birthDate).getFullYear()
      : '';

    // Linha de dados para inserir
    const values = [[
      // Timestamp e identificação
      timestamp,                                    // A - Data/Hora
      body.name || '',                              // B - Nome
      body.email || '',                             // C - Email
      body.phone || '',                             // D - Telefone
      
      // Dados demográficos
      body.gender || '',                            // E - Gênero
      birthDate,                                    // F - Data de Nascimento
      age,                                          // G - Idade
      
      // Dados físicos
      body.heightCm || '',                          // H - Altura (cm)
      body.weightKg || '',                          // I - Peso (kg)
      body.desiredWeightKg || '',                   // J - Peso Desejado (kg)
      
      // Objetivos
      body.goal || '',                              // K - Objetivo (perder/manter/ganhar)
      body.weightSpeedPerWeek || '',                // L - Velocidade Semanal (kg)
      
      // Estilo de vida
      body.dietType || '',                          // M - Tipo de Dieta
      body.workoutsPerWeek || '',                   // N - Treinos por Semana
      trainerOption,                                 // O - Tem Personal Trainer
      dietHelperOption,                              // P - Auxílio na Dieta
      
      // Motivação e desafios
      achievements,                                  // Q - Conquistas
      obstacles,                                     // R - Obstáculos
      
      // Marketing
      body.heardFrom || '',                         // S - Onde Ouviu Falar
      body.triedOtherApps ? 'Sim' : 'Não',          // T - Já Usou Outros Apps
      body.referralCode || '',                      // U - Código de Referência
      
      // UTMs
      body.utm_source || '',                        // V - UTM Source
      body.utm_medium || '',                        // W - UTM Medium
      body.utm_campaign || '',                      // X - UTM Campaign
      body.utm_term || '',                          // Y - UTM Term
      body.utm_content || '',                       // Z - UTM Content
      
      // Tracking adicional
      body.referrer || '',                          // AA - Referrer
      body.landingPage || '',                       // AB - Landing Page
      body.userAgent || '',                         // AC - User Agent
      
      // Configurações
      body.unit || 'metric',                        // AD - Unidade (métrica/imperial)
      body.addBurnedCalories ? 'Sim' : 'Não',      // AE - Adicionar Calorias Queimadas
      body.transferExtraCalories ? 'Sim' : 'Não',  // AF - Transferir Calorias Extras
      
      // Checkout Split (NOVAS COLUNAS)
      body.checkout_variant || '',                  // AG - Checkout Variant (hubla/proprio)
      body.checkout_plan || '',                     // AH - Checkout Plan (annual/monthly)
      body.checkout_url || '',                      // AI - Checkout URL (com UTMs)
      body.split_version || '',                     // AJ - Split Version (ex: 80_20_v1)
    ]];

    // Inserir dados na planilha
    console.log('📊 Enviando dados para a planilha...');
    console.log('Sheet ID:', spreadsheetId);
    console.log('Dados a enviar:', JSON.stringify(values[0], null, 2));
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A:AJ', // Expandido para incluir checkout split (até coluna AJ)
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

