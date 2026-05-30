// ===== Replica da lógica do app pra testar =====
let currentGuideline = 'ada';

function getThresholds() {
  if (currentGuideline === 'ada') {
    return { kPause: 3.5, kReplaceStart: 5.0, kHigh: 5.0, targetMin: 50, targetMax: 70, bicPh: 7.0, glicThreshold: 200, resolutionGlic: 200 };
  } else {
    return { kPause: 3.3, kReplaceStart: 5.3, kHigh: 5.3, targetMin: 50, targetMax: 75, bicPh: 6.9, glicThreshold: 250, resolutionGlic: 200 };
  }
}

function pickSolution(dx, na, k) {
  const t = getThresholds();
  if (dx > 250) {
    if (na > 135) return k < t.kReplaceStart ? 1 : 2;
    return k < t.kReplaceStart ? 3 : 4;
  }
  if (na > 135) return k < t.kReplaceStart ? 5 : 6;
  return k < t.kReplaceStart ? 7 : 8;
}
function solutionText(n) {
  const s = {1:'AD+KCl+NaCl',2:'AD+NaCl',3:'SF+KCl',4:'SF',5:'SG+KCl+NaCl',6:'SG+NaCl',7:'SG+KCl+NaCl',8:'SG+NaCl'};
  return s[n];
}

// Simula computeReactions, retorna a lista de condutas (textos crus)
function computeConducts(state, peso, glic, ph, bic, k, minutes) {
  const s = state;
  const t = getThresholds();
  const hoursSince = minutes / 60;
  const conducts = [];
  if (isNaN(glic) || hoursSince <= 0) return { conducts, title: 'VAZIO' };

  const diff = s.glic - glic;
  const rate = diff / hoursSince;
  const naRef = s.naCorr || s.na || 138;

  const resolutionMet = (!isNaN(ph) && !isNaN(bic)) && (currentGuideline === 'ada'
    ? ((ph >= 7.3 || bic >= 18) && glic < 200)
    : (ph >= 7.3 && bic >= 18 && glic < 200));

  let glicCat;
  if (glic >= s.glic) glicCat = 'refrat';
  else if (rate < t.targetMin) glicCat = 'lenta';
  else if (rate > t.targetMax) glicCat = 'rapida';
  else glicCat = 'meta';

  let kCat = null;
  if (!isNaN(k)) {
    if (k < t.kPause) kCat = 'critico';
    else if (k > t.kHigh) kCat = 'alto';
    else kCat = 'normal';
  }

  let bombaMlhAtual = parseFloat(s.bombaMlh);
  let novaBomba = bombaMlhAtual;
  let bombaTxt, bombaPausada = false;
  if (kCat === 'critico') {
    novaBomba = 0; bombaPausada = true;
    bombaTxt = `PAUSAR bomba de insulina (K < ${t.kPause})`;
  } else if (resolutionMet) {
    bombaTxt = null;
  } else if (glicCat === 'refrat') {
    novaBomba = bombaMlhAtual * 2; bombaTxt = `Dobrar bomba: ${bombaMlhAtual} -> ${novaBomba} mL/h (refrataria)`;
  } else if (glicCat === 'lenta') {
    novaBomba = bombaMlhAtual * 2; bombaTxt = `Dobrar bomba: ${bombaMlhAtual} -> ${novaBomba} mL/h (lenta)`;
  } else if (glicCat === 'rapida') {
    novaBomba = bombaMlhAtual / 2; bombaTxt = `Reduzir bomba 50%: ${bombaMlhAtual} -> ${novaBomba} mL/h`;
  } else {
    bombaTxt = `Manter bomba em ${bombaMlhAtual} mL/h`;
  }

  const solAtual = pickSolution(glic, naRef, !isNaN(k) ? k : s.k);
  const trocouSol = solAtual !== s.solNum;
  let solTxt = null;
  if (!bombaPausada) {
    const cruzouSG = glic <= t.glicThreshold && s.glic > t.glicThreshold;
    if (cruzouSG) solTxt = `Trocar para Solucao ${solAtual} (SG) a 250 mL/h`;
    else if (trocouSol) solTxt = `Trocar para Solucao ${solAtual} a 250 mL/h`;
    else solTxt = `Manter Solucao ${solAtual} a 250 mL/h`;
  }

  let kTxt = null;
  if (kCat === 'critico') {
    const doseAlta = k < 3.0;
    kTxt = `Repor KCl ${doseAlta ? '20-40' : '20-30'} mEq/h`;
  } else if (kCat === 'alto') {
    kTxt = `Sem KCl (K > ${t.kHigh})`;
  } else if (kCat === 'normal') {
    const solComKCl = [1,3,5,7].includes(solAtual);
    kTxt = solComKCl ? `KCl ja incluso na Solucao ${solAtual}` : `Adicionar 1 amp KCl 19,1% por litro`;
  }

  let hidraTxt = null;
  if (glicCat === 'refrat' || glicCat === 'lenta') hidraTxt = `Reavaliar volemia`;

  let bicTxt = null;
  if (!isNaN(ph) && ph < t.bicPh) bicTxt = `Bicarbonato: pH < ${t.bicPh}`;

  if (resolutionMet) {
    if (kCat === 'critico') conducts.push(kTxt);
    conducts.push('Liberar dieta');
    conducts.push('NPH/Glargina SC');
    conducts.push('Aguardar 1-2h apos SC');
    conducts.push('Desligar bomba apos sobreposicao');
    conducts.push('HGT 4/4h');
    return { conducts, title: 'RESOLUCAO' };
  } else {
    if (bombaTxt) conducts.push(bombaTxt);
    if (solTxt) conducts.push(solTxt);
    if (kTxt && kCat !== 'critico') conducts.push(kTxt);
    if (kCat === 'critico') {
      conducts.push(kTxt);
      conducts.push('Reavaliar K em 1h + ECG');
    }
    if (hidraTxt) conducts.push(hidraTxt);
    if (bicTxt) conducts.push(bicTxt);
    conducts.push('Proxima gasometria em 2h');
    let title = 'meta';
    if (kCat === 'critico') title = 'K CRITICO';
    else if (glicCat === 'refrat') title = 'REFRATARIA';
    else if (glicCat === 'lenta') title = 'LENTA';
    else if (glicCat === 'rapida') title = 'RAPIDA';
    return { conducts, title };
  }
}

