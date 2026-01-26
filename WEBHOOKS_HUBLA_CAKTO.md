# Webhooks Hubla e Cakto

## Visão Geral

O sistema agora utiliza **split 50/50** entre Hubla e Cakto para processar pagamentos. Os webhooks de ambas as plataformas devem ser configurados para notificar o sistema sobre leads e vendas.

## Endpoint Unificado

```
POST https://quiz.dietacalculada.com/api/leads-automation
```

Este endpoint detecta automaticamente se a requisição vem da **Hubla** ou **Cakto** através de:
- Headers específicos (ex: `x-hubla-token`, `x-cakto-token`)
- Estrutura do payload
- Campo `checkout_source` no body

## Configuração dos Webhooks

### 1. Webhook Hubla

Configure no painel da Hubla para enviar notificações para:
```
https://quiz.dietacalculada.com/api/leads-automation
```

**Eventos a configurar:**
- `lead.created` - Quando um lead é capturado
- `lead.abandoned_checkout` - Quando um lead abandona o checkout
- `invoice.payment.approved` - Quando um pagamento é aprovado
- `sale.created` - Quando uma venda é criada

A Hubla já envia os headers `x-hubla-token` e `x-hubla-idempotency` automaticamente.

### 2. Webhook Cakto

Configure no painel do Cakto para enviar notificações para:
```
https://quiz.dietacalculada.com/api/leads-automation
```

**Body esperado para captura de lead:**
```json
{
  "action": "capture",
  "FirstName": "João",
  "email": "joao@email.com",
  "phone": "11999999999",
  "checkout_source": "cakto"
}
```

**Body esperado para venda aprovada:**
```json
{
  "action": "sale",
  "email": "joao@email.com",
  "phone": "11999999999",
  "checkout_source": "cakto"
}
```

## Fluxo do Sistema

### 1. Quiz Completo → Checkout Split

Quando um usuário completa o quiz:

1. Sistema escolhe aleatoriamente entre Hubla (50%) ou Cakto (50%)
2. Registra o lead na planilha `Leads_Automacao` com `checkout_source` = "hubla" ou "cakto"
3. Redireciona para o checkout correspondente:
   - **Hubla Anual**: https://pay.hub.la/LG07vLA6urwSwXjGiTm3
   - **Hubla Mensal**: https://pay.hub.la/kDORNq8Jp0xTWlsJtEB0
   - **Cakto Anual**: https://pay.cakto.com.br/kvar8c2_742083
   - **Cakto Mensal**: https://pay.cakto.com.br/bigpf3i

### 2. Captura de Lead

Quando o webhook recebe notificação de captura de lead:

1. Sistema identifica a origem (Hubla ou Cakto)
2. Cria ou atualiza o lead em `Leads_Automacao`
3. Define `checkout_source` = "hubla" ou "cakto"
4. Define `purchased` = false
5. Define `zaia_sent` = false

### 3. Venda Aprovada

Quando o webhook recebe notificação de venda:

1. Sistema identifica a origem (Hubla ou Cakto)
2. Busca o lead por email ou telefone
3. Marca `purchased` = true
4. Atualiza `checkout_source` com a origem da venda
5. Registra `purchase_at` com timestamp

**Importante**: Leads com `purchased = true` **não recebem** mensagens de abandono da Zaia.

### 4. Automação de Abandono

O cron job (`/api/leads-automation/cron`) roda a cada 5 minutos e:

1. Busca leads com:
   - `purchased` = false
   - `zaia_sent` = false
   - Criados há mais de 5 minutos
2. Envia para Zaia (WhatsApp)
3. Marca `zaia_sent` = true

## Estrutura da Planilha Leads_Automacao

| Coluna | Campo | Descrição |
|--------|-------|-----------|
| A | lead_id | ID único do lead |
| B | FirstName | Primeiro nome |
| C | email | Email do lead |
| D | phone | Telefone (formato: 5527999999999) |
| E | created_at | Data/hora de criação (ISO) |
| F | purchased | true/false - Se comprou |
| G | zaia_sent | true/false - Se foi enviado para Zaia |
| H | **checkout_source** | **"hubla" ou "cakto"** |
| I | purchase_at | Data/hora da compra (ISO) |

## Testando os Webhooks

### Testar Hubla (simular)

```bash
curl -X POST http://localhost:3000/api/leads-automation \
  -H "Content-Type: application/json" \
  -H "x-hubla-token: test_token_123" \
  -d '{
    "type": "lead.created",
    "event": {
      "lead": {
        "id": "lead_123",
        "fullName": "João Silva",
        "email": "joao@email.com",
        "phone": "5527999999999"
      }
    }
  }'
```

### Testar Cakto

```bash
curl -X POST http://localhost:3000/api/leads-automation \
  -H "Content-Type: application/json" \
  -d '{
    "action": "capture",
    "FirstName": "Maria",
    "email": "maria@email.com",
    "phone": "5527988888888",
    "checkout_source": "cakto"
  }'
```

### Testar Venda Hubla

```bash
curl -X POST http://localhost:3000/api/leads-automation \
  -H "Content-Type: application/json" \
  -H "x-hubla-token: test_token_123" \
  -d '{
    "type": "invoice.payment.approved",
    "event": {
      "customer": {
        "email": "joao@email.com",
        "phone": "5527999999999"
      }
    }
  }'
```

### Testar Venda Cakto

```bash
curl -X POST http://localhost:3000/api/leads-automation \
  -H "Content-Type: application/json" \
  -d '{
    "action": "sale",
    "email": "maria@email.com",
    "phone": "5527988888888",
    "checkout_source": "cakto"
  }'
```

## Verificar Status

Para ver estatísticas e status do sistema:

```
GET https://quiz.dietacalculada.com/api/leads-automation
```

Resposta esperada:
```json
{
  "status": "ok",
  "sheetName": "Leads_Automacao",
  "stats": {
    "total": 150,
    "purchased": 45,
    "notPurchased": 105,
    "zaiaSent": 80,
    "pendingZaia": 25,
    "bySource": {
      "hubla": 75,
      "cakto": 75
    }
  }
}
```

## Logs

Para debug, verifique os logs da Vercel:

- `📥 Payload recebido:` - Payload completo recebido
- `🔍 Headers Hubla: SIM/NÃO` - Se detectou headers da Hubla
- `🔍 Headers/Body Cakto: SIM/NÃO` - Se detectou Cakto
- `🔍 Origem: hubla/cakto` - Origem detectada
- `📋 Tipo de evento: lead_capture/sale_approved` - Tipo de evento
- `✅ Lead capturado (hubla/cakto):` - Lead criado/atualizado
- `✅ Venda registrada (hubla/cakto):` - Venda marcada
- `⚠️ Lead não encontrado` - Venda sem lead correspondente

## Importante

1. **Campo checkout_source é obrigatório** para Cakto (enviar no body)
2. **Hubla é detectada automaticamente** pelos headers
3. **Apenas um checkout_source por lead** - o primeiro que capturar
4. **Vendas atualizam o checkout_source** se necessário
5. **Split 50/50 é aleatório** a cada novo usuário do quiz
