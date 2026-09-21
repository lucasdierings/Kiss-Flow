/**
 * Cliente HTTP do App Mobile Kiss Flow para conexão com o Backend API
 */

// Em ambiente de desenvolvimento local, apontamos para o IP local do Mac
export const API_BASE_URL = 'http://192.168.3.35:3000/api';

export interface AdviceResponse {
  success: boolean;
  mentor: string;
  diagnosis: string;
  options: Array<{
    title: string;
    text: string;
  }>;
  principleApplied: string;
}

export async function requestMentorAdvice(params: {
  mentor: 'donjuan' | 'cleopatra';
  target: {
    name: string;
    archetype: string;
    stage: string;
    mysteryScore: number;
    tensionScore: number;
    interestScore: number;
  };
  userProfile: {
    name: string;
    gender: string;
  };
  userMessage: string;
}): Promise<AdviceResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/advise`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Backend indisponível, usando motor local:', error);
    // Retorno de fallback offline caso o backend não esteja ativo
    return {
      success: true,
      mentor: params.mentor === 'donjuan' ? 'Don Juan' : 'Cleópatra',
      diagnosis: `Observei o comportamento da ${params.target.name}. A abertura é favorável. O momento é ideal para uma progressão sem ansiedade.`,
      options: [
        {
          title: 'Opção 1: Natural & Desafiadora',
          text: 'Sabia que você tinha bom gosto! Mas aposto que você ainda não provou a torta de pistache de lá. Sexta agora a gente vai tirar a prova.',
        },
        {
          title: 'Opção 2: Espirituosa & Curta',
          text: 'Esse café tem esse poder mesmo. E olha que você ainda não viu o meu lugar secreto pra tomar drinks.',
        },
        {
          title: 'Opção 3: Pausa & Desapego',
          text: 'Que bom que curtiu! Tô numa correria hoje, mais tarde te conto o que você precisa pedir da próxima vez 😉',
        },
      ],
      principleApplied: 'Fechamento Progressivo',
    };
  }
}

export async function fetchWalletStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/billing/wallet`);
    return await response.json();
  } catch {
    return {
      plan: 'pro',
      monthlyQuotaUsed: 48,
      monthlyQuotaTotal: 100,
      creditsBalance: 14,
    };
  }
}
