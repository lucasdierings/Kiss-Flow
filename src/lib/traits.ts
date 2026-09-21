/**
 * Traços observados do alvo — as seis "vulnerabilidades".
 *
 * REGRA CENTRAL: eixo não medido é lacuna, não é 50.
 *
 * Antes os seis eixos eram colunas em `contacts` com padrão 50, e nada nunca
 * os atualizava. O radar desenhava um hexágono cheio que parecia diagnóstico
 * e era só o valor inicial do sistema. Meio da escala não significa "médio":
 * significa "ninguém olhou".
 *
 * COMO UM TRAÇO PASSA A EXISTIR
 *
 *  1. Declarado — o usuário afirma. Confiança 1, vale até ele mudar.
 *  2. Inferido — a IA lê as notas das interações e propõe, com confiança e
 *     a evidência que usou. Nunca sobrescreve o declarado.
 *
 * COM QUE FREQUÊNCIA MUDA
 *
 * Declarado muda quando o usuário quiser. Inferido é recalculado sob pedido,
 * e só faz sentido pedir quando há material novo — por isso a interface exige
 * um mínimo de interações com notas desde a última leitura. Reinferir a cada
 * registro gastaria cota e faria o radar tremer sem o comportamento ter
 * mudado, que é o mesmo defeito do diagnóstico oscilando com pouco dado.
 *
 * ENVELHECIMENTO
 *
 * Um traço inferido há 40 interações descreve outra fase do relacionamento.
 * `observedAt` permite mostrar a idade do dado, e a interface avisa quando
 * está velho em vez de apresentá-lo como atual.
 */

export const EIXOS = [
  { id: "fantasy", nome: "Fantasia", desc: "Busca escapar do comum, se encanta com o que promete grandeza" },
  { id: "snobbery", nome: "Esnobismo", desc: "Valoriza status, exclusividade e ser vista com quem se destaca" },
  { id: "loneliness", nome: "Solidão", desc: "Sente falta de companhia e presença constante" },
  { id: "ego", nome: "Ego", desc: "Precisa de reconhecimento e admiração explícita" },
  { id: "adventure", nome: "Aventura", desc: "Se entedia com rotina, responde a novidade e risco" },
  { id: "rebellion", nome: "Rebeldia", desc: "Atraída pelo proibido e por quem foge das convenções" },
] as const;

export type EixoId = (typeof EIXOS)[number]["id"];

export type OrigemTraco = "declarado" | "inferido";

export interface Traco {
  axis: EixoId;
  value: number;
  source: OrigemTraco;
  confidence: number;
  evidence?: string | null;
  observedAt: string;
}

/** Quantas interações com nota exigimos antes de oferecer nova inferência. */
export const MINIMO_PARA_INFERIR = 4;

/** A partir de quantas interações novas um traço inferido é considerado velho. */
export const INTERACOES_ATE_ENVELHECER = 15;

export interface EixoExibicao {
  id: EixoId;
  nome: string;
  desc: string;
  /** null = nunca medido. A interface mostra lacuna. */
  valor: number | null;
  origem: OrigemTraco | null;
  confianca: number | null;
  evidencia: string | null;
  envelhecido: boolean;
}

export function montarEixos(
  tracos: Traco[],
  interacoesAtuais: number,
  interacoesNoMomentoDaMedicao: Record<string, number> = {}
): EixoExibicao[] {
  const porEixo = new Map(tracos.map((t) => [t.axis, t]));

  return EIXOS.map((eixo) => {
    const t = porEixo.get(eixo.id);
    if (!t) {
      return {
        id: eixo.id,
        nome: eixo.nome,
        desc: eixo.desc,
        valor: null,
        origem: null,
        confianca: null,
        evidencia: null,
        envelhecido: false,
      };
    }

    const naMedicao = interacoesNoMomentoDaMedicao[eixo.id] ?? 0;
    return {
      id: eixo.id,
      nome: eixo.nome,
      desc: eixo.desc,
      valor: t.value,
      origem: t.source,
      confianca: t.confidence,
      evidencia: t.evidence ?? null,
      envelhecido:
        t.source === "inferido" &&
        interacoesAtuais - naMedicao >= INTERACOES_ATE_ENVELHECER,
    };
  });
}

/** Quantos eixos já têm medição — usado para decidir se o radar aparece. */
export function eixosMedidos(tracos: Traco[]): number {
  return new Set(tracos.map((t) => t.axis)).size;
}
