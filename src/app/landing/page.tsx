"use client";

import { useState } from "react";
import Link from "next/link";

/* ─── Feature Data ─── */
const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    title: "IA que Entende Conquista",
    description: "Analisa suas conversas, sugere a mensagem certa na hora certa e valida suas abordagens antes de enviar.",
    gradient: "from-[#8b5cf6] to-[#06b6d4]",
    span: "col-span-1 md:col-span-2",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: "Psicologia a Seu Favor",
    description: "Metricas de misterio, tensao e encantamento mostram exatamente como ela esta se sentindo sobre voce.",
    gradient: "from-[#e11d48] to-[#7c3aed]",
    span: "col-span-1",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: "Nunca Mais Trave na Conversa",
    description: "3 modos de chat: converse com a IA, peca sugestoes de mensagens ou valide seu rascunho antes de mandar.",
    gradient: "from-[#06b6d4] to-[#059669]",
    span: "col-span-1",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
      </svg>
    ),
    title: "Alerta Anti-Friendzone",
    description: "O sistema detecta sinais de friendzone, momento ideal para agir e quando e melhor recuar estrategicamente.",
    gradient: "from-[#059669] to-[#06b6d4]",
    span: "col-span-1",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
    title: "Acompanhe sua Evolucao",
    description: "Veja taxas de conversao, tempo medio por fase e onde voce pode melhorar com analytics detalhado.",
    gradient: "from-[#7c3aed] to-[#d97706]",
    span: "col-span-1 md:col-span-2",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    title: "24 Taticas Comprovadas",
    description: "Biblioteca com taticas de conquista para cada fase, com explicacao do por que funciona e como executar.",
    gradient: "from-[#d97706] to-[#e11d48]",
    span: "col-span-1",
  },
];

const steps = [
  {
    number: "01",
    title: "Descubra seu Perfil de Seducao",
    description: "Quiz rapido de 10 perguntas revela qual dos 9 arquetipos e o seu — e como usar isso a seu favor.",
  },
  {
    number: "02",
    title: "Adicione Quem Voce Quer Conquistar",
    description: "Registre nome, objetivo e o que sabe sobre ela. A IA comeca a trabalhar imediatamente.",
  },
  {
    number: "03",
    title: "Receba Orientacao Personalizada",
    description: "A IA analisa a situacao e sugere exatamente o que dizer, quando agir e quando dar espaco.",
  },
  {
    number: "04",
    title: "Conquiste com Confianca",
    description: "Acompanhe as metricas, aplique as taticas e veja sua evolucao ate encontrar sua namorada.",
  },
];

const painPoints = [
  {
    problem: "Nao sabe o que mandar no WhatsApp",
    solution: "A IA sugere 3 opcoes de mensagem prontas para copiar e enviar",
  },
  {
    problem: "Fica na friendzone sem perceber",
    solution: "Alertas detectam sinais de friendzone antes que seja tarde",
  },
  {
    problem: "Perde o timing da conversa",
    solution: "Metricas mostram o momento exato de agir ou recuar",
  },
  {
    problem: "Nao sabe se ela esta interessada",
    solution: "Analise de screenshots revela sentimento e nivel de interesse",
  },
];

const testimonials = [
  {
    text: "Eu travava na hora de mandar mensagem. Agora a IA me sugere opcoes e eu so escolho a melhor. Ja estou no terceiro encontro com uma garota incrivel.",
    name: "Lucas M.",
    age: "27 anos",
    detail: "Sao Paulo",
  },
  {
    text: "O alerta de friendzone me salvou. Eu estava investindo errado e o app me mostrou que precisava mudar a abordagem. Funcionou.",
    name: "Rafael S.",
    age: "31 anos",
    detail: "Belo Horizonte",
  },
  {
    text: "Sempre tive dificuldade com paquera. O quiz de arquetipo me fez entender meus pontos fortes. Minha confianca mudou completamente.",
    name: "Gabriel T.",
    age: "25 anos",
    detail: "Curitiba",
  },
];

