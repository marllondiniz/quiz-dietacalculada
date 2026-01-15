import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

/**
 * API para salvar progresso do quiz progressivamente
 * Cria linha inicial se não existir, ou atualiza linha existente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, answers, step, trackingData } = body;

    if (!leadId) {
      return NextResponse.json(
        { error: 'leadId é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar variáveis de ambiente
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
      return NextResponse.json(
        { error: 'Configuração incompleta' },
        { status: 500 }
      );
    }

    // Configuração do Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Preparar timestamp
    const timestamp = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    });

    // Buscar todas as linhas para encontrar o leadId
    const allRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A:B', // Buscar apenas colunas A (Data/Hora) e B (Lead ID)
    });

    const rows = allRows.data.values || [];
    let rowIndex = -1;

    // Buscar linha com o leadId (coluna B, índice 1)
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === leadId) {
        rowIndex = i + 1; // +1 porque a planilha começa em 1
        break;
      }
    }

    // Se a linha não existe, criar uma nova
    if (rowIndex === -1) {
      console.log('📝 Criando nova linha para leadId:', leadId);
      // Buscar última linha
      const lastRow = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A:A',
      });
      rowIndex = (lastRow.data.values?.length || 1) + 1;
      console.log('📍 Nova linha será criada no índice:', rowIndex);

      // Criar linha inicial com Data/Hora e Lead ID
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `A${rowIndex}:B${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[timestamp, leadId]],
        },
      });
      console.log('✅ Linha inicial criada');
    } else {
      console.log('📝 Atualizando linha existente:', rowIndex);
      // Atualizar timestamp se a linha já existe
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `A${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[timestamp]],
        },
      });
    }

    // Mapear campos do quiz para colunas da planilha (ORDEM EXATA DO QUIZ)
    // A=Data/Hora, B=Lead ID
    
    const columnMap: Record<string, string> = {
      gender: 'C',      // Step 0
      workoutsPerWeek: 'D', // Step 1
      triedOtherApps: 'E', // Step 2
      name: 'F',        // Step 4
      email: 'G',       // Step 4
      phone: 'H',       // Step 4
      heightCm: 'I',    // Step 5
      weightKg: 'J',    // Step 5
      unit: 'K',        // Step 5
      birthDate: 'L',   // Step 6
      age: 'M',         // Step 6
      hasTrainer: 'N',  // Step 7
      dietHelper: 'O',  // Step 8
      goal: 'P',        // Step 9
      desiredWeightKg: 'Q', // Step 10
      weightSpeedPerWeek: 'R', // Step 13
      obstacles: 'S',   // Step 15
      dietType: 'T',    // Step 16
      achievements: 'U', // Step 17
      referralCode: 'Z', // Opcional
      heardFrom: 'AA',  // Opcional
      addBurnedCalories: 'AB', // Config
      transferExtraCalories: 'AC', // Config
      utm_source: 'AD', // Tracking
      utm_medium: 'AE', // Tracking
      utm_campaign: 'AF', // Tracking
      utm_term: 'AG',   // Tracking
      utm_content: 'AH', // Tracking
      referrer: 'AI',   // Tracking
      landingPage: 'AJ', // Tracking
      userAgent: 'AK',  // Tracking
    };

    // Mapear opções para texto legível
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

    // Preparar atualizações
    const updates: { range: string; values: any[][] }[] = [];

    // Função auxiliar para formatar valores
    const formatValue = (key: string, value: any): string => {
      if (value === null || value === undefined || value === '') return '';
      
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      
      if (typeof value === 'boolean') {
        return value ? 'Sim' : 'Não';
      }
      
      if (value instanceof Date || (typeof value === 'string' && value.includes('T'))) {
        try {
          return new Date(value).toLocaleDateString('pt-BR');
        } catch {
          return String(value);
        }
      }
      
      return String(value);
    };

    // Atualizar respostas fornecidas
    if (answers) {
      console.log('📊 Processando respostas:', Object.keys(answers).length, 'campos');
      
      // Calcular idade se birthDate foi fornecido
      let calculatedAge = '';
      if (answers.birthDate) {
        try {
          const birthDate = new Date(answers.birthDate);
          const currentYear = new Date().getFullYear();
          const birthYear = birthDate.getFullYear();
          calculatedAge = String(currentYear - birthYear);
          console.log(`📅 Idade calculada: ${calculatedAge} anos (nascido em ${birthYear})`);
        } catch (error) {
          console.error('⚠️ Erro ao calcular idade:', error);
        }
      }
      
      Object.entries(answers).forEach(([key, value]) => {
        const column = columnMap[key];
        if (column && value !== undefined && value !== null && value !== '') {
          let sheetValue = formatValue(key, value);
          
          // Aplicar mapeamentos especiais
          if (key === 'hasTrainer' && trainerOptionMap[value as string]) {
            sheetValue = trainerOptionMap[value as string];
          }
          if (key === 'dietHelper' && dietHelperOptionMap[value as string]) {
            sheetValue = dietHelperOptionMap[value as string];
          }

          updates.push({
            range: `${column}${rowIndex}`,
            values: [[sheetValue]],
          });
        } else if (!column) {
          console.log(`⚠️ Campo ${key} não tem mapeamento de coluna`);
        }
      });
      
      // Adicionar idade calculada se disponível
      if (calculatedAge && columnMap.age) {
        updates.push({
          range: `${columnMap.age}${rowIndex}`,
          values: [[calculatedAge]],
        });
        console.log(`✅ Idade adicionada: ${calculatedAge} anos`);
      }
      
      console.log(`📝 ${updates.length} atualizações preparadas das respostas`);
    } else {
      console.log('⚠️ Nenhuma resposta fornecida');
    }

    // Atualizar dados de tracking se fornecidos
    if (trackingData) {
      if (trackingData.utm_source && columnMap.utm_source) {
        updates.push({
          range: `${columnMap.utm_source}${rowIndex}`,
          values: [[trackingData.utm_source]],
        });
      }
      if (trackingData.utm_medium && columnMap.utm_medium) {
        updates.push({
          range: `${columnMap.utm_medium}${rowIndex}`,
          values: [[trackingData.utm_medium]],
        });
      }
      if (trackingData.utm_campaign && columnMap.utm_campaign) {
        updates.push({
          range: `${columnMap.utm_campaign}${rowIndex}`,
          values: [[trackingData.utm_campaign]],
        });
      }
      if (trackingData.utm_term && columnMap.utm_term) {
        updates.push({
          range: `${columnMap.utm_term}${rowIndex}`,
          values: [[trackingData.utm_term]],
        });
      }
      if (trackingData.utm_content && columnMap.utm_content) {
        updates.push({
          range: `${columnMap.utm_content}${rowIndex}`,
          values: [[trackingData.utm_content]],
        });
      }
      if (trackingData.referrer && columnMap.referrer) {
        updates.push({
          range: `${columnMap.referrer}${rowIndex}`,
          values: [[trackingData.referrer]],
        });
      }
      if (trackingData.landingPage && columnMap.landingPage) {
        updates.push({
          range: `${columnMap.landingPage}${rowIndex}`,
          values: [[trackingData.landingPage]],
        });
      }
      if (trackingData.userAgent && columnMap.userAgent) {
        updates.push({
          range: `${columnMap.userAgent}${rowIndex}`,
          values: [[trackingData.userAgent]],
        });
      }
    }

    // Aplicar todas as atualizações
    if (updates.length > 0) {
      console.log(`📝 Aplicando ${updates.length} atualizações na linha ${rowIndex}`);
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates,
        },
      });
      console.log('✅ Atualizações aplicadas com sucesso');
    } else {
      console.log('⚠️ Nenhuma atualização para aplicar');
    }

    return NextResponse.json({
      success: true,
      message: 'Progresso salvo com sucesso',
      rowIndex,
      leadId,
      step,
      updatesCount: updates.length,
    });

  } catch (error: any) {
    console.error('❌ Erro ao salvar progresso:', error);
    return NextResponse.json(
      {
        error: 'Erro ao salvar progresso',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
