import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

/**
 * API para criar/atualizar linha progressivamente na planilha
 * Se leadId existir, atualiza a linha correspondente
 * Se não existir, cria uma nova linha
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, answers, step } = body;

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

    // Buscar todas as linhas para encontrar o leadId
    const allRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A:B', // Apenas colunas A (Data/Hora) e B (Lead ID)
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

    // Preparar timestamp
    const timestamp = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    });

    // Mapear respostas para valores da planilha (mesmo formato da API principal)
    const mapAnswerToSheetValue = (key: string, value: any): string => {
      if (value === null || value === undefined || value === '') return '';
      
      // Formatar arrays
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      
      // Formatar booleans
      if (typeof value === 'boolean') {
        return value ? 'Sim' : 'Não';
      }
      
      // Formatar datas
      if (value instanceof Date || (typeof value === 'string' && value.includes('T'))) {
        try {
          return new Date(value).toLocaleDateString('pt-BR');
        } catch {
          return String(value);
        }
      }
      
      return String(value);
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

    // Preparar valores atualizados (baseado na estrutura da planilha)
    const updates: { range: string; values: any[][] }[] = [];

    // Se a linha não existe, criar uma nova
    if (rowIndex === -1) {
      // Buscar próxima linha vazia
      const lastRow = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A:A',
      });
      rowIndex = (lastRow.data.values?.length || 1) + 1;

      // Criar linha inicial com data/hora e leadId
      updates.push({
        range: `A${rowIndex}:B${rowIndex}`,
        values: [[timestamp, leadId]],
      });
    }
    
    // Calcular idade se birthDate foi fornecido
    if (answers?.birthDate) {
      try {
        const birthDate = new Date(answers.birthDate);
        const currentYear = new Date().getFullYear();
        const birthYear = birthDate.getFullYear();
        const calculatedAge = currentYear - birthYear;
        
        // Adicionar idade calculada aos answers
        if (!answers.age) {
          answers.age = calculatedAge;
        }
        console.log(`📅 Idade calculada: ${calculatedAge} anos`);
      } catch (error) {
        console.error('⚠️ Erro ao calcular idade:', error);
      }
    }

    // Mapear campos do quiz para colunas da planilha (ORDEM EXATA DO QUIZ)
    // A = Data/Hora, B = Lead ID (já preenchidas)
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

    // Atualizar apenas os campos fornecidos
    Object.entries(answers || {}).forEach(([key, value]) => {
      const column = columnMap[key];
      if (column && value !== undefined && value !== null) {
        let sheetValue = mapAnswerToSheetValue(key, value);
        
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
      }
    });

    // Aplicar todas as atualizações
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Dados atualizados com sucesso',
      rowIndex,
      leadId,
    });

  } catch (error: any) {
    console.error('❌ Erro ao atualizar planilha:', error);
    return NextResponse.json(
      {
        error: 'Erro ao atualizar planilha',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
