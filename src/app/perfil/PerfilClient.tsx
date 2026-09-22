"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LOVE_LANGUAGES, SEDUCER_ARCHETYPES } from "@/lib/types";
import Carteira from "@/components/Carteira";
import FotoPerfil from "@/components/FotoPerfil";

interface Perfil {
  displayName: string;
  gender: string;
  orientation: string;
  ageRange: string;
  avatarUrl: string | null;
  /** Alimenta o alerta de proximidade entre pessoas da mesma cidade. */
  city: string;
  /** Muda o TOM das sugestões, não só o conteúdo. */
  relationshipGoal: string;
  /** Como o próprio usuário recebe afeto — ajuda a IA a calibrar. */
  loveLanguage: string;
  bio: string;
  seducerArchetype: string;
  plan: string;
}

/**
 * O que a pessoa busca. Não é o mesmo que o objetivo com cada alvo: aqui é a
 * intenção geral, e ela muda o tom de tudo que a IA sugere.
 */
const OBJETIVOS = [
  { id: "relacionamento", label: "Relacionamento sério" },
  { id: "conhecer", label: "Conhecer pessoas" },
  { id: "reconquista", label: "Reconquistar alguém" },
  { id: "amizade", label: "Amizades e convívio" },
  { id: "sem_definir", label: "Ainda descobrindo" },
];

const GENEROS = ["masculino", "feminino", "nao_binario", "outro"];
const ORIENTACOES = ["mulheres", "homens", "ambos"];
const FAIXAS = ["18-24", "25-34", "35-44", "45+"];

const ROTULO_GENERO: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  nao_binario: "Não-binário",
  outro: "Prefiro não dizer",
};

const ROTULO_ORIENTACAO: Record<string, string> = {
  mulheres: "Mulheres",
  homens: "Homens",
  ambos: "Ambos",
};

