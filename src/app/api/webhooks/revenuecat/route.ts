import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/server/db/client";
import { user, userProfile } from "@/server/db/schema";
import { addCredits, grantExists, isUniqueViolation } from "@/server/usage";

/**
 * Webhook da RevenueCat.
 *
 * Antes só imprimia no console e respondia 200: nenhum crédito era lançado e
 * nenhum plano mudava. Duas correções de segurança junto com a ligação:
 *
 * 1. FALHA FECHADA. A versão anterior só conferia o segredo se a variável
 *    estivesse definida (`if (expectedSecret && ...)`), ou seja: esquecer de
 *    configurá-la deixava o endpoint aberto para qualquer um conceder plano
 *    premium. Agora, sem segredo configurado, a rota recusa tudo.
 *
 * 2. IDEMPOTÊNCIA. A RevenueCat reentrega o evento até receber 2xx. O
 *    `event.id` vai em `referenceId`, protegido pelo índice único parcial
 *    `credit_tx_grant_ref_idx`; a reentrega colide, é reconhecida e responde
 *    200 sem creditar de novo.
 *
 * Não confunda com trilha de auditoria: o corpo do evento não é persistido.
 */

const eventSchema = z.object({
  api_version: z.string().optional(),
  event: z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    app_user_id: z.string().min(1),
    product_id: z.string().optional(),
    expiration_at_ms: z.number().optional(),
  }),
});

/** Quantos créditos cada produto de recarga concede. */
const CREDIT_PACKS: Record<string, number> = {
  credits_25: 25,
  credits_60: 60,
  credits_150: 150,
  kissflow_credits_25: 25,
  kissflow_credits_60: 60,
  kissflow_credits_150: 150,
};

export async function POST(request: Request): Promise<Response> {
  const { env } = await getCloudflareContext({ async: true });
  const secret = env.REVENUECAT_WEBHOOK_AUTH_KEY;

  if (!secret) {
    console.error("REVENUECAT_WEBHOOK_AUTH_KEY ausente — webhook recusado.");
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
  const { event } = parsed.data;

  const db = await getDb();

  // app_user_id precisa ser o nosso user.id — é o que o app informa ao SDK.
  const [owner] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, event.app_user_id));

  if (!owner) {
    // 200 de propósito: repetir a entrega não faria o usuário aparecer.
    console.error(`Webhook para usuário desconhecido: ${event.app_user_id}`);
    return NextResponse.json({ received: true, action: "usuário desconhecido" });
  }

  const setPlan = async (plan: "free" | "premium", expiresAt?: number) =>
    db
      .update(userProfile)
      .set({
        plan,
        planExpiresAt: expiresAt ? new Date(expiresAt) : null,
        updatedAt: new Date(),
      })
      .where(eq(userProfile.userId, owner.id));

  try {
    switch (event.type) {
      case "NON_RENEWING_PURCHASE": {
        const amount = CREDIT_PACKS[event.product_id ?? ""];
        if (!amount) {
          console.error(`Produto de recarga desconhecido: ${event.product_id}`);
          return NextResponse.json({ received: true, action: "produto desconhecido" });
        }
        // Caminho comum da reentrega: reconhecido por consulta, sem depender
        // de capturar exceção. O índice único cobre a corrida entre entregas
        // simultâneas, que esta consulta sozinha não pegaria.
        if (await grantExists(db, event.id)) {
          return NextResponse.json({ received: true, action: "duplicado, ignorado" });
        }
        const balance = await addCredits(db, owner.id, amount, "purchase", event.id);
        return NextResponse.json({ received: true, action: "creditado", balance });
      }

      case "INITIAL_PURCHASE":
      case "RENEWAL":
      case "PRODUCT_CHANGE":
        await setPlan("premium", event.expiration_at_ms);
        return NextResponse.json({ received: true, action: "premium ativo" });

      case "CANCELLATION":
      case "EXPIRATION":
        await setPlan("free");
        return NextResponse.json({ received: true, action: "rebaixado para free" });

      default:
        return NextResponse.json({ received: true, action: "ignorado" });
    }
  } catch (error) {
    // Reentrega do mesmo evento: já foi processado, então 200 encerra o retry.
    if (isUniqueViolation(error)) {
      return NextResponse.json({ received: true, action: "duplicado, ignorado" });
    }
    console.error("Webhook RevenueCat falhou:", error);
    // 500 faz a RevenueCat tentar de novo, que é o desejado num erro real.
    return NextResponse.json({ error: "Falha ao processar" }, { status: 500 });
  }
}
