/**
 * Motor RAG (Retrieval-Augmented Generation) do Kiss Flow.
 *
 * Consolida o conhecimento de psicologia comportamental, dinâmica de atração,
 * escuta ativa, inteligência emocional e negociação social.
 *
 * REGRA FUNDAMENTAL DE MARCA:
 * NUNCA citar Robert Greene, nomes de livros ou fontes das estratégias.
 * Tratar os princípios como "Estratégia Comportamental Comprovada" ou "Inteligência Kiss Flow".
 */

export interface KnowledgeItem {
  id: string;
  category:
    | 'escuta'
    | 'clareza'
    | 'reciprocidade'
    | 'limites'
    | 'timing'
    | 'desapego'
    | 'empatia'
    | 'gestao_emocional'
    | 'escalada'
    | 'conflito';
  principleTitle: string;
  content: string;
  tacticalTip: string;
  riskLevel: 'baixo' | 'moderado' | 'alto';
}

export const KNOWLEDGE_BASE_ITEMS: KnowledgeItem[] = [
  {
    id: 'kb-1',
    category: 'escalada',
    principleTitle: 'Fechamento Progressivo e Transição de Canal',
    content:
      'Quando o contato responde com validação alta (risadas, emojis, entusiasmo), estender a conversa digital por dias sem propor avanço gera tédio e perda de tensão sexual/romântica. A transição para um café, drink ou almoço deve ser ancorada num assunto já mencionado.',
    tacticalTip:
      'Troque papo furado infinito por um convite leve com data e local sugeridos de forma despretensiosa.',
    riskLevel: 'baixo',
  },
  {
    id: 'kb-2',
    category: 'timing',
    principleTitle: 'Espelhamento de Cadência e Calibragem de Ausência',
    content:
      'Responder instantaneamente a quem demora horas ou dias comunica carência e excesso de disponibilidade. O valor percebido de uma pessoa é proporcional ao respeito que ela tem pelo próprio tempo.',
    tacticalTip:
      'Espelhe o tempo de resposta da outra pessoa. Se ela levou 4 horas, não responda em 30 segundos.',
    riskLevel: 'baixo',
  },
  {
    id: 'kb-3',
    category: 'desapego',
    principleTitle: 'O Silêncio Produtivo e o Recuo Estratégico',
    content:
      'Quando a interação esfria ou a pessoa não responde a uma pergunta, cobrar explicação ou mandar "e aí, sumiu?" destrói a atratividade. O silêncio calibrado restaura o mistério e força a outra pessoa a se perguntar sobre o motivo do afastamento.',
    tacticalTip:
      'Permaneça em silêncio absoluto por 48h a 72h. Não mande mensagens de cobrança.',
    riskLevel: 'baixo',
  },
  {
    id: 'kb-4',
    category: 'empatia',
    principleTitle: 'Validação Específica e Efeito Espelho',
    content:
      'Elogios clichês a atributos físicos são ignorados ou geram desconforto. Reconhecer algo único que a pessoa compartilhou (gosto musical, uma conquista, uma opinião diferente) gera conexão imediata.',
    tacticalTip:
      'Elogie a escolha, a energia ou a perspectiva da pessoa, nunca clichês óbvios.',
    riskLevel: 'baixo',
  },
  {
    id: 'kb-5',
    category: 'limites',
    principleTitle: 'Desarmamento do Não e Segurança Psicológica',
    content:
      'Dar à outra pessoa o direito explícito de recusar um convite reduz a ansiedade e aumenta dramaticamente a taxa de aceitação.',
    tacticalTip:
      'Adicione a saída honrosa: "Se sua semana estiver corrida, sem crise, marcamos quando você estiver mais tranquila(o)".',
    riskLevel: 'baixo',
  },
  {
    id: 'kb-6',
    category: 'conflito',
    principleTitle: 'Desescalada Assertiva sem Justificação Defensiva',
    content:
      'Responder a uma mensagem tensa ou ríspida com justificativas longas demonstra fraqueza e submissão. Uma resposta curta, calma e que valida o sentimento alheio sem se rebaixar neutraliza a agressividade.',
    tacticalTip:
      'Use a fórmula: "Entendo seu ponto. Vamos conversar com calma quando ambos estiverem com tempo."',
    riskLevel: 'moderado',
  },
];