// ===== RODA OS TESTES =====
const problemas = [];
let totalTestes = 0;

const glicAnteriores = [400, 280, 240, 180];
const glicAtuais = [600, 400, 350, 250, 200, 180, 150];
const phs = [6.8, 7.0, 7.1, 7.25, 7.35];
const bics = [8, 12, 16, 18, 22];
const ks = [2.8, 3.2, 3.6, 4.5, 5.1, 5.8];
const tempos = [60, 120, 240];
const guidelines = ['ada', 'usp'];

for (const g of guidelines) {
  currentGuideline = g;
  for (const ga of glicAnteriores) {
    for (const gat of glicAtuais) {
      for (const ph of phs) {
        for (const bic of bics) {
          for (const k of ks) {
            for (const min of tempos) {
              totalTestes++;
              const state = { glic: ga, ph: 7.1, bic: 12, k: 4.0, na: 138, naCorr: 140, solNum: 3, bombaMlh: 8 };
              const r = computeConducts(state, 80, gat, ph, bic, k, min);

              // CHECK 1: duplicatas
              const textos = r.conducts.map(c => c.replace(/[0-9.]/g,'').trim());
              const seen = {};
              for (let i=0;i<r.conducts.length;i++){
                const key = r.conducts[i];
                if (seen[key]) {
                  problemas.push(`DUP [${g}] ga=${ga} gat=${gat} ph=${ph} bic=${bic} k=${k} min=${min}: "${key}"`);
                }
                seen[key] = true;
              }

              // CHECK 2: contradição bomba (duas instruções de bomba diferentes)
              const bombaLinhas = r.conducts.filter(c => /bomba/i.test(c) && /(Manter|Dobrar|Reduzir|PAUSAR)/.test(c));
              if (bombaLinhas.length > 1) {
                problemas.push(`BOMBA-CONFLITO [${g}] gat=${gat} k=${k}: ${bombaLinhas.join(' || ')}`);
              }

              // CHECK 3: contradição KCl (manter solução com KCl + mandar sem KCl)
              const t = getThresholds();
              if (k > t.kHigh) {
                const temSolComKCl = r.conducts.some(c => /Solucao [1357]/.test(c));
                if (temSolComKCl) {
                  problemas.push(`KCL-CONFLITO [${g}] K alto=${k} mas solucao com KCl: ${r.conducts.filter(c=>/Solucao/.test(c)).join(', ')}`);
                }
              }

              // CHECK 4: K crítico DEVE pausar bomba
              if (k < t.kPause) {
                const pausou = r.conducts.some(c => /PAUSAR bomba/.test(c));
                const resolveu = r.title === 'RESOLUCAO';
                if (!pausou && !resolveu) {
                  problemas.push(`K-CRITICO-SEM-PAUSA [${g}] k=${k} gat=${gat}: ${r.conducts.join(' | ')}`);
                }
              }

              // CHECK 5: bomba nunca 0 (exceto pausa por K)
              const bombaZero = r.conducts.some(c => /-> 0 mL\/h|em 0 mL\/h/.test(c));
              if (bombaZero && k >= t.kPause) {
                problemas.push(`BOMBA-ZERO [${g}] k=${k} gat=${gat}: ${r.conducts.join(' | ')}`);
              }

              // CHECK 6: resolução não deve ter dobrar/reduzir bomba
              if (r.title === 'RESOLUCAO') {
                const temAjusteBomba = r.conducts.some(c => /Dobrar|Reduzir/.test(c));
                if (temAjusteBomba) {
                  problemas.push(`RESOLUCAO-COM-AJUSTE [${g}] gat=${gat}: ${r.conducts.join(' | ')}`);
                }
              }
            }
          }
        }
      }
    }
  }
}

