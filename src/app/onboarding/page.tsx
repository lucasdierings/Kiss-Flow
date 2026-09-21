import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { getDb } from "@/server/db/client";
import { userProfile } from "@/server/db/schema";
import { requireSession } from "@/server/session";

import OnboardingClient from "./OnboardingClient";

/**
 * Quem já concluiu não refaz o quiz por acidente ao digitar a URL — mas pode
 * refazer de propósito, por `?refazer=1`. O arquétipo descreve comportamento,
 * e comportamento muda: travar a primeira resposta para sempre transformaria
 * um retrato num rótulo.
 */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ refazer?: string }>;
}) {
  const session = await requireSession("/onboarding");
  const { refazer } = await searchParams;

  const db = await getDb();
  const [perfil] = await db
    .select({
      onboardingCompleted: userProfile.onboardingCompleted,
      displayName: userProfile.displayName,
      gender: userProfile.gender,
      orientation: userProfile.orientation,
      ageRange: userProfile.ageRange,
      seducerArchetype: userProfile.seducerArchetype,
    })
    .from(userProfile)
    .where(eq(userProfile.userId, session.user.id));

  const refazendo = refazer === "1";
  if (perfil?.onboardingCompleted && !refazendo) redirect("/");

  return (
    <OnboardingClient
      refazendo={refazendo}
      arquetipoAtual={refazendo ? perfil?.seducerArchetype ?? null : null}
      inicial={{
        displayName: perfil?.displayName ?? session.user.name ?? "",
        gender: perfil?.gender ?? "",
        orientation: perfil?.orientation ?? "",
        ageRange: perfil?.ageRange ?? "",
      }}
    />
  );
}
