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

    // 1. Limpar tudo e adicionar cabeçalhos (36 colunas: A-AJ)
    const headers = [[
      'Data/Hora',              // A
      'Nome',                   // B
      'Email',                  // C
      'Telefone',               // D
      'Gênero',                 // E
      'Data Nascimento',        // F
      'Idade',                  // G
      'Altura (cm)',            // H
      'Peso (kg)',              // I
      'Peso Desejado (kg)',     // J
      'Objetivo',               // K
      'Velocidade (kg/sem)',    // L
      'Tipo Dieta',             // M
      'Treinos/Semana',         // N
      'Auxílio Treinos',        // O
      'Auxílio Dieta',          // P
      'Conquistas',             // Q
      'Obstáculos',             // R
      'Onde Ouviu',             // S
      'Já Usou Apps',           // T
      'Código Referência',      // U
      'UTM Source',             // V
      'UTM Medium',             // W
      'UTM Campaign',           // X
      'UTM Term',               // Y
      'UTM Content',            // Z
      'Referrer',               // AA
      'Landing Page',           // AB
      'User Agent',             // AC
      'Unidade',                // AD
      'Add Calorias',           // AE
      'Transf. Calorias',       // AF
      'Checkout Variant',       // AG - NOVO
      'Checkout Plan',          // AH - NOVO
      'Checkout URL',           // AI - NOVO
      'Split Version',          // AJ - NOVO
    ]];
    
    const totalColumns = 36; // A até AJ

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

      // 4. Ajustar larguras das colunas principais
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, // Data/Hora
          properties: { pixelSize: 150 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 }, // Nome
          properties: { pixelSize: 180 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 }, // Email
          properties: { pixelSize: 220 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 3, endIndex: 4 }, // Telefone
          properties: { pixelSize: 140 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 4, endIndex: 20 }, // Colunas de dados
          properties: { pixelSize: 120 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 20, endIndex: 32 }, // UTMs e tracking (V-AF)
          properties: { pixelSize: 130 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 32, endIndex: 34 }, // Checkout Variant e Plan (AG-AH)
          properties: { pixelSize: 120 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 34, endIndex: 35 }, // Checkout URL (AI)
          properties: { pixelSize: 300 },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 35, endIndex: totalColumns }, // Split Version (AJ)
          properties: { pixelSize: 100 },
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
      
      // 8. Destacar colunas de checkout com cor diferente
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 32, // AG
            endColumnIndex: totalColumns, // AJ
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

