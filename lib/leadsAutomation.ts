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
  recovery_msg01_sent_at: 'J',
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
  recovery_msg01_sent_at: 9,
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
  checkout_source: string;
  purchase_at: string;
  recovery_msg01_sent_at: string;
}

// Tipo para checkout source
export type CheckoutSource = 'hubla';

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
  'recovery_msg01_sent_at',
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
      range: `${AUTOMATION_SHEET_NAME}!A1:J1`,
    });

    const existingHeaders = headerRow.data.values?.[0] || [];
    
    // Se não tem headers ou está incompleto, adicionar/atualizar
    if (existingHeaders.length === 0 || existingHeaders[0] !== 'lead_id' || existingHeaders.length < AUTOMATION_HEADERS.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${AUTOMATION_SHEET_NAME}!A1:J1`,
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
      range: `${AUTOMATION_SHEET_NAME}!A1:J1`,
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
    range: `${AUTOMATION_SHEET_NAME}!A:J`,
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
    checkout_source: (row[COLUMN_INDEXES.checkout_source] || '') as string,
    purchase_at: row[COLUMN_INDEXES.purchase_at] || '',
    recovery_msg01_sent_at: row[COLUMN_INDEXES.recovery_msg01_sent_at] || '',
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
    range: `${AUTOMATION_SHEET_NAME}!A:J`,
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
          checkout_source: (row[COLUMN_INDEXES.checkout_source] || '') as string,
          purchase_at: row[COLUMN_INDEXES.purchase_at] || '',
          recovery_msg01_sent_at: row[COLUMN_INDEXES.recovery_msg01_sent_at] || '',
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
          checkout_source: (row[COLUMN_INDEXES.checkout_source] || '') as string,
          purchase_at: row[COLUMN_INDEXES.purchase_at] || '',
          recovery_msg01_sent_at: row[COLUMN_INDEXES.recovery_msg01_sent_at] || '',
        },
        rowIndex: i + 1,
      };
    }
  }

  return { lead: null, rowIndex: -1 };
}

/** Nome da aba principal do quiz (onde ficam UTMs do checkout) */
const MAIN_SHEET_NAME = 'Página1';

/** Índices na aba Página1: G=email(6), H=phone(7), AD=utm_source(29), AE=utm_medium(30), AF=utm_campaign(31), AG=utm_term(32), AH=utm_content(33) */
const MAIN_SHEET_UTM_INDEXES = {
  email: 6,
  phone: 7,
  utm_source: 29,
  utm_medium: 30,
  utm_campaign: 31,
  utm_term: 32,
  utm_content: 33,
};

/**
 * Busca UTMs do lead na aba principal (Página1) por email ou telefone.
 * Usado quando o webhook de venda não envia UTMs (ex: Hubla payment event).
 */
export async function findLeadUTMsInMainSheet(
  email?: string,
  phone?: string
): Promise<{ utmSource: string; utmCampaign: string; utmMedium: string; utmContent: string; utmTerm: string } | null> {
  if (!email && !phone) return null;
  const { sheets, spreadsheetId } = await getGoogleSheetsInstance();
  const normPhone = normalizePhone(phone);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${MAIN_SHEET_NAME}'!A:AH`,
  });
  const rows = response.data.values || [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowEmail = (row[MAIN_SHEET_UTM_INDEXES.email] || '').toString().trim().toLowerCase();
    const rowPhone = (row[MAIN_SHEET_UTM_INDEXES.phone] || '').toString().trim();
    const matchByEmail = email && rowEmail === email.trim().toLowerCase();
    const matchByPhone = phone && normPhone && normalizePhone(rowPhone) === normPhone;
    if (matchByEmail || matchByPhone) {
      return {
        utmSource: (row[MAIN_SHEET_UTM_INDEXES.utm_source] || '').toString().trim(),
        utmCampaign: (row[MAIN_SHEET_UTM_INDEXES.utm_campaign] || '').toString().trim(),
        utmMedium: (row[MAIN_SHEET_UTM_INDEXES.utm_medium] || '').toString().trim(),
        utmContent: (row[MAIN_SHEET_UTM_INDEXES.utm_content] || '').toString().trim(),
        utmTerm: (row[MAIN_SHEET_UTM_INDEXES.utm_term] || '').toString().trim(),
      };
    }
  }
  return null;
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
    '',                           // recovery_msg01_sent_at
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${AUTOMATION_SHEET_NAME}!A:J`,
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
    range: `${AUTOMATION_SHEET_NAME}!A:J`,
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
    range: `${AUTOMATION_SHEET_NAME}!A:J`,
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
          checkout_source: (row[COLUMN_INDEXES.checkout_source] || '') as string,
          purchase_at: '',
          recovery_msg01_sent_at: row[COLUMN_INDEXES.recovery_msg01_sent_at] || '',
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

// ==========================================
// RECUPERAÇÃO DE QUIZ VIA WHATSAPP
// ==========================================

/**
 * Busca leads elegíveis para mensagem de recuperação do quiz
 * 
 * Critérios:
 * - purchased = false (não comprou)
 * - recovery_msg01_sent_at está vazio (não recebeu a mensagem)
 * - created_at >= N minutos atrás (padrão: 5)
 * - created_at dentro das últimas X horas (evita retroativo; RECOVERY_MAX_AGE_HOURS, padrão 48)
 * - Tem FirstName e phone válidos
 * 
 * @param minutesThreshold - Tempo mínimo em minutos desde a criação (padrão: 5)
 * @param maxAgeHours - Idade máxima em horas (só leads criados nas últimas X h); undefined = usar env RECOVERY_MAX_AGE_HOURS (padrão 48)
 * @returns Array de leads elegíveis com índice da linha
 */
export async function getLeadsForRecoveryMessage(
  minutesThreshold: number = 5,
  maxAgeHours?: number
): Promise<Array<{ lead: AutomationLead; rowIndex: number }>> {
  const { sheets, spreadsheetId } = await getGoogleSheetsInstance();

  await ensureAutomationSheetExists();

  const maxHours =
    maxAgeHours ??
    (process.env.RECOVERY_MAX_AGE_HOURS ? Number(process.env.RECOVERY_MAX_AGE_HOURS) : 48);
  const maxAgeMinutes = maxHours * 60;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${AUTOMATION_SHEET_NAME}!A:J`,
  });

  const rows = response.data.values || [];
  const now = new Date();
  const eligibleLeads: Array<{ lead: AutomationLead; rowIndex: number }> = [];
  const processedPhones = new Set<string>();

  console.log(`🔍 Buscando leads para recuperação (threshold: ${minutesThreshold} min, só últimos ${maxHours}h)...`);

  // Pular header
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    const purchased = row[COLUMN_INDEXES.purchased]?.toLowerCase() === 'true';
    const recoveryMsgSent = row[COLUMN_INDEXES.recovery_msg01_sent_at] || '';
    const createdAt = row[COLUMN_INDEXES.created_at];
    const phone = row[COLUMN_INDEXES.phone] || '';
    const firstName = row[COLUMN_INDEXES.FirstName] || '';

    // Normalizar telefone para comparação
    const normalizedPhone = phone.replace(/\D/g, '');

    // Pular se já comprou
    if (purchased) {
      continue;
    }

    // Pular se já recebeu a mensagem de recuperação
    if (recoveryMsgSent) {
      continue;
    }

    // Pular se já processamos este telefone (evitar duplicatas)
    if (normalizedPhone && processedPhones.has(normalizedPhone)) {
      continue;
    }

    // Pular se não tem nome ou telefone
    if (!firstName || !phone) {
      continue;
    }

    // Verificar se o telefone é válido (mínimo 10 dígitos)
    if (normalizedPhone.length < 10) {
      continue;
    }

    // Janela de elegibilidade: criado há pelo menos minutesThreshold e há no máximo maxAgeHours (evita retroativo)
    if (createdAt) {
      const createdDate = new Date(createdAt);
      const diffMs = now.getTime() - createdDate.getTime();
      const diffMinutes = diffMs / (1000 * 60);

      if (diffMinutes >= minutesThreshold && diffMinutes <= maxAgeMinutes) {
        const lead: AutomationLead = {
          lead_id: row[COLUMN_INDEXES.lead_id] || '',
          FirstName: firstName,
          email: row[COLUMN_INDEXES.email] || '',
          phone: phone,
          created_at: createdAt,
          purchased: false,
          zaia_sent: row[COLUMN_INDEXES.zaia_sent]?.toLowerCase() === 'true',
          checkout_source: (row[COLUMN_INDEXES.checkout_source] || '') as string,
          purchase_at: '',
          recovery_msg01_sent_at: '',
        };

        eligibleLeads.push({
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

  console.log(`✅ ${eligibleLeads.length} lead(s) elegível(is) para recuperação`);

  return eligibleLeads;
}

/**
 * Marca lead como tendo recebido a mensagem de recuperação
 * 
 * @param rowIndex - Índice da linha na planilha (1-based)
 */
export async function markLeadAsRecoverySent(rowIndex: number): Promise<void> {
  const { sheets, spreadsheetId } = await getGoogleSheetsInstance();
  
  const timestamp = generateISOTimestamp();

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${AUTOMATION_SHEET_NAME}!${AUTOMATION_COLUMNS.recovery_msg01_sent_at}${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[timestamp]],
    },
  });

  console.log(`✅ Lead marcado como recuperação enviada (linha ${rowIndex})`);
}