console.log(`Total de testes: ${totalTestes}`);
console.log(`Problemas encontrados: ${problemas.length}`);
if (problemas.length > 0) {
  // mostra os tipos únicos de problema
  const tipos = {};
  problemas.forEach(p => { const tipo = p.split(' ')[0]; tipos[tipo] = (tipos[tipo]||0)+1; });
  console.log('\nResumo por tipo:');
  Object.entries(tipos).forEach(([t,c]) => console.log(`  ${t}: ${c}`));
  console.log('\nPrimeiros 15 exemplos:');
  problemas.slice(0,15).forEach(p => console.log('  ' + p));
} else {
  console.log('\n✅ NENHUM PROBLEMA — todos os cenários passaram');
}

// ===== TESTES DE ADERÊNCIA CLÍNICA (valores específicos) =====
console.log('\n\n===== TESTES CLÍNICOS ESPECÍFICOS =====');
const clin = [];

function testar(desc, cond) { if (!cond) clin.push('❌ ' + desc); else console.log('✅ ' + desc); }

// Cenário 1: ADA, glic caiu de 400 pra 350 em 1h (queda 50 = na meta), K 4.5
currentGuideline = 'ada';
let st = { glic: 400, ph: 7.1, bic: 12, k: 4.5, na: 138, naCorr: 140, solNum: 1, bombaMlh: 8 };
let r = computeConducts(st, 80, 350, 7.1, 12, 4.5, 60);
testar('ADA queda 50/h = meta (mantém bomba)', r.conducts.some(c=>/Manter bomba em 8/.test(c)));

// Cenário 2: ADA, queda só 30/h (lenta) → dobra
r = computeConducts(st, 80, 370, 7.1, 12, 4.5, 60);
testar('ADA queda 30/h = lenta (dobra bomba 8->16)', r.conducts.some(c=>/Dobrar bomba: 8 -> 16/.test(c)));

// Cenário 3: ADA, queda 100/h (rápida) → reduz 50%
r = computeConducts(st, 80, 300, 7.1, 12, 4.5, 60);
testar('ADA queda 100/h = rápida (reduz 8->4)', r.conducts.some(c=>/Reduzir bomba 50%: 8 -> 4/.test(c)));

// Cenário 4: K 3.2 (< 3.5 ADA) → pausa bomba
r = computeConducts(st, 80, 350, 7.1, 12, 3.2, 60);
testar('ADA K 3.2 < 3.5 → PAUSA bomba', r.conducts.some(c=>/PAUSAR bomba/.test(c)));
testar('ADA K 3.2 → repor 20-30 (não 20-40, pois >3.0)', r.conducts.some(c=>/Repor KCl 20-30/.test(c)));

// Cenário 5: K 2.8 (< 3.0) → dose alta 20-40
r = computeConducts(st, 80, 350, 7.1, 12, 2.8, 60);
testar('ADA K 2.8 < 3.0 → repor 20-40 (dose alta)', r.conducts.some(c=>/Repor KCl 20-40/.test(c)));

