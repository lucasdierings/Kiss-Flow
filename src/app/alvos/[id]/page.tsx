import { requireOnboarded } from "@/server/session";

import AlvoDetalheClient from "./AlvoDetalheClient";

export default async function AlvoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireOnboarded(`/alvos/${id}`);
  return <AlvoDetalheClient id={id} />;
}
