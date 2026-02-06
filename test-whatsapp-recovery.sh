#!/bin/bash

# Script de teste para o sistema de recuperação WhatsApp
# Uso: ./test-whatsapp-recovery.sh [local|prod]

ENV=${1:-local}

if [ "$ENV" = "local" ]; then
  BASE_URL="http://localhost:3000"
  echo "🧪 Testando LOCALMENTE..."
elif [ "$ENV" = "prod" ]; then
  BASE_URL="https://seu-dominio.vercel.app"
  echo "🚀 Testando PRODUÇÃO..."
  read -p "Tem certeza? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
else
  echo "❌ Uso: ./test-whatsapp-recovery.sh [local|prod]"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TESTE DO SISTEMA DE RECUPERAÇÃO VIA WHATSAPP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Status geral da automação
echo "📊 1. Verificando status geral..."
curl -s "${BASE_URL}/api/leads-automation" | jq '.'
echo ""

# 2. Teste de recuperação com threshold baixo (1 minuto para teste)
echo "📱 2. Testando recuperação (threshold: 1 minuto)..."
curl -s "${BASE_URL}/api/leads-automation/recovery?minutes=1" | jq '.'
echo ""

# 3. Teste com threshold padrão (20 minutos)
echo "📱 3. Testando recuperação (threshold: 20 minutos)..."
curl -s "${BASE_URL}/api/leads-automation/recovery?minutes=20" | jq '.'
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Testes concluídos!"
echo ""
echo "💡 Dicas:"
echo "  - Configure WA_DRY_RUN=true no .env.local para não enviar mensagens reais"
echo "  - Verifique os logs do servidor para mais detalhes"
echo "  - Use threshold baixo (1-5 min) para testes rápidos"
echo ""
