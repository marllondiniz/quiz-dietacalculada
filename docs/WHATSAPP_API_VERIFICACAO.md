# Verificação da API do WhatsApp

**Branch:** `fix/verify-whatsapp-api`  
**Data:** 2026-02-06

## Checklist da API WhatsApp

### 1. Biblioteca (`lib/whatsapp.ts`)
- [x] `sendRecoveryTemplate({ to, name })` — envia template via Graph API
- [x] Validação de `WA_TOKEN`, `WA_PHONE_NUMBER_ID`, `to`, `name`
- [x] Telefone normalizado (só dígitos)
- [x] Template configurável: `WA_RECOVERY_TEMPLATE_NAME` (fallback: `msg01_recuperacao_quiz_01`)
- [x] Idioma `pt_BR`, body com 1 parâmetro (nome)
- [x] Tratamento de erro com log e throw
- [x] Funções auxiliares: `isValidPhoneNumber`, `formatPhoneNumber`

### 2. Automação (`lib/leadsAutomation.ts`)
- [x] `sendRecoveryWhatsApp(lead)` — chama `sendRecoveryTemplate` com telefone formatado (+55)
- [x] `WA_DRY_RUN` — quando `true`, simula envio sem chamar API
- [x] `getLeadsForRecoveryMessage(5)` — leads 5+ min, não comprou, não recebeu mensagem
- [x] `markLeadAsRecoverySent` / `markAllLeadsWithPhoneAsRecoverySent` — evita reenvio

### 3. Endpoint de recovery (`app/api/leads-automation/recovery/route.ts`)
- [x] GET/POST; threshold padrão 5 minutos
- [x] Opcional: `CRON_SECRET` via query param
- [x] Busca leads elegíveis → envia WhatsApp → marca planilha
- [x] Rate limiting 200ms entre envios
- [x] Resposta JSON com `processed`, `sent`, `failed`, `threshold_minutes`

### 4. Endpoint de teste (`app/api/test-whatsapp/route.ts`)
- [x] GET/POST com `?phone=...&name=...` (e opcional `template=...`)
- [x] Usa `WA_RECOVERY_TEMPLATE_NAME` ou query `template` ou fallback
- [x] Retorna erro detalhado da API (ex.: template pausado) e instruções
- [x] Útil para validar credenciais e template sem passar pela planilha

### 5. Cron (Vercel)
- [x] `vercel.json`: único cron = `/api/leads-automation/recovery`, schedule `* * * * *` (1 min)
- [x] Zaia removida (cron e rota antiga excluídos)

### 6. Variáveis de ambiente (produção Vercel)
- [x] `WA_TOKEN` — obrigatório
- [x] `WA_PHONE_NUMBER_ID` — obrigatório
- [x] `GRAPH_VERSION` — opcional (default v24.0)
- [ ] `CRON_SECRET` — recomendado para proteger o endpoint
- [ ] `WA_RECOVERY_TEMPLATE_NAME` — só se usar outro template
- [ ] `WA_DRY_RUN` — não definir ou `false` em produção

### 7. Build e lint
- [x] `npm run build` — OK
- [x] Sem erros de linter nos arquivos WhatsApp

## Como testar

1. **Local (envio real):**  
   `WA_DRY_RUN` não definido ou `false`, depois:  
   `http://localhost:3001/api/test-whatsapp?phone=5511999999999&name=Teste`

2. **Recovery (planilha):**  
   `http://localhost:3001/api/leads-automation/recovery?minutes=0`  
   (ou em produção com `?secret=CRON_SECRET` se configurado)

## Status

**API do WhatsApp:** implementação conferida e consistente.  
O envio só falha se o template estiver pausado/rejeitado no Meta ou se credenciais estiverem inválidas — resolver no Meta Business Suite ou renovando token.
