"use client";

import { useState } from "react";
import {
  Contact,
  VICTIM_TYPES,
  LOVE_LANGUAGES,
  type VictimType,
  type LoveLanguage,
} from "@/lib/types";

interface EditContactModalProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Contact>) => void;
}

export default function EditContactModal({
  contact,
  isOpen,
  onClose,
  onSave,
}: EditContactModalProps) {
  const [firstName, setFirstName] = useState(contact.firstName);
  const [lastName, setLastName] = useState(contact.lastName);
  const [notes, setNotes] = useState(contact.notes);
  const [phone, setPhone] = useState(contact.phone || "");
  const [primaryArchetype, setPrimaryArchetype] = useState<VictimType>(contact.primaryArchetype);
  const [secondaryArchetype, setSecondaryArchetype] = useState<VictimType | "">(
    contact.secondaryArchetype || ""
  );
  const [loveLanguage, setLoveLanguage] = useState<LoveLanguage | "">(
    contact.loveLanguage || ""
  );
  const [vulnerabilities, setVulnerabilities] = useState({ ...contact.vulnerabilities });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!firstName.trim()) return;
    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      notes: notes.trim(),
      phone: phone.trim() || undefined,
      primaryArchetype,
      secondaryArchetype: secondaryArchetype || undefined,
      loveLanguage: loveLanguage || undefined,
      vulnerabilities,
    });
    onClose();
  };

  const vulnLabels: Record<string, string> = {
    fantasy: "Fantasia",
    snobbery: "Snobismo",
    loneliness: "Solidão",
    ego: "Ego",
    adventure: "Aventura",
    rebellion: "Rebeldia",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#161616] border border-[#262626] shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold tracking-tighter text-[#e5e5e5]">Editar Alvo</h2>
          <button
            onClick={onClose}
            className="text-[#737373] hover:text-[#a3a3a3] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Nome */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#737373] mb-1 block">Nome *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] focus:outline-none focus:border-[#7c3aed]/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[#737373] mb-1 block">Sobrenome</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] focus:outline-none focus:border-[#7c3aed]/50 transition-colors"
              />
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label className="text-xs text-[#737373] mb-1 block">Telefone (WhatsApp)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+55 11 99999-9999"
              className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] focus:outline-none focus:border-[#7c3aed]/50 transition-colors"
            />
          </div>

          {/* Perfil Primário */}
          <div>
            <label className="text-xs text-[#737373] mb-1.5 block">Perfil Principal</label>
            <div className="flex flex-wrap gap-1.5">
              {VICTIM_TYPES.map((vt) => (
                <button
                  key={vt.id}
                  onClick={() => setPrimaryArchetype(vt.id as VictimType)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                    primaryArchetype === vt.id
                      ? "bg-[#7c3aed]/15 text-[#8b5cf6] border border-[#7c3aed]/30"
                      : "bg-[#0D0D0D] text-[#737373] border border-[#262626] hover:border-[#333]"
                  }`}
                >
                  {vt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Perfil Secundário */}
          <div>
            <label className="text-xs text-[#737373] mb-1 block">Perfil Secundário (opcional)</label>
            <select
              value={secondaryArchetype}
              onChange={(e) => setSecondaryArchetype(e.target.value as VictimType | "")}
              className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] focus:outline-none focus:border-[#7c3aed]/50"
            >
              <option value="">Nenhum</option>
              {VICTIM_TYPES.filter((v) => v.id !== primaryArchetype).map((vt) => (
                <option key={vt.id} value={vt.id}>{vt.name}</option>
              ))}
            </select>
          </div>

          {/* Linguagem do Amor */}
          <div>
            <label className="text-xs text-[#737373] mb-1 block">Linguagem do Amor</label>
            <select
              value={loveLanguage}
              onChange={(e) => setLoveLanguage(e.target.value as LoveLanguage | "")}
              className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] focus:outline-none focus:border-[#7c3aed]/50"
            >
              <option value="">Não definida</option>
              {LOVE_LANGUAGES.map((ll) => (
                <option key={ll.id} value={ll.id}>{ll.name}</option>
              ))}
            </select>
          </div>

          {/* Vulnerabilidades */}
          <div>
            <label className="text-xs text-[#737373] mb-2 block">Vulnerabilidades</label>
            <div className="space-y-2.5">
              {Object.entries(vulnerabilities).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-[10px] text-[#737373] w-16">{vulnLabels[key]}</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={value}
                    onChange={(e) =>
                      setVulnerabilities((prev) => ({
                        ...prev,
                        [key]: parseInt(e.target.value),
                      }))
                    }
                    className="flex-1 accent-[#06b6d4]"
                  />
                  <span className="text-[10px] font-mono text-[#06b6d4] w-8 text-right">{value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="text-xs text-[#737373] mb-1 block">Notas / Contexto</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Informações relevantes sobre o alvo..."
              className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] placeholder:text-[#737373]/50 focus:outline-none focus:border-[#7c3aed]/50 resize-none transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end mt-5 pt-4 border-t border-[#262626]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-[#737373] hover:text-[#a3a3a3] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!firstName.trim()}
            className="px-5 py-2 rounded-xl bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
