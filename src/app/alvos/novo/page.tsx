import { requireOnboarded } from "@/server/session";

import NovoAlvoClient from "./NovoAlvoClient";

export default async function NovoAlvoPage() {
  await requireOnboarded("/alvos/novo");
  return <NovoAlvoClient />;
}
