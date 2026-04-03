"use client";

import { useState } from "react";

interface Suggestion {
  style: string;
  message: string;
}

interface MessageSuggestionCardProps {
  suggestions: Suggestion[];
  phone?: string;
}

export default function MessageSuggestionCard({
  suggestions,
  phone,
}: MessageSuggestionCardProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleWhatsApp = (text: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
  };

  const styleColors: Record<string, string> = {
    misteriosa: "#8b5cf6",
    provocativa: "#e11d48",
    "de validação": "#059669",
    carinhosa: "#d97706",
    direta: "#06b6d4",
  };

  return (
    <div className="space-y-3">
      {suggestions.map((s, idx) => {
        const color = styleColors[s.style.toLowerCase()] || "#8b5cf6";
        return (
          <div
            key={idx}
            className="rounded-xl bg-[#0D0D0D] border border-[#262626] p-3 hover:border-[#333] transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: `${color}15`,
                  color,
                  border: `1px solid ${color}30`,
                }}
              >
                {s.style}
              </span>
            </div>
            <p className="text-sm text-[#e5e5e5] leading-relaxed mb-3">{s.message}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(s.message, idx)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-medium bg-[#161616] border border-[#262626] text-[#a3a3a3] hover:text-[#e5e5e5] hover:border-[#333] transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                {copiedIdx === idx ? "Copiado!" : "Copiar"}
              </button>
              {phone && (
                <button
                  onClick={() => handleWhatsApp(s.message)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-medium bg-[#059669]/10 border border-[#059669]/20 text-[#059669] hover:bg-[#059669]/20 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Enviar WhatsApp
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
