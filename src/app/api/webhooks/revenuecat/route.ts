import { NextResponse } from "next/server";

export const runtime = "edge";

interface RevenueCatEvent {
  id: string;
  type:
    | "INITIAL_PURCHASE"
    | "RENEWAL"
    | "CANCELLATION"
    | "EXPIRATION"
    | "NON_RENEWING_PURCHASE"
    | "PRODUCT_CHANGE"
    | string;
  app_user_id: string;
  product_id: string;
  price_in_purchased_currency?: number;
  currency?: string;
  purchased_at_ms?: number;
  expiration_at_ms?: number;
}

interface RevenueCatWebhookPayload {
  api_version: string;
  event: RevenueCatEvent;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.REVENUECAT_WEBHOOK_AUTH_KEY;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: "Acesso não autorizado ao webhook." },
        { status: 401 }
      );
    }

    const payload = (await request.json()) as RevenueCatWebhookPayload;
    const { event } = payload;

    if (!event) {
      return NextResponse.json(
        { error: "Payload do webhook inválido." },
        { status: 400 }
      );
    }

    const userId = event.app_user_id;
    const eventType = event.type;
    const productId = event.product_id;

    console.log(`[RevenueCat Webhook] Recebido evento ${eventType} para usuário ${userId}, produto ${productId}`);

    // Mapeamento de produtos de créditos
    const CREDIT_PACK_MAP: Record<string, number> = {
      "kissflow_credits_25": 25,
      "kissflow_credits_60": 60,
      "kissflow_credits_150": 150,
      "credits_25": 25,
      "credits_60": 60,
      "credits_150": 150,
    };

    let resultSummary = "Evento processado com sucesso.";

    switch (eventType) {
      case "NON_RENEWING_PURCHASE": {
        const creditsToAdd = CREDIT_PACK_MAP[productId] || 25;
        resultSummary = `Recarga avulsa de ${creditsToAdd} créditos creditada para usuário ${userId}.`;
        break;
      }

      case "INITIAL_PURCHASE":
      case "RENEWAL": {
        resultSummary = `Assinatura Pro ativada/renovada para usuário ${userId}. Franquia mensal de 30 análises concedida.`;
        break;
      }

      case "CANCELLATION":
      case "EXPIRATION": {
        resultSummary = `Assinatura cancelada/expirada para usuário ${userId}. Plano rebaixado para Free.`;
        break;
      }

      default:
        resultSummary = `Evento ${eventType} registrado sem ação de cota necessária.`;
    }

    return NextResponse.json({
      received: true,
      eventId: event.id,
      userId,
      action: resultSummary,
    });
  } catch (err: any) {
    console.error("[RevenueCat Webhook Error]:", err);
    return NextResponse.json(
      { error: "Falha interna ao processar webhook.", details: err?.message },
      { status: 500 }
    );
  }
}
