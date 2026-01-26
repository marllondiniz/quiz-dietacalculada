import { google, sheets_v4 } from 'googleapis';

// Nome da aba de automação
export const AUTOMATION_SHEET_NAME = 'Leads_Automacao';

// Colunas da aba de automação
export const AUTOMATION_COLUMNS = {
  lead_id: 'A',
  FirstName: 'B',
  email: 'C',
  phone: 'D',
  created_at: 'E',
  purchased: 'F',
  zaia_sent: 'G',
  checkout_source: 'H',
  purchase_at: 'I',
};

// Índices das colunas (0-based)
export const COLUMN_INDEXES = {
  lead_id: 0,
  FirstName: 1,
  email: 2,
  phone: 3,
  created_at: 4,
  purchased: 5,
  zaia_sent: 6,
  checkout_source: 7,
  purchase_at: 8,
};

// Interface para o lead
export interface AutomationLead {
  lead_id: string;
  FirstName: string;
  email: string;
  phone: string;
  created_at: string;
  purchased: boolean;
  zaia_sent: boolean;
  checkout_source: 'hubla' | 'cakto' | '';
  purchase_at: string;
}

// Tipo para checkout source
export type CheckoutSource = 'hubla' | 'cakto';

/**
 * Cria instância autenticada do Google Sheets
 */
export async function getGoogleSheetsInstance(): Promise<{
  sheets: sheets_v4.Sheets;
  spreadsheetId: string;
}> {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
    throw new Error('Configuração do Google Sheets incompleta');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  return { sheets, spreadsheetId };
}

// Headers padrão da aba de automação
export const AUTOMATION_HEADERS = [
  'lead_id',
  'FirstName',
  'email',
  'phone',
  'created_at',
  'purchased',
  'zaia_sent',
  'checkout_source',
  'purchase_at',
];

/**
 * Verifica se a aba Leads_Automacao existe, se não, cria com os headers
 * Se existir mas estiver vazia, adiciona os headers
 */
export async function ensureAutomationSheetExists(): Promise<void> {
  const { sheets, spreadsheetId } = await getGoogleSheetsInstance();

  // Buscar informações da planilha
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  const sheetExists = spreadsheet.data.sheets?.some(
    (sheet) => sheet.properties?.title === AUTOMATION_SHEET_NAME
  );

  if (!sheetExists) {
    // Criar a aba
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: AUTOMATION_SHEET_NAME,
              },
            },
          },
        ],
      },
    });

  }

  // Verificar se os headers existem (primeira linha)
  try {
    const headerRow = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${AUTOMATION_SHEET_NAME}!A1:I1`,
    });

    const existingHeaders = headerRow.data.values?.[0] || [];
    
    // Se não tem headers ou está incompleto, adicionar
    if (existingHeaders.length === 0 || existingHeaders[0] !== 'lead_id') {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${AUTOMATION_SHEET_NAME}!A1:I1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [AUTOMATION_HEADERS],
        },
      });
    }
  } catch (error) {
    // Se der erro ao ler, provavelmente a aba está vazia, adicionar headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${AUTOMATION_SHEET_NAME}!A1:I1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [AUTOMATION_HEADERS],
      },
    });
  }
}

/**
 * Busca todos os leads da aba de automação
 */
export async function getAllLeads(): Promise<AutomationLead[]> {
  const { sheets, spreadsheetId } = await getGoogleSheetsInstance();

  await ensureAutomationSheetExists();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${AUTOMATION_SHEET_NAME}!A:I`,
  });

  const rows = response.data.values || [];
  
  // Pular header (primeira linha)
  if (rows.length <= 1) {
    return [];
  }

  return rows.slice(1).map((row) => ({
    lead_id: row[COLUMN_INDEXES.lead_id] || '',
    FirstName: row[COLUMN_INDEXES.FirstName] || '',
    email: row[COLUMN_INDEXES.email] || '',
    phone: row[COLUMN_INDEXES.phone] || '',
    created_at: row[COLUMN_INDEXES.created_at] || '',
    purchased: row[COLUMN_INDEXES.purchased]?.toLowerCase() === 'true',
    zaia_sent: row[COLUMN_INDEXES.zaia_sent]?.toLowerCase() === 'true',
    checkout_source: (row[COLUMN_INDEXES.checkout_source] || '') as '' | 'hubla' | 'cakto',
    purchase_at: row[COLUMN_INDEXES.purchase_at] || '',
  }));
}