const faqs = [
  {
    q: "O Kiss Flow e gratuito?",
    a: "Sim! O plano gratuito inclui 1 pessoa ativa, 5 analises de IA por mes e 20 mensagens no chat. Voce pode comecar sem cartao de credito.",
  },
  {
    q: "Como a IA me ajuda a conquistar?",
    a: "A IA analisa suas conversas, sugere mensagens personalizadas para cada situacao, identifica o momento ideal para agir e alerta sobre riscos como friendzone. Tudo baseado em psicologia comportamental comprovada.",
  },
  {
    q: "Funciona para qualquer tipo de relacionamento?",
    a: "Sim. Voce pode usar para romance, amizade, reconquista ou atracao. A IA adapta todas as sugestoes ao seu objetivo especifico com cada pessoa.",
  },
  {
    q: "Meus dados ficam seguros?",
    a: "Totalmente. Usamos criptografia, autenticacao segura e politicas rigorosas de privacidade. Seus dados sao exclusivamente seus e nunca sao compartilhados com terceiros.",
  },
  {
    q: "Preciso saber sobre psicologia para usar?",
    a: "Nao. O Kiss Flow faz toda a analise para voce. Voce so recebe orientacoes claras e praticas — sem teoria complicada.",
  },
  {
    q: "O app substitui terapia ou coaching?",
    a: "Nao. O Kiss Flow e uma ferramenta de apoio estrategico para conquista. Se voce precisa de suporte emocional ou psicologico, recomendamos buscar ajuda profissional.",
  },
];

const pricingPlans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "para sempre",
    features: [
      "1 pessoa ativa",
      "5 analises de IA/mes",
      "20 mensagens no chat/mes",
      "3 uploads de print/mes",
      "Alertas basicos",
      "Quiz de arquetipo",
    ],
    cta: "Comecar Gratis",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "R$ 29,90",
    period: "/mes",
    features: [
      "Pessoas ilimitadas",
      "100 analises de IA/mes",
      "Chat ilimitado",
      "Uploads ilimitados",
      "Alertas completos",
      "Analise de audio",
      "Suporte prioritario",
    ],
    cta: "Assinar Premium",
    highlighted: true,
  },
];

