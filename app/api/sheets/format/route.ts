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

    // 1. Limpar tudo e adicionar cabeçalhos
    const headers = [[
      'Data/Hora',
      'Nome',
      'Email',
      'Telefone',
      'Gênero',
      'Data Nascimento',
      'Idade',
      'Altura (cm)',
      'Peso (kg)',
      'Peso Desejado (kg)',
      'Objetivo',
      'Velocidade Semanal (kg)',
      'Tipo Dieta',
      'Treinos/Semana',
      'Tem Personal',
      'Conquistas',
      'Obstáculos',
      'Onde Ouviu',
      'Já Usou Apps',
      'Código Referência',
      'UTM Source',
      'UTM Medium',
      'UTM Campaign',
      'UTM Term',
      'UTM Content',
      'Referrer',
      'Landing Page',
      'User Agent',
      'Unidade',
      'Adicionar Calorias',
      'Transferir Calorias',
    ]];

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
      // 1. Formatar linha de cabeçalho (A1:AE1)
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 31,
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
          range: { sheetId, dimension: 'COLUMNS', startIndex: 20, endIndex: 31 }, // UTMs e tracking
          properties: { pixelSize: 150 },
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
            endColumnIndex: 31,
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
            endColumnIndex: 31,
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
              endColumnIndex: 31,
            },
          },
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

