import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { userProfile } from "@/server/db/schema";
import { withApi } from "@/server/guard";
import { updateProfileSchema } from "@/server/schemas";

/**
 * Perfil do usuário.
 *
 * Existia no banco desde a migração e nunca teve rota: o dashboard mostrava
 * um "Seducer Pro" fixo no código porque não havia de onde ler o nome real.
 */

export const GET = withApi(null, async ({ ctx }) => {
  const [row] = await ctx.db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, ctx.userId));

  if (!row) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      displayName: row.displayName,
      gender: row.gender,
      orientation: row.orientation,
      ageRange: row.ageRange,
      avatarUrl: row.avatarUrl,
      city: row.city,
      relationshipGoal: row.relationshipGoal,
      loveLanguage: row.loveLanguage,
      bio: row.bio,
      seducerArchetype: row.seducerArchetype,
      activeContactId: row.activeContactId,
      onboardingCompleted: row.onboardingCompleted,
      plan: row.plan,
    },
  });
});

export const PATCH = withApi(updateProfileSchema, async ({ body, ctx }) => {
  await ctx.db
    .update(userProfile)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(userProfile.userId, ctx.userId));

  return NextResponse.json({ ok: true });
});
