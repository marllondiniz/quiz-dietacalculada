# Validação de Telefone com Zod

## Implementação

A validação de telefone foi implementada usando **Zod** para garantir que apenas números de telefone brasileiros válidos sejam aceitos nos webhooks.

## Formatos Aceitos

### Telefone Fixo
- **10 dígitos**: DDD + número fixo
  - Exemplo: `2733334444` (ES - Vitória)
  - Formato: `(27) 3333-4444`

- **12 dígitos**: DDI + DDD + número fixo
  - Exemplo: `552733334444`
  - Formato: `+55 (27) 3333-4444`

### Telefone Celular
- **11 dígitos**: DDD + 9 + número
  - Exemplo: `27999999999` (ES - celular)
  - Formato: `(27) 99999-9999`

- **13 dígitos**: DDI + DDD + 9 + número
  - Exemplo: `5527999999999`
  - Formato: `+55 (27) 99999-9999`

## Regras de Validação

### 1. Quantidade de Dígitos
✅ Aceita: 10, 11, 12 ou 13 dígitos
❌ Rejeita: qualquer outra quantidade

### 2. DDI (Código do País)
✅ Se 12 ou 13 dígitos, deve começar com `55` (Brasil)
❌ Rejeita: DDI diferente de 55

### 3. DDD (Código de Área)
✅ DDD válido: entre 11 e 99
❌ Rejeita: DDD < 11 ou DDD > 99

Exemplos de DDDs válidos:
- 11 - São Paulo
- 21 - Rio de Janeiro
- 27 - Espírito Santo
- 31 - Minas Gerais
- 85 - Ceará

### 4. Dígito 9 (Celular)
✅ Telefones com 11 ou 13 dígitos **devem** ter o dígito 9 após o DDD
❌ Rejeita: celular sem o 9

Exemplo:
- ✅ `27999999999` (correto)
- ❌ `2788888888` (incorreto - celular sem 9)

### 5. Caracteres Especiais
A validação **remove automaticamente** caracteres não numéricos:
- `(27) 99999-9999` → `27999999999`
- `+55 27 99999-9999` → `5527999999999`
- `27 9 9999-9999` → `27999999999`

## Exemplos de Uso

### Telefones Válidos ✅

```json
{
  "phone": "27999999999"        // Celular ES
}
```

```json
{
  "phone": "5527999999999"      // Celular ES com DDI
}
```

```json
{
  "phone": "2733334444"         // Fixo ES
}
```

```json
{
  "phone": "552733334444"       // Fixo ES com DDI
}
```

```json
{
  "phone": "(27) 99999-9999"    // Com formatação - será limpo
}
```

### Telefones Inválidos ❌

```json
{
  "phone": "999999999"          // ❌ Apenas 9 dígitos
}
```

```json
{
  "phone": "279999999999"       // ❌ 12 dígitos mas sem DDI 55
}
```

```json
{
  "phone": "2788888888"         // ❌ 10 dígitos (deveria ser celular com 11)
}
```

```json
{
  "phone": "0527999999999"      // ❌ DDI inválido (05 ao invés de 55)
}
```

```json
{
  "phone": "09999999999"        // ❌ DDD inválido (09 < 11)
}
```

## Resposta de Erro

Quando um telefone inválido é enviado, a API retorna:

```json
{
  "success": false,
  "error": "Dados inválidos",
  "message": "Telefone deve ter 10, 11, 12 ou 13 dígitos (com ou sem DDI 55)",
  "details": [
    {
      "code": "custom",
      "message": "Telefone deve ter 10, 11, 12 ou 13 dígitos (com ou sem DDI 55)",
      "path": ["phone"]
    }
  ]
}
```

## Endpoints Validados

### 1. `/api/leads-automation` (POST)
Valida telefone em:
- Captura de lead (Hubla e Cakto)
- Venda aprovada (Hubla e Cakto)

### 2. `/api/webhook/checkout-proprio` (POST)
Valida telefone em:
- Notificação de venda

## Testando a Validação

### Teste 1: Telefone Válido (Celular com DDD)

```bash
curl -X POST http://localhost:3000/api/leads-automation \
  -H "Content-Type: application/json" \
  -d '{
    "action": "capture",
    "FirstName": "João",
    "email": "joao@email.com",
    "phone": "27999999999",
    "checkout_source": "cakto"
  }'
```

✅ Resposta esperada: `200 OK`

### Teste 2: Telefone Inválido (Poucos dígitos)

```bash
curl -X POST http://localhost:3000/api/leads-automation \
  -H "Content-Type: application/json" \
  -d '{
    "action": "capture",
    "FirstName": "João",
    "email": "joao@email.com",
    "phone": "999999999",
    "checkout_source": "cakto"
  }'
```

❌ Resposta esperada: `400 Bad Request`

```json
{
  "success": false,
  "error": "Dados inválidos",
  "message": "Telefone deve ter 10, 11, 12 ou 13 dígitos (com ou sem DDI 55)"
}
```

### Teste 3: Telefone com Formatação

```bash
curl -X POST http://localhost:3000/api/leads-automation \
  -H "Content-Type: application/json" \
  -d '{
    "action": "capture",
    "FirstName": "Maria",
    "email": "maria@email.com",
    "phone": "(27) 99999-9999",
    "checkout_source": "hubla"
  }'
```

✅ Resposta esperada: `200 OK` (formatação removida automaticamente)

### Teste 4: Celular sem dígito 9

```bash
curl -X POST http://localhost:3000/api/leads-automation \
  -H "Content-Type: application/json" \
  -d '{
    "action": "capture",
    "FirstName": "Pedro",
    "email": "pedro@email.com",
    "phone": "2788888888",
    "checkout_source": "cakto"
  }'
```

❌ Resposta esperada: `400 Bad Request`

```json
{
  "success": false,
  "error": "Dados inválidos",
  "message": "Celular deve ter o dígito 9 após o DDD"
}
```

## Benefícios

1. ✅ **Dados limpos**: Apenas telefones válidos entram na planilha
2. ✅ **Automação confiável**: WhatsApp/Zaia recebe números corretos
3. ✅ **Feedback claro**: Mensagens de erro específicas
4. ✅ **Flexibilidade**: Aceita diferentes formatos (com/sem formatação)
5. ✅ **Segurança**: Previne entrada de dados malformados

## Código de Validação

O código de validação está em:
```
lib/validations.ts
```

Principais schemas:
- `phoneSchema` - Validação de telefone
- `emailSchema` - Validação de email
- `leadCaptureSchema` - Schema completo para captura de lead
- `saleApprovedSchema` - Schema completo para venda aprovada

## Configuração do Cakto

Para o webhook do Cakto funcionar corretamente com a validação, configure:

**URL do Webhook:**
```
https://quiz.dietacalculada.com/api/leads-automation
```

**Payload esperado (captura de lead):**
```json
{
  "action": "capture",
  "FirstName": "Nome do Cliente",
  "email": "email@cliente.com",
  "phone": "27999999999",
  "checkout_source": "cakto"
}
```

**Payload esperado (venda aprovada):**
```json
{
  "action": "sale",
  "email": "email@cliente.com",
  "phone": "27999999999",
  "checkout_source": "cakto"
}
```

**Importante**: O campo `phone` deve estar em um dos formatos válidos listados acima.