// Cenário 6: USP, K 3.4 (entre 3.3 e 3.5) → NÃO pausa (USP corte é 3.3)
currentGuideline = 'usp';
r = computeConducts(st, 80, 350, 7.1, 12, 3.4, 60);
testar('USP K 3.4 > 3.3 → NÃO pausa bomba', !r.conducts.some(c=>/PAUSAR bomba/.test(c)));

// Cenário 7: ADA, K 3.4 (< 3.5) → pausa (ADA corte 3.5)
currentGuideline = 'ada';
r = computeConducts(st, 80, 350, 7.1, 12, 3.4, 60);
testar('ADA K 3.4 < 3.5 → PAUSA bomba', r.conducts.some(c=>/PAUSAR bomba/.test(c)));

// Cenário 8: K 5.2 (> 5.0 ADA) → sem KCl, solução sem KCl
r = computeConducts(st, 80, 350, 7.1, 12, 5.2, 60);
testar('ADA K 5.2 > 5.0 → Sem KCl', r.conducts.some(c=>/Sem KCl/.test(c)));
testar('ADA K 5.2 → solução SEM KCl (par)', r.conducts.some(c=>/Solucao [2468]/.test(c)) && !r.conducts.some(c=>/Solucao [1357]/.test(c)));

// Cenário 9: glic cruza 200 (ADA threshold) → troca pra SG
r = computeConducts({glic:250,ph:7.1,bic:12,k:4.5,na:138,naCorr:140,solNum:3,bombaMlh:8}, 80, 180, 7.1, 12, 4.5, 60);
testar('ADA glic 180 < 200 → solução com SG (5-8)', r.conducts.some(c=>/Solucao [5678]/.test(c)));

// Cenário 10: resolução ADA (glic<200, pH>=7.3 OU bic>=18)
r = computeConducts(st, 80, 180, 7.35, 16, 4.5, 60);
testar('ADA resolução (glic 180, pH 7.35) → RESOLUCAO', r.title === 'RESOLUCAO');
testar('ADA resolução → tem NPH/Glargina', r.conducts.some(c=>/NPH\/Glargina/.test(c)));
testar('ADA resolução → NÃO tem dobrar bomba', !r.conducts.some(c=>/Dobrar/.test(c)));

// Cenário 11: USP resolução exige pH>=7.3 E bic>=18 (não OU)
currentGuideline = 'usp';
r = computeConducts(st, 80, 180, 7.35, 16, 4.5, 60); // bic 16 < 18 → NÃO resolve em USP
testar('USP glic 180 + pH 7.35 + bic 16 → NÃO resolve (exige bic>=18)', r.title !== 'RESOLUCAO');
r = computeConducts(st, 80, 180, 7.35, 18, 4.5, 60); // bic 18 → resolve
testar('USP glic 180 + pH 7.35 + bic 18 → RESOLVE', r.title === 'RESOLUCAO');

// Cenário 12: bicarbonato ADA pH < 7.0
currentGuideline = 'ada';
r = computeConducts(st, 80, 350, 6.8, 8, 4.5, 60);
testar('ADA pH 6.8 < 7.0 → sugere bicarbonato', r.conducts.some(c=>/Bicarbonato/.test(c)));
r = computeConducts(st, 80, 350, 7.1, 12, 4.5, 60);
testar('ADA pH 7.1 > 7.0 → NÃO sugere bicarbonato', !r.conducts.some(c=>/Bicarbonato/.test(c)));

// Cenário 13: glic refratária (subiu)
r = computeConducts(st, 80, 450, 7.1, 12, 4.5, 60);
testar('Glic subiu 400->450 → refratária (dobra + investigar)', r.title==='REFRATARIA' && r.conducts.some(c=>/Dobrar/.test(c)));
testar('Refratária → reavaliar volemia', r.conducts.some(c=>/volemia/.test(c)));

// Cenário 14: sempre tem próxima gaso (exceto resolução)
r = computeConducts(st, 80, 350, 7.1, 12, 4.5, 60);
testar('Conduta normal sempre tem próxima gaso', r.conducts.some(c=>/Proxima gasometria/.test(c)));

console.log(`\nTestes clínicos: ${clin.length === 0 ? 'TODOS PASSARAM ✅' : clin.length + ' FALHARAM'}`);
clin.forEach(c => console.log(c));
