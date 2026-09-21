/**
 * Liberação progressiva dos recursos.
 *
 * POR QUE ISTO EXISTE
 *
 * Um gráfico com dois pontos não é um gráfico, é um enfeite. A auditoria do
 * diagnóstico comportamental (`npm run auditar:scoring`) mediu o problema:
 * com 1 a 3 interações registradas, o Poder geral oscila cerca de 9 pontos
 * entre históricos do MESMO perfil de comportamento. Ou seja, o número muda
 * por acaso, não por conduta. Só a partir de ~20 interações o desvio cai
 * abaixo de 6 pontos.
 *
 * Mostrar esses números cedo demais não é neutro: o produto promete leitura
 * do comportamento, e entregar ruído como diagnóstico gasta a confiança que
 * é o ativo principal. Melhor dizer "ainda não dá" e explicar o que falta.
 *
 * O EFEITO COLATERAL É BOM
 *
 * Isso transforma a evolução num percurso: cada recurso novo aparece quando
 * passa a ser confiável, e o usuário vê o que falta para o próximo. É
 * progressão honesta — nada é escondido para forçar uso, os limiares saem da
 * estatística.
 *
 * NÃO CONFUNDIR COM PLANO. Limite de plano é comercial e vive em plans.ts.
 * Aqui é só maturidade de dado, e vale igual para quem paga e quem não paga.
 */

export type RecursoId =
  | "metricas_alvo"
  | "linha_encantamento"
  | "funil"
  | "diagnostico"
  | "prova_social"
  | "analytics_conversao"
  | "kanban";

export interface DadosProgresso {
  /** Pessoas ativas cadastradas. */
  alvos: number;
  /** Interações registradas no total. */
  interacoes: number;
  /** Maior número de interações numa mesma pessoa. */
  maiorHistorico: number;
  /** Transições de fase já registradas. */
  transicoes: number;
}

export interface Requisito {
  alvos?: number;
  interacoes?: number;
  maiorHistorico?: number;
  transicoes?: number;
}

export interface Recurso {
  id: RecursoId;
  nome: string;
  requisito: Requisito;
  /** Por que este limiar, em uma frase que o usuário entende. */
  porque: string;
}

export const RECURSOS: Record<RecursoId, Recurso> = {
  metricas_alvo: {
    id: "metricas_alvo",
    nome: "Métricas da pessoa",
    requisito: { maiorHistorico: 3 },
    porque: "As métricas partem de valores iniciais e só significam algo depois de algumas interações registradas.",
  },
  linha_encantamento: {
    id: "linha_encantamento",
    nome: "Linha de encantamento",
    requisito: { maiorHistorico: 5 },
    porque: "Uma linha precisa de pontos suficientes para mostrar direção, e não apenas dois traços soltos.",
  },
  funil: {
    id: "funil",
    nome: "Funil de conquista",
    requisito: { alvos: 2 },
    porque: "Um funil com uma pessoa só é uma linha. Ele compara em que ponto cada uma está.",
  },
  diagnostico: {
    id: "diagnostico",
    nome: "Diagnóstico comportamental",
    requisito: { interacoes: 20 },
    porque: "Foi medido: abaixo de 20 registros o diagnóstico muda sozinho a cada interação nova. Seria chute com cara de número.",
  },
  prova_social: {
    id: "prova_social",
    nome: "Índice de prova social",
    requisito: { alvos: 3 },
    porque: "Esta dimensão mede não depender de uma pessoa só — ela precisa de mais de uma para existir.",
  },
  analytics_conversao: {
    id: "analytics_conversao",
    nome: "Análise de conversão",
    requisito: { alvos: 3, transicoes: 3 },
    porque: "Taxa de conversão exige histórico de mudanças de fase. Sem transições registradas não há o que dividir.",
  },
  kanban: {
    id: "kanban",
    nome: "Quadro de gestão",
    requisito: { alvos: 2 },
    porque: "O quadro serve para mover pessoas entre fases. Com uma só, a lista já basta.",
  },
};

export interface EstadoRecurso {
  liberado: boolean;
  /** 0 a 1 — o pior dos requisitos, que é o que trava. */
  progresso: number;
  /** O que falta, em linguagem de usuário. Vazio quando liberado. */
  falta: string[];
  porque: string;
}

const ROTULOS: Record<keyof Requisito, (n: number) => string> = {
  alvos: (n) => `${n} ${n === 1 ? "pessoa cadastrada" : "pessoas cadastradas"}`,
  interacoes: (n) => `${n} ${n === 1 ? "interação registrada" : "interações registradas"}`,
  maiorHistorico: (n) => `${n} ${n === 1 ? "interação" : "interações"} com a mesma pessoa`,
  transicoes: (n) => `${n} ${n === 1 ? "mudança de fase" : "mudanças de fase"}`,
};

export function avaliarRecurso(id: RecursoId, dados: DadosProgresso): EstadoRecurso {
  const recurso = RECURSOS[id];
  const falta: string[] = [];
  let pior = 1;

  for (const [chave, exigido] of Object.entries(recurso.requisito) as Array<
    [keyof Requisito, number]
  >) {
    const atual = dados[chave] ?? 0;
    const razao = Math.min(1, atual / exigido);
    if (razao < pior) pior = razao;
    if (atual < exigido) {
      falta.push(`${ROTULOS[chave](exigido)} (você tem ${atual})`);
    }
  }

  return {
    liberado: falta.length === 0,
    progresso: pior,
    falta,
    porque: recurso.porque,
  };
}

/** Recursos ainda travados, do mais próximo de liberar para o mais distante. */
export function proximosRecursos(
  dados: DadosProgresso,
  quantos = 3
): Array<{ recurso: Recurso; estado: EstadoRecurso }> {
  return (Object.keys(RECURSOS) as RecursoId[])
    .map((id) => ({ recurso: RECURSOS[id], estado: avaliarRecurso(id, dados) }))
    .filter((r) => !r.estado.liberado)
    .sort((a, b) => b.estado.progresso - a.estado.progresso)
    .slice(0, quantos);
}

/** Resume o estado a partir do que o cliente já tem em mãos. */
export function medirProgresso(
  contatos: Array<{ id: string; status: string }>,
  interacoes: Array<{ contactId: string }>,
  transicoes: Array<unknown> = []
): DadosProgresso {
  const porContato = new Map<string, number>();
  for (const i of interacoes) {
    porContato.set(i.contactId, (porContato.get(i.contactId) ?? 0) + 1);
  }

  return {
    alvos: contatos.filter((c) => c.status === "active").length,
    interacoes: interacoes.length,
    maiorHistorico: porContato.size ? Math.max(...porContato.values()) : 0,
    transicoes: transicoes.length,
  };
}