/**
 * Marca TODOS os leads com o mesmo telefone como recovery_msg01_sent
 * Evita envios duplicados para o mesmo número
 * 
 * @param phone - Número de telefone
 */
export async function markAllLeadsWithPhoneAsRecoverySent(phone: string): Promise<void> {
  const { sheets, spreadsheetId } = await getGoogleSheetsInstance();
  const normalizedPhone = phone.replace(/\D/g, '');
  const timestamp = generateISOTimestamp();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${AUTOMATION_SHEET_NAME}!A:J`,
  });

  const rows = response.data.values || [];
  const updates: { range: string; values: string[][] }[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowPhone = (row[COLUMN_INDEXES.phone] || '').replace(/\D/g, '');
    const recoveryMsgSent = row[COLUMN_INDEXES.recovery_msg01_sent_at] || '';

    if (rowPhone === normalizedPhone && !recoveryMsgSent) {
      updates.push({
        range: `${AUTOMATION_SHEET_NAME}!${AUTOMATION_COLUMNS.recovery_msg01_sent_at}${i + 1}`,
        values: [[timestamp]],
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

    console.log(`✅ ${updates.length} lead(s) com telefone ${normalizedPhone} marcado(s) como recuperação enviada`);
  }
}

// ==========================================
// RECUPERAÇÃO DE QUIZ VIA API OFICIAL WHATSAPP
// ==========================================

/**
 * Envia mensagem de recuperação do quiz via API oficial do WhatsApp Business
 * (template quiz_webhook_recuperacao_fernanda - Fernanda, {{1}} = nome).
 *
 * @param lead - Lead para enviar a mensagem
 * @returns true se enviado com sucesso, false caso contrário
 */
export async function sendRecoveryWhatsApp(lead: AutomationLead): Promise<boolean> {
  try {
    const { sendRecoveryTemplate } = await import('./whatsapp');

    const phoneClean = lead.phone.replace(/\D/g, '');
    let formattedPhone = phoneClean;
    if (!phoneClean.startsWith('55') && phoneClean.length >= 10) {
      formattedPhone = '55' + phoneClean;
    }

    if ((process.env.WA_DRY_RUN || '').toLowerCase() === 'true') {
      console.log('🧪 WA_DRY_RUN ativo — simulando envio WhatsApp:', {
        to: formattedPhone,
        name: lead.FirstName,
      });
      return true;
    }

    await sendRecoveryTemplate({
      to: formattedPhone,
      name: lead.FirstName,
    });

    console.log(`✅ Mensagem de recuperação (WhatsApp) enviada para ${lead.FirstName} (${formattedPhone})`);
    return true;
  } catch (error: any) {
    if (error?.whatsappCode === 132015) {
      throw error;
    }
    console.error('❌ Erro ao enviar mensagem de recuperação (WhatsApp):', error.message);
    return false;
  }
}

// ==========================================
// ABA "LISTA VENDAS"
// ==========================================

// Nome da aba de vendas
export const SALES_SHEET_NAME = 'Lista Vendas';

// Headers da aba "Lista Vendas" (18 colunas conforme a planilha)
export const SALES_HEADERS = [
  'DATA COMPRA',
  'DATA PAGAMENTO',
  'CHECKOUT',
  'ID TRANSAÇÃO',
  'PLANO',
  'VALOR BRUTO',
  'VALOR LÍQUIDO',
  'FORMA DE PAGAMENTO',
  'NOME',
  'E-MAIL',
  'TELEFONE',
  'NOME DA OFERTA',
  'UTM_SOURCE',
  'UTM_CAMPAIGN',
  'UTM_MEDIUM',
  'UTM_CONTENT',
  'UTM_TERM',
  'CUPOM',
];

/**
 * Verifica se a aba "Lista Vendas" existe, se não, cria com os headers
 */
export async function ensureSalesSheetExists(): Promise<void> {
  const { sheets, spreadsheetId } = await getGoogleSheetsInstance();

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  const sheetExists = spreadsheet.data.sheets?.some(
    (sheet) => sheet.properties?.title === SALES_SHEET_NAME
  );

  if (!sheetExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: SALES_SHEET_NAME,
              },
            },
          },
        ],
      },
    });
  }

  try {
    const headerRow = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${SALES_SHEET_NAME}'!A1:R1`,
    });

    const existingHeaders = headerRow.data.values?.[0] || [];
    
    if (existingHeaders.length === 0 || existingHeaders[0] !== 'DATA COMPRA') {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${SALES_SHEET_NAME}'!A1:R1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [SALES_HEADERS],
        },
      });
    }
  } catch (error) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${SALES_SHEET_NAME}'!A1:R1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [SALES_HEADERS],
      },
    });
  }
}

