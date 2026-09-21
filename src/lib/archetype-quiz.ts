// Quiz de classificação de arquétipo sedutor.

import type { SeducerArchetype } from "./types";

/**
 * HISTÓRICO — por que este arquivo foi reescrito (21/09/2026)
 *
 * A versão anterior tinha 10 perguntas com pontuação atribuída à mão, e o
 * resultado era enviesado. Simulando as 1.048.576 combinações possíveis de
 * respostas:
 *
 *   Estrela      29,1%        Natural       5,9%
 *   Coquete      17,5%        Carismático   4,5%
 *   Amante Ideal 12,5%        Encantador    2,5%
 *
 * Ou seja: 11,6 vezes mais chance de sair "Estrela" do que "Encantador",
 * qualquer que fosse a resposta. A causa era a distribuição desigual de
 * pontos — Estrela somava 38 pontos espalhados pelo quiz, Carismático 23.
 *
 * O arquétipo alimenta a persona da IA e o scoring do usuário, então esse
 * viés contaminava tudo o que vem depois.
 *
 * DESENHO ATUAL — equilíbrio por construção, não por ajuste fino
 *
 * 18 perguntas × 4 opções = 72 posições. Cada opção aponta um arquétipo
 * DOMINANTE (3 pontos) e um SECUNDÁRIO (1 ponto). Como 72/9 = 8, cada
 * arquétipo é dominante exatamente 8 vezes, e o secundário segue uma
 * permutação sem ponto fixo — logo, também 8 vezes cada.
 *
 * Total idêntico para os nove: 8×3 + 8×1 = 32 pontos disponíveis.
 *
 * Ao editar, rode `node scripts/auditar-quiz.mjs`. Ele refaz a medição e
 * falha se o equilíbrio se perder.
 */

/**
 * Traço secundário de cada dominante. É uma permutação sem ponto fixo: cada
 * arquétipo aparece como secundário exatamente uma vez, o que mantém a
 * contagem equilibrada sozinha. Os pares foram escolhidos por afinidade —
 * quem é magnético tende ao aura de ídolo, quem é obsessivo tende a se
 * moldar ao outro, e assim por diante.
 */
const SECUNDARIO: Record<SeducerArchetype, SeducerArchetype> = {
  siren: "star",
  star: "dandy",
  dandy: "coquette",
  coquette: "siren",
  rake: "ideal_lover",
  ideal_lover: "charmer",
  charmer: "natural",
  natural: "charismatic",
  charismatic: "rake",
};

export const PONTOS_DOMINANTE = 3;
export const PONTOS_SECUNDARIO = 1;