/**
 * Busca um lead por email (prioritário) ou phone
 * Retorna o lead e o índice da linha (1-based, incluindo header)
 */
export async function findLeadByEmailOrPhone(
  email?: string,
  phone?: string
): Promise<{ lead: AutomationLead | null; rowIndex: number }> {
  const { sheets, spreadsheetId } = await getGoogleSheetsInstance();

  await ensureAutomationSheetExists();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${AUTOMATION_SHEET_NAME}!A:I`,
  });

  const rows = response.data.values || [];

  // Pular header
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowEmail = row[COLUMN_INDEXES.email]?.trim().toLowerCase();
    const rowPhone = row[COLUMN_INDEXES.phone]?.trim();

    // Prioridade: email
    if (email && rowEmail === email.trim().toLowerCase()) {
      return {
        lead: {
          lead_id: row[COLUMN_INDEXES.lead_id] || '',
          FirstName: row[COLUMN_INDEXES.FirstName] || '',
          email: row[COLUMN_INDEXES.email] || '',
          phone: row[COLUMN_INDEXES.phone] || '',
          created_at: row[COLUMN_INDEXES.created_at] || '',
          purchased: row[COLUMN_INDEXES.purchased]?.toLowerCase() === 'true',
          zaia_sent: row[COLUMN_INDEXES.zaia_sent]?.toLowerCase() === 'true',
          checkout_source: (row[COLUMN_INDEXES.checkout_source] || '') as '' | 'hubla' | 'cakto',
          purchase_at: row[COLUMN_INDEXES.purchase_at] || '',
        },
        rowIndex: i + 1, // +1 porque a planilha é 1-indexed
      };
    }

    // Fallback: phone (normalizado)
    if (!email && phone && normalizePhone(rowPhone) === normalizePhone(phone)) {
      return {
        lead: {
          lead_id: row[COLUMN_INDEXES.lead_id] || '',
          FirstName: row[COLUMN_INDEXES.FirstName] || '',
          email: row[COLUMN_INDEXES.email] || '',
          phone: row[COLUMN_INDEXES.phone] || '',
          created_at: row[COLUMN_INDEXES.created_at] || '',
          purchased: row[COLUMN_INDEXES.purchased]?.toLowerCase() === 'true',
          zaia_sent: row[COLUMN_INDEXES.zaia_sent]?.toLowerCase() === 'true',
          checkout_source: (row[COLUMN_INDEXES.checkout_source] || '') as '' | 'hubla' | 'cakto',
          purchase_at: row[COLUMN_INDEXES.purchase_at] || '',
        },
        rowIndex: i + 1,
      };
    }
  }

  return { lead: null, rowIndex: -1 };
}

/**
 * Normaliza número de telefone removendo caracteres especiais
 */
export function normalizePhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Gera timestamp no formato brasileiro
 */
export function generateTimestamp(): string {
  return new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
  });
}

/**
 * Gera timestamp ISO para cálculos de tempo
 */
export function generateISOTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Cria ou atualiza um lead na aba de automação
 */
export async function upsertLead(data: {
  lead_id?: string;
  FirstName: string;
  email: string;
  phone: string;
  checkout_source?: CheckoutSource;
}): Promise<{ success: boolean; lead_id: string; isNew: boolean }> {
  const { sheets, spreadsheetId } = await getGoogleSheetsInstance();

  await ensureAutomationSheetExists();

  // Buscar lead existente por email ou phone
  const { lead: existingLead, rowIndex } = await findLeadByEmailOrPhone(
    data.email,
    data.phone
  );

  if (existingLead && rowIndex > 0) {
    // Atualizar dados faltantes (não sobrescrever dados existentes)
    const updates: { range: string; values: string[][] }[] = [];

    if (!existingLead.FirstName && data.FirstName) {
      updates.push({
        range: `${AUTOMATION_SHEET_NAME}!${AUTOMATION_COLUMNS.FirstName}${rowIndex}`,
        values: [[data.FirstName]],
      });
    }

    if (!existingLead.email && data.email) {
      updates.push({
        range: `${AUTOMATION_SHEET_NAME}!${AUTOMATION_COLUMNS.email}${rowIndex}`,
        values: [[data.email]],
      });
    }

    if (!existingLead.phone && data.phone) {
      updates.push({
        range: `${AUTOMATION_SHEET_NAME}!${AUTOMATION_COLUMNS.phone}${rowIndex}`,
        values: [[data.phone]],
      });
    }

    // Atualizar lead_id se fornecido e não existir
    if (!existingLead.lead_id && data.lead_id) {
      updates.push({
        range: `${AUTOMATION_SHEET_NAME}!${AUTOMATION_COLUMNS.lead_id}${rowIndex}`,
        values: [[data.lead_id]],
      });
    }

    // Atualizar checkout_source se fornecido e não existir
    if (!existingLead.checkout_source && data.checkout_source) {
      updates.push({
        range: `${AUTOMATION_SHEET_NAME}!${AUTOMATION_COLUMNS.checkout_source}${rowIndex}`,
        values: [[data.checkout_source]],
      });
    }

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates,
        },
      });
    }

    return {
      success: true,
      lead_id: existingLead.lead_id || data.lead_id || '',
      isNew: false,
    };
  }

  // Criar novo lead
  const newLeadId = data.lead_id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = generateISOTimestamp();

  const newRow = [
    newLeadId,                    // lead_id
    data.FirstName,               // FirstName
    data.email,                   // email
    data.phone,                   // phone
    timestamp,                    // created_at (ISO format para cálculos)
    'false',                      // purchased
    'false',                      // zaia_sent
    data.checkout_source || '',   // checkout_source
    '',                           // purchase_at
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${AUTOMATION_SHEET_NAME}!A:I`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [newRow],
    },
  });

  return {
    success: true,
    lead_id: newLeadId,
    isNew: true,
  };
}

