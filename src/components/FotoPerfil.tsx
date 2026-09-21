"use client";

import { useRef, useState } from "react";

/**
 * Foto do perfil.
 *
 * Sobe para o R2 pelo /api/media/upload. O bucket é privado, então a imagem
 * é servida por /api/media/<chave>, que confere o dono pelo prefixo — nada de
 * URL pública e adivinhável para foto de rosto.
 */
export default function FotoPerfil({
  urlAtual,
  nome,
  aoEnviar,
}: {
  urlAtual: string | null;
  nome: string;
  aoEnviar: (url: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const iniciais = nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function escolher(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    setErro(null);
    setEnviando(true);

    const form = new FormData();
    form.append("file", arquivo);
    form.append("kind", "avatar_user");

    const r = await fetch("/api/media/upload", { method: "POST", body: form });
    const corpo = (await r.json().catch(() => null)) as
      | { url?: string; error?: string; detail?: string }
      | null;

    if (!r.ok || !corpo?.url) {
      setErro(corpo?.detail ?? corpo?.error ?? "Não foi possível enviar a foto.");
      setEnviando(false);
      return;
    }

    aoEnviar(corpo.url);
    setEnviando(false);
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={enviando}
        className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[var(--card-border)] bg-[#0D0D0D]"
        aria-label="Trocar foto do perfil"
      >
        {urlAtual ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={urlAtual} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xl text-[var(--muted)]">
            {iniciais || "?"}
          </span>
        )}

        <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
          {enviando ? "Enviando…" : "Trocar"}
        </span>
      </button>

      <div>
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={enviando}
          className="rounded-lg border border-[var(--card-border)] px-3 py-2 text-xs transition-colors hover:border-[#3a3a3a] disabled:opacity-40"
        >
          {enviando ? "Enviando…" : urlAtual ? "Trocar foto" : "Adicionar foto"}
        </button>
        <p className="mt-1.5 text-[11px] text-[var(--muted)]">JPG, PNG ou WebP, até 5 MB.</p>
        {erro && <p className="mt-1 text-[11px] text-[#fda4af]">{erro}</p>}
      </div>

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={escolher}
        className="hidden"
      />
    </div>
  );
}
