import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Retorna o saldo da carteira e a cota do plano
  return NextResponse.json({
    plan: "pro",
    planExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    monthlyQuotaUsed: 48,
    monthlyQuotaTotal: 100,
    creditsBalance: 14,
    packagesAvailable: [
      { id: "sos_25", credits: 25, priceCents: 1990, label: "Pacote SOS" },
      { id: "popular_80", credits: 80, priceCents: 4990, label: "Mais Vendido" },
      { id: "pro_200", credits: 200, priceCents: 9990, label: "Pro Master" },
    ],
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as any;
    const { packageId, creditsAmount, provider = "apple_iap" } = body;

    return NextResponse.json({
      success: true,
      transactionId: `tx_${Date.now()}`,
      addedCredits: creditsAmount || 25,
      newBalance: 14 + (creditsAmount || 25),
      provider,
      message: "Créditos adicionados à carteira com sucesso.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar compra de créditos" },
      { status: 400 }
    );
  }
}