/**
 * Marca um lead como comprado
 */
export async function markLeadAsPurchased(
  email?: string,
  phone?: string,
  checkoutSource: CheckoutSource = 'hubla'
): Promise<{ success: boolean; message: string }> {
  const { sheets, spreadsheetId } = await getGoogleSheetsInstance();

  const { lead, rowIndex } = await findLeadByEmailOrPhone(email, phone);

  if (!lead || rowIndex <= 0) {
    return {
      success: false,
      message: 'Lead não encontrado',
    };
  }

  // Se já está marcado como purchased, retornar sucesso
  if (lead.purchased) {
    return {
      success: true,
      message: 'Lead já estava marcado como comprado',
    };
  }

  const purchaseTimestamp = generateISOTimestamp();

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: [
        {
          range: `${AUTOMATION_SHEET_NAME}!${AUTOMATION_COLUMNS.purchased}${rowIndex}`,
          values: [['true']],
        },
        {
          range: `${AUTOMATION_SHEET_NAME}!${AUTOMATION_COLUMNS.checkout_source}${rowIndex}`,
          values: [[checkoutSource]],
        },
        {
          range: `${AUTOMATION_SHEET_NAME}!${AUTOMATION_COLUMNS.purchase_at}${rowIndex}`,
          values: [[purchaseTimestamp]],
        },
      ],
    },
  });

  return {
    success: true,
    message: 'Lead marcado como comprado',
  };
}

/**
 * Marca um lead como enviado para Zaia
 */
export async function markLeadAsZaiaSent(rowIndex: number): Promise<void> {
  const { sheets, spreadsheetId } = await getGoogleSheetsInstance();

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${AUTOMATION_SHEET_NAME}!${AUTOMATION_COLUMNS.zaia_sent}${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [['true']],
    },
  });

}

/**
 * Marca TODOS os leads com o mesmo telefone como zaia_sent
 * Evita envios duplicados para o mesmo número
 */
