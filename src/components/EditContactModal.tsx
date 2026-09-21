"use client";

import { useState } from "react";
import {
  Contact,
  LOVE_LANGUAGES,
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
  const [loveLanguage, setLoveLanguage] = useState<LoveLanguage | "">(
    contact.loveLanguage || ""
  );

  if (!isOpen) return null;

  const handleSave = () => {
    if (!firstName.trim()) return;
    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      notes: notes.trim(),
      phone: phone.trim() || undefined,
      loveLanguage: loveLanguage || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#161616] border border-[#262626] shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold tracking-tighter text-[#e5e5e5]">Editar Alvo</h2>
          <button
            onClick={onClose}
            className="text-[#737373] hover:text-[#a3a3a3] transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
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

          <div>
            <label className="text-xs text-[#737373] mb-1 block">Notas / Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Informações relevantes sobre o alvo..."
              className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] placeholder:text-[#737373]/50 focus:outline-none focus:border-[#7c3aed]/50 resize-none transition-colors"
            />
          </div>
        </div>

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
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#e11d48] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