/**
 * Busca os itens mais relevantes da base de conhecimento conforme a categoria
 * e termos da mensagem.
 */
export function retrieveKnowledgeChunks(
  contextCategory?: string,
  queryText?: string
): KnowledgeItem[] {
  if (!contextCategory && !queryText) {
    return KNOWLEDGE_BASE_ITEMS.slice(0, 3);
  }

  const matches = KNOWLEDGE_BASE_ITEMS.filter((item) => {
    if (contextCategory && item.category === contextCategory) return true;
    if (queryText) {
      const q = queryText.toLowerCase();
      return (
        item.content.toLowerCase().includes(q) ||
        item.principleTitle.toLowerCase().includes(q) ||
        item.tacticalTip.toLowerCase().includes(q)
      );
    }
    return false;
  });

  return matches.length > 0 ? matches.slice(0, 3) : KNOWLEDGE_BASE_ITEMS.slice(0, 3);
}

/**
 * Monta o prompt do sistema para Don Juan ou Cleópatra
 */
export function buildMentorSystemPrompt(
  mentor: 'donjuan' | 'cleopatra',
  userProfile: { name: string; gender: string; orientation?: string },
  target: {
    name: string;
    archetype: string;
    stage: string;
    mysteryScore: number;
    tensionScore: number;
    interestScore: number;
  },
  retrievedKnowledge: KnowledgeItem[]
): string {
  const personaIdentity =
    mentor === 'donjuan'
      ? `Você é Don Juan, o estrategista pessoal e mentor definitivo de conquistas masculinas. Seu tom é sofisticado, confiante, espirituoso, cirúrgico e direto ao ponto. Você enxerga as entrelinhas das mensagens femininas com precisão de mestre e ajuda o homem a nunca agir como carente ou previsível.`
      : `Você é Cleópatra, a estrategista pessoal e mentora suprema de magnetismo feminino e relacionamentos. Seu tom é magnético, elegante, sábio, intuitivo e soberano. Você ensina a mulher a manter o poder da dinâmica, controlar o ritmo e fazer a outra pessoa se encantar e tomar atitudes com respeito e desejo.`;

  const knowledgeContext = retrievedKnowledge
    .map(
      (k, idx) =>
        `[Princípio ${idx + 1}: ${k.principleTitle}]\nFundamento: ${k.content}\nDica de execução: ${k.tacticalTip}`
    )
    .join('\n\n');

  return `${personaIdentity}

DIRETRIZ DE IDENTIDADE:
- NUNCA se chame de "IA", "robô", "assistente virtual" ou "agente". Chame-se sempre pelo seu nome (${mentor === 'donjuan' ? 'Don Juan' : 'Cleópatra'}).
- NUNCA mencione Robert Greene, nomes de livros ou fontes teóricas.
- Responda em português fluente do Brasil, com acentuação impecável.

CONTEXTO DO USUÁRIO:
- Nome: ${userProfile.name}
- Gênero: ${userProfile.gender}

DOSSIÊ DO ALVO NO CRM:
- Nome do Alvo: ${target.name}
- Arquétipo do Alvo: ${target.archetype}
- Estágio no Funil: ${target.stage}
- Nível de Mistério: ${target.mysteryScore}%
- Termômetro de Tensão: ${target.tensionScore}%
- Interesse Percebido: ${target.interestScore}%

BASE DE CONHECIMENTO COMPORTAMENTAL (RAG):
${knowledgeContext}

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON puro, sem markdown fora do bloco json):
{
  "diagnosis": "Diagnóstico claro em 2 a 3 frases explicando o que a mensagem da pessoa realmente significa nas entrelinhas e qual o momento da dinâmica.",
  "options": [
    {
      "title": "Opção 1: Natural & Desafiadora",
      "text": "Mensagem exata pronta para copiar e enviar no WhatsApp."
    },
    {
      "title": "Opção 2: Espirituosa & Curta",
      "text": "Mensagem exata pronta para copiar e enviar no WhatsApp."
    },
    {
      "title": "Opção 3: Pausa & Desapego",
      "text": "Mensagem exata pronta para copiar e enviar no WhatsApp."
    }
  ],
  "principleApplied": "Explicação elegante de 1 frase sobre o princípio psicológico aplicado nesta jogada."
}`;
}
