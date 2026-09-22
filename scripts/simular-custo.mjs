/**
 * Simulador de custo e margem.
 *
 * Responde três perguntas que só o número responde:
 *   1. Quantos créditos cada tipo de análise consome?
 *   2. Quanto ela custa de verdade em API?
 *   3. A margem do plano e dos pacotes fecha?
 *
 * Uso: npm run simular:custo
 *
 * Os preços em src/lib/pricing.ts são ponto de partida — confira a tabela
 * oficial do Google antes de decidir preço de venda.
 */

import {
  CREDITO_MINIMO,
  TOKENS_POR_CREDITO,
  creditosDaChamada,
  custoEmDolar,
  formatarDolar,
} from "../src/lib/pricing.ts";
import { CREDIT_PACKS, PLAN_INFO, PLAN_LIMITS } from "../src/lib/plans.ts";

const DOLAR = 5.87; // câmbio de referência; ajuste ao simular
const MODELO = "gemini-flash-latest";

console.log(`Franquia: ${TOKENS_POR_CREDITO.toLocaleString("pt-BR")} tokens = ${CREDITO_MINIMO} crédito`);
console.log(`Modelo: ${MODELO} · câmbio de referência US$ 1 = R$ ${DOLAR}\n`);

const CENARIOS = [
  ["análise curta", 1200, 400],
  ["análise típica", 2800, 700],
  ["conversa longa", 9000, 1500],
  ["histórico grande", 24000, 2000],
  ["colou tudo", 60000, 3000],
];

console.log("cenário             entrada   saída    total  créditos    custo real");
let tipico = 0;
for (const [nome, ein, sai] of CENARIOS) {
  const cr = creditosDaChamada(ein, sai);
  const usd = custoEmDolar(MODELO, ein, sai);
  if (nome === "análise típica") tipico = usd;
  console.log(
    `  ${nome.padEnd(17)} ${String(ein).padStart(6)} ${String(sai).padStart(7)} ${String(ein + sai).padStart(8)} ${String(cr).padStart(9)}    ${formatarDolar(usd)}`
  );
}

const custoTipicoBrl = tipico * DOLAR;
console.log(`\nUma análise típica custa R$ ${custoTipicoBrl.toFixed(4)} em API.\n`);

console.log("Pacotes de crédito");
console.log("  pacote        créditos    preço   por crédito   margem");
for (const p of CREDIT_PACKS) {
  const preco = p.precoCentavos / 100;
  const porCredito = preco / p.creditos;
  const margem = ((porCredito - custoTipicoBrl) / porCredito) * 100;
  console.log(
    `  ${p.nome.padEnd(12)} ${String(p.creditos).padStart(8)}  R$ ${preco.toFixed(2).padStart(6)}   R$ ${porCredito.toFixed(4)}    ${margem.toFixed(1)}%`
  );
}

console.log("\nPlano Pro — pior caso (usuário consome a franquia inteira)");
const analisesPro = PLAN_LIMITS.premium.monthly.ai_analysis;
const precoPro = PLAN_INFO.premium.precoCentavos / 100;
const custoPro = custoTipicoBrl * analisesPro;
console.log(`  ${analisesPro} análises × R$ ${custoTipicoBrl.toFixed(4)} = R$ ${custoPro.toFixed(2)}`);
console.log(`  preço do plano: R$ ${precoPro.toFixed(2)}`);
console.log(`  margem no pior caso: ${(((precoPro - custoPro) / precoPro) * 100).toFixed(1)}%`);

const analisesParaZerar = Math.floor(precoPro / custoTipicoBrl);
console.log(`  o plano só empata em ${analisesParaZerar.toLocaleString("pt-BR")} análises/mês`);

console.log("\nPlano gratuito — quanto bancamos por usuário");
const analisesFree = PLAN_LIMITS.free.monthly.ai_analysis;
console.log(`  ${analisesFree} análises × R$ ${custoTipicoBrl.toFixed(4)} = R$ ${(custoTipicoBrl * analisesFree).toFixed(4)}/mês`);
console.log(`  1.000 usuários gratuitos ativos: R$ ${(custoTipicoBrl * analisesFree * 1000).toFixed(2)}/mês`);
