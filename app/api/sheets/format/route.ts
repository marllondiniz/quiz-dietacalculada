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

    // Primeiro, inserir apenas os cabeçalhos
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1:AE1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: headers,
      },
    });

    // Depois, formatar em lote
    const requests = [
      // 1. Formatar cabeçalhos
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
              textFormat: {
                foregroundColor: { red: 1, green: 1, blue: 1 },
                fontSize: 11,
                bold: true,
              },
              horizontalAlignment: 'CENTER',
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
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

