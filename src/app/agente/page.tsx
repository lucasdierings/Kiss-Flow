import { requireOnboarded } from "@/server/session";

import AgenteClient from "./AgenteClient";

export default async function AgentePage() {
  await requireOnboarded("/agente");
  return <AgenteClient />;
}
