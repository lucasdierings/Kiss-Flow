# Kiss Flow - Gerenciador de Conquistas

## Visao Geral
CRM de Conquistas baseado nas 24 taticas de seducao de Robert Greene. O sistema gerencia relacionamentos interpessoais atraves de um pipeline (Lead Generation -> Qualification -> Nurturing -> Closing -> Retention) com metricas psicologicas (Mystery, Tension, Vulnerability, Enchantment, Scarcity).

Plataforma SaaS freemium que ajuda usuarios com dificuldades em relacionamentos a usar estrategias de seducao de forma inteligente e justificada.

## Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + CSS variables (dark theme Luxury Noir)
- **Backend:** Supabase (Postgres + Auth + Storage + RLS)
- **IA:** Google Gemini Flash/Pro via `@google/generative-ai` SDK
- **Pagamentos:** Stripe (freemium)
- **Deploy:** Vercel (free tier → Pro quando escalar)
- **Fonts:** Geist Sans + Geist Mono

## Estrutura
```
src/
  app/
    page.tsx              - Dashboard principal (bento grid + AlertBanner + ActionBar)
    layout.tsx            - Root layout (pt-BR, dark mode)
    globals.css           - CSS vars, glassmorphism, bento-card
    alvos/                - CRUD de alvos (targets)
      page.tsx            - Lista de alvos com filtros
      novo/page.tsx       - Cadastro de novo alvo
      [id]/page.tsx       - Detalhe do alvo com analytics + AlertBanner + ActionBar
    onboarding/page.tsx   - Fluxo 4-step (identidade, quiz, comunicacao, resultado)
    chat/page.tsx         - Chat assistente IA com personas e upload
    login/page.tsx        - Magic Link + Google OAuth
    signup/page.tsx       - Redirect para /login (Magic Link cria conta automaticamente)
    auth/callback/route.ts - Callback OAuth + Magic Link verification
    pricing/              - Pagina de precos (planejado)
    api/
      ai/analyze-screenshot/route.ts - Gemini Vision: OCR + sentimento + tatica
      ai/analyze-profile/route.ts    - Gemini Vision: arquetipo + vulnerabilidades
      ai/chat/route.ts               - Chat com Gemini (persona-aware)
      ai/suggest-action/route.ts     - Sugestao de acao justificada com Greene
  components/
    ActionBar.tsx         - Barra flutuante com 5 taticas, abre ActionModal
    ActionModal.tsx       - Modal com 5 secoes (O que e, Por que agora, Como executar, Risco, Referencia)
    AlertBanner.tsx       - Cards de alerta proativo com prioridade visual
    CurrentVictim.tsx     - Card perfil do contato
    EnchantmentTimeline.tsx - Grafico encantamento
    KPICards.tsx          - Metricas agregadas
    MysteryGauge.tsx      - Gauge misterio
    ScarcityIndex.tsx     - Indice escassez
    Sidebar.tsx           - Navegacao lateral
    TensionThermometer.tsx - Termometro tensao
    VulnerabilityRadar.tsx - Radar 6 eixos
    chat/                 - ChatInput, ChatMessage, ContactSelector
  lib/
    supabase.ts           - Cliente Supabase (browser + server + server-with-auth)
    gemini.ts             - Cliente Gemini (Flash, Pro, Vision)
    prompts.ts            - System prompts adaptativos (persona + objetivo)
    persona.ts            - Sistema de personas (Don Juan / Cleopatra / Neutro)
    archetype-quiz.ts     - Quiz 10 perguntas, 9 arquetipos, scoring
    alerts-engine.ts      - Motor alertas proativos (8 tipos, 24 taticas Greene, Supabase)
    store.ts              - Estado local (localStorage) — legado, migrar para Supabase
    types.ts              - Tipos TypeScript (Contact, Interaction, 18 vitimas, 5 categorias)
    engine.ts             - Regras de negocio (dopamina, timing, metricas, pipeline)
  middleware.ts           - Auth middleware (protege rotas, redirect onboarding)
```