export default function PerfilClient() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const r = await fetch("/api/profile");
      if (!r.ok || cancelado) return;
      const { profile } = (await r.json()) as { profile: Record<string, string | null> };
      if (cancelado) return;
      setPerfil({
        displayName: profile.displayName ?? "",
        gender: profile.gender ?? "",
        orientation: profile.orientation ?? "",
        ageRange: profile.ageRange ?? "",
        avatarUrl: profile.avatarUrl ?? null,
        city: profile.city ?? "",
        relationshipGoal: profile.relationshipGoal ?? "",
        loveLanguage: profile.loveLanguage ?? "",
        bio: profile.bio ?? "",
        seducerArchetype: profile.seducerArchetype ?? "charmer",
        plan: profile.plan ?? "free",
      });
    })();
    return () => { cancelado = true; };
  }, []);

  async function salvar() {
    if (!perfil) return;
    setSalvando(true);
    setSalvo(false);

    // O arquétipo NÃO é enviado: ele vem do quiz, calculado no servidor.
    // Deixar editável aqui esvaziaria o onboarding e desalinharia a persona
    // da IA do comportamento real do usuário.
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: perfil.displayName.trim() || null,
        gender: perfil.gender || null,
        orientation: perfil.orientation || null,
        ageRange: perfil.ageRange || null,
        city: perfil.city.trim() || null,
        relationshipGoal: perfil.relationshipGoal || null,
        loveLanguage: perfil.loveLanguage || null,
        bio: perfil.bio.trim() || null,
      }),
    });

    setSalvando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  }

  if (!perfil) {
    return <main className="mx-auto max-w-lg px-4 py-10 text-sm text-[var(--muted)]">Carregando…</main>;
  }

  const arquetipo = SEDUCER_ARCHETYPES.find((a) => a.id === perfil.seducerArchetype);

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <Link href="/" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tighter">Meu perfil</h1>

      <div className="bento-card mt-6 flex flex-col gap-5">
        <FotoPerfil
          urlAtual={perfil.avatarUrl}
          nome={perfil.displayName}
          aoEnviar={(url) => setPerfil({ ...perfil, avatarUrl: url })}
        />

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--muted)]">Como quer ser chamado</span>
          <input
            value={perfil.displayName}
            onChange={(e) => setPerfil({ ...perfil, displayName: e.target.value })}
            className="rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-violet)]"
          />
        </label>

        <Grupo
          titulo="Gênero"
          opcoes={GENEROS.map((g) => ({ id: g, label: ROTULO_GENERO[g] }))}
          valor={perfil.gender}
          aoEscolher={(v) => setPerfil({ ...perfil, gender: v })}
        />
        <Grupo
          titulo="Você se interessa por"
          opcoes={ORIENTACOES.map((o) => ({ id: o, label: ROTULO_ORIENTACAO[o] }))}
          valor={perfil.orientation}
          aoEscolher={(v) => setPerfil({ ...perfil, orientation: v })}
        />
        <Grupo
          titulo="Faixa etária"
          opcoes={FAIXAS.map((f) => ({ id: f, label: f }))}
          valor={perfil.ageRange}
          aoEscolher={(v) => setPerfil({ ...perfil, ageRange: v })}
        />

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--muted)]">Cidade</span>
          <input
            value={perfil.city}
            onChange={(e) => setPerfil({ ...perfil, city: e.target.value })}
            placeholder="Onde você vive"
            className="rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-3 py-2.5 text-sm outline-none placeholder:text-[#4a4a4a] focus:border-[var(--accent-violet)]"
          />
          <span className="text-[11px] text-[var(--muted)]">
            Usada para avisar quando duas pessoas suas são da mesma cidade.
          </span>
        </label>

        <Grupo
          titulo="O que você busca"
          opcoes={OBJETIVOS}
          valor={perfil.relationshipGoal}
          aoEscolher={(v) => setPerfil({ ...perfil, relationshipGoal: v })}
        />

        <div className="flex flex-col gap-1.5">
          <Grupo
            titulo="Como você recebe afeto"
            opcoes={LOVE_LANGUAGES.map((l) => ({ id: l.id, label: l.name }))}
            valor={perfil.loveLanguage}
            aoEscolher={(v) => setPerfil({ ...perfil, loveLanguage: v })}
          />
          <span className="text-[11px] text-[var(--muted)]">
            Ajuda a IA a calibrar o que sugerir — o que funciona com você costuma
            informar o que você percebe nos outros.
          </span>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--muted)]">Sobre você</span>
          <textarea
            value={perfil.bio}
            onChange={(e) => setPerfil({ ...perfil, bio: e.target.value })}
            rows={3}
            maxLength={500}
            placeholder="O que você faz, o que gosta, o que te trouxe aqui"
            className="resize-y rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-3 py-2.5 text-sm outline-none placeholder:text-[#4a4a4a] focus:border-[var(--accent-violet)]"
          />
          <span className="text-[11px] text-[var(--muted)]">
            {perfil.bio.length}/500 · entra no contexto das sugestões
          </span>
        </label>

        <button
          onClick={salvar}
          disabled={salvando}
          className="rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {salvando ? "Salvando…" : salvo ? "Salvo" : "Salvar"}
        </button>
      </div>

      <div className="bento-card mt-4">
        <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Seu arquétipo</p>
        <p className="mt-2 text-lg font-medium">{arquetipo?.name ?? perfil.seducerArchetype}</p>
        {arquetipo?.desc && <p className="mt-1 text-sm text-[var(--muted)]">{arquetipo.desc}</p>}
        <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
          Calculado a partir das suas respostas, por isso não é editável na mão.
          Mas seu jeito de se relacionar muda — refaça quando sentir que o
          diagnóstico não descreve mais você.
        </p>
        <Link
          href="/onboarding?refazer=1"
          className="mt-4 inline-block rounded-lg border border-[var(--accent-violet)] px-4 py-2 text-xs transition-colors hover:bg-[var(--accent-purple)]/15"
        >
          Refazer diagnóstico
        </Link>
      </div>

      <div className="mt-4">
        <Carteira />
      </div>
    </main>
  );
}

function Grupo({
  titulo,
  opcoes,
  valor,
  aoEscolher,
}: {
  titulo: string;
  opcoes: { id: string; label: string }[];
  valor: string;
  aoEscolher: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--muted)]">{titulo}</span>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => aoEscolher(o.id)}
            className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
              valor === o.id
                ? "border-[var(--accent-violet)] bg-[var(--accent-purple)]/15 text-[var(--foreground)]"
                : "border-[var(--card-border)] bg-[#0D0D0D] text-[var(--muted)] hover:border-[#3a3a3a]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
