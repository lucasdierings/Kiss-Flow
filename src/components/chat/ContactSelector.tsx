"use client";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  primary_archetype: string;
  pipeline_stage: string;
}

interface ContactSelectorProps {
  contacts: Contact[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function ContactSelector({ contacts, selectedId, onSelect }: ContactSelectorProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {/* General chat (no contact) */}
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          selectedId === null
            ? "bg-[#7c3aed]/15 border border-[#7c3aed]/40 text-[#8b5cf6]"
            : "bg-[#0D0D0D] border border-[#262626] text-[#737373] hover:border-[#333]"
        }`}
      >
        Geral
      </button>

      {contacts.map((contact) => (
        <button
          key={contact.id}
          onClick={() => onSelect(contact.id)}
          className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            selectedId === contact.id
              ? "bg-[#7c3aed]/15 border border-[#7c3aed]/40 text-[#8b5cf6]"
              : "bg-[#0D0D0D] border border-[#262626] text-[#737373] hover:border-[#333]"
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center border border-[#262626]">
            <span className="text-[8px] font-bold text-[#8b5cf6]">
              {contact.first_name.charAt(0)}
            </span>
          </div>
          {contact.first_name}
        </button>
      ))}
    </div>
  );
}