/* ─── FAQ Item Component ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bento-card !p-0 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D] rounded-2xl"
        aria-expanded={open}
      >
        <span className="text-base font-medium leading-snug">{q}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`w-5 h-5 flex-shrink-0 text-[var(--muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 -mt-1">
          <p className="text-sm text-[var(--muted)] leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden">
      {/* Skip Link (Accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#7c3aed] focus:text-white focus:rounded-lg focus:text-sm"
      >
        Pular para o conteudo principal
      </a>

      {/* Ambient Glow (decorative) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-[#7c3aed]/[0.04] blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] rounded-full bg-[#8b5cf6]/[0.03] blur-[120px]" />
      </div>

      {/* ══════════════ NAVBAR ══════════════ */}
      <header>
        <nav className="fixed top-0 inset-x-0 z-50 glass-strong" aria-label="Navegacao principal">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/landing" className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] rounded-lg" aria-label="Kiss Flow - Pagina inicial">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[#7c3aed]/20 group-hover:shadow-[#7c3aed]/40 transition-shadow">
                <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 text-white" aria-hidden="true">
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight">Kiss Flow</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors focus-visible:outline-none focus-visible:text-[var(--foreground)]">Recursos</a>
              <a href="#how-it-works" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors focus-visible:outline-none focus-visible:text-[var(--foreground)]">Como Funciona</a>
              <a href="#pricing" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors focus-visible:outline-none focus-visible:text-[var(--foreground)]">Precos</a>
              <a href="#faq" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors focus-visible:outline-none focus-visible:text-[var(--foreground)]">Duvidas</a>
              <Link href="/login" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors focus-visible:outline-none focus-visible:text-[var(--foreground)]">Entrar</Link>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white hover:opacity-90 transition-opacity shadow-lg shadow-[#7c3aed]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D]"
              >
                Comecar Gratis
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[var(--muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] rounded-lg"
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div id="mobile-menu" className="md:hidden border-t border-white/5 px-6 pb-4 pt-2 flex flex-col gap-1">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm py-3 text-[var(--muted)] hover:text-[var(--foreground)]">Recursos</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm py-3 text-[var(--muted)] hover:text-[var(--foreground)]">Como Funciona</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm py-3 text-[var(--muted)] hover:text-[var(--foreground)]">Precos</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-sm py-3 text-[var(--muted)] hover:text-[var(--foreground)]">Duvidas</a>
              <Link href="/login" className="text-sm py-3 text-[var(--muted)]">Entrar</Link>
              <Link href="/login" className="mt-2 px-4 py-3 text-sm font-medium rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white text-center">
                Comecar Gratis
              </Link>
            </div>
          )}
        </nav>
      </header>

      <main id="main-content">
        {/* ══════════════ HERO ══════════════ */}
        <section className="relative pt-32 pb-16 md:pt-44 md:pb-28 px-6" aria-labelledby="hero-heading">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/10 text-[#8b5cf6] text-xs font-medium mb-8 motion-safe:animate-float-up">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] motion-safe:animate-pulse-glow" aria-hidden="true" />
              Inteligencia Artificial para Conquista
            </div>

            {/* Headline */}
            <h1 id="hero-heading" className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.1] mb-6">
              Pare de adivinhar.{" "}
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-[#7c3aed] via-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">
                Conquiste com estrategia.
              </span>
            </h1>

            {/* Subheadline - speaks to the audience */}
            <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
              O app que usa inteligencia artificial e psicologia comportamental para te ajudar
              a conquistar quem voce quer. Saiba o que dizer, quando agir e como criar conexao de verdade.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white hover:opacity-90 transition-all shadow-xl shadow-[#7c3aed]/25 hover:shadow-[#7c3aed]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D]"
              >
                Comecar Gratis
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-medium rounded-xl border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--card)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D]"
              >
                Ver Como Funciona
              </a>
            </div>

            {/* Trust signals */}
            <p className="mt-8 text-sm text-[var(--muted)]">
              Sem cartao de credito. Configuracao em 2 minutos. Seus dados ficam seguros.
            </p>
          </div>

          {/* Hero Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7c3aed]/[0.06] blur-[150px] pointer-events-none" aria-hidden="true" />
        </section>

        {/* ══════════════ PAIN POINTS ══════════════ */}
        <section className="relative py-16 md:py-20 px-6 border-y border-white/5" aria-labelledby="pain-heading">
          <div className="max-w-5xl mx-auto">
            <h2 id="pain-heading" className="text-2xl md:text-3xl font-bold tracking-tighter text-center mb-12">
              Se voce ja passou por isso, o Kiss Flow e para voce
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {painPoints.map((item, i) => (
                <div key={i} className="bento-card flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#e11d48]/10 border border-[#e11d48]/20 flex items-center justify-center mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-[#e11d48]" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#e11d48]/80 mb-1">{item.problem}</p>
                    <div className="flex items-start gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-[#059669] flex-shrink-0 mt-0.5" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <p className="text-sm text-[var(--muted)] leading-relaxed">{item.solution}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ METRICS BAR ══════════════ */}
        <section className="relative py-12 border-b border-white/5" aria-label="Numeros do Kiss Flow">
          <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-12 md:gap-20">
            {[
              { value: "9", label: "Arquetipos de Seducao" },
              { value: "24", label: "Taticas Estrategicas" },
              { value: "5", label: "Metricas Psicologicas" },
              { value: "3", label: "Modos de Chat IA" },
            ].map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="text-3xl md:text-5xl font-bold tracking-tighter bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] bg-clip-text text-transparent">
                  {metric.value}
                </div>
                <div className="text-sm md:text-base text-[var(--muted)] mt-1">{metric.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ FEATURES ══════════════ */}
        <section id="features" className="relative py-20 md:py-28 px-6 scroll-mt-20" aria-labelledby="features-heading">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 id="features-heading" className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                Tudo que voce precisa para{" "}
                <span className="bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] bg-clip-text text-transparent">
                  conquistar com confianca
                </span>
              </h2>
              <p className="text-[var(--muted)] max-w-xl mx-auto leading-relaxed">
                Ferramentas inteligentes que transformam inseguranca em estrategia. Voce nao precisa ser
                extrovertido — precisa do plano certo.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((feature, i) => (
                <article
                  key={i}
                  className={`${feature.span} bento-card group cursor-default`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4 shadow-lg motion-safe:group-hover:scale-105 transition-transform duration-200`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight mb-2">{feature.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ HOW IT WORKS ══════════════ */}
        <section id="how-it-works" className="relative py-20 md:py-28 px-6 scroll-mt-20" aria-labelledby="steps-heading">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 id="steps-heading" className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                Comece em{" "}
                <span className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">
                  4 passos simples
                </span>
              </h2>
              <p className="text-[var(--muted)] max-w-xl mx-auto leading-relaxed">
                Sem complicacao. Em 2 minutos voce ja esta recebendo orientacao da IA.
              </p>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {steps.map((step, i) => (
                <li key={i} className="bento-card group flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#7c3aed]/20 to-[#8b5cf6]/10 border border-[#7c3aed]/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#8b5cf6] font-mono" aria-hidden="true">{step.number}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight mb-1.5">{step.title}</h3>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ══════════════ SOCIAL PROOF ══════════════ */}
        <section className="relative py-20 md:py-28 px-6 border-y border-white/5" aria-labelledby="testimonials-heading">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                Quem usa,{" "}
                <span className="bg-gradient-to-r from-[#7c3aed] to-[#059669] bg-clip-text text-transparent">
                  conquista
                </span>
              </h2>
              <p className="text-[var(--muted)] max-w-xl mx-auto leading-relaxed">
                Historias reais de quem estava no mesmo lugar que voce.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <blockquote key={i} className="bento-card flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4" aria-label="5 estrelas">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#d97706]" aria-hidden="true">
                        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-sm text-[var(--muted)] leading-relaxed flex-1 mb-5">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  <footer className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-[var(--muted)]">{t.age} — {t.detail}</p>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ PRICING ══════════════ */}
        <section id="pricing" className="relative py-20 md:py-28 px-6 scroll-mt-20" aria-labelledby="pricing-heading">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                Comece gratis,{" "}
                <span className="bg-gradient-to-r from-[#7c3aed] to-[#e11d48] bg-clip-text text-transparent">
                  evolua
                </span>{" "}
                quando quiser
              </h2>
              <p className="text-[var(--muted)] max-w-xl mx-auto leading-relaxed">
                Teste sem compromisso. Faca upgrade quando estiver pronto para desbloquear todo o potencial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative bento-card flex flex-col ${
                    plan.highlighted ? "border-[#7c3aed]/40 shadow-xl shadow-[#7c3aed]/10" : ""
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] rounded-t-2xl" />
                  )}
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-medium bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white rounded-full">
                      Mais Popular
                    </span>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tighter">{plan.price}</span>
                      <span className="text-sm text-[var(--muted)]">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="flex-1 space-y-3 mb-8" aria-label={`Recursos do plano ${plan.name}`}>
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 mt-0.5 flex-shrink-0 text-[#059669]" aria-hidden="true">
                          <path d="M4.5 12.75l6 6 9-13.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[var(--muted)]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/login"
                    className={`block w-full py-3 text-sm font-medium rounded-lg text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D] ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white shadow-lg shadow-[#7c3aed]/25 hover:opacity-90"
                        : "border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--card-hover)]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ FAQ ══════════════ */}
        <section id="faq" className="relative py-20 md:py-28 px-6 scroll-mt-20" aria-labelledby="faq-heading">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                Perguntas{" "}
                <span className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">
                  frequentes
                </span>
              </h2>
              <p className="text-[var(--muted)] max-w-xl mx-auto leading-relaxed">
                Tudo que voce precisa saber antes de comecar.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ FINAL CTA ══════════════ */}
        <section className="relative py-20 md:py-28 px-6" aria-labelledby="cta-heading">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bento-card py-16 px-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/10 via-transparent to-[#8b5cf6]/5 pointer-events-none" aria-hidden="true" />

              <h2 id="cta-heading" className="relative text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                Chega de ficar no vacuo.{" "}
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] bg-clip-text text-transparent">
                  Comece agora.
                </span>
              </h2>
              <p className="relative text-[var(--muted)] mb-8 max-w-lg mx-auto leading-relaxed">
                Milhares de pessoas ja estao usando IA para conquistar com mais confianca.
                Seu proximo grande relacionamento pode estar a uma estrategia de distancia.
              </p>
              <Link
                href="/login"
                className="relative inline-flex px-8 py-3.5 text-base font-semibold rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white hover:opacity-90 transition-all shadow-xl shadow-[#7c3aed]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D]"
              >
                Criar Conta Gratis
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="border-t border-white/5 py-10 px-6" role="contentinfo">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white" aria-hidden="true">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-medium">Kiss Flow</span>
          </div>

          <p className="text-xs text-[var(--muted)]">
            &copy; {new Date().getFullYear()} Kiss Flow. Todos os direitos reservados.
          </p>

          <nav aria-label="Links do rodape" className="flex gap-6">
            <a href="#" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Termos de Uso</a>
            <a href="#" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Privacidade</a>
            <a href="#" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Contato</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
