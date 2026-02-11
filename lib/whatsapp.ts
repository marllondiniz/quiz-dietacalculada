/**
 * BIBLIOTECA WHATSAPP BUSINESS API
 * 
 * Funções para enviar templates de mensagens via WhatsApp Business API
 */

export interface SendRecoveryTemplateParams {
  to: string;      // Número do destinatário (com ou sem formatação)
  name: string;    // Nome do lead para personalização da mensagem
}

export interface WhatsAppResponse {
  messaging_product: string;
  contacts?: Array<{ input: string; wa_id: string }>;
  messages?: Array<{ id: string }>;
}

/**
 * Envia template de recuperação do quiz via WhatsApp
 * 
 * Template: msg01_recuperacao_quiz_01
 * Mensagem: "Oi, {{1}}! Aqui é a Sabrina, do Dieta Calculada..."
 * 
 * @param params - Parâmetros da mensagem (to, name)
 * @returns Resposta da API do WhatsApp
 */
export async function sendRecoveryTemplate(
  params: SendRecoveryTemplateParams
): Promise<WhatsAppResponse> {
  const { to, name } = params;

  // Validações
  const token = process.env.WA_TOKEN;
  const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;
  const graphVersion = process.env.GRAPH_VERSION || 'v24.0';

  if (!token) {
    throw new Error('WA_TOKEN não definido no arquivo .env');
  }

  if (!phoneNumberId) {
    throw new Error('WA_PHONE_NUMBER_ID não definido no arquivo .env');
  }

  if (!to) {
    throw new Error('Campo "to" (número do destinatário) é obrigatório');
  }

  if (!name) {
    throw new Error('Campo "name" (nome do lead) é obrigatório');
  }

  // Limpar número (remover caracteres não numéricos)
  const cleanedPhone = String(to).replace(/\D/g, '');

  if (cleanedPhone.length < 10) {
    throw new Error(`Número de telefone inválido: ${to} (muito curto)`);
  }

  // Nome do template (permite trocar via .env quando criar novo template no Meta)
  const templateName = process.env.WA_RECOVERY_TEMPLATE_NAME || 'msg01_recuperacao_quiz_01';

  // Montar URL da API
  const url = `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`;

  // Montar payload do template
  const payload = {
    messaging_product: 'whatsapp',
    to: cleanedPhone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'pt_BR' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: String(name) }
          ],
        },
      ],
    },
  };

  console.log(`📱 Enviando template WhatsApp para ${cleanedPhone} (${name})...`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const apiCode = (data as any)?.error?.code;
      // Log do erro para debug (uma vez; 132015 será tratado no recovery para não repetir)
      console.error('❌ Erro WhatsApp API:', {
        status: response.status,
        statusText: response.statusText,
        data,
      });
      const err = new Error(
        `Erro WhatsApp API (${response.status}): ${JSON.stringify(data)}`
      ) as Error & { whatsappCode?: number };
      err.whatsappCode = apiCode;
      throw err;
    }

    console.log(`✅ Template enviado com sucesso para ${cleanedPhone}`);

    return data as WhatsAppResponse;
  } catch (error: any) {
    console.error('❌ Erro ao enviar template WhatsApp:', error);
    throw error;
  }
}

/**
 * Valida se um número de telefone está no formato correto
 * 
 * @param phone - Número a ser validado
 * @returns true se válido, false caso contrário
 */
export function isValidPhoneNumber(phone: string | undefined): boolean {
  if (!phone) return false;
  
  const cleaned = phone.replace(/\D/g, '');
  
  // Brasil: mínimo 10 dígitos (DDD + número), máximo 13 (código país + DDD + 9 dígitos)
  return cleaned.length >= 10 && cleaned.length <= 13;
}

/**
 * Formata número de telefone para exibição
 * 
 * @param phone - Número a ser formatado
 * @returns Número formatado (ex: +55 11 99999-9999)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  // Formato brasileiro
  if (cleaned.length === 11) {
    return `+55 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
  }
  
  return phone;
}
