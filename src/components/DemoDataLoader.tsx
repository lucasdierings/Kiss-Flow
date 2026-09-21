"use client";

import { useState } from "react";
import { loadState, saveState, getDefaultState } from "@/lib/store";

export default function DemoDataLoader({ onReload }: { onReload?: () => void }) {
  const [loaded, setLoaded] = useState(false);

  const handleLoadDemoData = () => {
    const defaultState = getDefaultState();
    saveState(defaultState);
    setLoaded(true);
    if (onReload) onReload();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="glass p-3 rounded-xl border border-[#8b5cf6]/30 flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse" />
        <span className="text-[#e5e5e5] font-medium">
          Protótipo Interativo Ativo: Deseja redefinir ou carregar dados realistas de demonstração?
        </span>
      </div>

      <button
        onClick={handleLoadDemoData}
        className="px-3 py-1.5 rounded-lg bg-[#8b5cf6] text-white font-semibold text-[11px] hover:bg-[#7c3aed] transition-colors cursor-pointer whitespace-nowrap shadow-md shadow-[#8b5cf6]/20"
      >
        {loaded ? "Recarregando..." : "⚡ Carregar Dados de Demonstração"}
      </button>
    </div>
  );
}
