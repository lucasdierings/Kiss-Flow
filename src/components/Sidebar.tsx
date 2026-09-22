"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SEDUCER_ARCHETYPES } from "@/lib/types";

/**
 * Navegação.
 *
 * `ativo: false` esconde o item. Sete dos oito links apontavam para páginas
 * que não existem desde o pivô, e cada clique dava 404 — inclusive o
 * "Adicionar primeiro alvo" do dashboard. Melhor um menu curto e verdadeiro
 * do que um completo e quebrado: ao construir a tela, vire a chave.
 */
const navItems = [
  {
    label: "Dashboard",
    href: "/",
    ativo: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: "Agente",
    href: "/agente",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    ativo: true,
  },
  {
    label: "Alvos",
    href: "/alvos",
    ativo: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-4.5 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    label: "Kanban",
    href: "/kanban",
    ativo: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp Studio",
    href: "/whatsapp",
    ativo: false,
    icon: (
      <svg className="w-5 h-5 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    label: "Matriz Vendas",
    href: "/matriz-vendas",
    ativo: false,
    icon: (
      <svg className="w-5 h-5 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v6.75m3-9v9m3-6.75v6.75M3 19.5h18M3 4.5h18" />
      </svg>
    ),
  },
  {
    label: "Dates & Encontros",
    href: "/encontros",
    ativo: false,
    icon: (
      <svg className="w-5 h-5 text-[#e11d48]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    label: "Táticas",
    href: "/taticas",
    ativo: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/analytics",
    ativo: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    label: "Perfil",
    href: "/perfil",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    ativo: true,
  },
].filter((item) => item.ativo);

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [userName, setUserName] = useState("");
  // Vazio até a carga: o padrão anterior era o rótulo "O Encantador", que
  // nunca casava com SEDUCER_ARCHETYPES (a busca é por id, tipo "charmer").
  const [userArchetype, setUserArchetype] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function loadProfile() {
      try {
        const resposta = await fetch("/api/profile");
        if (resposta.ok) {
          const { profile } = (await resposta.json()) as {
            profile: { displayName: string | null; seducerArchetype: string | null; avatarUrl: string | null };
          };
          // Sem nome no perfil, o componente mostra o estado vazio em vez de
          // um rótulo inventado.
          setUserName(profile.displayName ?? "");
          if (profile.seducerArchetype) setUserArchetype(profile.seducerArchetype);
          if (profile.avatarUrl) setAvatarUrl(profile.avatarUrl);
        }
      } catch { /* silent fallback */ }
    }
    loadProfile();
  }, []);

  const archetype = SEDUCER_ARCHETYPES.find((a) => a.id === userArchetype);
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 glass-strong flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#262626]/50">
        <Link href="/" className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#e11d48] flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          </svg>
        </Link>
        {!collapsed && (
          <div className="animate-float-up">
            <div className="text-sm font-bold tracking-tighter text-white">Kiss Flow</div>
            <div className="text-[9px] text-[#737373] uppercase tracking-wider">CRM do Amor</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive(item.href)
                ? "bg-[#7c3aed]/15 text-[#8b5cf6] font-semibold border border-[#7c3aed]/30"
                : "text-[#737373] hover:text-[#a3a3a3] hover:bg-[#ffffff05]"
            }`}
          >
            <div className="flex-shrink-0">{item.icon}</div>
            {!collapsed && (
              <span className="text-xs animate-float-up">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom User */}
      <Link href="/perfil" className="block p-3 border-t border-[#262626]/50 hover:bg-[#ffffff05] transition-colors">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-[#8b5cf6]/40">
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#7c3aed] to-[#e11d48] flex items-center justify-center">
                <span className="text-xs font-semibold text-white">{initials}</span>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="animate-float-up">
              <div className="text-xs font-medium text-white">{userName}</div>
              <div className="text-[9px] text-[#737373]">
                {archetype ? `Estilo: ${archetype.name}` : "O Encantador"}
              </div>
            </div>
          )}
        </div>
      </Link>
    </aside>
  );
}
