# MEMÓRIA DO PROJETO — CAD App
Última atualização: 28/05/2026

## ESTRUTURA
App HTML único (sem dependências). https://horisawa-ai.github.io/cad-calculadora/
- Tela inicial (welcome): 2 botões grandes (Caso Ativo / Calculadoras), cabe sem rolar. Botão home SVG. Meta tags anti-cache.
- Modo Caso Ativo: inicia com glic/pH/bic/K/peso + NPH precoce opcional. Timeline com horários (reavaliações CLICÁVEIS → expandem mostrando condutas). Reavaliação com seletor de TEMPO RELATIVO (chips 15 em 15 min até 4h, depois 30 em 30 min até 6h). Toggle ADA/USP. CONDUTA ÚNICA CONSOLIDADA, numerada ①②③ por prioridade, SEM checkbox. Seção "Conduta atual". Encerrar por duplo-clique. Prescrição copiável.
- Modo Calculadoras (9 abas): Dx, Admissão, Bomba, Solução, Bicarb, Off, Cálc, Soluções, Siglas. ESTÁVEL — não mexer sem pedido.

## LÓGICA DA CONDUTA ÚNICA
Cada reavaliação = UM bloco. Decisões integradas:
- Bomba: decidida SÓ pela glicemia (+ K crítico pausa). refratária→dobrar+investigar; <meta→dobrar; >meta→reduzir 50%; meta→manter; K<kPause→PAUSAR.
- Solução: recalculada com glic/Na/K ATUAIS, KCl já embutido. "Trocar" se mudou, senão "Manter". 250 mL/h.
- Potássio: coerente com solução (não duplica KCl).
- Hidratação: só se queda lenta/refratária. Bicarbonato: só pH<bicPh. Próxima gaso 2h sempre (exceto resolução).
- resolutionMet: só conduta de resolução (dieta, NPH/Glargina, desligar bomba).

## THRESHOLDS ADA 2024 vs USP
kPause 3,5/3,3 · kReplaceStart=kHigh 5,0/5,3 · meta 50-70/50-75 · pH bic <7,0/<6,9 · glic SG 200/250 · resolução: ADA glic<200+(pH≥7,3 OU bic≥18) / USP glic<200+pH≥7,3 E bic≥18 E AG≤12.

## DOSES
Bomba: 1mL insulina(100UI)+99mL SF=1UI/mL; vel 0,1 UI/kg/h (peso×0,1 mL/h); bolus 0,1UI/kg opcional.
K: KCl 19,1% 10mL=25mEq · KCl 10% 10mL=13mEq. K<3,3: PAUSAR, 20-30mEq/h (20-40 se<3,0) em 250mL SF, central, nunca bolus, ECG, reavaliar 1h. K 3,3-5,2: manter, KCl só se solução não tiver. K>5,2: sem KCl.
8 soluções (250mL/h): 1=AD+1KCl+2NaCl 2=AD+2NaCl 3=SF+1KCl 4=SF 5=SG+1KCl+2NaCl 6=SG+2NaCl 7=SG+2KCl+4NaCl 8=SG+4NaCl.
Árvore: Dx>250→1-4; Dx<250→5-8; Na>135→AD; Na<135→SF; K baixo→com KCl.
Bicarb (pH<6,9): 100mL Bic8,4%+400mL AD+1amp KCl em 2h.
Off: glic<200,pH≥7,3,Bic≥18,AG≤12 → dieta→NPH 0,1U/kg(ou Glargina 0,25)→aguardar 1-2h→desligar.
Hipoglicemia<70: suspender bomba 30min, SG50% 30-60mL.

## BUGS CORRIGIDOS
1. Meia-noite → tempo relativo. 2. Duplicação → conduta única. 3. KCl genérico → ampolas+não duplicar. 4. Home unicode → SVG. 5. Encerrar (confirm iOS) → duplo-clique. 6. Bomba 0.0 → fallback peso. 7. Contradições entre boxes → CONDUTA ÚNICA. 8. "reading length" caso antigo → migração defensiva loadCase. 9. event.target showCalc → passa this.

## DESIGN
Azul Einstein (#14377d/#0a1f3d/#5a8ae8) + dourado (#c9a961). Dark mode. Plus Jakarta Sans. Condutas SEM checkbox, numeradas ①②③ (cor por gravidade). Reavaliações clicáveis na timeline.

## CONFORMIDADE
Nunca usar "nutrólogo"/"médico nutrólogo" em material público (até RQE). App de emergência não usa.

## VALIDAÇÃO
teste-cenarios.js: 25.200 cenários + 21 testes clínicos. Zero contradição/duplicação. Thresholds ADA/USP corretos.
