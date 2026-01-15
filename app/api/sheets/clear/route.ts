import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
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

    console.log('🧹 Limpando dados antigos...');

    // Limpar todas as linhas exceto o cabeçalho (até coluna AK)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'A2:AK1000',
    });

    console.log('✅ Dados limpos com sucesso!');

    return NextResponse.json(
      { success: true, message: 'Dados limpos! Pronto para novos testes.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Erro ao limpar planilha:', error);
    return NextResponse.json(
      {
        error: 'Erro ao limpar planilha',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

