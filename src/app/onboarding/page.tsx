import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { getDb } from "@/server/db/client";
import { userProfile } from "@/server/db/schema";
import { requireSession } from "@/server/session";

import OnboardingClient from "./OnboardingClient";

/** Quem já concluiu não refaz o quiz por acidente ao digitar a URL. */
export default async function OnboardingPage() {
  const session = await requireSession("/onboarding");

  const db = await getDb();
  const [perfil] = await db
    .select({
      onboardingCompleted: userProfile.onboardingCompleted,
      displayName: userProfile.displayName,
    })
    .from(userProfile)
    .where(eq(userProfile.userId, session.user.id));

  if (perfil?.onboardingCompleted) redirect("/");

  return <OnboardingClient nomeInicial={perfil?.displayName ?? session.user.name ?? ""} />;
}
