#!/bin/bash
# Script de Validação de OS - Padrão Aurora Platinum
# Uso: ./validate-os.sh <caminho-do-arquivo>

OS_FILE="$1"

# 1. Validação de Existência
if [ ! -f "$OS_FILE" ]; then
    echo "❌ Erro: Arquivo não encontrado ou não salvo."
    exit 1
fi

# 2. Validação Estrutural (Cabeçalho)
if ! grep -q "**ID:**" "$OS_FILE" || ! grep -q "## 1. O OBJETIVO" "$OS_FILE"; then
    echo "❌ Erro: Estrutura inválida. Use o snippet 'nova-os' para começar."
    exit 1
fi

# 3. Validação de Fechamento (Ciclo Cognitivo)
if grep -q "## 5. RELATÓRIO DE ENCERRAMENTO" "$OS_FILE"; then
    # A OS está fechada, vamos validar a lógica
    STATUS=$(grep "**Status Final:**" "$OS_FILE" | cut -d ' ' -f 3-)
    
    # Se não for sucesso total, exige lição aprendida
    if [[ "$STATUS" != *"✅ SUCESSO"* ]]; then
        # Verifica se o campo de erro ainda tem o texto padrão ou está vazio
        if grep -q "Nada a reportar" "$OS_FILE" || grep -q "Nenhuma regra nova" "$OS_FILE"; then
            echo "⚠️  ALERTA COGNITIVO:"
            echo "   A OS terminou com status $STATUS, mas o campo de lições está padrão."
            echo "   Regra Platinum: Se houve erro/desvio, você DEVE registrar o aprendizado."
            exit 1
        fi
    fi
    echo "✅ OS Fechada e Validada com Sucesso (Memória Gerada)."
else
    echo "🟡 OS Aberta e Válida (Ainda não encerrada)."
fi

exit 0
