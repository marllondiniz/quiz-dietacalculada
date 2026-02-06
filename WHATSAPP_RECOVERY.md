# 📱 Sistema de Recuperação de Quiz via WhatsApp

Sistema automatizado para enviar mensagens de recuperação para leads que iniciaram o quiz mas não finalizaram a compra.

## 📋 Visão Geral

O sistema monitora leads na planilha Google Sheets e envia automaticamente uma mensagem personalizada via WhatsApp Business API após um período configurável (padrão: 20 minutos).

### Template da Mensagem

**Nome:** `msg01_recuperacao_quiz_01`

**Conteúdo:**
```
Oi, {{NOME}}! Aqui é a Sabrina, do Dieta Calculada.

Vi que você entrou no nosso Quiz, mas não finalizou sua inscrição!

Ficou com alguma dúvida?
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione no arquivo `.env.local`:

```env
# WhatsApp Business API
WA_TOKEN=EAAZBmLRP91IIBQtZA7SJTDAVSpmVpBUr8fJVXmM6IqRnH1IJxhlhOz529wxGnjXBEjvyBz1GvHbt3vudn5XqB19V9t3d8azJqPESlYoIlJyAoVohfyFnpKN49oE7a5t6hASzRBl4XspOxbgi0PQ7DtUZBFd1DFlN7TnmrI9N09YimJz53OfrG5gKQtfo2jeAgZDZD
WA_PHONE_NUMBER_ID=987607171098659
WA_BUSINESS_ACCOUNT_ID=1818467925307785
GRAPH_VERSION=v24.0

# Modo teste (opcional - não envia mensagens reais)
WA_DRY_RUN=false

# Chave secreta para proteger o endpoint (opcional mas recomendado)
CRON_SECRET=sua-chave-secreta-aqui
```

### 2. Template no WhatsApp Business

Certifique-se de que o template `msg01_recuperacao_quiz_01` está:
- ✅ Criado no WhatsApp Business Manager
- ✅ Aprovado pelo WhatsApp
- ✅ Configurado com 1 variável no corpo (`{{1}}` = nome do lead)
- ✅ Idioma: `pt_BR`

## 🚀 Como Funciona

### Fluxo Automático

1. **Lead capturado** → Salvo na planilha `Leads_Automacao` via webhook Hubla
2. **Cron job** → Roda a cada 5 minutos verificando leads elegíveis
3. **Verificação** → Lead atende aos critérios?
   - ❌ Não comprou (`purchased = false`)
   - ❌ Não recebeu mensagem (`recovery_msg01_sent_at` vazio)
   - ✅ Passou 20+ minutos desde `created_at`
   - ✅ Tem nome e telefone válidos
4. **Envio** → Mensagem enviada via WhatsApp API
5. **Marcação** → Campo `recovery_msg01_sent_at` preenchido com timestamp

### Estrutura da Planilha

A aba `Leads_Automacao` tem as seguintes colunas:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `lead_id` | String | ID único do lead |
| `FirstName` | String | Primeiro nome (usado na mensagem) |
| `email` | String | E-mail do lead |
| `phone` | String | Telefone (formato: 5511999999999) |
| `created_at` | ISO Date | Data/hora de criação |
| `purchased` | Boolean | Se comprou (true/false) |
| `zaia_sent` | Boolean | Se foi enviado para Zaia |
| `checkout_source` | String | Origem (hubla, etc) |
| `purchase_at` | ISO Date | Data/hora da compra |
| **`recovery_msg01_sent_at`** | ISO Date | **Data/hora do envio da recuperação** |

## 🧪 Testando

### 1. Modo Dry-Run (Teste sem enviar)

Configure no `.env.local`:

```env
WA_DRY_RUN=true
```

Isso simula o envio sem fazer chamadas reais à API do WhatsApp.

### 2. Teste Manual via Endpoint

```bash
# Testar com threshold de 1 minuto (para teste rápido)
curl "http://localhost:3000/api/leads-automation/recovery?minutes=1"

