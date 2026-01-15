import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

/**
 * API para criar linha inicial na planilha quando o usuário entra no quiz
 * Cria uma linha com Data/Hora, Lead ID e dados de tracking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, trackingData } = body;

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

    // Buscar todas as linhas para verificar se o leadId já existe
    const allRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A:B',
    });

    const rows = allRows.data.values || [];
    let leadExists = false;

    // Verificar se leadId já existe (coluna B)
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === leadId) {
        leadExists = true;
        break;
      }
    }

    // Se já existe, retornar sucesso
    if (leadExists) {
      return NextResponse.json({
        success: true,
        message: 'Lead já existe',
        leadId,
      });
    }

    // Criar linha inicial com todas as colunas vazias exceto Data/Hora e Lead ID
    // Estrutura atual: A=Data/Hora, B=Nome, C=Email, D=Telefone, etc.
    // Mas vamos adicionar Lead ID na coluna B e deslocar tudo
    
    // Por enquanto, vou criar uma linha com Data/Hora na coluna A e Lead ID na coluna B
    // E preencher os dados de tracking nas colunas correspondentes
    
    const initialRow = [
      timestamp,                                    // A - Data/Hora
      leadId,                                       // B - Lead ID
      '',                                          // C - Gênero (Step 0)
      '',                                          // D - Treinos/Semana (Step 1)
      '',                                          // E - Já Usou Apps (Step 2)
      '',                                          // F - Nome (Step 4)
      '',                                          // G - Email (Step 4)
      '',                                          // H - Telefone (Step 4)
      '',                                          // I - Altura (Step 5)
      '',                                          // J - Peso (Step 5)
      '',                                          // K - Unidade (Step 5)
      '',                                          // L - Data Nascimento (Step 6)
      '',                                          // M - Idade (Step 6)
      '',                                          // N - Auxílio Treinos (Step 7)
      '',                                          // O - Auxílio Dieta (Step 8)
      '',                                          // P - Objetivo (Step 9)
      '',                                          // Q - Peso Desejado (Step 10)
      '',                                          // R - Velocidade (Step 13)
      '',                                          // S - Obstáculos (Step 15)
      '',                                          // T - Tipo Dieta (Step 16)
      '',                                          // U - Conquistas (Step 17)
      '',                                          // V - Checkout Variant (Step 23)
      '',                                          // W - Checkout Plan (Step 23)
      '',                                          // X - Checkout URL (Step 23)
      '',                                          // Y - Split Version (Step 23)
      '',                                          // Z - Código Referência
      '',                                          // AA - Onde Ouviu
      '',                                          // AB - Add Calorias
      '',                                          // AC - Transf. Calorias
      trackingData?.utm_source || '',              // AD - UTM Source
      trackingData?.utm_medium || '',              // AE - UTM Medium
      trackingData?.utm_campaign || '',            // AF - UTM Campaign
      trackingData?.utm_term || '',                // AG - UTM Term
      trackingData?.utm_content || '',             // AH - UTM Content
      trackingData?.referrer || '',                // AI - Referrer
      trackingData?.landingPage || '',             // AJ - Landing Page
      trackingData?.userAgent || '',               // AK - User Agent
    ];

    // Inserir linha na planilha
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A:AK',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [initialRow],
      },
    });

    console.log('✅ Linha inicial criada para lead:', leadId);

    return NextResponse.json({
      success: true,
      message: 'Linha inicial criada com sucesso',
      leadId,
    });

  } catch (error: any) {
    console.error('❌ Erro ao criar linha inicial:', error);
    return NextResponse.json(
      {
        error: 'Erro ao criar linha inicial',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
