import DashboardClient from "./DashboardClient";
import { requireSession } from "@/server/session";

/**
 * Porta de entrada da versão web.
 *
 * Server Component fino: confere a sessão antes de renderizar qualquer coisa.
 * Antes quem fazia isso era o `src/proxy.ts`, que olhava só a assinatura do
 * cookie — e que precisou sair para o build do Cloudflare passar. Ver
 * src/server/session.ts.
 */
export default async function HomePage() {
  await requireSession("/");
  return <DashboardClient />;
}
