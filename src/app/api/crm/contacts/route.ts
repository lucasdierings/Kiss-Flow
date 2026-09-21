import { NextResponse } from "next/server";

const DEMO_CONTACTS = [
  {
    id: "1",
    name: "Gabriela Lima",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    stage: "flerte",
    stageLabel: "Flerte Rendendo",
    temp: "hot",
    archetype: "A Sereia",
    lastMessage: "Amei o café que você indicou haha",
    lastInteractionHoursAgo: 2,
    mysteryScore: 82,
    tensionScore: 68,
    interestScore: 90,
  },
  {
    id: "2",
    name: "Camila Rocha",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    stage: "marcar",
    stageLabel: "Tentando Marcar",
    temp: "warm",
    archetype: "Coquete",
    lastMessage: "Sexta acho que tenho aula até tarde...",
    lastInteractionHoursAgo: 24,
    mysteryScore: 60,
    tensionScore: 45,
    interestScore: 65,
  },
  {
    id: "3",
    name: "Juliana Mendes",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    stage: "de_olho",
    stageLabel: "De Olho",
    temp: "cold",
    archetype: "Natural",
    lastMessage: "Visualizou e não respondeu",
    lastInteractionHoursAgo: 96,
    mysteryScore: 45,
    tensionScore: 20,
    interestScore: 35,
    alert: "Ação recomendada: Não mande mensagem agora. Espere 48h para recuperar o mistério.",
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    contacts: DEMO_CONTACTS,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as any;
    const newContact = {
      id: `c_${Date.now()}`,
      name: body.name || "Novo Alvo",
      avatarUrl: body.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      stage: body.stage || "papo",
      stageLabel: "Puxando Papo",
      temp: "warm",
      archetype: body.archetype || "A Sereia",
      lastMessage: body.notes || "Contato iniciado",
      lastInteractionHoursAgo: 1,
      mysteryScore: 80,
      tensionScore: 50,
      interestScore: 70,
    };

    return NextResponse.json({
      success: true,
      contact: newContact,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar contato" },
      { status: 400 }
    );
  }
}
