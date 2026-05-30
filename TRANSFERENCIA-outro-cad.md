# TRANSFERÊNCIA — atualizar o outro CAD para ficar idêntico a este

Cole este texto na outra conversa onde está o outro CAD, junto com o arquivo `index.html` deste pacote. Instrução para a IA:

---

"Tenho dois apps de manejo de Cetoacidose Diabética que preciso deixar IDÊNTICOS. Vou colar abaixo o código final (index.html) que é a versão correta e atualizada. Substitua o app desta conversa por este código, mantendo exatamente esta versão. Depois me devolva o index.html final para eu hospedar no GitHub."

[colar aqui o conteúdo completo do index.html do pacote]

---

## Checklist do que esta versão tem (confira se o outro CAD está igual)

ESTRUTURA:
☐ Tela inicial com 2 botões grandes (Caso Ativo / Calculadoras) que cabe sem rolar
☐ Toggle pill (Caso Ativo / Calculadoras) só aparece DEPOIS de escolher na welcome
☐ Header 3 linhas: Manejo de Cetoacidose Diabética / Dr. Renan Horisawa / Calculadora clínica
☐ Botão home (SVG de casa) no header
☐ Dark mode (botão lua)
☐ Meta tags anti-cache no head

MODO CASO ATIVO:
☐ Iniciar caso pede glic, pH, bic, K, peso + toggle NPH precoce
☐ Timeline com horários
☐ Reavaliação com seletor de tempo (chips 15 em 15 min, de 15min a 4h) — NÃO usa campo de horário absoluto
☐ Engine de 7 cenários (refratária, queda lenta, meta, rápida, troca SG, K crítico, resolução)
☐ Toggle ADA 2024 ↔ USP com thresholds dinâmicos
☐ Condutas colapsáveis (clica no card e expande/recolhe)
☐ Condutas executadas agrupadas na timeline (1 card "X condutas executadas")
☐ Deduplicação de condutas idênticas
☐ Encerrar caso por duplo-clique (não confirm nativo)
☐ Prescrição final copiável

MODO CALCULADORAS (9 abas):
☐ Dx (tabela gravidade que acende + Na corrigido + DDx EHH)
☐ Admissão
☐ Bomba (preparo + velocidade por peso + tabela K com ampolas)
☐ Solução (toggle 1000/500 mL, hero com número)
☐ Bicarb
☐ Off (4 critérios incluindo AG + hipoglicemia)
☐ Cálc (Ânion gap + Osmolaridade)
☐ Soluções 1-8 com badge "250 mL/h" em cada
☐ Siglas + lógica da árvore

REPOSIÇÃO DE K (detalhe crítico):
☐ Ampolas: KCl 19,1% 10mL = 25 mEq E KCl 10% 10mL = 13 mEq
☐ K<3,3: pausar bomba, 20-30 mEq/h (20-40 se K<3,0), acesso central, nunca bolus
☐ K 3,3-5,2: não duplica KCl se solução já tem (Sol 1,3,5,7)
☐ K>5,2: sem KCl

SOLUÇÕES:
☐ 250 mL/h padrão em todas, com nota de ajuste por volemia
☐ KCl 19,1% e NaCl 20% especificados

Se algum item estiver faltando ou diferente no outro CAD, peça pra IA corrigir item por item até bater 100%.
