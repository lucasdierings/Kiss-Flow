"use client";

import type { EstadoRecurso } from "@/lib/progression";

/**
 * O que aparece no lugar de um gráfico que ainda não tem dado suficiente.
 *
 * Três decisões deliberadas:
 *
 * 1. Diz **o que falta** e **quanto falta**, não só "sem dados". Um vazio
 *    mudo parece defeito; um vazio que explica vira instrução.
 * 2. Diz **por que** aquele limiar existe. Os números saem da auditoria do
 *    scoring, não de palpite, e quem lê merece saber disso.
 * 3. Mostra a barra de progresso. Ver a distância encurtar é o que
 *    transforma requisito em objetivo.
 */
export default function RecursoBloqueado({
  titulo,
  estado,
  className = "",
}: {
  titulo: string;
  estado: EstadoRecurso;
  className?: string;
}) {
  const pct = Math.round(estado.progresso * 100);

  return (
    <div className={`bento-card flex flex-col justify-center ${className}`}>
      <div className="flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="h-3.5 w-3.5 text-[var(--muted)]"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
        <h3 className="text-xs uppercase tracking-widest text-[var(--muted)]">{titulo}</h3>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
          <span>Falta pouco</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--card-border)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] transition-all duration-500"
            style={{ width: `${Math.max(pct, 3)}%` }}
          />
        </div>
      </div>

      {estado.falta.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1">
          {estado.falta.map((f) => (
            <li key={f} className="text-xs text-[var(--foreground)]">
              {f}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">{estado.porque}</p>
    </div>
  );
}
