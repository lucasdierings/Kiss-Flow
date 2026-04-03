"use client";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  contactName?: string;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  // Simple markdown-like rendering (bold, italic, lists)
  function renderContent(text: string) {
    return text.split("\n").map((line, i) => {
      // Bold
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#e5e5e5] font-semibold">$1</strong>');
      // Italic
      processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Bullet points
      if (processed.startsWith("- ") || processed.startsWith("• ")) {
        processed = `<span class="text-[#8b5cf6] mr-1">•</span>${processed.slice(2)}`;
      }
      // Numbered lists
      const numMatch = processed.match(/^(\d+)\.\s/);
      if (numMatch) {
        processed = `<span class="text-[#8b5cf6] mr-1 font-mono text-xs">${numMatch[1]}.</span>${processed.slice(numMatch[0].length)}`;
      }

      if (!processed.trim()) return <br key={i} />;
      return <p key={i} className="mb-1 last:mb-0" dangerouslySetInnerHTML={{ __html: processed }} />;
    });
  }

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
        isUser
          ? "bg-gradient-to-br from-[#7c3aed] to-[#6d28d9]"
          : "bg-gradient-to-br from-[#e11d48] to-[#be123c]"
      }`}>
        {isUser ? (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          </svg>
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? "text-right" : ""}`}>
        <div className={`inline-block text-left rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-[#7c3aed]/15 border border-[#7c3aed]/20 text-[#e5e5e5]"
            : "bg-[#161616] border border-[#262626] text-[#a3a3a3]"
        }`}>
          {renderContent(content)}
        </div>
        {timestamp && (
          <p className={`text-[9px] text-[#737373]/50 mt-1 ${isUser ? "text-right" : ""}`}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}
