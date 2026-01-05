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

    // Batch de requisições para formatar tudo de uma vez
    const requests = [
      // 1. Adicionar cabeçalhos na linha 1
      {
        updateCells: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: headers[0].length,
          },
          rows: [
            {
              values: headers[0].map(header => ({
                userEnteredValue: { stringValue: header },
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 11,
                    bold: true,
                  },
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE',
                },
              })),
            },
          ],
          fields: 'userEnteredValue,userEnteredFormat',
        },
      },
      // 2. Congelar linha de cabeçalho
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
      // 3. Ajustar altura da linha de cabeçalho
      {
        updateDimensionProperties: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: 0,
            endIndex: 1,
          },
          properties: {
            pixelSize: 40,
          },
          fields: 'pixelSize',
        },
      },
      // 4. Ajustar largura das colunas principais
      {
        updateDimensionProperties: {
          range: {
            sheetId,
            dimension: 'COLUMNS',
            startIndex: 0, // Data/Hora
            endIndex: 1,
          },
          properties: {
            pixelSize: 140,
          },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: {
            sheetId,
            dimension: 'COLUMNS',
            startIndex: 1, // Nome
            endIndex: 2,
          },
          properties: {
            pixelSize: 150,
          },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: {
            sheetId,
            dimension: 'COLUMNS',
            startIndex: 2, // Email
            endIndex: 3,
          },
          properties: {
            pixelSize: 200,
          },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: {
            sheetId,
            dimension: 'COLUMNS',
            startIndex: 3, // Telefone
            endIndex: 4,
          },
          properties: {
            pixelSize: 130,
          },
          fields: 'pixelSize',
        },
      },
      // 5. Adicionar filtros
      {
        setBasicFilter: {
          filter: {
            range: {
              sheetId,
              startRowIndex: 0,
              startColumnIndex: 0,
              endColumnIndex: headers[0].length,
            },
          },
        },
      },
      // 6. Formatar células de dados (zebrado)
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [
              {
                sheetId,
                startRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: headers[0].length,
              },
            ],
            booleanRule: {
              condition: {
                type: 'CUSTOM_FORMULA',
                values: [{ userEnteredValue: '=MOD(ROW(),2)=0' }],
              },
              format: {
                backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
              },
            },
          },
          index: 0,
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

