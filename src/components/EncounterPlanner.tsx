"use client";

import { useState, useEffect } from "react";
import { loadState, saveState } from "@/lib/store";
import type { Contact, Interaction } from "@/lib/types";

interface DateRecord {
  id: string;
  contactId: string;
  contactName: string;
  location: string;
  dateStr: string;
  cost: number;
  rating: number;
  kiss: boolean;
  intimacy: boolean;
  notes: string;
  createdAt: string;
}

export default function EncounterPlanner() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dates, setDates] = useState<DateRecord[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [cost, setCost] = useState<string>("120");
  const [rating, setRating] = useState<number>(5);
  const [kiss, setKiss] = useState<boolean>(true);
  const [intimacy, setIntimacy] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    const state = loadState();
    if (state) {
      setContacts(state.contacts || []);
      if (state.contacts.length > 0) {
        setSelectedContactId(state.contacts[0].id);
      }

      // Load mock/stored dates from interactions
      const storedDates: DateRecord[] = (state.interactions || [])
        .filter((i) => i.category === "presencial_casual" || i.category === "presencial_intimate")
        .map((i) => ({
          id: i.id,
          contactId: i.contactId,
          contactName: state.contacts.find((c) => c.id === i.contactId)?.firstName || "Alvo",
          location: i.location || "Restaurante / Bar",
          dateStr: i.date.split("T")[0],
          cost: 150,
          rating: 5,
          kiss: i.sentiment > 0.4,
          intimacy: i.category === "presencial_intimate",
          notes: i.notes || "",
          createdAt: i.date,
        }));

      // Add default mock dates if empty for clean prototype display
      if (storedDates.length === 0 && state.contacts.length > 0) {
        const mock: DateRecord[] = [
          {
            id: "date-1",
            contactId: state.contacts[0].id,
            contactName: state.contacts[0].firstName,
            location: "Vinho & Jazz Bar - Jardins",
            dateStr: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
            cost: 210,
            rating: 5,
            kiss: true,
            intimacy: true,
            notes: "Excelente química presencial. Conversa profunda sobre viagens e projetos.",
            createdAt: new Date().toISOString(),
          },
          {
            id: "date-2",
            contactId: state.contacts[0].id,
            contactName: state.contacts[0].firstName,
            location: "Café Botânico",
            dateStr: new Date(Date.now() - 86400000 * 10).toISOString().split("T")[0],
            cost: 75,
            rating: 4,
            kiss: true,
            intimacy: false,
            notes: "Primeiro date de baixa pressão. Ótimo para quebrar o gelo.",
            createdAt: new Date().toISOString(),
          },
        ];
        setDates(mock);
      } else {
        setDates(storedDates);
      }
    }
  }, []);

  const handleCreateDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContactId || !location.trim()) return;

    const contactObj = contacts.find((c) => c.id === selectedContactId);
    const newRecord: DateRecord = {
      id: `date-${Date.now()}`,
      contactId: selectedContactId,
      contactName: contactObj ? contactObj.firstName : "Alvo",
      location: location.trim(),
      dateStr: new Date().toISOString().split("T")[0],
      cost: parseFloat(cost) || 0,
      rating,
      kiss,
      intimacy,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedDates = [newRecord, ...dates];
    setDates(updatedDates);

    // Also persist into interaction store
    const state = loadState();
    if (state) {
      const newInteraction: Interaction = {
        id: newRecord.id,
        contactId: selectedContactId,
        typeId: intimacy ? "sleepover" : (kiss ? "dinner" : "coffee"),
        category: intimacy ? "presencial_intimate" : "presencial_casual",
        sentiment: kiss ? 0.8 : 0.4,
        date: new Date().toISOString(),
        duration: 120,
        initiatedByTarget: false,
        location: location.trim(),
        notes: `Date em ${location.trim()}. Custo: R$ ${cost}. ${notes}`,
        enchantmentAfter: 0.85,
        mysteryAfter: 70,
        tensionAfter: 80,
      };
      state.interactions.unshift(newInteraction);
      saveState(state);
    }

    setShowModal(false);
    setLocation("");
    setNotes("");
  };

  // Metrics calculation
  const totalSpent = dates.reduce((acc, d) => acc + d.cost, 0);
  const avgCostPerDate = dates.length > 0 ? (totalSpent / dates.length).toFixed(0) : "0";
  const totalKisses = dates.filter((d) => d.kiss).length;
  const kissRate = dates.length > 0 ? ((totalKisses / dates.length) * 100).toFixed(0) : "0";
  const costPerKiss = totalKisses > 0 ? (totalSpent / totalKisses).toFixed(0) : "N/A";

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bento-card bg-gradient-to-r from-[#161616] via-[#151c28] to-[#161616] border-[#059669]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#059669] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
            Central de Dates & ROI de Encontros Presenciais
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Gestão de Encontros & Conversões Físicas
          </h2>
          <p className="text-sm text-[#a3a3a3] mt-1">
            Registro de custos em R$, ambiente, cálculo de custo por beijo (CPK) e retenção pós-date.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#e11d48] text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-[#8b5cf6]/20 cursor-pointer"
        >
          <span>➕ Novo Date / Encontro</span>
        </button>
      </div>

      {/* Financial & Conversion Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bento-card border-[#262626] p-4">
          <div className="text-xs text-[#737373] uppercase font-mono">Investimento Total em Dates</div>
          <div className="text-2xl font-bold text-white mt-1">R$ {totalSpent.toLocaleString("pt-BR")}</div>
          <div className="text-[11px] text-[#737373] mt-1 font-mono">Em {dates.length} encontros registrados</div>
        </div>

        <div className="bento-card border-[#262626] p-4">
          <div className="text-xs text-[#737373] uppercase font-mono">Custo Médio por Date</div>
          <div className="text-2xl font-bold text-[#8b5cf6] mt-1">R$ {avgCostPerDate}</div>
          <div className="text-[11px] text-[#737373] mt-1 font-mono">Alocação por saída</div>
        </div>

        <div className="bento-card border-[#262626] p-4">
          <div className="text-xs text-[#737373] uppercase font-mono">Taxa de Conversão (Beijo)</div>
          <div className="text-2xl font-bold text-[#059669] mt-1">{kissRate}%</div>
          <div className="text-[11px] text-[#059669] mt-1 font-mono">{totalKisses} beijos registrados</div>
        </div>

        <div className="bento-card border-[#262626] p-4">
          <div className="text-xs text-[#737373] uppercase font-mono">Custo por Conversão (CPK)</div>
          <div className="text-2xl font-bold text-[#06b6d4] mt-1">
            {costPerKiss !== "N/A" ? `R$ ${costPerKiss}` : "N/A"}
          </div>
          <div className="text-[11px] text-[#737373] mt-1 font-mono">Investimento por beijo/conversão</div>
        </div>
      </div>

      {/* Date History List */}
      <div className="bento-card p-4 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center justify-between border-b border-[#262626] pb-3">
          <span>🍷 Histórico de Dates & Retrospectivas</span>
          <span className="text-xs text-[#737373]">{dates.length} encontros cadastrados</span>
        </h3>

        {dates.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#737373]">
            Nenhum date cadastrado ainda. Clique em "Novo Date / Encontro" acima para registrar.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dates.map((d) => (
              <div key={d.id} className="p-4 rounded-xl bg-[#0d0d0d] border border-[#262626] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{d.contactName}</span>
                    <span className="text-xs text-[#737373] font-mono">({d.dateStr})</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#8b5cf6]">
                    R$ {d.cost}
                  </span>
                </div>

                <div className="text-xs text-[#a3a3a3] flex items-center gap-1">
                  📍 <span>{d.location}</span>
                </div>

                {d.notes && (
                  <p className="text-xs text-[#e5e5e5] italic bg-[#161616] p-2 rounded-lg border border-[#262626]">
                    "{d.notes}"
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 text-xs border-t border-[#262626]/50">
                  <div className="flex items-center gap-2">
                    {d.kiss ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#059669]/20 text-[#059669] border border-[#059669]/30">
                        💋 Houve Beijo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#262626] text-[#737373]">
                        Sem Beijo
                      </span>
                    )}

                    {d.intimacy && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e11d48]/20 text-[#e11d48] border border-[#e11d48]/30">
                        🔥 Intimidade
                      </span>
                    )}
                  </div>

                  <div className="text-[#d97706] font-mono text-xs">
                    {"★".repeat(d.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Date Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 glass-strong flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#262626] w-full max-w-md rounded-2xl p-6 space-y-4 animate-float-up">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="text-base font-bold text-white">Registrar Novo Date</h3>
              <button onClick={() => setShowModal(false)} className="text-[#737373] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateDate} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#737373] mb-1">Selecionar Alvo:</label>
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className="w-full bg-[#0d0d0d] text-white border border-[#262626] rounded-xl p-2.5"
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName || ""}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#737373] mb-1">Local / Restaurante / Bar:</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Bar de Jazz ou Café Botânico"
                  required
                  className="w-full bg-[#0d0d0d] text-white border border-[#262626] rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#737373] mb-1">Custo Estimado (R$):</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    required
                    className="w-full bg-[#0d0d0d] text-white border border-[#262626] rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#737373] mb-1">Avaliação (1-5 Estrelas):</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-[#0d0d0d] text-white border border-[#262626] rounded-xl p-2.5"
                  >
                    <option value={5}>5 Estrelas (Perfeito)</option>
                    <option value={4}>4 Estrelas (Muito Bom)</option>
                    <option value={3}>3 Estrelas (Ok)</option>
                    <option value={2}>2 Estrelas (Regular)</option>
                    <option value={1}>1 Estrela (Fraco)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={kiss}
                    onChange={(e) => setKiss(e.target.checked)}
                    className="accent-[#059669] w-4 h-4"
                  />
                  <span>💋 Houve Beijo (Conversão)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={intimacy}
                    onChange={(e) => setIntimacy(e.target.checked)}
                    className="accent-[#e11d48] w-4 h-4"
                  />
                  <span>🔥 Houve Intimidade</span>
                </label>
              </div>

              <div>
                <label className="block text-[#737373] mb-1">Notas e Retrospectiva:</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Resumo dos assuntos marcantes, química e próximos passos..."
                  className="w-full bg-[#0d0d0d] text-white border border-[#262626] rounded-xl p-2.5 h-20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2 px-4 text-[#737373] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#e11d48] text-white font-semibold shadow-md"
                >
                  Salvar Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
