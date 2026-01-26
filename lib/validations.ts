import { z } from 'zod';

/**
 * Validação de telefone brasileiro
 * 
 * Formatos aceitos:
 * - 11999999999 (11 dígitos - celular com DDD)
 * - 5511999999999 (13 dígitos - celular com DDI+DDD)
 * - 1133334444 (10 dígitos - fixo com DDD)
 * - 551133334444 (12 dígitos - fixo com DDI+DDD)
 */
export const phoneSchema = z
  .string()
  .min(1, 'Telefone é obrigatório')
  .transform((val) => val.replace(/\D/g, '')) // Remove caracteres não numéricos
  .refine(
    (val) => {
      // Aceita:
      // - 10 dígitos: telefone fixo com DDD (ex: 2733334444)
      // - 11 dígitos: celular com DDD (ex: 27999999999)
      // - 12 dígitos: fixo com DDI+DDD (ex: 552733334444)
      // - 13 dígitos: celular com DDI+DDD (ex: 5527999999999)
      const length = val.length;
      return length === 10 || length === 11 || length === 12 || length === 13;
    },
    {
      message: 'Telefone deve ter 10, 11, 12 ou 13 dígitos (com ou sem DDI 55)',
    }
  )
  .refine(
    (val) => {
      // Se tem 13 dígitos, deve começar com 55 (DDI do Brasil)
      if (val.length === 13) {
        return val.startsWith('55');
      }
      // Se tem 12 dígitos, deve começar com 55 (DDI do Brasil)
      if (val.length === 12) {
        return val.startsWith('55');
      }
      return true;
    },
    {
      message: 'Telefone com DDI deve começar com 55 (Brasil)',
    }
  )
  .refine(
    (val) => {
      // Validar DDD (após remover DDI se existir)
      let phone = val;
      if (val.startsWith('55')) {
        phone = val.substring(2); // Remove DDI
      }
      
      // DDD deve estar entre 11 e 99
      const ddd = parseInt(phone.substring(0, 2));
      return ddd >= 11 && ddd <= 99;
    },
    {
      message: 'DDD inválido (deve estar entre 11 e 99)',
    }
  )
  .refine(
    (val) => {
      // Se for celular (11 ou 13 dígitos), o 3º dígito após DDD deve ser 9
      let phone = val;
      if (val.startsWith('55')) {
        phone = val.substring(2); // Remove DDI
      }
      
      if (phone.length === 11) {
        // Celular: terceiro dígito deve ser 9
        return phone[2] === '9';
      }
      
      return true;
    },
    {
      message: 'Celular deve ter o dígito 9 após o DDD',
    }
  );

/**
 * Validação de email
 */
export const emailSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .email('Email inválido')
  .toLowerCase()
  .trim();

/**
 * Schema para captura de lead
 */
export const leadCaptureSchema = z.object({
  action: z.enum(['capture']).optional(),
  lead_id: z.string().optional(),
  FirstName: z.string().min(1, 'Nome é obrigatório').trim(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  checkout_source: z.enum(['hubla', 'cakto']).optional(),
}).refine(
  (data) => data.email || data.phone,
  {
    message: 'Email ou telefone é obrigatório',
    path: ['email'],
  }
);

/**
 * Schema para venda aprovada
 */
export const saleApprovedSchema = z.object({
  action: z.enum(['sale', 'venda', 'purchase']).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  checkout_source: z.enum(['hubla', 'cakto']).optional(),
  transaction_id: z.string().optional(),
  amount: z.number().positive().optional(),
  plan: z.enum(['annual', 'monthly']).optional(),
}).refine(
  (data) => data.email || data.phone,
  {
    message: 'Email ou telefone é obrigatório',
    path: ['email'],
  }
);

/**
 * Schema para webhook Hubla (estrutura aninhada)
 */
export const hublaWebhookSchema = z.object({
  type: z.string(),
  event: z.object({
    lead: z.object({
      id: z.string().optional(),
      fullName: z.string().optional(),
      full_name: z.string().optional(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: phoneSchema.optional(),
    }).optional(),
    customer: z.object({
      id: z.string().optional(),
      fullName: z.string().optional(),
      full_name: z.string().optional(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: phoneSchema.optional(),
    }).optional(),
    buyer: z.object({
      email: z.string().email().optional(),
      phone: phoneSchema.optional(),
    }).optional(),
    user: z.object({
      email: z.string().email().optional(),
      phone: phoneSchema.optional(),
    }).optional(),
  }).optional(),
});

/**
 * Tipo inferido dos schemas
 */
export type LeadCaptureInput = z.infer<typeof leadCaptureSchema>;
export type SaleApprovedInput = z.infer<typeof saleApprovedSchema>;
export type HublaWebhookInput = z.infer<typeof hublaWebhookSchema>;
