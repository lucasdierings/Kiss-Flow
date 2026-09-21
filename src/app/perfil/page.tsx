import { requireOnboarded } from "@/server/session";

import PerfilClient from "./PerfilClient";

export default async function PerfilPage() {
  await requireOnboarded("/perfil");
  return <PerfilClient />;
}
