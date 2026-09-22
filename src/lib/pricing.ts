/**
 * Custo de IA e conversão para créditos.
 *
 * POR QUE ISTO EXISTE
 *
 * `usage_events` tinha `tokens_in` e `tokens_out` desde a migração e **nada
 * os preenchia**. Sem eles não havia custo por análise nem por usuário — e
 * "custo estimado por análise" é um dos critérios de instrumentação do Gate 0.
 * Pior: sem medir, o preço do crédito seria chute, e a margem de um plano de
 * assinatura é justamente a diferença entre o que se cobra e o que se gasta.
 *
 * COMO O CRÉDITO É COBRADO
 *
 * Uma análise custa **1 crédito**, desde que caiba na franquia de tokens. Não
 * é por token direto, e isso é deliberado: o usuário precisa conseguir prever
 * o que vai gastar. "Sua análise custou 2,7 créditos" é uma péssima frase.
 *
 * Acima da franquia, cobra-se proporcionalmente — é o caso raro de quem cola
 * um histórico gigante, e que sem teto sairia caro para nós.
 *
 * O custo em dinheiro é registrado SEMPRE, independente de quantos créditos
 * foram debitados. É com esse número que se descobre se o preço do crédito
 * está certo.
 */

/**
 * Preço por milhão de tokens, em dólar.
 *
 * ATENÇÃO: confira na tabela oficial antes de usar para decidir preço de
 * venda. O Google muda valores e aposenta modelos — já aconteceu neste
 * projeto, com o `gemini-2.0-flash` respondendo 404 do nada. Estes números
 * são ponto de partida para o cálculo, não verdade contratual.
 *
 * https://ai.google.dev/pricing
 */
export interface PrecoModelo {
  entradaPorMilhao: number;
  saidaPorMilhao: number;
}

const PRECO_PADRAO: PrecoModelo = { entradaPorMilhao: 0.3, saidaPorMilhao: 2.5 };

const PRECOS: Record<string, PrecoModelo> = {
  "gemini-flash-latest": { entradaPorMilhao: 0.3, saidaPorMilhao: 2.5 },
  "gemini-3-flash-preview": { entradaPorMilhao: 0.3, saidaPorMilhao: 2.5 },
  "gemini-3.5-flash": { entradaPorMilhao: 0.3, saidaPorMilhao: 2.5 },
  "gemini-3.1-flash-lite": { entradaPorMilhao: 0.1, saidaPorMilhao: 0.4 },
};

/** Modelo desconhecido cai no preço mais caro conhecido, para não subestimar. */
export function precoDoModelo(modelo: string): PrecoModelo {
  return PRECOS[modelo] ?? PRECO_PADRAO;
}

/** Custo em dólar de uma chamada. */
export function custoEmDolar(
  modelo: string,
  tokensEntrada: number,
  tokensSaida: number
): number {
  const p = precoDoModelo(modelo);
  return (
    (tokensEntrada / 1_000_000) * p.entradaPorMilhao +
    (tokensSaida / 1_000_000) * p.saidaPorMilhao
  );
}

/** Guardado como inteiro em micro-dólares: `REAL` acumularia erro na soma. */
export function emMicroDolares(dolares: number): number {
  return Math.round(dolares * 1_000_000);
}

/**
 * Franquia de tokens de 1 crédito.
 *
 * Uma análise típica gasta por volta de 2 a 4 mil tokens (prompt do mentor +
 * anotações + resposta). O teto de 20 mil dá folga larga para conversas
 * longas e só é ultrapassado por quem cola um histórico realmente grande.
 */
export const TOKENS_POR_CREDITO = 20_000;

/** Nenhuma chamada custa menos de 1 crédito, mesmo se falhar rápido. */
export const CREDITO_MINIMO = 1;

/**
 * Quantos créditos uma chamada realmente custou.
 *
 * Entrada e saída são somadas sem peso porque o crédito é uma unidade de
 * franquia, não de custo: o peso real (saída é mais cara) já está em
 * `custoEmDolar`, que é o que orienta o preço.
 */
export function creditosDaChamada(tokensEntrada: number, tokensSaida: number): number {
  const total = tokensEntrada + tokensSaida;
  return Math.max(CREDITO_MINIMO, Math.ceil(total / TOKENS_POR_CREDITO));
}

export function formatarDolar(valor: number): string {
  return valor < 0.01 ? `US$ ${valor.toFixed(5)}` : `US$ ${valor.toFixed(2)}`;
}