export interface QuizOption {
  text: string;
  /** Arquétipo que a resposta mais expressa. */
  primary: SeducerArchetype;
  scores: Partial<Record<SeducerArchetype, number>>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

/** Monta os pontos a partir do dominante, para o equilíbrio não depender de digitação. */
function opcao(text: string, primary: SeducerArchetype): QuizOption {
  return {
    text,
    primary,
    scores: {
      [primary]: PONTOS_DOMINANTE,
      [SECUNDARIO[primary]]: PONTOS_SECUNDARIO,
    },
  };
}

/**
 * Ordem das opções, embaralhada de forma determinística.
 *
 * As perguntas foram escritas seguindo a rotação dos nove arquétipos, o que
 * deixava a POSIÇÃO da opção correlacionada ao arquétipo. Quem respondesse
 * sempre "a primeira" acabava com exatamente 2 escolhas de cada um — empate
 * perfeito entre os nove — e o desempate caía na ordem de declaração, dando
 * "Sereia" para todo mundo.
 *
 * Girar as opções de cada pergunta desfaz o alinhamento sem mexer no
 * equilíbrio: os mesmos arquétipos continuam presentes, só mudam de lugar.
 *
 * O giro é fixo, e não aleatório, porque o índice da resposta é gravado em
 * `onboarding_answer`: sortear a cada carga tornaria o histórico ilegível.
 */
function girar<T>(itens: T[], casas: number): T[] {
  const n = casas % itens.length;
  return [...itens.slice(n), ...itens.slice(0, n)];
}

const PERGUNTAS_BASE: QuizQuestion[] = [
  {
    id: "q1_chegada",
    question: "Você entra num ambiente e vê alguém que te interessa. Qual é o seu primeiro movimento?",
    options: [
      opcao("Cuido da minha presença: postura, olhar, energia. Quero ser notado antes de falar", "siren"),
      opcao("Vou direto e dou atenção total àquela pessoa, como se mais ninguém existisse", "rake"),
      opcao("Observo o que parece faltar ali e ofereço exatamente isso", "ideal_lover"),
      opcao("Faço algo fora do esperado. Prefiro intrigar a agradar", "dandy"),
    ],
  },
  {
    id: "q2_elogio_recebido",
    question: "O que as pessoas mais elogiam em você?",
    options: [
      opcao("Minha leveza. Perto de mim ninguém precisa fazer esforço", "natural"),
      opcao("Que sou difícil de decifrar", "coquette"),
      opcao("Que eu faço a pessoa se sentir importante de verdade", "charmer"),
      opcao("Minha confiança e a clareza sobre o que eu quero da vida", "charismatic"),
    ],
  },
  {
    id: "q3_silencio",
    question: "A pessoa que te interessa simplesmente parou de responder. O que você faz?",
    options: [
      opcao("Sumo também. Não corro atrás de ninguém", "star"),
      opcao("Apareço de outro jeito: posto algo que sei que ela vai ver", "siren"),
      opcao("Mando uma mensagem mostrando que pensei nela", "rake"),
      opcao("Pergunto se está tudo bem. Pode ser algo que não tem a ver comigo", "ideal_lover"),
    ],
  },
  {
    id: "q4_flerte",
    question: "Seu jeito de flertar é mais...",
    options: [
      opcao("Ambíguo. Nunca fica claro até onde eu quero chegar", "dandy"),
      opcao("Brincalhão, sem peso nenhum", "natural"),
      opcao("Alternado: me aproximo bastante, depois recuo", "coquette"),
      opcao("Atento. Elogio o que percebo e escuto de verdade", "charmer"),
    ],
  },
  {
    id: "q5_poder",
    question: "O que mais te dá poder numa conquista?",
    options: [
      opcao("Saber exatamente para onde eu vou na vida", "charismatic"),
      opcao("O fato de ninguém conseguir me decifrar por completo", "star"),
      opcao("A reação física que eu provoco", "siren"),
      opcao("A intensidade com que eu me entrego", "rake"),
    ],
  },
  {
    id: "q6_primeiro_encontro",
    question: "Num primeiro encontro, você tende a...",
    options: [
      opcao("Escutar muito e acompanhar o clima da pessoa", "ideal_lover"),
      opcao("Levar para um lugar que ela não conhece nem esperava", "dandy"),
      opcao("Deixar acontecer, sem roteiro nenhum", "natural"),
      opcao("Demonstrar interesse e, em seguida, segurar um pouco", "coquette"),
    ],
  },
  {
    id: "q7_recebe_elogio",
    question: "Alguém te elogia abertamente. Sua reação?",
    options: [
      opcao("Devolvo um elogio ainda melhor", "charmer"),
      opcao("Agradeço e sigo. Não me altera", "charismatic"),
      opcao("Sorrio e não comento nada", "star"),
      opcao("Uso aquilo para aumentar a tensão entre nós", "siren"),
    ],
  },
  {
    id: "q8_quando_quer_muito",
    question: "Quando você quer muito alguém, o que acontece com você?",
    options: [
      opcao("Essa pessoa vira meu foco total, quase uma obsessão", "rake"),
      opcao("Descubro o que ela precisa e me torno aquilo", "ideal_lover"),
      opcao("Mantenho certa distância. Não me entrego fácil", "dandy"),
      opcao("Continuo exatamente o mesmo. Não mudo por ninguém", "natural"),
    ],
  },
  {
    id: "q9_incomodo",
    question: "O que mais te incomoda numa relação começando?",
    options: [
      opcao("Previsibilidade. Saber o que vem a seguir mata a graça", "coquette"),
      opcao("Alguém que recebe atenção e não retribui", "charmer"),
      opcao("Falta de propósito. Gente que não quer nada da vida", "charismatic"),
      opcao("Intimidade rápida demais, antes da hora", "star"),
    ],
  },
  {
    id: "q10_arma",
    question: "Numa conversa, sua maior arma é...",
    options: [
      opcao("O olhar e o tom de voz", "siren"),
      opcao("A intensidade do que eu digo", "rake"),
      opcao("Perceber aquilo que a pessoa não disse", "ideal_lover"),
      opcao("Um ponto de vista que ninguém esperava", "dandy"),
    ],
  },
  {
    id: "q11_depois_encontro",
    question: "O encontro foi ótimo. E depois?",
    options: [
      opcao("Mando uma mensagem boba, do jeito que eu sou mesmo", "natural"),
      opcao("Demoro de propósito para responder", "coquette"),
      opcao("Digo com todas as letras o quanto gostei da companhia", "charmer"),
      opcao("Já proponho o próximo, com dia marcado", "charismatic"),
    ],
  },
  {
    id: "q12_lembranca",
    question: "Como você gostaria de ser lembrado por alguém que passou pela sua vida?",
    options: [
      opcao("Como alguém que ela nunca entendeu por completo", "star"),
      opcao("Como uma presença que não dá para esquecer", "siren"),
      opcao("Como quem amou com uma intensidade rara", "rake"),
      opcao("Como quem entendeu essa pessoa como ninguém entendeu", "ideal_lover"),
    ],
  },
  {
    id: "q13_no_grupo",
    question: "Num grupo de amigos, você costuma ser...",
    options: [
      opcao("O que destoa de todo mundo, e gosta disso", "dandy"),
      opcao("O que descontrai e tira o peso das situações", "natural"),
      opcao("O que provoca e mexe com as pessoas", "coquette"),
      opcao("O que faz cada um ali se sentir bem", "charmer"),
    ],
  },
  {
    id: "q14_rejeicao",
    question: "Você foi rejeitado. O que acontece nos dias seguintes?",
    options: [
      opcao("Sigo em frente. Tenho muita coisa pela frente", "charismatic"),
      opcao("Me recolho e não dou nenhuma explicação a ninguém", "star"),
      opcao("Vou para onde eu sei que vou ser valorizado", "siren"),
      opcao("Custo a aceitar. Ainda tento mais uma vez", "rake"),
    ],
  },
  {
    id: "q15_diferencial",
    question: "O que você oferece que a maioria não oferece?",
    options: [
      opcao("Atenção real ao que a pessoa precisa, não ao que eu quero dar", "ideal_lover"),
      opcao("Uma experiência diferente de tudo que ela já viveu", "dandy"),
      opcao("Leveza. Comigo não existe jogo", "natural"),
      opcao("A dúvida. Nunca se sabe qual vai ser o próximo passo", "coquette"),
    ],
  },
  {
    id: "q16_conquista_por",
    question: "Você conquista mais por...",
    options: [
      opcao("Fazer o outro se sentir o centro de tudo", "charmer"),
      opcao("Inspirar as pessoas a quererem mais de si mesmas", "charismatic"),
      opcao("Despertar curiosidade e não saciar", "star"),
      opcao("Atração física, pura e simples", "siren"),
    ],
  },
  {
    id: "q17_fraqueza",
    question: "Sendo honesto, qual é a sua maior fraqueza?",
    options: [
      opcao("Me apego rápido demais", "rake"),
      opcao("Me anulo para agradar", "ideal_lover"),
      opcao("Enjoo rápido e parto para a próxima", "dandy"),
      opcao("Não levo nada a sério o suficiente", "natural"),
    ],
  },
  {
    id: "q18_objetivo",
    question: "Com alguém que você quer de verdade, seu objetivo é...",
    options: [
      opcao("Manter o desejo sempre vivo", "coquette"),
      opcao("Me tornar insubstituível no dia a dia dela", "charmer"),
      opcao("Construir algo com direção e propósito", "charismatic"),
      opcao("Ser desejado sem precisar me entregar por inteiro", "star"),
    ],
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = PERGUNTAS_BASE.map((pergunta, i) => ({
  ...pergunta,
  options: girar(pergunta.options, i % 4),
}));

export interface ArchetypeResult {
  primary: SeducerArchetype;
  secondary: SeducerArchetype;
  scores: Record<string, number>;
  /** Quantas vezes cada arquétipo foi o dominante das respostas escolhidas. */
  escolhas: Record<string, number>;
}

/**
 * Apura o resultado.
 *
 * O desempate é por número de escolhas dominantes, não pela ordem das chaves
 * do objeto. A versão anterior usava `Object.entries().sort()`, que é estável
 * — num empate vencia sempre quem aparecesse primeiro na declaração, e
 * "siren" era o primeiro. Com a pontuação equilibrada os empates ficaram mais
 * comuns, então isso passou a importar.
 */
export function calculateArchetype(
  answers: Record<string, number>
): ArchetypeResult {
  const scores: Record<string, number> = {};
  const escolhas: Record<string, number> = {};

  for (const chave of Object.keys(SECUNDARIO)) {
    scores[chave] = 0;
    escolhas[chave] = 0;
  }

  for (const [questionId, opcaoIndex] of Object.entries(answers)) {
    const pergunta = QUIZ_QUESTIONS.find((q) => q.id === questionId);
    const escolhida = pergunta?.options[opcaoIndex];
    if (!escolhida) continue;

    escolhas[escolhida.primary] += 1;
    for (const [arq, pontos] of Object.entries(escolhida.scores)) {
      scores[arq] = (scores[arq] ?? 0) + (pontos ?? 0);
    }
  }

  const ordenado = Object.keys(scores).sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a];
    return escolhas[b] - escolhas[a];
  });