/**
 * Interface para dados de venda
 */
export interface SaleData {
  purchaseDate?: string;
  paymentDate?: string;
  checkout: 'hubla';
  transactionId?: string;
  plan?: string;
  grossValue?: number;
  netValue?: number;
  paymentMethod?: string;
  name?: string;
  email?: string;
  phone?: string;
  offerName?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  utmContent?: string;
  utmTerm?: string;
  coupon?: string;
}

/**
 * Formata valor para Real brasileiro
 */
function formatCurrency(value?: number): string {
  if (!value && value !== 0) return '';
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

/**
 * Formata data para formato brasileiro
 */
function formatDateBR(date?: string | Date): string {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '';
  }
}

/**
 * Mapeia plano para nome em português
 */
function mapPlanName(plan?: string): string {
  if (!plan) return '';
  const planLower = plan.toLowerCase();
  if (planLower.includes('annual') || planLower.includes('anual')) return 'Anual';
  if (planLower.includes('monthly') || planLower.includes('mensal')) return 'Mensal';
  return plan;
}

/**
 * Mapeia nome da oferta
 */
function mapOfferName(plan?: string, offerName?: string): string {
  if (offerName) return offerName;
  if (!plan) return '';
  const planLower = plan.toLowerCase();
  if (planLower.includes('annual') || planLower.includes('anual')) return 'Plano Anual';
  if (planLower.includes('monthly') || planLower.includes('mensal')) return 'Plano Mensal';
  return plan;
}

