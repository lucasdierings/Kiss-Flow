/**
 * Auditoria do quiz de arquétipo.
 *
 * Responde a uma pergunta simples: o quiz consegue produzir os nove
 * arquétipos com chances parecidas, ou existe um que sai quase sempre?
 *
 * A versão de 10 perguntas dava 29,1% de "Estrela" contra 2,5% de
 * "Encantador" — 11,6 vezes de diferença, qualquer que fosse a resposta. Como
 * o arquétipo alimenta a persona da IA e o scoring, o viés contaminava tudo
 * o que vem depois.
 *
 * Uso:  node --experimental-strip-types scripts/auditar-quiz.mjs
 *       (ou `npm run auditar:quiz`)
 *
 * Importa o módulo de verdade em vez de ler o texto do arquivo: uma versão
 * anterior analisava o código-fonte e não enxergava a rotação aplicada em
 * tempo de carga, chegando a uma conclusão errada.
 *
 * Sai com código 1 se o equilíbrio se perder.
 */

import { QUIZ_QUESTIONS, calculateArchetype } from "../src/lib/archetype-quiz.ts";

const NOMES = {
  siren: "Sereia", rake: "Libertino", ideal_lover: "Amante Ideal",
  dandy: "Dandi", natural: "Natural", coquette: "Coquete",
  charmer: "Encantador", charismatic: "Carismático", star: "Estrela",
};
const ARQ = Object.keys(NOMES);

// Ideal: 11,1% para cada um dos nove.
const MIN_PCT = 7;
const MAX_PCT = 16;
const MAX_RAZAO = 2.0;
const AMOSTRAS = 300_000;

const nOpcoes = QUIZ_QUESTIONS.map((q) => q.options.length);
const combinacoes = nOpcoes.reduce((a, b) => a * b, 1);
const problemas = [];

console.log(`Perguntas: ${QUIZ_QUESTIONS.length}`);
console.log(`Opções por pergunta: ${[...new Set(nOpcoes)].join(", ")}`);

/* 1. Equilíbrio estrutural ------------------------------------------------ */

const comoDominante = Object.fromEntries(ARQ.map((a) => [a, 0]));
const pontosTotais = Object.fromEntries(ARQ.map((a) => [a, 0]));

for (const q of QUIZ_QUESTIONS) {
  for (const o of q.options) {
    comoDominante[o.primary] += 1;
    for (const [arq, pts] of Object.entries(o.scores)) {
      pontosTotais[arq] = (pontosTotais[arq] ?? 0) + pts;
    }
  }
}

console.log("\nEquilíbrio estrutural");
console.log("  arquétipo        dominante  pontos disponíveis");
for (const a of ARQ) {
  console.log(
    `  ${NOMES[a].padEnd(15)} ${String(comoDominante[a]).padStart(6)} ${String(pontosTotais[a]).padStart(18)}`
  );
}

const distintos = new Set(Object.values(pontosTotais));
if (distintos.size !== 1) {
  problemas.push(`totais de pontos diferentes entre arquétipos: ${[...distintos].sort((a, b) => a - b).join(", ")}`);
} else {
  console.log(`  -> todos com ${[...distintos][0]} pontos disponíveis`);
}

/* 2. Distribuição de resultados ------------------------------------------- */

const respostasDe = (escolhas) =>
  Object.fromEntries(QUIZ_QUESTIONS.map((q, i) => [q.id, escolhas[i]]));

const vitorias = Object.fromEntries(ARQ.map((a) => [a, 0]));
const forcaBruta = combinacoes <= 2_000_000;
let avaliadas = 0;

if (forcaBruta) {
  const idx = new Array(QUIZ_QUESTIONS.length).fill(0);
  for (;;) {
    vitorias[calculateArchetype(respostasDe(idx)).primary] += 1;
    avaliadas += 1;
    let i = QUIZ_QUESTIONS.length - 1;
    while (i >= 0 && ++idx[i] >= nOpcoes[i]) { idx[i] = 0; i -= 1; }
    if (i < 0) break;
  }
} else {
  const idx = new Array(QUIZ_QUESTIONS.length).fill(0);
  for (let n = 0; n < AMOSTRAS; n++) {
    for (let q = 0; q < QUIZ_QUESTIONS.length; q++) {
      idx[q] = Math.floor(Math.random() * nOpcoes[q]);
    }
    vitorias[calculateArchetype(respostasDe(idx)).primary] += 1;
    avaliadas += 1;
  }
}

console.log(
  `\nDistribuição (${forcaBruta ? "todas as" : "amostra de"} ${avaliadas.toLocaleString("pt-BR")} de ${combinacoes.toLocaleString("pt-BR")} combinações)`
);

const pct = Object.fromEntries(ARQ.map((a) => [a, (vitorias[a] / avaliadas) * 100]));
for (const a of [...ARQ].sort((x, y) => pct[y] - pct[x])) {
  console.log(`  ${NOMES[a].padEnd(15)} ${pct[a].toFixed(1).padStart(5)}%  ${"█".repeat(Math.round(pct[a]))}`);
}

const maior = Math.max(...Object.values(pct));
const menor = Math.min(...Object.values(pct));
const razao = maior / menor;

console.log(`\n  ideal: 11,1% cada`);
console.log(`  faixa: ${menor.toFixed(1)}% a ${maior.toFixed(1)}%   razão: ${razao.toFixed(2)}x`);

for (const a of ARQ) {
  if (pct[a] < MIN_PCT) problemas.push(`${NOMES[a]} raro demais (${pct[a].toFixed(1)}%, mínimo ${MIN_PCT}%)`);
  if (pct[a] > MAX_PCT) problemas.push(`${NOMES[a]} frequente demais (${pct[a].toFixed(1)}%, máximo ${MAX_PCT}%)`);
}
if (razao > MAX_RAZAO) problemas.push(`razão ${razao.toFixed(2)}x acima do limite de ${MAX_RAZAO}x`);

/* 3. Resposta uniforme ----------------------------------------------------- */
/* Quem só clica na mesma posição não pode receber sempre o mesmo diagnóstico.
   Antes da rotação das opções, isso dava empate perfeito entre os nove e o
   desempate entregava "Sereia" a todo mundo. */

console.log("\nResposta uniforme (quem só clica na mesma posição)");
const uniformes = [];
for (let pos = 0; pos < Math.max(...nOpcoes); pos++) {
  const escolhas = QUIZ_QUESTIONS.map((q) => Math.min(pos, q.options.length - 1));
  const r = calculateArchetype(respostasDe(escolhas)).primary;
  uniformes.push(r);
  console.log(`  sempre a opção ${pos + 1}: ${NOMES[r]}`);
}
if (new Set(uniformes).size === 1) {
  problemas.push(`resposta uniforme resulta sempre em ${NOMES[uniformes[0]]}, em qualquer posição`);
}

/* Resultado ---------------------------------------------------------------- */

if (problemas.length) {
  console.error("\nFALHA:");
  for (const p of problemas) console.error(`  - ${p}`);
  process.exit(1);
}

console.log("\nOK: quiz equilibrado.");
