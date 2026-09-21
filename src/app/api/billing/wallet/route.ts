import { NextResponse } from "next/server";

import { limitFor } from "@/lib/plans";
import { withApi } from "@/server/guard";
import { userProfile } from "@/server/db/schema";
import { getMonthlyUsage, getPlan, getWalletBalance } from "@/server/usage";
import { eq } from "drizzle-orm";

/**
 * Estado da conta: plano, consumo do mês e saldo de créditos — tudo lido do
 * D1. Antes eram valores fixos no código ("pro", 48/100, 14 créditos).
 *
 * O POST que existia aqui foi REMOVIDO. Ele aceitava `creditsAmount` do corpo
 * da requisição e respondia com o saldo somado, ou seja: qualquer cliente
 * pedia quantos créditos quisesse. Crédito só entra por `addCredits()`, e
 * quem chama é o webhook da loja, depois de conferir o segredo compartilhado.
 *
 * O catálogo de pacotes também saiu: preço e disponibilidade vêm da App Store
 * e do Google Play em tempo de execução, via SDK. Servir uma tabela de preços
 * própria só criaria uma segunda verdade para divergir da loja.
 */
export const GET = withApi(null, async ({ ctx }) => {
  const [plan, analysisUsed, uploadUsed, credits, profileRows] = await Promise.all([
    getPlan(ctx),
    getMonthlyUsage(ctx, "ai_analysis"),
    getMonthlyUsage(ctx, "upload"),
    getWalletBalance(ctx),
    ctx.db
      .select({ planExpiresAt: userProfile.planExpiresAt })
      .from(userProfile)
      .where(eq(userProfile.userId, ctx.userId)),
  ]);

  const analysisLimit = limitFor(plan, "ai_analysis");
  const uploadLimit = limitFor(plan, "upload");

  // Infinity não sobrevive a JSON.stringify (vira null). O cliente recebe a
  // ausência de teto como `null` explícito e trata como ilimitado.
  const asJson = (n: number) => (Number.isFinite(n) ? n : null);

  return NextResponse.json({
    plan,
    planExpiresAt: profileRows[0]?.planExpiresAt?.toISOString() ?? null,
    creditsBalance: credits,
    usage: {
      ai_analysis: { used: analysisUsed, limit: asJson(analysisLimit) },
      upload: { used: uploadUsed, limit: asJson(uploadLimit) },
    },
  });
});
