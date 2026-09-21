import { requireOnboarded } from "@/server/session";

import KanbanClient from "./KanbanClient";

export default async function KanbanPage() {
  await requireOnboarded("/kanban");
  return <KanbanClient />;
}
