#!/bin/bash

# Script para testar a extração de valores do webhook
# Uso: ./test-webhook.sh

echo "🧪 Testando extração de valores do webhook..."
echo ""

curl -X POST http://localhost:3000/api/test-webhook \
  -H "Content-Type: application/json" \
  -d @test-payload.json \
  | jq '.'

echo ""
echo "✅ Teste concluído!"
echo ""
echo "Valores esperados:"
echo "  - Valor Bruto: R$ 99,00"
echo "  - Valor Líquido: R$ 91,18"
