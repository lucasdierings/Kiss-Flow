"use client";

import { useEffect, useState } from "react";

import { CREDIT_PACKS, PLAN_INFO, formatarPreco, type Plan } from "@/lib/plans";

/**
 * Créditos: quanto resta, quanto foi usado, e como recarregar.
 *
 * O saldo existia no banco desde a migração e não aparecia em lugar nenhum —
 * o usuário gastava crédito sem ver o número diminuir.
 *
 * A recarga muda conforme onde ele está, e isso não é detalhe de layout:
 * Apple e Google **exigem** a compra pela loja dentro do app e proíbem
 * apontar para pagamento externo lá. Na web, Pix e cartão são livres e a taxa
 * é muito menor. Por isso o componente detecta o ambiente em vez de mostrar
 * as duas coisas.
 */

interface Carteira {
  plan: Plan;
  creditsBalance: number;
  usage: {
    ai_analysis: { used: number; limit: number | null };
    upload: { used: number; limit: number | null };
  };
}

export default function Carteira({ compacto = false }: { compacto?: boolean }) {
  const [dados, setDados] = useState<Carteira | null>(null);
  const [abrindo, setAbrindo] = useState(false);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const r = await fetch("/api/billing/wallet");
      if (!r.ok || cancelado) return;
      setDados((await r.json()) as Carteira);
    })();
    return () => { cancelado = true; };
  }, []);

  if (!dados) {
    return compacto ? null : (
      <div className="bento-card">
        <p className="text-sm text-[var(--muted)]">Carregando sua carteira…</p>
      </div>
    );
  }

  const analise = dados.usage.ai_analysis;
  const restamNaFranquia =
    analise.limit === null ? null : Math.max(0, analise.limit - analise.used);
  const total = (restamNaFranquia ?? 0) + dados.creditsBalance;
  const plano = PLAN_INFO[dados.plan];

  if (compacto) {
    return (
      <span className="text-xs text-[var(--muted)]">
        {analise.limit === null ? "análises ilimitadas" : `${total} análise${total === 1 ? "" : "s"} disponíve${total === 1 ? "l" : "is"}`}
      </span>
    );
  }

  return (
    <section className="bento-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xs uppercase tracking-widest text-[var(--muted)]">Carteira</h2>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tighter">
            {analise.limit === null ? "∞" : total}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {analise.limit === null
              ? "análises ilimitadas"
              : `análise${total === 1 ? "" : "s"} disponíve${total === 1 ? "l" : "is"}`}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--card-border)] px-3 py-1 text-[11px] text-[var(--muted)]">
          plano {plano.nome}
        </span>
      </div>

      {analise.limit !== null && (
        <div className="mt-4 flex flex-col gap-2 border-t border-[var(--card-border)] pt-4 text-xs">
          <Linha
            rotulo="Da franquia do mês"
            valor={`${restamNaFranquia} de ${analise.limit}`}
            dica="Renova todo mês. Não acumula."
          />
          <Linha
            rotulo="Créditos avulsos"
            valor={String(dados.creditsBalance)}
            dica="Comprados à parte. Não expiram, e só são usados depois que a franquia acaba."
          />
        </div>
      )}

      <button
        onClick={() => setAbrindo(true)}
        className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Adicionar créditos
      </button>

      {abrindo && <ModalRecarga aoFechar={() => setAbrindo(false)} />}
    </section>
  );
}

function Linha({ rotulo, valor, dica }: { rotulo: string; valor: string; dica: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[var(--muted)]">{rotulo}</span>
        <span className="tabular-nums">{valor}</span>
      </div>
      <p className="mt-0.5 text-[11px] leading-relaxed text-[#5a5a5a]">{dica}</p>
    </div>
  );
}

/** Detecta o app embutido: a compra dentro dele precisa passar pela loja. */
function dentroDoApp(): boolean {
  if (typeof navigator === "undefined") return false;
  return /KissFlowApp/i.test(navigator.userAgent);
}

function ModalRecarga({ aoFechar }: { aoFechar: () => void }) {
  const naLoja = dentroDoApp();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={aoFechar}
    >
      <div className="bento-card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-medium">Adicionar créditos</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
          Cada análise consome 1 crédito. Créditos comprados não expiram e só são
          usados depois que a franquia do mês acaba.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {CREDIT_PACKS.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-lg border px-3 py-3 ${
                p.destaque
                  ? "border-[var(--accent-violet)] bg-[var(--accent-purple)]/10"
                  : "border-[var(--card-border)] bg-[#0D0D0D]"
              }`}
            >
              <div>
                <p className="text-sm">
                  {p.creditos} créditos
                  {p.destaque && (
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-[var(--accent-violet)]">
                      melhor valor
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                  {formatarPreco(p.precoCentavos / p.creditos)} por análise
                </p>
              </div>
              <span className="shrink-0 text-sm tabular-nums">
                {formatarPreco(p.precoCentavos)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] p-3">
          <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
            Como pagar
          </p>
          {naLoja ? (
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
              Pelo app, a compra passa pela App Store ou pelo Google Play, com o
              método de pagamento que você já tem cadastrado lá.
            </p>
          ) : (
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
              Pela web você paga com <strong className="text-[var(--foreground)]">Pix</strong> ou
              cartão de crédito.
            </p>
          )}
          <p className="mt-2 text-[11px] leading-relaxed text-[#5a5a5a]">
            Pagamento ainda não liberado — estamos em testes fechados. Enquanto
            isso, os créditos são cortesia.
          </p>
        </div>

        <button
          onClick={aoFechar}
          className="mt-4 w-full rounded-lg border border-[var(--card-border)] px-4 py-2.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
