import { requireOnboarded } from "@/server/session";

import AlvosClient from "./AlvosClient";

export default async function AlvosPage() {
  await requireOnboarded("/alvos");
  return <AlvosClient />;
}
