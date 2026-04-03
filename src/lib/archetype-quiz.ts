// Quiz de classificacao de arquetipo sedutor
// Baseado nos 9 arquetipos de Robert Greene (A Arte da Seducao)

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
    question: "Quando voce entra em um ambiente com alguem que te interessa, qual sua primeira reacao?",
    options: [
      { text: "Garanto que minha presenca seja notada — postura, olhar, energia", scores: { siren: 3, star: 2, charismatic: 1 } },
      { text: "Observo a pessoa por um tempo antes de me aproximar", scores: { coquette: 3, natural: 1, star: 2 } },
      { text: "Vou direto conversar, dou atencao total e exclusiva", scores: { rake: 3, charmer: 2, ideal_lover: 1 } },
      { text: "Me aproximo com humor e leveza, sem pressao", scores: { natural: 3, charmer: 2, dandy: 1 } },
    ],
  },
  {
    id: "q2_attention",
    question: "O que as pessoas mais elogiam em voce?",
    options: [
      { text: "Minha aparencia e presenca fisica marcante", scores: { siren: 3, dandy: 2, star: 1 } },
      { text: "Minha capacidade de fazer o outro se sentir especial", scores: { charmer: 3, ideal_lover: 2, rake: 1 } },
      { text: "Minha confianca e visao sobre a vida", scores: { charismatic: 3, star: 2, coquette: 1 } },
      { text: "Minha espontaneidade e jeito autentico de ser", scores: { natural: 3, dandy: 2, charmer: 1 } },
    ],
  },
  {
    id: "q3_conflict",
    question: "Quando alguem que voce gosta para de responder, o que voce faz?",
    options: [
      { text: "Espero. Se a pessoa quiser, volta. Tenho minha vida", scores: { coquette: 3, star: 2, dandy: 1 } },
      { text: "Mando uma mensagem leve mostrando que pensei nela", scores: { charmer: 2, ideal_lover: 3, natural: 1 } },
      { text: "Posto algo nas redes que sei que vai chamar atencao", scores: { siren: 2, star: 3, coquette: 1 } },
      { text: "Intensifico — mando mensagem intensa mostrando o que sinto", scores: { rake: 3, charismatic: 2, siren: 1 } },
    ],
  },
  {
    id: "q4_seduction_style",
    question: "Qual frase descreve melhor seu estilo de conquista?",
    options: [
      { text: "Faco a pessoa sentir que ninguem nunca a entendeu tao bem", scores: { ideal_lover: 3, charmer: 2, rake: 1 } },
      { text: "Alterno entre calor e frieza — mantenho a pessoa pensando em mim", scores: { coquette: 3, dandy: 1, star: 2 } },
      { text: "Sou intenso e mostro devocao total, sem meias palavras", scores: { rake: 3, charismatic: 2, siren: 1 } },
      { text: "Sou misterioso — revelo pouco e deixo a curiosidade crescer", scores: { star: 3, dandy: 2, coquette: 1 } },
    ],
  },
  {
    id: "q5_power",
    question: "Em um relacionamento, onde voce se sente mais confortavel?",
    options: [
      { text: "No controle — gosto de conduzir e ser a referencia", scores: { charismatic: 3, siren: 2, coquette: 1 } },
      { text: "Em equilibrio — adapto ao que a pessoa precisa", scores: { ideal_lover: 3, charmer: 2, natural: 1 } },
      { text: "Na incerteza — gosto quando nenhum dos dois sabe exatamente o que esta acontecendo", scores: { coquette: 3, dandy: 2, rake: 1 } },
      { text: "Como o centro das atencoes — preciso ser admirado", scores: { star: 3, siren: 2, charismatic: 1 } },
    ],
  },
  {
    id: "q6_rejection",
    question: "Quando percebe que alguem esta perdendo interesse, qual sua reacao?",
    options: [
      { text: "Sumo por um tempo — ausencia cura tudo", scores: { coquette: 3, star: 2, dandy: 1 } },
      { text: "Redobro a atencao e os gestos romanticos", scores: { rake: 3, ideal_lover: 2, charmer: 1 } },
      { text: "Mudo minha abordagem — surpreendo com algo inesperado", scores: { dandy: 3, natural: 2, charismatic: 1 } },
      { text: "Aceito com tranquilidade — outras oportunidades virao", scores: { natural: 2, star: 3, charismatic: 1 } },
    ],
  },
  {
    id: "q7_gift",
    question: "Qual tipo de presente voce daria para impressionar alguem?",
    options: [
      { text: "Algo que mostra que eu realmente prestei atencao nos detalhes da vida dela", scores: { ideal_lover: 3, charmer: 2, natural: 1 } },
      { text: "Algo luxuoso e impactante que ela nunca esquecera", scores: { siren: 3, star: 2, rake: 1 } },
      { text: "Uma experiencia unica — algo que vivemos juntos", scores: { charismatic: 2, natural: 3, rake: 1 } },
      { text: "Algo ironico ou inesperado que quebre expectativas", scores: { dandy: 3, coquette: 2, natural: 1 } },
    ],
  },
  {
    id: "q8_social",
    question: "Nas redes sociais, como voce se apresenta?",
    options: [
      { text: "Cuido muito da estetica — cada foto e pensada", scores: { siren: 3, star: 2, dandy: 1 } },
      { text: "Posto pouco e de forma estrategica — menos e mais", scores: { coquette: 3, star: 2, dandy: 1 } },
      { text: "Sou autentico — posto o que estou vivendo sem filtro", scores: { natural: 3, charismatic: 2, charmer: 1 } },
      { text: "Uso para inspirar e compartilhar ideias e visoes", scores: { charismatic: 3, ideal_lover: 1, rake: 2 } },
    ],
  },
  {
    id: "q9_weakness",
    question: "Qual seu maior ponto fraco em relacionamentos?",
    options: [
      { text: "Me apego rapido demais e demonstro interesse cedo", scores: { rake: 3, ideal_lover: 2, charmer: 1 } },
      { text: "Sou distante demais e as pessoas acham que nao me importo", scores: { coquette: 2, star: 3, dandy: 2 } },
      { text: "Tento agradar demais e perco minha essencia", scores: { charmer: 3, ideal_lover: 2, natural: 1 } },
      { text: "Fico entediado rapido quando conquisto alguem", scores: { dandy: 3, coquette: 2, siren: 1 } },
    ],
  },
  {
    id: "q10_dream",
    question: "O que voce quer que a pessoa sinta quando pensa em voce?",
    options: [
      { text: "Desejo incontrolavel — ela nao consegue me tirar da cabeca", scores: { siren: 3, rake: 2, coquette: 1 } },
      { text: "Seguranca e profundidade — sou o porto seguro dela", scores: { ideal_lover: 3, charmer: 2, natural: 1 } },
      { text: "Admiracao e fascinacao — ela me ve como alguem unico", scores: { star: 3, charismatic: 2, dandy: 1 } },
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

// Descricoes detalhadas para resultado
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
    title: "A Forca do Desejo Fisico",
    description: "Voce possui uma energia magnetica que atrai atraves dos sentidos. Sua presenca e impossivel de ignorar — quando entra em um ambiente, todos olham. Seu poder esta na capacidade de despertar desejo fisico e fantasias nos outros.",
    strengths: ["Presenca fisica marcante", "Capacidade de criar fantasia", "Energia sexual natural"],
    weaknesses: ["Pode ser visto como superficial", "Dependencia da aparencia", "Dificuldade em conexoes profundas"],
    ideal_victims: ["Professor", "Lider Solitario", "Novo Prudente"],
    color: "#e11d48",
  },
  rake: {
    name: "Libertino",
    title: "A Devocao Obsessiva",
    description: "Voce conquista atraves da intensidade e devocao total. Quando foca em alguem, essa pessoa se torna o centro do seu universo. Sua paixao e contagiante e faz o alvo se sentir a pessoa mais desejada do mundo.",
    strengths: ["Intensidade emocional", "Faz o outro se sentir unico", "Persistencia incansavel"],
    weaknesses: ["Pode assustar com excesso de intensidade", "Tendencia a se apegar rapido", "Dificuldade em manter misterio"],
    ideal_victims: ["Beleza", "Estrela Ofuscada", "Bebe que Envelhece"],
    color: "#dc2626",
  },
  ideal_lover: {
    name: "Amante Ideal",
    title: "O Espelho da Alma",
    description: "Voce tem o dom raro de perceber o que falta na vida do outro e preencher esse vazio. Como Casanova, voce observa, escuta e se molda para se tornar exatamente o que a pessoa precisa — sem perder sua essencia.",
    strengths: ["Empatia profunda", "Adaptabilidade", "Capacidade de criar conexao genuina"],
    weaknesses: ["Pode se anular para agradar", "Risco de perder identidade", "Vulneravel a manipulacao"],
    ideal_victims: ["Sonhador Decepcionado", "Salvador", "Adorador de Idolos"],
    color: "#7c3aed",
  },
  dandy: {
    name: "Dandi",
    title: "O Rebelde Estetico",
    description: "Voce desafia convencoes e fascina pela originalidade. Sua estetica, comportamento e pensamento fogem do padrao. As pessoas sao atraidas por voce porque representam algo que elas desejam ser mas nao ousam.",
    strengths: ["Originalidade", "Nao-conformismo", "Ambiguidade intrigante"],
    weaknesses: ["Pode parecer arrogante", "Dificuldade em demonstrar vulnerabilidade", "Tedio rapido"],
    ideal_victims: ["Novo Prudente", "Fetichista do Exotico", "Genero Flutuante"],
    color: "#06b6d4",
  },
  natural: {
    name: "Natural",
    title: "A Inocencia Desarmante",
    description: "Voce conquista pela espontaneidade e autenticidade. Em um mundo de mascaras, sua naturalidade e refrescante. As pessoas baixam a guarda perto de voce porque sentem que podem ser quem realmente sao.",
    strengths: ["Autenticidade", "Humor natural", "Desativa defesas"],
    weaknesses: ["Pode parecer ingenue", "Dificuldade em ser estrategico", "Subestimado"],
    ideal_victims: ["Roue", "Professor", "Conquistador"],
    color: "#059669",
  },
  coquette: {
    name: "Coquete",
    title: "O Mestre do Push-Pull",
    description: "Voce domina a arte da alternancia entre calor e frieza. Sabe exatamente quando se aproximar e quando recuar, mantendo o alvo em um estado constante de antecipacao. Sua autossuficiencia e seu maior trunfo.",
    strengths: ["Controle emocional", "Gera obsessao", "Autossuficiencia atraente"],
    weaknesses: ["Pode ser visto como frio", "Dificuldade em se entregar", "Relacionamentos superficiais"],
    ideal_victims: ["Conquistador", "Rainha do Drama", "Sedutor Reformado"],
    color: "#d97706",
  },
  charmer: {
    name: "Encantador",
    title: "O Diplomata do Afeto",
    description: "Voce faz cada pessoa se sentir a mais importante da sala. Seu foco total no outro, sua escuta ativa e seus elogios precisos criam uma experiencia irresistivel. Como Dale Carnegie ensinou — fale sobre os interesses deles.",
    strengths: ["Escuta ativa", "Faz o outro se sentir valorizado", "Evita conflitos"],
    weaknesses: ["Pode parecer submisso", "Dificuldade em impor limites", "Risco de people-pleasing"],
    ideal_victims: ["Lider Solitario", "Estrela Ofuscada", "Realeza Mimada"],
    color: "#8b5cf6",
  },
  charismatic: {
    name: "Carismatico",
    title: "A Forca da Conviccao",
    description: "Voce irradia confianca e proposito. As pessoas sao atraidas pela sua visao de mundo e pela certeza que voce transmite. Seu carisma nao vem da aparencia, mas da energia e convicção que coloca em tudo que faz.",
    strengths: ["Confianca inabalavel", "Inspira outros", "Energia contagiante"],
    weaknesses: ["Pode parecer dominador", "Dificuldade em ouvir", "Ego inflado"],
    ideal_victims: ["Novico", "Adorador de Idolos", "Sensualista"],
    color: "#f59e0b",
  },
  star: {
    name: "Estrela",
    title: "O Idolo Inalcancavel",
    description: "Voce fascina pela distancia e pelo misterio. Como um astro de cinema, voce projeta uma imagem que as pessoas desejam mas nunca alcancam completamente. Seu poder esta no que voce NAO revela.",
    strengths: ["Misterio natural", "Imagem fascinante", "Independencia"],
    weaknesses: ["Dificuldade em intimidade real", "Pode parecer inacessivel", "Solidao"],
    ideal_victims: ["Sonhador Decepcionado", "Fetichista do Exotico", "Novico"],
    color: "#a855f7",
  },
};
