// Quiz de classificação de arquétipo sedutor
// Sistema de classificação de arquétipo do sedutor

export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    text: string;
    scores: Partial<Record<string, number>>;
  }[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1_approach",
    question: "Quando você entra em um ambiente com alguém que te interessa, qual sua primeira reação?",
    options: [
      { text: "Garanto que minha presença seja notada — postura, olhar, energia", scores: { siren: 3, star: 2, charismatic: 1 } },
      { text: "Observo a pessoa por um tempo antes de me aproximar", scores: { coquette: 3, natural: 1, star: 2 } },
      { text: "Vou direto conversar, dou atenção total e exclusiva", scores: { rake: 3, charmer: 2, ideal_lover: 1 } },
      { text: "Me aproximo com humor e leveza, sem pressão", scores: { natural: 3, charmer: 2, dandy: 1 } },
    ],
  },
  {
    id: "q2_attention",
    question: "O que as pessoas mais elogiam em você?",
    options: [
      { text: "Minha aparência e presença física marcante", scores: { siren: 3, dandy: 2, star: 1 } },
      { text: "Minha capacidade de fazer o outro se sentir especial", scores: { charmer: 3, ideal_lover: 2, rake: 1 } },
      { text: "Minha confiança e visão sobre a vida", scores: { charismatic: 3, star: 2, coquette: 1 } },
      { text: "Minha espontaneidade e jeito autêntico de ser", scores: { natural: 3, dandy: 2, charmer: 1 } },
    ],
  },
  {
    id: "q3_conflict",
    question: "Quando alguém que você gosta para de responder, o que você faz?",
    options: [
      { text: "Espero. Se a pessoa quiser, volta. Tenho minha vida", scores: { coquette: 3, star: 2, dandy: 1 } },
      { text: "Mando uma mensagem leve mostrando que pensei nela", scores: { charmer: 2, ideal_lover: 3, natural: 1 } },
      { text: "Posto algo nas redes que sei que vai chamar atenção", scores: { siren: 2, star: 3, coquette: 1 } },
      { text: "Intensifico — mando mensagem intensa mostrando o que sinto", scores: { rake: 3, charismatic: 2, siren: 1 } },
    ],
  },
  {
    id: "q4_seduction_style",
    question: "Qual frase descreve melhor seu estilo de conquista?",
    options: [
      { text: "Faço a pessoa sentir que ninguém nunca a entendeu tão bem", scores: { ideal_lover: 3, charmer: 2, rake: 1 } },
      { text: "Alterno entre calor e frieza — mantenho a pessoa pensando em mim", scores: { coquette: 3, dandy: 1, star: 2 } },
      { text: "Sou intenso e mostro devoção total, sem meias palavras", scores: { rake: 3, charismatic: 2, siren: 1 } },
      { text: "Sou misterioso — revelo pouco e deixo a curiosidade crescer", scores: { star: 3, dandy: 2, coquette: 1 } },
    ],
  },
  {
    id: "q5_power",
    question: "Em um relacionamento, onde você se sente mais confortável?",
    options: [
      { text: "No controle — gosto de conduzir e ser a referência", scores: { charismatic: 3, siren: 2, coquette: 1 } },
      { text: "Em equilíbrio — adapto ao que a pessoa precisa", scores: { ideal_lover: 3, charmer: 2, natural: 1 } },
      { text: "Na incerteza — gosto quando nenhum dos dois sabe exatamente o que está acontecendo", scores: { coquette: 3, dandy: 2, rake: 1 } },
      { text: "Como o centro das atenções — preciso ser admirado", scores: { star: 3, siren: 2, charismatic: 1 } },
    ],
  },
  {
    id: "q6_rejection",
    question: "Quando percebe que alguém está perdendo interesse, qual sua reação?",
    options: [
      { text: "Sumo por um tempo — ausência cura tudo", scores: { coquette: 3, star: 2, dandy: 1 } },
      { text: "Redobro a atenção e os gestos românticos", scores: { rake: 3, ideal_lover: 2, charmer: 1 } },
      { text: "Mudo minha abordagem — surpreendo com algo inesperado", scores: { dandy: 3, natural: 2, charismatic: 1 } },
      { text: "Aceito com tranquilidade — outras oportunidades virão", scores: { natural: 2, star: 3, charismatic: 1 } },
    ],
  },
  {
    id: "q7_gift",
    question: "Qual tipo de presente você daria para impressionar alguém?",
    options: [
      { text: "Algo que mostra que eu realmente prestei atenção nos detalhes da vida dela", scores: { ideal_lover: 3, charmer: 2, natural: 1 } },
      { text: "Algo luxuoso e impactante que ela nunca esquecerá", scores: { siren: 3, star: 2, rake: 1 } },
      { text: "Uma experiência única — algo que vivemos juntos", scores: { charismatic: 2, natural: 3, rake: 1 } },
      { text: "Algo irônico ou inesperado que quebre expectativas", scores: { dandy: 3, coquette: 2, natural: 1 } },
    ],
  },
  {
    id: "q8_social",
    question: "Nas redes sociais, como você se apresenta?",
    options: [
      { text: "Cuido muito da estética — cada foto é pensada", scores: { siren: 3, star: 2, dandy: 1 } },
      { text: "Posto pouco e de forma estratégica — menos é mais", scores: { coquette: 3, star: 2, dandy: 1 } },
      { text: "Sou autêntico — posto o que estou vivendo sem filtro", scores: { natural: 3, charismatic: 2, charmer: 1 } },
      { text: "Uso para inspirar e compartilhar ideias e visões", scores: { charismatic: 3, ideal_lover: 1, rake: 2 } },
    ],
  },
  {
    id: "q9_weakness",
    question: "Qual seu maior ponto fraco em relacionamentos?",
    options: [
      { text: "Me apego rápido demais e demonstro interesse cedo", scores: { rake: 3, ideal_lover: 2, charmer: 1 } },
      { text: "Sou distante demais e as pessoas acham que não me importo", scores: { coquette: 2, star: 3, dandy: 2 } },
      { text: "Tento agradar demais e perco minha essência", scores: { charmer: 3, ideal_lover: 2, natural: 1 } },
      { text: "Fico entediado rápido quando conquisto alguém", scores: { dandy: 3, coquette: 2, siren: 1 } },
    ],
  },
  {
    id: "q10_dream",
    question: "O que você quer que a pessoa sinta quando pensa em você?",
    options: [
      { text: "Desejo incontrolável — ela não consegue me tirar da cabeça", scores: { siren: 3, rake: 2, coquette: 1 } },
      { text: "Segurança e profundidade — sou o porto seguro dela", scores: { ideal_lover: 3, charmer: 2, natural: 1 } },
      { text: "Admiração e fascinação — ela me vê como alguém único", scores: { star: 3, charismatic: 2, dandy: 1 } },
      { text: "Curiosidade e saudade — ela nunca sabe o que esperar", scores: { coquette: 3, dandy: 2, star: 1 } },
    ],
  },
];

export function calculateArchetype(answers: Record<string, number>): {
  primary: string;
  secondary: string;
  scores: Record<string, number>;
} {
  const archetypeScores: Record<string, number> = {
    siren: 0, rake: 0, ideal_lover: 0, dandy: 0, natural: 0,
    coquette: 0, charmer: 0, charismatic: 0, star: 0,
  };

  // Sum all scores from answers
  for (const questionId of Object.keys(answers)) {
    const question = QUIZ_QUESTIONS.find((q) => q.id === questionId);
    if (!question) continue;
    const optionIndex = answers[questionId];
    const option = question.options[optionIndex];
    if (!option) continue;
    for (const [archetype, score] of Object.entries(option.scores)) {
      archetypeScores[archetype] = (archetypeScores[archetype] || 0) + (score || 0);
    }
  }

  // Sort by score
  const sorted = Object.entries(archetypeScores).sort((a, b) => b[1] - a[1]);

  return {
    primary: sorted[0][0],
    secondary: sorted[1][0],
    scores: archetypeScores,
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
