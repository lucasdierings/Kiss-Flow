/**
 * Auditoria do diagnóstico comportamental (src/lib/user-scoring.ts).
 *
 * Duas perguntas:
 *   1. Os scores realmente distinguem comportamentos diferentes, ou todo
 *      mundo fica perto de 50?
 *   2. A partir de quantas interações o diagnóstico para de oscilar?
 *
 * A resposta da segunda define os limiares de liberação dos gráficos: mostrar
 * um diagnóstico que muda de cara a cada registro novo é pior do que não
 * mostrar nada.
 *
 * Uso: npm run auditar:scoring
 */

import { registerHooks } from "node:module";

// O Node executa TypeScript direto, mas não completa a extensão de imports
// relativos sem ela — e user-scoring.ts importa um VALOR de "./types".
// Este gancho resolve "./types" como "./types.ts" só para esta auditoria,
// sem mexer no código da aplicação.
registerHooks({
  resolve(especificador, contexto, proximo) {
    if (especificador.startsWith(".") && !/\.[mc]?[jt]s$/.test(especificador)) {
      try {
        return proximo(especificador + ".ts", contexto);
      } catch {
        /* cai no comportamento padrão abaixo */
      }
    }
    return proximo(especificador, contexto);
  },
});

const { calculateUserScore } = await import("../src/lib/user-scoring.ts");

const CATEGORIAS = ["digital_passive", "digital_active", "presencial_casual", "presencial_intimate", "strategic"];
const TIPOS = ["story_view", "like_post", "dm_casual", "dm_deep", "voice_message", "silence", "bold_move", "triangle"];

let semente = 12345;
const rnd = () => (semente = (semente * 1103515245 + 12345) % 2147483648) / 2147483648;

/** Perfis de comportamento propositalmente distintos. */
const PERFIS = {
  carente: { iniciaPct: 0.92, silencio: 0.0, sentimento: 0.1, porDia: 6, diversidade: 0.2, alvos: 1 },
  equilibrado: { iniciaPct: 0.5, silencio: 0.08, sentimento: 0.4, porDia: 1, diversidade: 0.8, alvos: 3 },
  distante: { iniciaPct: 0.18, silencio: 0.25, sentimento: 0.2, porDia: 0.3, diversidade: 0.6, alvos: 4 },
};

function gerar(perfil, n) {
  const p = PERFIS[perfil];
  const interactions = [];
  const diasTotais = Math.max(1, Math.round(n / p.porDia));

  for (let i = 0; i < n; i++) {
    const ehSilencio = rnd() < p.silencio;
    const tipo = ehSilencio
      ? "silence"
      : TIPOS[Math.floor(rnd() * (p.diversidade * TIPOS.length)) % TIPOS.length];
    const data = new Date(Date.now() - (diasTotais - (i / n) * diasTotais) * 86400000);

    interactions.push({
      id: `i${i}`,
      contactId: "c1",
      typeId: tipo,
      category: CATEGORIAS[Math.floor(rnd() * (p.diversidade * CATEGORIAS.length)) % CATEGORIAS.length],
      sentiment: Math.max(-1, Math.min(1, p.sentimento + (rnd() - 0.5) * 0.5)),
      date: data.toISOString(),
      notes: "",
      initiatedByTarget: rnd() > p.iniciaPct,
    });
  }

  const contacts = Array.from({ length: p.alvos }, (_, k) => ({
    id: `c${k + 1}`, firstName: `Teste ${k + 1}`, lastName: "", primaryArchetype: "disappointed_dreamer",
    pipelineStage: "engajamento", status: "active", notes: "",
    mysteryCoefficient: 70, tensionLevel: 40, enchantmentScore: 0.2,
    victimScore: 30, scarcityScore: 60,
    vulnerabilities: { fantasy: 50, snobbery: 50, loneliness: 50, ego: 50, adventure: 50, rebellion: 50 },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }));

  return { contacts, interactions };
}

const DIMENSOES = ["mysteryMaintenance", "emotionalControl", "strategicPatience", "socialProofAwareness", "adaptability", "overallPower", "needinessIndex"];
const ROTULOS = {
  mysteryMaintenance: "Mistério", emotionalControl: "Controle",
  strategicPatience: "Paciência", socialProofAwareness: "Prova social",
  adaptability: "Adaptabilidade", overallPower: "Poder geral", needinessIndex: "Carência",
};

const TAMANHOS = [1, 3, 5, 8, 12, 20, 40];
const REPETICOES = 40;

/* 1. Os perfis são distinguidos? ------------------------------------------ */

console.log("1. O diagnóstico distingue comportamentos diferentes?");
console.log("   (média de 40 históricos por perfil, com 40 interações cada)\n");