## Design System
- Background: #0D0D0D, Cards: #161616, Borders: #262626
- Accent: Purple #7c3aed/#8b5cf6, Rose #e11d48, Emerald #059669, Amber #d97706, Cyan #06b6d4
- Glassmorphism: `.glass` e `.glass-strong`
- Cards: `.bento-card` com hover e gradient top border
- Tipografia: Geist, tracking-tighter para titulos

## Conceitos de Negocio
- **9 Arquetipos de Sedutores:** Sereia, Libertino, Amante Ideal, Dandi, Natural, Coquete, Encantador, Carismatico, Estrela
- **18 Tipos de Vitimas:** Sonhador Decepcionado, Realeza Mimada, Novo Prudente, Estrela Ofuscada, Novico, Conquistador, etc.
- **5 Linguagens do Amor (Chapman):** Palavras, Presentes, Atos, Tempo, Toque
- **Pipeline:** Lead Generation -> Qualification -> Nurturing -> Closing -> Retention
- **Metricas:** Mystery (0-100), Tension (ansiedade vs desejo), Vulnerability (radar 6 eixos), Enchantment (timeline sentimento), Scarcity (escassez)
- **Motor de Dopamina:** Reforco intermitente, jejum de dopamina, recuo estrategico, alerta de friendzone
- **Objetivo por alvo:** Amizade, Romance, Sexual, Reconquista, Outro
- **Genero/Orientacao:** Suportamos todos (hetero, homo, bi, pan, NB) — linguagem adequada sempre

## Sistema de Personas IA
- **Don Juan:** Para usuarios masculinos — mentor sofisticado e confiante, analogias de estrategia
- **Cleopatra:** Para usuarias femininas — mentora elegante e empoderada, poder feminino e intuicao
- **Neutro:** Para nao-binarios/outros — linguagem inclusiva e adaptavel
- A persona aparece no chat (header, greeting, footer), nos prompts e nas sugestoes
- O tom se adapta ao OBJETIVO do usuario com cada alvo (romance/atracao/amizade/reconquista)

## Regras de Negocio Importantes
1. **Onboarding obrigatorio:** Usuario deve completar quiz de arquetipo antes de usar o app
2. **Alvo requer:** nome, genero, cidade, objetivo — arquetipo pode ser sugerido por IA
3. **Analise de midia:** Screenshots de conversas/perfis sao analisados por Gemini Flash (OCR + sentimento + sugestoes)
4. **Acoes justificadas:** Toda sugestao de tatica deve explicar o PORQUE (contexto + referencia a Greene)
5. **Alertas proativos:** Sistema detecta friendzone risk, climax emocional, recuo necessario
6. **Alerta de proximidade:** Dois alvos na mesma cidade = warning visual
7. **Chat IA coleta intel:** O chat faz perguntas ativamente para completar o perfil do alvo
8. **LGPD:** Dados sensiveis requerem consentimento, termos de uso e privacidade OBRIGATORIOS antes do deploy publico
9. **Linguagem harmonica:** NAO parecer ferramenta so para sexo. Adaptar linguagem ao objetivo (amor, casamento, companheirismo, amizade). Ser empatetico com insegurancas dos usuarios
10. **Personas adaptativas:** Don Juan (homens), Cleopatra (mulheres), Neutro (NB/outros). Tom e sugestoes mudam conforme genero do usuario E objetivo com cada alvo

## Monetizacao (Freemium)
| Feature | Free | Premium |
|---------|------|---------|
| Alvos | 1 | Ilimitados |
| Analises IA/mes | 5 | 100 |
| Chat msgs/mes | 20 | Ilimitadas |
| Upload prints | 3/mes | Ilimitado |
| Audio analysis | Nao | Sim |
| Alertas proativos | Basicos | Completos |

## Integracao Instagram
- Meta API e restrita demais para contas pessoais
- Abordagem: upload de screenshots + analise Gemini Flash Vision
- Custo: ~$0.001 por analise de screenshot
- Futuro: avaliar Meta Graph API quando app estiver maduro

## Referencias (livros base)
Pasta `/Users/lucasdierings/Kiss Flow/Referencias/`:
- A Arte da Seducao - Robert Greene (BASE PRINCIPAL)
- Nacao Dopamina - Dra Anna Lembke
- As 5 Linguagens do Amor para Solteiros - Chapman
- Como fazer amigos e influenciar pessoas - Dale Carnegie
- A Biblia de Vendas - Jeffrey Gitomer
- A Biblia do Marketing Digital - Claudio Torres
- Tecnologia da informacao e automacao em vendas

