"use client";

import { useState } from "react";

import { TACTICS, type Tactic } from "@/lib/tactics-data";
import { PIPELINE_STAGES, type Contact } from "@/lib/types";

/**
 * Táticas cabíveis para ESTA pessoa, nesta fase.
 *
 * SUBSTITUI a ActionBar, que ficava no painel e tinha cinco problemas:
 *
 * 1. Lista fixa no código. Oferecia "Recuo Estratégico" — risco alto, para
 *    fases avançadas — a alguém que você acabou de conhecer.
 * 2. Números errados. Dizia "Tática 10 · Poetizar Presença", mas a 10 do
 *    catálogo é "Use o Poder das Palavras"; poetizar é a 12. Dois dos cinco
 *    apontavam para outra tática.
 * 3. "Tática 21" não diz nada a ninguém. É a numeração da fonte, e a regra
 *    nº 1 do produto proíbe expor origem.
 * 4. Nenhum "porquê". A regra nº 4 exige que toda sugestão explique o
 *    contexto, e cinco botões fixos não explicam nada.
 * 5. Ficava no painel, que é visão geral — mas tática se aplica a uma pessoa,
 *    e ela usava silenciosamente o "contato ativo".
 *
 * Aqui a lista sai do catálogo real, filtrada pela fase da pessoa e ordenada
 * do menor para o maior risco. Risco alto aparece com aviso, não escondido:
 * esconder seria decidir pelo usuário; avisar é informá-lo.
 */

const CORES_RISCO: Record<Tactic["risk"], { cor: string; rotulo: string }> = {
  baixo: { cor: "#059669", rotulo: "risco baixo" },
  medio: { cor: "#d97706", rotulo: "risco médio" },
  alto: { cor: "#e11d48", rotulo: "risco alto" },
};

const ORDEM_RISCO: Record<Tactic["risk"], number> = { baixo: 0, medio: 1, alto: 2 };

export default function TaticasSugeridas({ contato }: { contato: Contact }) {
  const [aberta, setAberta] = useState<number | null>(null);
  const [mostrarTodas, setMostrarTodas] = useState(false);

  const daFase = TACTICS.filter((t) => t.phase.includes(contato.pipelineStage)).sort(
    (a, b) => ORDEM_RISCO[a.risk] - ORDEM_RISCO[b.risk]
  );

  const nomeFase = PIPELINE_STAGES.find((f) => f.id === contato.pipelineStage)?.name;
  const visiveis = mostrarTodas ? daFase : daFase.slice(0, 4);

  if (daFase.length === 0) return null;

  return (
    <section className="bento-card mt-6">
      <h2 className="text-xs uppercase tracking-widest text-[var(--muted)]">
        O que cabe agora
      </h2>
      <p className="mt-1.5 text-xs text-[var(--muted)]">
        {contato.firstName} está em <strong className="text-[var(--foreground)]">{nomeFase}</strong>.
        Estas são as abordagens que fazem sentido nesse ponto — as outras ficam de
        fora porque ainda é cedo para elas.
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {visiveis.map((t) => {
          const risco = CORES_RISCO[t.risk];
          const abertaAgora = aberta === t.number;

          return (
            <div key={t.number} className="rounded-lg border border-[var(--card-border)] bg-[#0D0D0D]">
              <button
                onClick={() => setAberta(abertaAgora ? null : t.number)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm">{t.name}</span>
                  <span className="mt-0.5 block text-[11px] text-[var(--muted)]">
                    {t.description}
                  </span>
                </span>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px]"
                  style={{ color: risco.cor, backgroundColor: `${risco.cor}1a` }}
                >
                  {risco.rotulo}
                </span>
              </button>

              {abertaAgora && (
                <div className="border-t border-[var(--card-border)] px-3 py-3">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                    Quando usar
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{t.whenToUse}</p>

                  <p className="mt-3 text-[11px] uppercase tracking-wider text-[var(--muted)]">
                    Na prática
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                    {t.example}
                  </p>

                  {t.risk === "alto" && (
                    <p className="mt-3 rounded-lg border border-[#e11d48]/30 bg-[#e11d48]/10 px-3 py-2 text-[11px] leading-relaxed text-[#fda4af]">
                      Risco alto: se você errar o momento, isso afasta em vez de
                      aproximar. Peça a leitura da situação antes.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {daFase.length > 4 && (
        <button
          onClick={() => setMostrarTodas(!mostrarTodas)}
          className="mt-3 text-xs text-[var(--accent-violet)] hover:underline"
        >
          {mostrarTodas ? "Ver menos" : `Ver mais ${daFase.length - 4}`}
        </button>
      )}
    </section>
  );
}
