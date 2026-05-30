# Manejo de Cetoacidose Diabética — App Clínico

**Autor:** Dr. Renan Horisawa
**Hospedagem:** https://horisawa-ai.github.io/cad-calculadora/
**Referências:** ADA 2024 · Emergências Clínicas USP

---

## O que é

Aplicativo web (HTML único, sem dependências externas) para manejo de cetoacidose diabética no plantão. Funciona offline depois de carregado, otimizado para celular, pode ser adicionado à tela de início do iPhone como app nativo.

## Estrutura do app

O app tem **uma tela inicial** com dois caminhos:

### 1. Caso Ativo (manejo guiado)
Gerenciador de caso ao vivo. Registra a admissão do paciente, calcula doses, e a cada reavaliação sugere condutas baseadas em guideline.
- Timeline com horários
- Reavaliações com seletor de tempo (15 em 15 min, de 15min a 4h)
- Engine de condutas (7 cenários clínicos)
- Toggle ADA 2024 ↔ Emergências USP (thresholds mudam dinamicamente)
- NPH precoce opcional (estratégia ADA 2024)
- Condutas colapsáveis e deduplicadas
- Prescrição final pronta pra copiar/colar no prontuário
- Dados salvos em localStorage (persiste ao fechar/reabrir)

### 2. Calculadoras (consulta rápida) — 9 abas
1. **Dx** — critérios diagnósticos + tabela de gravidade que acende + Na corrigido + DDx EHH
2. **Admissão** — protocolo de admissão + ajuste de bomba + exames seriados
3. **Bomba** — preparo + velocidade por peso + reposição de K com ampolas
4. **Solução** — escolha por Dx/Na/K (toggle 1000/500 mL)
5. **Bicarb** — indicação + receita padrão
6. **Off** — critérios de desligamento + sequência + hipoglicemia
7. **Cálc** — Ânion gap + Osmolaridade efetiva
8. **Soluções** — referência das 8 soluções (250 mL/h)
9. **Siglas** — legenda + lógica da árvore

## Como editar

É um arquivo HTML único. Abra `index.html` em qualquer editor de texto (VS Code, Bloco de Notas). Todo o código (HTML + CSS + JavaScript) está nele.

## Como hospedar / atualizar

1. Entre no repositório `horisawa-ai/cad-calculadora` no GitHub
2. Add file → Upload files → arraste o `index.html` (substituir)
3. Commit changes
4. Em ~30s a URL atualiza: https://horisawa-ai.github.io/cad-calculadora/

O app tem meta tags anti-cache, então o navegador sempre pega a versão nova. O localStorage (dados do caso) NÃO é afetado pelo cache.

## Como usar no celular

1. Abra a URL no Safari/Chrome
2. Compartilhar → Adicionar à tela de início
3. Vira ícone de app, abre em tela cheia

## Tecnologia

- HTML/CSS/JS puro, sem frameworks
- Fonte: Plus Jakarta Sans (Google Fonts)
- Paleta: Azul Einstein (#14377d) + dourado (#c9a961)
- Dark mode incluído (botão 🌙 no header)
- localStorage para persistência do caso ativo