# Produção com secret
curl "https://seu-dominio.vercel.app/api/leads-automation/recovery?secret=sua-chave-secreta"
```

### 3. Verificar Logs

Os logs mostram todo o processo:

```
🚀 [RECOVERY] Iniciando processamento de recuperação de quiz...
⏱️ [RECOVERY] Threshold configurado: 20 minutos
🔍 Buscando leads para recuperação (threshold: 20 min)...
✅ 3 lead(s) elegível(is) para recuperação
📱 [RECOVERY] Processando: Maria (5511999999999)...
📱 Enviando template WhatsApp para 5511999999999 (Maria)...
✅ Template enviado com sucesso para 5511999999999
✅ Lead marcado como recuperação enviada (linha 5)
✅ [RECOVERY] Enviado com sucesso: Maria
✅ [RECOVERY] Processamento concluído: { sent: 3, failed: 0 }
```

## 📊 Endpoints

### POST/GET `/api/leads-automation/recovery`

Processa leads elegíveis e envia mensagens de recuperação.

**Query Params:**
- `minutes` (opcional): Threshold em minutos (padrão: 20)
- `secret` (opcional): Chave de segurança (se `CRON_SECRET` estiver configurado)

**Resposta de Sucesso:**

```json
{
  "success": true,
  "message": "Processamento de recuperação concluído",
  "processed": 5,
  "sent": 5,
  "failed": 0,
  "threshold_minutes": 20
}
```

**Resposta sem Leads:**

```json
{
  "success": true,
  "message": "Nenhum lead elegível para recuperação",
  "processed": 0,
  "sent": 0,
  "failed": 0
}
```

## ⚙️ Cron Job (Vercel)

O arquivo `vercel.json` está configurado para executar automaticamente:

```json
{
  "crons": [
    {
      "path": "/api/leads-automation/recovery",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Frequência:** A cada 5 minutos

💡 **Dica:** Ajuste o `schedule` conforme necessário:
- `*/5 * * * *` = A cada 5 minutos
- `*/10 * * * *` = A cada 10 minutos
- `0 * * * *` = A cada hora

## 🔒 Segurança

### Proteção do Endpoint

1. **Em desenvolvimento:** Endpoint aberto (localhost)
2. **Em produção:** Configure `CRON_SECRET` e proteja com secret no query param

```bash
# ✅ Correto (com secret)
GET /api/leads-automation/recovery?secret=SUA_CHAVE_SECRETA

# ❌ Bloqueado (sem secret)
GET /api/leads-automation/recovery
# Retorna: 401 Unauthorized
```

### Rate Limiting

- ⏱️ **Intervalo entre envios:** 200ms
- 🔢 **Máximo por execução:** Ilimitado (mas controlado pelo threshold)

## 🐛 Troubleshooting

### Mensagens não estão sendo enviadas

1. ✅ Verifique se o template está **aprovado** no WhatsApp Business Manager
2. ✅ Confirme que `WA_TOKEN` e `WA_PHONE_NUMBER_ID` estão corretos
3. ✅ Verifique se `WA_DRY_RUN=false` (ou remova essa variável)
4. ✅ Confira os logs do servidor para erros específicos

### Lead não está sendo selecionado

1. ✅ Verifique se `purchased = false` na planilha
2. ✅ Confirme que `recovery_msg01_sent_at` está vazio
3. ✅ Certifique-se de que passaram 20+ minutos desde `created_at`
4. ✅ Verifique se o telefone tem 10+ dígitos

### Erro de autenticação WhatsApp

```json
{
  "error": {
    "message": "(#100) Invalid parameter",
    "code": 100
  }
}
```

**Solução:**
- Verifique se o `WA_TOKEN` não expirou
- Confirme se o token tem permissões de `whatsapp_business_messaging`
- Teste o token diretamente na Graph API Explorer

### Template não encontrado

```json
{
  "error": {
    "message": "Template not found",
    "code": 132000
  }
}
```

**Solução:**
- Confirme o nome exato: `msg01_recuperacao_quiz_01`
- Verifique se o template está aprovado
- Certifique-se de que está usando o `WA_PHONE_NUMBER_ID` correto

## 📚 Bibliotecas e Arquivos

### Estrutura de Código

```
├── lib/
│   ├── whatsapp.ts              # Funções de envio WhatsApp
│   └── leadsAutomation.ts       # Funções de leads (+ recuperação)
│
├── app/api/leads-automation/
│   ├── route.ts                 # Webhook Hubla (captura)
│   ├── cron/route.ts            # Cron Zaia (abandono)
│   └── recovery/route.ts        # Cron recuperação WhatsApp
│
└── vercel.json                  # Config cron jobs
```

### Funções Principais

#### `lib/whatsapp.ts`

- `sendRecoveryTemplate()` - Envia template via WhatsApp API
- `isValidPhoneNumber()` - Valida formato do telefone
- `formatPhoneNumber()` - Formata telefone para exibição

#### `lib/leadsAutomation.ts`

- `getLeadsForRecoveryMessage()` - Busca leads elegíveis
- `sendRecoveryWhatsApp()` - Envia mensagem de recuperação
- `markLeadAsRecoverySent()` - Marca lead individual como enviado
- `markAllLeadsWithPhoneAsRecoverySent()` - Marca todos com mesmo telefone

## 📈 Monitoramento

### Estatísticas

Acesse o endpoint principal para ver estatísticas:

```bash
GET /api/leads-automation
```

Retorna informações sobre leads, incluindo os que receberam recuperação.

### Logs Recomendados

Configure alertas para:
- ❌ Taxa de falha > 10%
- ⏰ Execuções do cron (verificar se está rodando)
- 📊 Volume de envios (monitorar custos WhatsApp)

## 💡 Dicas e Boas Práticas

1. **Threshold de 20 minutos** é recomendado para não parecer spam
2. **Não envie duplicatas** - o sistema já previne por telefone
3. **Monitore custos** - cada mensagem tem custo na API do WhatsApp
4. **Teste antes de produção** - use `WA_DRY_RUN=true`
5. **Configure secret** - proteja o endpoint em produção

## 🔄 Próximas Melhorias

Sugestões para expandir o sistema:

- [ ] **Mensagem 2** - Enviar segunda mensagem após 24h
- [ ] **Mensagem 3** - Enviar terceira mensagem após 48h
- [ ] **Segmentação** - Mensagens diferentes por UTM
- [ ] **A/B Test** - Testar diferentes textos
- [ ] **Dashboard** - Interface para visualizar estatísticas
- [ ] **Pausar/Retomar** - Controle manual do sistema

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor
2. Consulte a documentação da WhatsApp Business API
3. Teste no modo dry-run primeiro

---

✅ **Sistema pronto e funcionando!**

O sistema está configurado para rodar automaticamente via cron job da Vercel, processando leads a cada 5 minutos e enviando mensagens de recuperação para quem não finalizou o quiz.