/**
 * Monta a linha (18 colunas) que será escrita na aba "Lista Vendas".
 * Exportado para testes e dry-run (validar dados antes de gravar).
 */
export function buildSalesRow(saleData: SaleData): string[] {
  const now = new Date().toISOString();
  
  const grossFormatted = formatCurrency(saleData.grossValue);
  const netFormatted = formatCurrency(saleData.netValue);
  
  console.log('📋 [DEBUG] buildSalesRow - Formatação de valores:', {
    grossValue: saleData.grossValue,
    netValue: saleData.netValue,
    grossFormatted,
    netFormatted,
  });
  
  return [
    formatDateBR(saleData.purchaseDate || now),      // A  DATA COMPRA
    formatDateBR(saleData.paymentDate || now),       // B  DATA PAGAMENTO
    saleData.checkout.toUpperCase(),                 // C  CHECKOUT
    saleData.transactionId ?? '',                    // D  ID TRANSAÇÃO
    mapPlanName(saleData.plan),                      // E  PLANO
    grossFormatted,                                  // F  VALOR BRUTO
    netFormatted,                                    // G  VALOR LÍQUIDO
    saleData.paymentMethod ?? '',                    // H  FORMA DE PAGAMENTO
    saleData.name ?? '',                             // I  NOME
    saleData.email ?? '',                            // J  E-MAIL
    saleData.phone ?? '',                            // K  TELEFONE
    mapOfferName(saleData.plan, saleData.offerName), // L  NOME DA OFERTA
    saleData.utmSource ?? '',                        // M  UTM_SOURCE
    saleData.utmCampaign ?? '',                      // N  UTM_CAMPAIGN
    saleData.utmMedium ?? '',                        // O  UTM_MEDIUM
    saleData.utmContent ?? '',                       // P  UTM_CONTENT
    saleData.utmTerm ?? '',                          // Q  UTM_TERM
    saleData.coupon ?? '',                           // R  CUPOM
  ];
}

/**
 * Salva uma venda na aba "Lista Vendas".
 * Garante as 18 colunas (A–R) sempre preenchidas; valores ausentes viram string vazia ou data/hora atual.
 */
export async function saveSaleToSalesSheet(saleData: SaleData): Promise<{ success: boolean; message: string }> {
  try {
    const { sheets, spreadsheetId } = await getGoogleSheetsInstance();
    
    await ensureSalesSheetExists();

    const row = buildSalesRow(saleData);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${SALES_SHEET_NAME}'!A:R`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    console.log(`✅ Venda salva na aba "Lista Vendas": ${saleData.transactionId || 'N/A'}`);
    
    return {
      success: true,
      message: 'Venda salva na aba "Lista Vendas"',
    };
  } catch (error: any) {
    console.error('❌ Erro ao salvar venda na aba "Lista Vendas":', error.message);
    return {
      success: false,
      message: `Erro ao salvar venda: ${error.message}`,
    };
  }
}