  return {
    primary: ordenado[0] as SeducerArchetype,
    secondary: ordenado[1] as SeducerArchetype,
    scores,
    escolhas,
  };
}

// Descrições detalhadas para resultado
export const ARCHETYPE_RESULTS: Record<string, {
  name: string;
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  ideal_victims: string[];
  color: string;
}> = {
  siren: {
    name: "Sereia",
    title: "A Força do Desejo Físico",
    description: "Você possui uma energia magnética que atrai através dos sentidos. Sua presença é impossível de ignorar — quando entra em um ambiente, todos olham. Seu poder está na capacidade de despertar desejo físico e fantasias nos outros.",
    strengths: ["Presença física marcante", "Capacidade de criar fantasia", "Energia sexual natural"],
    weaknesses: ["Pode ser visto como superficial", "Dependência da aparência", "Dificuldade em conexões profundas"],
    ideal_victims: ["Professor", "Líder Solitário", "Novo Prudente"],
    color: "#e11d48",
  },
  rake: {
    name: "Libertino",
    title: "A Devoção Obsessiva",
    description: "Você conquista através da intensidade e devoção total. Quando foca em alguém, essa pessoa se torna o centro do seu universo. Sua paixão é contagiante e faz o alvo se sentir a pessoa mais desejada do mundo.",
    strengths: ["Intensidade emocional", "Faz o outro se sentir único", "Persistência incansável"],
    weaknesses: ["Pode assustar com excesso de intensidade", "Tendência a se apegar rápido", "Dificuldade em manter mistério"],
    ideal_victims: ["Beleza", "Estrela Ofuscada", "Bebê que Envelhece"],
    color: "#dc2626",
  },
  ideal_lover: {
    name: "Amante Ideal",
    title: "O Espelho da Alma",
    description: "Você tem o dom raro de perceber o que falta na vida do outro e preencher esse vazio. Como Casanova, você observa, escuta e se molda para se tornar exatamente o que a pessoa precisa — sem perder sua essência.",
    strengths: ["Empatia profunda", "Adaptabilidade", "Capacidade de criar conexão genuína"],
    weaknesses: ["Pode se anular para agradar", "Risco de perder identidade", "Vulnerável a manipulação"],
    ideal_victims: ["Sonhador Decepcionado", "Salvador", "Adorador de Ídolos"],
    color: "#7c3aed",
  },
  dandy: {
    name: "Dandi",
    title: "O Rebelde Estético",
    description: "Você desafia convenções e fascina pela originalidade. Sua estética, comportamento e pensamento fogem do padrão. As pessoas são atraídas por você porque representam algo que elas desejam ser mas não ousam.",
    strengths: ["Originalidade", "Não-conformismo", "Ambiguidade intrigante"],
    weaknesses: ["Pode parecer arrogante", "Dificuldade em demonstrar vulnerabilidade", "Tédio rápido"],
    ideal_victims: ["Novo Prudente", "Fetichista do Exótico", "Gênero Flutuante"],
    color: "#06b6d4",
  },
  natural: {
    name: "Natural",
    title: "A Inocência Desarmante",
    description: "Você conquista pela espontaneidade e autenticidade. Em um mundo de máscaras, sua naturalidade é refrescante. As pessoas baixam a guarda perto de você porque sentem que podem ser quem realmente são.",
    strengths: ["Autenticidade", "Humor natural", "Desativa defesas"],
    weaknesses: ["Pode parecer ingênue", "Dificuldade em ser estratégico", "Subestimado"],
    ideal_victims: ["Roué", "Professor", "Conquistador"],
    color: "#059669",
  },
  coquette: {
    name: "Coquete",
    title: "O Mestre do Push-Pull",
    description: "Você domina a arte da alternância entre calor e frieza. Sabe exatamente quando se aproximar e quando recuar, mantendo o alvo em um estado constante de antecipação. Sua autossuficiência é seu maior trunfo.",
    strengths: ["Controle emocional", "Gera obsessão", "Autossuficiência atraente"],
    weaknesses: ["Pode ser visto como frio", "Dificuldade em se entregar", "Relacionamentos superficiais"],
    ideal_victims: ["Conquistador", "Rainha do Drama", "Sedutor Reformado"],
    color: "#d97706",
  },
  charmer: {
    name: "Encantador",
    title: "O Diplomata do Afeto",
    description: "Você faz cada pessoa se sentir a mais importante da sala. Seu foco total no outro, sua escuta ativa e seus elogios precisos criam uma experiência irresistível. Como Dale Carnegie ensinou — fale sobre os interesses deles.",
    strengths: ["Escuta ativa", "Faz o outro se sentir valorizado", "Evita conflitos"],
    weaknesses: ["Pode parecer submisso", "Dificuldade em impor limites", "Risco de people-pleasing"],
    ideal_victims: ["Líder Solitário", "Estrela Ofuscada", "Realeza Mimada"],
    color: "#8b5cf6",
  },
  charismatic: {
    name: "Carismático",
    title: "A Força da Convicção",
    description: "Você irradia confiança e propósito. As pessoas são atraídas pela sua visão de mundo e pela certeza que você transmite. Seu carisma não vem da aparência, mas da energia e convicção que coloca em tudo que faz.",
    strengths: ["Confiança inabalável", "Inspira outros", "Energia contagiante"],
    weaknesses: ["Pode parecer dominador", "Dificuldade em ouvir", "Ego inflado"],
    ideal_victims: ["Noviço", "Adorador de Ídolos", "Sensualista"],
    color: "#f59e0b",
  },
  star: {
    name: "Estrela",
    title: "O Ídolo Inalcançável",
    description: "Você fascina pela distância e pelo mistério. Como um astro de cinema, você projeta uma imagem que as pessoas desejam mas nunca alcançam completamente. Seu poder está no que você NÃO revela.",
    strengths: ["Mistério natural", "Imagem fascinante", "Independência"],
    weaknesses: ["Dificuldade em intimidade real", "Pode parecer inacessível", "Solidão"],
    ideal_victims: ["Sonhador Decepcionado", "Fetichista do Exótico", "Noviço"],
    color: "#a855f7",
  },
};
