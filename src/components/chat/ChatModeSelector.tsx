"use client";

export type ChatMode = "conversa" | "sugerir" | "validar";

interface ChatModeSelectorProps {
  mode: ChatMode;
  onChange: (mode: ChatMode) => void;
}

const MODES: { id: ChatMode; label: string; icon: string; desc: string }[] = [
  { id: "conversa", label: "Conversa", icon: "💬", desc: "Chat livre com a IA" },
  { id: "sugerir", label: "Sugerir", icon: "✨", desc: "Gerar mensagens para enviar" },
  { id: "validar", label: "Validar", icon: "🛡️", desc: "Analisar risco da mensagem" },
];

export default function ChatModeSelector({ mode, onChange }: ChatModeSelectorProps) {
  return (
    <div className="flex gap-1">
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors flex items-center gap-1.5 ${
            mode === m.id
              ? "bg-[#7c3aed]/15 text-[#8b5cf6] border border-[#7c3aed]/30"
              : "bg-[#0D0D0D] text-[#737373] border border-[#262626] hover:border-[#333]"
          }`}
          title={m.desc}
        >
          <span>{m.icon}</span>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}
