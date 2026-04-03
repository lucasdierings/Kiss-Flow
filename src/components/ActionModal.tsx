"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import type { Contact } from "@/lib/types";

// ===== Types =====

interface TacticInfo {
  id: string;
  name: string;
  tacticNumber: number;
  description: string;
  color: string;
}

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tactic: TacticInfo | null;
  contact: Contact | null;
  onConfirm: (tacticId: string) => void;
  onAskAI: (tacticId: string) => void;
}

interface AIResponse {
  porQueAgora: string;
  comoExecutar: string[];
  risco: string;
  referencia: string;
}

// ===== Greene Tactic Reference Data =====

const TACTIC_REFERENCES: Record<number, { principle: string; quote: string }> = {
  4: {
    principle: "Criar um Triangulo -- introduza uma terceira parte para despertar ciume e competicao.",
    quote: "Se o alvo nao sente competicao, nao sente urgencia.",
  },
  6: {
    principle: "Dominar a Arte da Insinuacao -- plante ideias indiretamente para que parecam surgir no alvo.",
    quote: "A insinuacao penetra por tras das defesas, insinuando-se no inconsciente.",
  },
  10: {
    principle: "Usar a Linguagem Poetica do Amor -- estimule a imaginacao com palavras vividas.",
    quote: "As palavras sao o afrodisiaco mais subestimado. Use-as como um poeta.",
  },
  21: {
    principle: "Recuar para Avancar -- a ausencia estimula o desejo e a fantasia.",
    quote: "Um recuo calculado cria um vacuo que a outra pessoa precisa preencher.",
  },
  23: {
    principle: "Chegar com Ousadia -- no momento certo, aja com decisao absoluta.",
    quote: "A hesitacao cria duvida. A ousadia elimina o espaco entre o desejo e a acao.",
  },
};

// ===== Skeleton Loader =====

function SkeletonLine({ width = "100%" }: { width?: string }) {
  return (
    <div
      className="h-3.5 rounded-md animate-pulse"
      style={{
        width,
        background: "linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.8s ease-in-out infinite",
      }}
    />
  );
}

function SkeletonBlock() {
  return (
    <div className="space-y-2.5">
      <SkeletonLine width="90%" />
      <SkeletonLine width="75%" />
      <SkeletonLine width="85%" />
    </div>
  );
}

// ===== Section Component =====

function Section({
  number,
  title,
  color,
  children,
  icon,
}: {
  number: string;
  title: string;
  color: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="bento-card group/section">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color }}>
            {number}
          </span>
          <h3 className="text-sm font-semibold text-[#e5e5e5]">{title}</h3>
        </div>
      </div>
      <div className="text-[13px] leading-relaxed text-[#a3a3a3]">{children}</div>
    </div>
  );
}

// ===== Main Component =====