export async function markAllLeadsWithPhoneAsZaiaSent(phone: string): Promise<void> {
  const { sheets, spreadsheetId } = await getGoogleSheetsInstance();
  const normalizedPhone = phone.replace(/\D/g, '');

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${AUTOMATION_SHEET_NAME}!A:I`,
  });

  const rows = response.data.values || [];
  const updates: { range: string; values: string[][] }[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowPhone = (row[COLUMN_INDEXES.phone] || '').replace(/\D/g, '');
    const zaiaSent = row[COLUMN_INDEXES.zaia_sent]?.toLowerCase() === 'true';

    if (rowPhone === normalizedPhone && !zaiaSent) {
      updates.push({
        range: `${AUTOMATION_SHEET_NAME}!${AUTOMATION_COLUMNS.zaia_sent}${i + 1}`,
        values: [['true']],
      });
    }
  }

  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates,
      },
    });
  }
}

/**
 * Busca leads elegíveis para abandono (5+ minutos sem compra e não enviados)
 * Evita duplicatas por telefone (envia apenas uma vez por telefone único)
 */
export async function getAbandonedLeads(minutesThreshold: number = 5): Promise<
  Array<{ lead: AutomationLead; rowIndex: number }>
> {
  const { sheets, spreadsheetId } = await getGoogleSheetsInstance();

  await ensureAutomationSheetExists();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${AUTOMATION_SHEET_NAME}!A:I`,
  });

  const rows = response.data.values || [];
  const now = new Date();
  const abandonedLeads: Array<{ lead: AutomationLead; rowIndex: number }> = [];
  const processedPhones = new Set<string>();

  // Pular header
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    const purchased = row[COLUMN_INDEXES.purchased]?.toLowerCase() === 'true';
    const zaiaSent = row[COLUMN_INDEXES.zaia_sent]?.toLowerCase() === 'true';
    const createdAt = row[COLUMN_INDEXES.created_at];
    const phone = row[COLUMN_INDEXES.phone] || '';

    // Normalizar telefone para comparação
    const normalizedPhone = phone.replace(/\D/g, '');

    // Pular se já comprou ou já foi enviado para Zaia
    if (purchased || zaiaSent) {
      continue;
    }

    // Pular se já processamos este telefone (evitar duplicatas)
    if (normalizedPhone && processedPhones.has(normalizedPhone)) {
      continue;
    }

    // Verificar se passou tempo suficiente
    if (createdAt) {
      const createdDate = new Date(createdAt);
      const diffMs = now.getTime() - createdDate.getTime();
      const diffMinutes = diffMs / (1000 * 60);

      if (diffMinutes >= minutesThreshold) {
        const lead: AutomationLead = {
          lead_id: row[COLUMN_INDEXES.lead_id] || '',
          FirstName: row[COLUMN_INDEXES.FirstName] || '',
          email: row[COLUMN_INDEXES.email] || '',
          phone: phone,
          created_at: createdAt,
          purchased: false,
          zaia_sent: false,
          checkout_source: (row[COLUMN_INDEXES.checkout_source] || '') as '' | 'hubla' | 'cakto',
          purchase_at: '',
        };

        // Só incluir se tiver FirstName e phone (obrigatórios para Zaia)
        if (lead.FirstName && lead.phone) {
          abandonedLeads.push({
            lead,
            rowIndex: i + 1, // 1-indexed
          });
          
          // Marcar telefone como processado (evitar duplicatas)
          if (normalizedPhone) {
            processedPhones.add(normalizedPhone);
          }
        }
      }
    }
  }

  return abandonedLeads;
}

/**
 * Envia lead para webhook da Zaia
 */
export async function sendToZaia(lead: AutomationLead): Promise<boolean> {
  const ZAIA_WEBHOOK_URL =
    'https://api.zaia.app/v1/webhook/agent-incoming-webhook-event/create?agentIncomingWebhookId=5437&key=a2fda80e-faac-41f1-9b0c-eb6544adaa93';

  try {
    // Formatar telefone removendo caracteres especiais
    const phoneClean = lead.phone.replace(/\D/g, '');
    
    // Garantir que o telefone tem DDD (adicionar +55 se necessário)
    let formattedPhone = phoneClean;
    if (!phoneClean.startsWith('55') && phoneClean.length >= 10) {
      formattedPhone = '55' + phoneClean;
    }

    const payload = {
      FirstName: lead.FirstName,
      phone: formattedPhone,
    };

    // ✅ Modo teste: não envia nada para a Zaia, apenas loga o payload.
    // Útil para validar o fluxo (quiz → planilha → cron) sem disparar mensagens reais.
    if ((process.env.ZAIA_DRY_RUN || '').toLowerCase() === 'true') {
      console.log('🧪 ZAIA_DRY_RUN ativo — simulando envio para Zaia:', payload);
      return true;
    }

    const response = await fetch(ZAIA_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      console.error(`❌ Erro ao enviar para Zaia [${response.status}]:`, {
        lead: { FirstName: lead.FirstName, phone: formattedPhone },
        error: responseBody,
      });
      return false;
    }

    console.log(`✅ Lead enviado para Zaia: ${lead.FirstName} (${formattedPhone})`);
    return true;
  } catch (error: any) {
    console.error('❌ Erro ao enviar para Zaia:', error.message);
    return false;
  }
}
