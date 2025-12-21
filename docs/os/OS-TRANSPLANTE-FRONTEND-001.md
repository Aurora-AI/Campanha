# 🧬 ORDEM DE SERVIÇO: OS-TRANSPLANTE-FRONTEND-001

**ID:** `OS-TRANSPLANTE-FRONTEND-001`
**Prioridade:** CRÍTICA (Bloqueante)
**Executor:** CODEX / Agente Técnico
**Contexto:** Migração "Zero Point" (Elysian -> Ozzmosis)
**Objetivo:** Transplantar o código do Frontend "Exo Ape" (validado) para a nova estrutura Ozzmosis e renomear a identidade do pacote.

---

## 1. DEFINIÇÃO DE VARIÁVEIS DE AMBIENTE

* **Raiz do Repositório Atual (Receptor):** `C:\Aurora\Ozzmosis`
* **Caminho Relativo do Doador (Origem):** `..\Campanha\apps\aurora-frontend`
* *Nota:* O Doador contém o código Next.js com design "Exo Ape" validado.


* **Caminho do Órgão Alvo (Destino):** `apps\mycelium-front`

---

## 2. PROCEDIMENTO DE TRANSPLANTE (Script PowerShell)

O executor deve rodar o seguinte bloco no terminal da raiz `Ozzmosis` para mover os arquivos e limpar artefatos de build antigos.

```powershell
# --- INÍCIO DO PROTOCOLO CIRÚRGICO ---

$Source = "..\Campanha\apps\aurora-frontend"
$Dest = "apps\mycelium-front"

Write-Host "🚀 Iniciando Transplante: $Source -> $Dest"

# 1. Validação de Segurança
if (!(Test-Path $Source)) {
    Write-Error "⛔ ERRO FATAL: A pasta de origem '$Source' não foi encontrada."
    exit 1
}

# 2. Limpeza Prévia (Garantir que o destino está limpo)
if (Test-Path $Dest) {
    Remove-Item -Path "$Dest\*" -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Force -Path $Dest | Out-Null

# 3. Cópia dos Arquivos (Excluindo lixo tóxico: node_modules, .next, .git)
# Nota: Copiamos tudo e limpamos depois para garantir integridade
Write-Host "📦 Copiando arquivos (isso pode demorar alguns segundos)..."
Copy-Item -Path "$Source\*" -Destination $Dest -Recurse -Force

# 4. Esterilização (Remoção de Gordura)
Write-Host "🧹 Removendo artefatos do doador (node_modules, .next)..."
Remove-Item -Path "$Dest\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$Dest\.next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$Dest\.git" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$Dest\package-lock.json" -Force -ErrorAction SilentlyContinue

Write-Host "✅ Transplante Físico Concluído."

```

---

## 3. MUTAGÊNESE (Alteração de Identidade)

O código transplantado ainda acredita chamar-se "web-crm" ou "aurora-frontend". É necessário editar o DNA.

**Ação Obrigatória:**
Editar o arquivo `apps/mycelium-front/package.json`:

1. **Localizar:** `"name": "aurora-frontend"` (ou similar).
2. **Substituir por:** `"name": "@ozzmosis/mycelium-front"`.
3. **Localizar:** `"version": "..."`.
4. **Reiniciar para:** `"version": "0.1.0"`.

---

## 4. REANIMAÇÃO E VALIDAÇÃO

Após a cópia e renomeação, o executor deve rodar a sequência de boot para garantir que o órgão não foi rejeitado.

```bash
# Sequência de Boot
cd apps/mycelium-front
npm install
npm run dev

```

**Critérios de Sucesso (Definition of Done):**

1. [ ] O comando `npm install` finaliza sem erros de dependência.
2. [ ] O servidor inicia em `localhost:3000`.
3. [ ] Acessar `localhost:3000` exibe a interface "Exo Ape" (Fundo branco, paralaxe, design limpo).
4. [ ] Não há erros de "Missing Module" no console.

---

## 5. ASSINATURA DO EXECUTOR

Ao finalizar, realizar o commit da nova estrutura:

```bash
git add apps/mycelium-front
git commit -m "feat(mycelium): transplante inicial do frontend exo-ape v1.0"
git push origin main

```

**FIM DA ORDEM DE SERVIÇO**