export default function ActionModal({
  isOpen,
  onClose,
  tactic,
  contact,
  onConfirm,
  onAskAI,
}: ActionModalProps) {
  const [aiData, setAiData] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Portal mount
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Animation sequencing
  useEffect(() => {
    if (isOpen) {
      // Small delay to allow portal mount before animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Fetch AI suggestions when tactic + contact change
  useEffect(() => {
    if (!isOpen || !tactic || !contact) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setAiData(null);

    fetch("/api/ai/suggest-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tacticId: tactic.id,
        tacticNumber: tactic.tacticNumber,
        contactId: contact.id,
        metrics: {
          mystery: contact.mysteryCoefficient,
          tension: contact.tensionLevel,
          enchantment: contact.enchantmentScore,
          scarcity: contact.scarcityScore,
          victimType: contact.primaryArchetype,
          pipelineStage: contact.pipelineStage,
          vulnerabilities: contact.vulnerabilities,
        },
      }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao gerar sugestoes");
        return res.json();
      })
      .then((data: AIResponse) => setAiData(data))
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Nao foi possivel gerar a analise. Tente novamente.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [isOpen, tactic, contact]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) onClose();
    },
    [onClose]
  );

  if (!mounted || !isOpen || !tactic) return null;

  const ref = TACTIC_REFERENCES[tactic.tacticNumber];
  const accentColor = tactic.color || "#7c3aed";

  const modalContent = (
    <>
      {/* Shimmer keyframe (injected once) */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes modal-slide-up {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes modal-slide-up-mobile {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center"
        style={{
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {/* Modal panel */}
        <div
          className="relative w-full md:max-w-xl md:mx-4 max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-2xl"
          style={{
            background: "#0D0D0D",
            border: "1px solid #262626",
            boxShadow: `0 0 80px ${accentColor}10, 0 25px 50px rgba(0,0,0,0.5)`,
            transform: visible ? "translateY(0)" : "translateY(40px)",
            opacity: visible ? 1 : 0,
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            }}
          />

          {/* Mobile drag handle */}
          <div className="md:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[#333]" />
          </div>

          {/* Header */}
          <div className="px-6 pt-5 pb-4 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}25`, color: accentColor }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#e5e5e5] leading-tight">
                  {tactic.name}
                </h2>
                <p className="text-[11px] font-mono uppercase tracking-widest mt-0.5" style={{ color: accentColor }}>
                  Tatica {tactic.tacticNumber} -- Robert Greene
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#737373] hover:text-[#e5e5e5] hover:bg-[#1a1a1a] transition-all duration-200"
              aria-label="Fechar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contact context pill */}
          {contact && (
            <div className="px-6 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161616] border border-[#262626]">
                {contact.avatarUrl ? (
                  <img src={contact.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ background: `${accentColor}20`, color: accentColor }}
                  >
                    {contact.firstName[0]}
                  </div>
                )}
                <span className="text-xs text-[#a3a3a3]">
                  {contact.firstName} {contact.lastName}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#737373] font-mono">
                  M:{contact.mysteryCoefficient} T:{contact.tensionLevel} E:{(contact.enchantmentScore * 100).toFixed(0)}
                </span>
              </div>
            </div>
          )}

          {/* Sections */}
          <div className="px-6 pb-4 space-y-3">
            {/* 1 -- O que e */}
            <Section
              number="01"
              title="O que e"
              color={accentColor}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              }
            >
              <p>{tactic.description}</p>
            </Section>

            {/* 2 -- Por que agora */}
            <Section
              number="02"
              title="Por que agora"
              color="#e11d48"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              {loading ? (
                <SkeletonBlock />
              ) : error ? (
                <p className="text-[#e11d48]/80">{error}</p>
              ) : aiData ? (
                <p>{aiData.porQueAgora}</p>
              ) : (
                <p className="italic text-[#525252]">Aguardando analise da IA...</p>
              )}
            </Section>

            {/* 3 -- Como executar */}
            <Section
              number="03"
              title="Como executar"
              color="#059669"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              }
            >
              {loading ? (
                <div className="space-y-3">
                  <SkeletonBlock />
                  <SkeletonLine width="60%" />
                </div>
              ) : error ? (
                <p className="text-[#e11d48]/80">--</p>
              ) : aiData ? (
                <ul className="space-y-2">
                  {aiData.comoExecutar.map((step, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                        style={{ background: "#05966915", color: "#059669" }}
                      >
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="italic text-[#525252]">Aguardando sugestoes...</p>
              )}
            </Section>

            {/* 4 -- Risco */}
            <Section
              number="04"
              title="Risco"
              color="#d97706"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              }
            >
              {loading ? (
                <SkeletonBlock />
              ) : error ? (
                <p className="text-[#e11d48]/80">--</p>
              ) : aiData ? (
                <p>{aiData.risco}</p>
              ) : (
                <p className="italic text-[#525252]">Aguardando analise de risco...</p>
              )}
            </Section>

            {/* 5 -- Referencia */}
            <Section
              number="05"
              title="Referencia"
              color="#8b5cf6"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                </svg>
              }
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-mono px-2 py-0.5 rounded"
                    style={{ background: "#8b5cf615", color: "#8b5cf6" }}
                  >
                    Tatica #{tactic.tacticNumber}
                  </span>
                  <span className="text-[#e5e5e5] text-sm font-medium">{tactic.name}</span>
                </div>
                {ref && (
                  <>
                    <p className="text-[12px] text-[#737373]">{ref.principle}</p>
                    <blockquote
                      className="pl-3 py-1 text-[12px] italic text-[#a3a3a3]"
                      style={{ borderLeft: `2px solid ${accentColor}40` }}
                    >
                      &ldquo;{ref.quote}&rdquo;
                    </blockquote>
                  </>
                )}
                {aiData?.referencia && (
                  <p className="text-[12px] text-[#525252]">{aiData.referencia}</p>
                )}
              </div>
            </Section>
          </div>

          {/* Action buttons */}
          <div className="sticky bottom-0 px-6 py-5 border-t border-[#262626]" style={{ background: "#0D0D0D" }}>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (tactic) onConfirm(tactic.id);
                }}
                disabled={loading}
                className="flex-1 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                  boxShadow: `0 4px 20px ${accentColor}30`,
                }}
              >
                Confirmar Acao
              </button>
              <button
                onClick={() => {
                  if (tactic) onAskAI(tactic.id);
                }}
                className="flex-1 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-[#1a1a1a]"
                style={{
                  border: `1px solid ${accentColor}40`,
                  color: accentColor,
                }}
              >
                Pedir Conselho a IA
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
