# Webhook do Checkout Próprio

## Configuração

Quando o pagamento for aprovado no **checkout.dietacalculada.com**, configure o webhook/callback para chamar:

```
POST https://quiz.dietacalculada.com/api/webhook/checkout-proprio
```

## Body da requisição

```json
{
  "email": "cliente@email.com",
  "phone": "11999999999",
  "transaction_id": "tx_123",
  "amount": 99.90,
  "plan": "annual"
}
```

### Campos obrigatórios
- `email` (string) - Email do cliente **OU**
- `phone` (string) - Telefone do cliente

**Importante**: Pelo menos um dos dois (email ou phone) é obrigatório para identificar o lead.

### Campos opcionais
- `transaction_id` - ID da transação do gateway
- `amount` - Valor pago
- `plan` - Plano contratado (annual/monthly)

## Resposta de sucesso

```json
{
  "success": true,
  "message": "Venda registrada com sucesso",
  "data": {
    "success": true,
    "message": "Venda registrada",
    "checkout_source": "proprio",
    "source": "proprio",
    "event": "sale_approved"
  }
}
```

## O que acontece internamente

1. Webhook recebe notificação de pagamento aprovado
2. Chama `/api/leads-automation` com `action: "sale"`
3. Sistema marca o lead como `purchased = true` na aba `Leads_Automacao`
4. Zaia **não** envia mensagem para esse lead (porque ele comprou)

## Testando o webhook

### Via curl (local)
```bash
curl -X POST http://localhost:3000/api/webhook/checkout-proprio \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "phone": "11999999999",
    "transaction_id": "tx_test_123",
    "amount": 99.90,
    "plan": "annual"
  }'
```

### Via curl (produção)
```bash
curl -X POST https://quiz.dietacalculada.com/api/webhook/checkout-proprio \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "phone": "11999999999",
    "transaction_id": "tx_test_123",
    "amount": 99.90,
    "plan": "annual"
  }'
```

## Logs

Para debug, verifique os logs da Vercel. Você verá:
- `📥 Webhook checkout próprio recebido:` - payload recebido
- `✅ Venda registrada com sucesso:` - sucesso
- `❌ Erro ao registrar venda:` - erro (lead não encontrado ou outro problema)

## Documentação do endpoint

Para ver a documentação JSON do endpoint:
```
GET https://quiz.dietacalculada.com/api/webhook/checkout-proprio
```