## Environment Variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Comandos
```bash
cd "/Users/lucasdierings/Kiss Flow/kissflow-dashboard" && npm run dev   # Dev server porta 3000
npm run build                          # Build producao
npm run lint                           # ESLint
```

## Divisao de Trabalho
- **Claude Code (backend):** Supabase, API routes, Gemini integration, engine, auth, Stripe
- **VS Code + Gemini Code Assist (frontend):** Design visual, UI polish, animacoes, responsividade
- **Ambos:** Componentes React, logica de estado

## Pendencias por Fase
- [x] Fase 1: Supabase + Auth + Schema SQL + RLS — CONCLUIDO
- [x] Fase 2: Onboarding usuario (quiz arquetipo 10 perguntas, identidade, comunicacao, resultado) — CONCLUIDO
- [x] Fase 3: Motor Gemini (API routes: analyze-screenshot, analyze-profile, chat, suggest-action) — CONCLUIDO
- [x] Fase 4: Chat assistente IA (interface + Gemini + upload screenshots + historico Supabase) — CONCLUIDO
- [x] Fase 5: Acoes justificadas (ActionModal 5 secoes + IA) + alertas proativos (AlertBanner + alerts-engine 8 tipos + 24 taticas Greene) — CONCLUIDO
- [ ] Fase 6: LGPD + Termos de Uso + Termos de Privacidade ← PROXIMO
- [ ] Fase 7: Stripe + paywall freemium
- [ ] Fase 8: Deploy Vercel

## Supabase (projeto Kiss Flow)
- **Project ID:** ozsnnqebzlvnohqvwklu
- **URL:** https://ozsnnqebzlvnohqvwklu.supabase.co
- **Region:** us-east-1
- **Tabelas:** user_profiles, user_onboarding, contacts, interactions, media_uploads, ai_chat_messages, system_alerts
- **Storage bucket:** kissflow-media (10MB limit per file)
- **RLS:** Ativo em todas as tabelas (user_id = auth.uid())
- **Trigger:** Auto-create user_profiles on auth.users insert

## GitHub
- **Repo:** github.com/lucasdierings/Kiss-Flow (privado)
- **Branch principal:** main

## Auth
- **Magic Link:** signInWithOtp (cria conta automaticamente se email nao existe)
- **Google OAuth:** Configurado no Google Cloud Console + Supabase Dashboard
- **Middleware:** Protege todas as rotas exceto /login, /signup, /auth/callback, /api/*
- **Onboarding redirect:** Se user nao completou onboarding, redireciona para /onboarding

## Fase 5: Acoes Justificadas + Alertas (detalhes)
- **ActionModal:** 5 secoes (O que e, Por que agora, Como executar, Risco, Referencia Greene)
  - Fetch automatico de /api/ai/suggest-action ao abrir
  - Botoes: "Confirmar Acao" (registra interacao) e "Pedir Conselho a IA" (abre chat)
- **AlertBanner:** Cards com prioridade visual (critical=red, high=amber, medium=purple, low=neutral)
  - Max 3 visiveis, expandivel com "Ver mais X alertas"
  - Botoes Executar/Ignorar por alerta
- **alerts-engine.ts:** 8 tipos de alerta proativo:
  - friendzone_risk, climax_ready, silence_needed, excessive_frequency
  - mystery_critical, target_pursuing, extended_silence, high_enchantment
  - Cada alerta referencia tatica de Greene (numero + nome)
  - GREENE_TACTICS: mapa completo das 24 taticas em portugues
  - Persistencia Supabase: persistAlerts, dismissAlert, getActiveAlerts

---
**Ultima atualizacao:** 03 de abril de 2026
**Status:** Backend Supabase ativo. Auth funcional (Magic Link + Google OAuth). Onboarding com quiz 10 perguntas. 4 API routes Gemini. Chat IA com personas, upload screenshots, historico. Acoes justificadas com ActionModal + AlertBanner proativo + alerts-engine (24 taticas Greene). Fases 1-5 concluidas.

@AGENTS.md
