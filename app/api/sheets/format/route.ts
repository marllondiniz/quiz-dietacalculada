import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    // Configuração do Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json({ error: 'Sheet ID não configurado' }, { status: 500 });
    }

    console.log('🎨 Formatando planilha...');

    // 1. Limpar tudo e adicionar cabeçalhos (37 colunas: A-AK)
    // ORDEM EXATA DAS PERGUNTAS DO QUIZ
    const headers = [[
      'Data/Hora',              // A - Timestamp
      'Lead ID',                // B - Identificador único
      'Gênero',                 // C - Step 0
      'Treinos/Semana',         // D - Step 1
      'Já Usou Apps',           // E - Step 2
      'Nome',                   // F - Step 4
      'Email',                  // G - Step 4
      'Telefone',               // H - Step 4
      'Altura (cm)',            // I - Step 5
      'Peso (kg)',              // J - Step 5
      'Unidade',                // K - Step 5 (metric/imperial)
      'Data Nascimento',        // L - Step 6
      'Idade',                  // M - Step 6 (calculado)
      'Auxílio Treinos',        // N - Step 7
      'Auxílio Dieta',          // O - Step 8
      'Objetivo',               // P - Step 9
      'Peso Desejado (kg)',     // Q - Step 10
      'Velocidade (kg/sem)',    // R - Step 13
      'Obstáculos',             // S - Step 15
      'Tipo Dieta',             // T - Step 16
      'Conquistas',             // U - Step 17
      'Checkout Variant',       // V - Step 23 (hubla/proprio)
      'Checkout Plan',          // W - Step 23 (annual/monthly)
      'Checkout URL',           // X - Step 23
      'Split Version',          // Y - Step 23
      'Código Referência',      // Z - Opcional
      'Onde Ouviu',             // AA - Opcional
      'Add Calorias',           // AB - Configuração
      'Transf. Calorias',       // AC - Configuração
      'UTM Source',             // AD - Tracking
      'UTM Medium',             // AE - Tracking
      'UTM Campaign',           // AF - Tracking
      'UTM Term',               // AG - Tracking
      'UTM Content',            // AH - Tracking
      'Referrer',               // AI - Tracking
      'Landing Page',           // AJ - Tracking
      'User Agent',             // AK - Tracking
    ]];
    
    const totalColumns = 37; // A até AK

    // Obter o Sheet ID da primeira aba
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetId = spreadsheet.data.sheets?.[0]?.properties?.sheetId || 0;

    // Primeiro, limpar a linha 1 e inserir cabeçalhos
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: '1:1',
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: headers,
      },
    });

    // Depois, formatar tudo perfeitamente
    const requests = [
      // 1. Formatar linha de cabeçalho (A1:AJ1)
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: totalColumns,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.13, green: 0.13, blue: 0.13 }, // Cinza escuro
              textFormat: {
                foregroundColor: { red: 1, green: 1, blue: 1 }, // Branco
                fontSize: 11,
                bold: true,
              },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE',
              wrapStrategy: 'WRAP',
            },
          },
          fields: 'userEnteredFormat',
        },
      },
      
      // 2. Ajustar altura da linha de cabeçalho
      {
        updateDimensionProperties: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: 0,
            endIndex: 1,
          },
          properties: {
            pixelSize: 50,
          },
          fields: 'pixelSize',
        },
      },

      // 3. Congelar linha de cabeçalho
      {
        updateSheetProperties: {
          properties: {
            sheetId,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          fields: 'gridProperties.frozenRowCount',
        },
      },

      // 4. Ajustar larguras das colunas (ORDEM EXATA DO QUIZ)
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, // A: Data/Hora
          properties: { pixelSize: 150 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 }, // B: Lead ID
          properties: { pixelSize: 280 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 }, // C: Gênero
          properties: { pixelSize: 110 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 3, endIndex: 5 }, // D-E: Treinos, Já Usou Apps
          properties: { pixelSize: 130 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 5, endIndex: 6 }, // F: Nome
          properties: { pixelSize: 180 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 6, endIndex: 7 }, // G: Email
          properties: { pixelSize: 220 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 7, endIndex: 8 }, // H: Telefone
          properties: { pixelSize: 140 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 8, endIndex: 21 }, // I-U: Dados do quiz (Altura até Conquistas)
          properties: { pixelSize: 130 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 21, endIndex: 23 }, // V-W: Checkout Variant e Plan
          properties: { pixelSize: 130 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 23, endIndex: 24 }, // X: Checkout URL
          properties: { pixelSize: 350 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 24, endIndex: 25 }, // Y: Split Version
          properties: { pixelSize: 150 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 25, endIndex: 29 }, // Z-AC: Código Ref, Onde Ouviu, Config
          properties: { pixelSize: 120 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 29, endIndex: totalColumns }, // AD-AK: UTMs e Tracking
          properties: { pixelSize: 140 },
          fields: 'pixelSize',
        },
      },

      // 5. Formatar células de dados com linhas alternadas (zebrado)
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: totalColumns,
          },
          cell: {
            userEnteredFormat: {
              verticalAlignment: 'MIDDLE',
              wrapStrategy: 'CLIP',
            },
          },
          fields: 'userEnteredFormat(verticalAlignment,wrapStrategy)',
        },
      },

      // 6. Adicionar bordas ao cabeçalho
      {
        updateBorders: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: totalColumns,
          },
          bottom: {
            style: 'SOLID',
            width: 2,
            color: { red: 0, green: 0, blue: 0 },
          },
        },
      },

      // 7. Habilitar filtros
      {
        setBasicFilter: {
          filter: {
            range: {
              sheetId,
              startRowIndex: 0,
              startColumnIndex: 0,
              endColumnIndex: totalColumns,
            },
          },
        },
      },
      
      // 8. Destacar colunas de checkout com cor diferente (V-Y)
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 21, // V: Checkout Variant
            endColumnIndex: 25, // Y: Split Version
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.0, green: 0.5, blue: 0.3 }, // Verde escuro
              textFormat: {
                foregroundColor: { red: 1, green: 1, blue: 1 }, // Branco
                fontSize: 11,
                bold: true,
              },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE',
              wrapStrategy: 'WRAP',
            },
          },
          fields: 'userEnteredFormat',
        },
      },
    ];

    // Aplicar todas as formatações
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests,
      },
    });

    console.log('✅ Planilha formatada com sucesso!');

    return NextResponse.json(
      { success: true, message: 'Planilha formatada com sucesso!' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Erro ao formatar planilha:', error);
    return NextResponse.json(
      {
        error: 'Erro ao formatar planilha',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

