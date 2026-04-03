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
    page.tsx              - Dashboard principal (bento grid)
    layout.tsx            - Root layout (pt-BR, dark mode)
    globals.css           - CSS vars, glassmorphism, bento-card
    alvos/                - CRUD de alvos (targets)
      page.tsx            - Lista de alvos com filtros
      novo/page.tsx       - Cadastro de novo alvo
      [id]/page.tsx       - Detalhe do alvo com analytics
    onboarding/           - Fluxo de onboarding do usuario (planejado)
    chat/                 - Chat assistente IA (planejado)
    pricing/              - Pagina de precos (planejado)
    api/                  - API routes server-side
      ai/                 - Endpoints Gemini
  components/             - Componentes do dashboard
  lib/
    supabase.ts           - Cliente Supabase (browser + server)
    gemini.ts             - Cliente Gemini
    prompts.ts            - System prompts para IA (adaptativos por persona e objetivo)
    persona.ts            - Sistema de personas (Don Juan / Cleopatra / Neutro)
    archetype-quiz.ts     - Quiz de 10 perguntas para classificar arquetipo sedutor
    store.ts              - Estado local (localStorage) — legado, migrar para Supabase
    types.ts              - Tipos TypeScript
    engine.ts             - Regras de negocio (dopamina, timing, metricas)
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
- [ ] Fase 5: Acoes justificadas + alertas proativos ← PROXIMO
- [ ] Fase 6: LGPD + Termos de Uso + Termos de Privacidade
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

---
**Ultima atualizacao:** 03 de abril de 2026
**Status:** Backend Supabase ativo. Auth funcional. Onboarding com quiz 10 perguntas. 4 API routes Gemini. Chat IA com upload de screenshots, seletor de alvos, historico persistente, quick actions. Fases 1-4 concluidas.

@AGENTS.md