const medias = {};
for (const perfil of Object.keys(PERFIS)) {
  medias[perfil] = Object.fromEntries(DIMENSOES.map((d) => [d, 0]));
  for (let r = 0; r < REPETICOES; r++) {
    const { contacts, interactions } = gerar(perfil, 40);
    const s = calculateUserScore(contacts, interactions, "charmer");
    for (const d of DIMENSOES) medias[perfil][d] += s[d] / REPETICOES;
  }
}

console.log("   dimensão         carente  equilibrado  distante   amplitude");
const amplitudes = {};
for (const d of DIMENSOES) {
  const vals = Object.keys(PERFIS).map((p) => medias[p][d]);
  const amp = Math.max(...vals) - Math.min(...vals);
  amplitudes[d] = amp;
  console.log(
    `   ${ROTULOS[d].padEnd(16)} ${vals.map((v) => v.toFixed(0).padStart(7)).join("  ")}   ${amp.toFixed(0).padStart(7)}`
  );
}

const inertes = DIMENSOES.filter((d) => amplitudes[d] < 10);
console.log(
  inertes.length
    ? `\n   ATENÇÃO: praticamente não reagem ao comportamento: ${inertes.map((d) => ROTULOS[d]).join(", ")}`
    : "\n   Todas as dimensões reagem ao comportamento."
);

/* 2. A partir de quantas interações estabiliza? ---------------------------- */

console.log("\n\n2. A partir de quantas interações o diagnóstico para de oscilar?");
console.log("   (desvio-padrão do Poder geral entre 40 históricos do MESMO perfil)\n");
console.log("   interações   carente  equilibrado  distante");

const estabilidade = {};
for (const n of TAMANHOS) {
  const linha = [];
  for (const perfil of Object.keys(PERFIS)) {
    const amostras = [];
    for (let r = 0; r < REPETICOES; r++) {
      const { contacts, interactions } = gerar(perfil, n);
      amostras.push(calculateUserScore(contacts, interactions, "charmer").overallPower);
    }
    const m = amostras.reduce((a, b) => a + b, 0) / amostras.length;
    const dp = Math.sqrt(amostras.reduce((a, b) => a + (b - m) ** 2, 0) / amostras.length);
    linha.push(dp);
  }
  estabilidade[n] = Math.max(...linha);
  console.log(`   ${String(n).padStart(9)}   ${linha.map((v) => v.toFixed(1).padStart(7)).join("  ")}`);
}

const LIMITE_DP = 6;
const estavelA = TAMANHOS.find((n) => estabilidade[n] <= LIMITE_DP);
console.log(
  `\n   Desvio aceitável (<= ${LIMITE_DP} pontos) a partir de ${estavelA ?? "nunca"} interações.`
);

/* 3. O que sai com pouquíssimo dado? -------------------------------------- */

console.log("\n\n3. O que o diagnóstico devolve com 1 e com 3 interações?\n");
for (const n of [1, 3]) {
  const { contacts, interactions } = gerar("equilibrado", n);
  const s = calculateUserScore(contacts, interactions, "charmer");
  console.log(`   com ${n} interação(ões): ${DIMENSOES.map((d) => `${ROTULOS[d]}=${s[d]}`).join("  ")}`);
}

/* 4. Dependência do número de alvos ---------------------------------------- */

console.log("\n\n4. Quanto cada dimensão muda só por ter mais alvos?");
console.log("   (mesmo comportamento, 40 interações, variando o número de alvos)\n");
console.log("   alvos    " + DIMENSOES.map((d) => ROTULOS[d].slice(0, 7).padStart(8)).join(""));

const porAlvos = {};
for (const nAlvos of [1, 2, 3, 5]) {
  const acc = Object.fromEntries(DIMENSOES.map((d) => [d, 0]));
  for (let r = 0; r < REPETICOES; r++) {
    const base = gerar("equilibrado", 40);
    const contacts = Array.from({ length: nAlvos }, (_, k) => ({ ...base.contacts[0], id: `c${k + 1}` }));
    const s = calculateUserScore(contacts, base.interactions, "charmer");
    for (const d of DIMENSOES) acc[d] += s[d] / REPETICOES;
  }
  porAlvos[nAlvos] = acc;
  console.log("   " + String(nAlvos).padEnd(8) + DIMENSOES.map((d) => acc[d].toFixed(0).padStart(8)).join(""));
}

console.log("\n\nCONCLUSÃO");
console.log(`  - dimensões inertes: ${inertes.length ? inertes.map((d) => ROTULOS[d]).join(", ") : "nenhuma"}`);
console.log(`  - estabiliza a partir de: ${estavelA ?? "nunca"} interações`);
