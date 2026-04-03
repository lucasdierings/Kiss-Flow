# Kiss Flow - Gerenciador de Conquistas

## Visao Geral
CRM de Conquistas baseado em estrategias classicas de seducao e psicologia comportamental. O sistema gerencia relacionamentos interpessoais atraves de um pipeline (Lead Generation -> Qualification -> Nurturing -> Closing -> Retention) com metricas psicologicas (Mystery, Tension, Vulnerability, Enchantment, Scarcity).

Plataforma SaaS freemium que ajuda usuarios com dificuldades em relacionamentos a usar estrategias de seducao de forma inteligente e justificada.

**IMPORTANTE:** NAO mencionar Robert Greene, nomes de livros, ou fontes das estrategias na interface do usuario. As estrategias sao usadas internamente mas a origem e segredo nosso.

## Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + CSS variables (dark theme Luxury Noir)
- **Backend:** Supabase (Postgres + Auth + Storage + RLS)
- **IA:** Google Gemini Flash/Pro via `@google/generative-ai` SDK
- **Pagamentos:** Stripe (freemium)
- **Deploy:** Cloudflare (Pages + Workers)
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
    perfil/page.tsx       - Edicao de perfil (nome, foto, genero, orientacao, arquetipo, scores)
    onboarding/page.tsx   - Fluxo 4-step (identidade, quiz, comunicacao, resultado)
    chat/page.tsx         - Chat assistente IA com 3 modos (conversa, sugerir mensagem, validar mensagem)
    kanban/page.tsx       - Kanban board com drag-and-drop HTML5 (5 colunas + Lost)
    taticas/page.tsx      - Biblioteca de 24 taticas com filtros (fase, risco, busca)
    analytics/page.tsx    - Analytics dedicado (conversao, velocidade, gargalos, performance usuario)
    login/page.tsx        - Magic Link + Google OAuth
    signup/page.tsx       - Redirect para /login (Magic Link cria conta automaticamente)
    auth/callback/route.ts - Callback OAuth + Magic Link verification
    pricing/              - Pagina de precos (planejado)
    api/
      ai/analyze-screenshot/route.ts - Gemini Vision: OCR + sentimento + tatica
      ai/analyze-profile/route.ts    - Gemini Vision: arquetipo + vulnerabilidades
      ai/chat/route.ts               - Chat com Gemini (persona-aware, context-aware)
      ai/suggest-action/route.ts     - Sugestao de acao justificada
      ai/update-context/route.ts     - Atualiza memoria de contexto por alvo via Gemini
      ai/post-mortem/route.ts        - Analise post-mortem de alvos perdidos
  components/
    ActionBar.tsx         - Barra flutuante com 5 taticas, abre ActionModal
    ActionModal.tsx       - Modal com 5 secoes (O que e, Por que agora, Como executar, Risco, Referencia)
    AlertBanner.tsx       - Cards de alerta proativo com prioridade visual
    AvatarUpload.tsx      - Upload de avatar reutilizavel (Supabase Storage)
    ConfirmDeleteModal.tsx - Modal reutilizavel de confirmacao de exclusao
    EditContactModal.tsx  - Modal de edicao completa de alvo (nome, telefone, arquetipo, vulnerabilidades)
    EditInteractionModal.tsx - Modal de edicao de interacao (categoria, tipo, sentimento, notas)
    UserProfileCard.tsx   - Card perfil do USUARIO no dashboard (scores, foto, arquetipo)
    ActiveContacts.tsx    - Lista de alvos ativos com metricas mini e prioridade
    PipelineFunnel.tsx    - Funil visual de pipeline (contatos por fase)
    QuickLogFAB.tsx       - Botao flutuante para registro rapido de interacao
    StrategicInsights.tsx - Insights dos 3 pilares (seducao, poder, natureza humana)
    BehaviorDiagnostic.tsx - Diagnostico comportamental (forcas/fraquezas/indicadores)
    ConversionAnalytics.tsx - Widget de analytics embutido no dashboard
    EnchantmentTimeline.tsx - Grafico encantamento
    KPICards.tsx          - Metricas agregadas
    MysteryGauge.tsx      - Gauge misterio
    ScarcityIndex.tsx     - Indice escassez
    Sidebar.tsx           - Navegacao lateral (Dashboard, Alvos, Kanban, Chat, Taticas, Analytics, Perfil)
    TensionThermometer.tsx - Termometro tensao
    VulnerabilityRadar.tsx - Radar 6 eixos
    chat/
      ChatInput.tsx       - Input de mensagem
      ChatMessage.tsx     - Bolha de mensagem
      ContactSelector.tsx - Seletor de alvo no chat
      ChatModeSelector.tsx - Toggle entre 3 modos (conversa/sugerir/validar)
      MessageSuggestionCard.tsx - Card de sugestao com botoes Copiar + Enviar WhatsApp (wa.me)
  lib/
    supabase.ts           - Cliente Supabase (browser + server + server-with-auth)
    gemini.ts             - Cliente Gemini (Flash, Pro, Vision)
    prompts.ts            - System prompts adaptativos (persona + objetivo + contexto por alvo)
    persona.ts            - Sistema de personas (Don Juan / Cleopatra / Neutro)
    archetype-quiz.ts     - Quiz 10 perguntas, 9 arquetipos, scoring
    alerts-engine.ts      - Motor alertas proativos (8 tipos, 24 taticas, Supabase)
    analytics.ts          - Funcoes de analytics (conversao, velocidade, gargalos, distribuicao)
    context-engine.ts     - Memoria de contexto por alvo (localStorage, injeta no prompt da IA)
    tactics-data.ts       - 24 taticas estruturadas (nome, descricao, fase, risco, exemplo)
    user-scoring.ts       - Motor de scoring do USUARIO (5 scores + indicadores + diagnostico + 3 livros)
    store.ts              - Estado local (localStorage) com CRUD completo (create, update, delete contacts/interactions)
    types.ts              - Tipos TypeScript (Contact com phone, Interaction, 18 vitimas, 5 categorias)
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
4. **Acoes justificadas:** Toda sugestao de tatica deve explicar o PORQUE (contexto + referencia estrategica)
5. **Alertas proativos:** Sistema detecta friendzone risk, climax emocional, recuo necessario
6. **Alerta de proximidade:** Dois alvos na mesma cidade = warning visual
7. **Chat IA coleta intel:** O chat faz perguntas ativamente para completar o perfil do alvo
8. **LGPD:** Dados sensiveis requerem consentimento, termos de uso e privacidade OBRIGATORIOS antes do deploy publico
9. **Linguagem harmonica:** NAO parecer ferramenta so para sexo. Adaptar linguagem ao objetivo (amor, casamento, companheirismo, amizade). Ser empatetico com insegurancas dos usuarios
10. **Personas adaptativas:** Don Juan (homens), Cleopatra (mulheres), Neutro (NB/outros). Tom e sugestoes mudam conforme genero do usuario E objetivo com cada alvo
11. **NAO citar fontes:** NUNCA mencionar Robert Greene, nomes de livros, ou origens das estrategias na interface. Usar termos genericos como "estrategias comprovadas", "psicologia comportamental", "tecnicas classicas de seducao"
12. **Acentos:** Todo texto em portugues DEVE ter acentos corretos (você, ação, estratégia, etc.)

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

## Referencias (livros base — INTERNO, nao expor ao usuario)
Pasta `/Users/lucasdierings/Kiss Flow/Referencias/`:
- A Arte da Seducao (BASE PRINCIPAL — 24 taticas, 9 sedutores, 18 vitimas)
- 48 Leis do Poder (18 leis mapeadas em user-scoring.ts para insights)
- Leis da Natureza Humana (18 leis mapeadas em user-scoring.ts para insights)
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
- **Claude Code Terminal:** Supabase, API routes, Gemini integration, engine, auth, Stripe, features complexas
- **Claude Code VS Code:** Design visual, UI polish, animacoes, responsividade, ajustes pontuais
- **Ambos:** Componentes React, logica de estado

## Pendencias por Fase
- [x] Fase 1: Supabase + Auth + Schema SQL + RLS — CONCLUIDO
- [x] Fase 2: Onboarding usuario (quiz arquetipo 10 perguntas, identidade, comunicacao, resultado) — CONCLUIDO
- [x] Fase 3: Motor Gemini (API routes: analyze-screenshot, analyze-profile, chat, suggest-action) — CONCLUIDO
- [x] Fase 4: Chat assistente IA (interface + Gemini + upload screenshots + historico Supabase) — CONCLUIDO
- [x] Fase 5: Acoes justificadas (ActionModal 5 secoes + IA) + alertas proativos (AlertBanner + alerts-engine 8 tipos + 24 taticas) — CONCLUIDO
- [x] Fase 5.5: Dashboard funcional + perfil usuario + scoring + funil + acentos + remover Greene — CONCLUIDO
- [x] Fase 6: Pipeline v2.0 — Behavioral Intelligence System — CONCLUIDO
  - [x] Tipos: ContactStatus, LostReason, PhaseTransition, ClosingGoal em types.ts
  - [x] Store: moveToLost, reactivateContact, manualStageChange, addPhaseTransition, backward compat
  - [x] Engine: suggestion-based progression (nao auto-comita, retorna sugestao para modal)
  - [x] PhaseTransitionModal: modal obrigatorio com evidencia + motivo de perda
  - [x] Closing Goal: campo no form de novo alvo + badge editavel no detalhe
  - [x] Funil com Perdidos: secao vermelha no funil + filtro na lista + reativacao
  - [x] Analytics: analytics.ts + ConversionAnalytics (taxa conversao, velocidade, gargalos)
  - [x] Tom IA estrategista: persona.ts + prompts.ts + alerts-engine.ts (de mentor para estrategista operacional)
  - [x] Alertas estagnacao (stagnation_warning) + post-mortem IA (API route + prompt Gemini)
- [x] Fase 6.5: Funcionalidades extras — CONCLUIDO
  - [x] Rename "Victim Score" → "Receptividade" em toda a UI
  - [x] CRUD completo: EditContactModal, EditInteractionModal, ConfirmDeleteModal, exclusao de alvo
  - [x] Upload de avatar para alvos (AvatarUpload.tsx reutilizavel, Supabase Storage)
  - [x] Campo telefone (phone) nos contatos + link wa.me no detalhe
  - [x] Memoria de contexto por alvo (context-engine.ts + API update-context + auto-update a cada 5 msgs)
  - [x] Chat com 3 modos: conversa, sugerir mensagem (3 opcoes + Copiar + WhatsApp), validar rascunho
  - [x] Kanban board (/kanban) com drag-and-drop HTML5 nativo + PhaseTransitionModal
  - [x] Biblioteca de Taticas (/taticas) com 24 taticas, filtros por fase/risco/busca
  - [x] Quick Log FAB no dashboard (registro rapido de interacao)
  - [x] Analytics page (/analytics) com conversao, velocidade, gargalos, perdas, performance usuario
- [ ] Fase 7: LGPD + Termos de Uso + Termos de Privacidade
- [ ] Fase 8: Stripe + paywall freemium
- [ ] Fase 9: Deploy Cloudflare

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
- **ActionModal:** 5 secoes (O que e, Por que agora, Como executar, Risco, Referencia)
  - Fetch automatico de /api/ai/suggest-action ao abrir
  - Botoes: "Confirmar Acao" (registra interacao) e "Pedir Conselho a IA" (abre chat)
- **AlertBanner:** Cards com prioridade visual (critical=red, high=amber, medium=purple, low=neutral)
  - Max 3 visiveis, expandivel com "Ver mais X alertas"
  - Botoes Executar/Ignorar por alerta
- **alerts-engine.ts:** 8 tipos de alerta proativo:
  - friendzone_risk, climax_ready, silence_needed, excessive_frequency
  - mystery_critical, target_pursuing, extended_silence, high_enchantment
  - 24 taticas mapeadas (sem mencionar fonte ao usuario)
  - Persistencia Supabase: persistAlerts, dismissAlert, getActiveAlerts

## Fase 5.5: Dashboard Funcional + Perfil + Scoring (detalhes)
- **UserProfileCard:** Substituiu CurrentVictim no dashboard. Mostra perfil do USUARIO (nao do alvo), foto, arquetipo, power score circular, 5 barras de score, indice de carencia
- **PipelineFunnel:** Funil visual mostrando quantos alvos em cada fase do pipeline com barras proporcionais e avatares clicaveis
- **ActiveContacts:** Lista de alvos ordenados por prioridade (receptividade), com mini metricas (R, M, T), fase, e tempo desde ultima interacao
- **StrategicInsights:** 3 cards de insights (seducao, poder, natureza humana) + dica proximo nivel — todos sem citar fontes
- **BehaviorDiagnostic:** 4 indicadores (impulsividade, equilibrio presenca, diversidade tatica, carencia) + forcas/fraquezas
- **user-scoring.ts:** Motor de scoring do usuario com 5 scores principais (mysteryMaintenance, emotionalControl, strategicPatience, socialProofAwareness, adaptability) + 4 indicadores comportamentais + diagnostico textual + insights de 3 pilares (48 leis do poder, natureza humana, seducao)
- **/perfil:** Pagina completa de edicao de perfil (foto via Supabase Storage, nome, genero, orientacao, faixa etaria, arquetipo), resumo comportamental, detalhamento de scores
- **Sidebar:** Carrega dados reais do Supabase (nome, foto, arquetipo), link clicavel para /perfil
- **Supabase migration:** avatar_url e age_range adicionados a user_profiles
- **Acentos:** 150+ palavras corrigidas em 10 arquivos
- **Greene removido:** Todas as mencoes a Robert Greene removidas da interface

## Fase 6: Pipeline v2.0 — Behavioral Intelligence System (detalhes)
- **Novos tipos (types.ts):** ContactStatus (active/lost), LostReason (desistencia/rejeicao/sucesso_efemero), CLOSING_GOALS (6 opcoes), PhaseTransition (historico de transicoes), campos novos no Contact (status, closingGoal, lostReason, lostAt, postMortem), phaseHistory no AppState
- **Store (store.ts):** addPhaseTransition, manualStageChange, moveToLost, reactivateContact, getContactPhaseHistory, backward compat (contacts sem status → "active"), addInteraction agora retorna AddInteractionResult { state, suggestedProgression? }
- **Engine (engine.ts):** applyInteractionImpact retorna InteractionImpactResult { contact, suggestedProgression? } — NÃO auto-comita progressao, UI mostra modal de confirmacao
- **PhaseTransitionModal:** Modal obrigatorio em toda transicao de fase. Evidencia texto obrigatoria (min 10 chars). Se "Perdidos": radio de motivo (3 opcoes). Dispara em auto-progressao E mudanca manual
- **Closing Goal:** Seletor no form /alvos/novo (6 opcoes predefinidas + custom). Badge editavel no detalhe /alvos/[id]
- **Perdidos:** Secao vermelha no PipelineFunnel com sub-grupos por motivo. Filtro "Perdidos" na lista /alvos. Botao "Mover para Perdidos" no detalhe. Reativacao → Nurturing
- **Plano completo:** /Users/lucasdierings/.claude/plans/rustling-watching-mountain.md

## Fase 6.5: Funcionalidades Extras (detalhes)
- **Rename Victim Score → Receptividade:** Labels atualizados em KPICards, ActiveContacts, alvos/[id], alvos/page, engine.ts. Campo interno `victimScore` mantido no banco, so mudou a UI
- **CRUD completo:**
  - `EditContactModal.tsx` — edita nome, sobrenome, telefone, arquetipo (button grid), secundario, love language, vulnerabilidades (6 sliders), notas
  - `EditInteractionModal.tsx` — edita categoria (5 botoes), tipo, data, iniciador, duracao, local, sentimento (slider), notas
  - `ConfirmDeleteModal.tsx` — reutilizavel, com icone warning, titulo/mensagem/label customizaveis
  - `store.ts` — funcoes `updateInteraction(state, id, updates)` e `deleteInteraction(state, id)` adicionadas
  - `/alvos/[id]` — botao Editar abre modal, botao Excluir com dupla confirmacao, edit/delete por interacao
- **AvatarUpload.tsx:** Componente reutilizavel (props: currentUrl, storagePath, size, onUploaded). Camera overlay no hover, spinner, Supabase Storage upload. Usado em /alvos/[id] e /alvos/novo
- **Telefone + wa.me:** Campo `phone?: string` em Contact (types.ts). Input no form /alvos/novo. Exibicao no detalhe com link wa.me direto. MessageSuggestionCard gera link `wa.me/{phone}?text={encoded}`
- **Memoria de contexto (context-engine.ts):**
  - Interface `ContactContext`: contactId, summary, keyFacts[], communicationStyle, lastTopics[], emotionalState, updatedAt
  - Funcoes: loadContexts, getContactContext, saveContactContext, deleteContactContext, buildContextPromptSection
  - Armazenamento: localStorage (chave `kissflow_contexts`)
  - API `/api/ai/update-context`: Gemini gera/atualiza resumo estruturado a partir de interacoes + chat
  - Auto-update: a cada 5 mensagens no chat, atualiza contexto em background
  - Injecao: contexto injetado no system prompt do chat via buildContextPromptSection
- **Chat 3 modos (ChatModeSelector.tsx):**
  - `conversa` — chat livre com IA (modo original)
  - `sugerir` — usuario descreve situacao, IA gera 3 mensagens naturais (JSON parsed). Exibe via MessageSuggestionCard com Copiar (clipboard) + Enviar WhatsApp (wa.me link)
  - `validar` — usuario cola rascunho, IA analisa tom/risco/ajustes e sugere versao melhorada
- **Kanban (/kanban):** 5 colunas pipeline + coluna Lost. Cards com avatar, nome, arquetipo, Mystery, Receptividade, dias na fase. HTML5 drag-and-drop nativo (onDragStart/onDragOver/onDrop). Ao soltar, abre PhaseTransitionModal
- **Taticas (/taticas):** 24 taticas em `tactics-data.ts`. Filtros: fase (5 botoes), risco (baixo/medio/alto), busca texto. TacticCard expandivel com "quando usar" e "exemplo pratico". Sem mencionar fontes
- **Quick Log FAB (QuickLogFAB.tsx):** Botao roxo flutuante (raio) no canto inferior direito do dashboard. Abre modal bottom-sheet com: seletor de alvo, categoria (5 botoes), tipo, quem iniciou, slider sentimento, salvar
- **Analytics (/analytics):** KPIs (taxa geral, total alvos, perdidos, interacoes). Conversao por fase (barras coloridas). Velocidade por fase. Gargalos (loss rate + tempo). Analise de perdas por motivo. Performance por arquetipo (avg receptividade). Distribuicao atual. Score do usuario (5 dimensoes)

---
**Ultima atualizacao:** 03 de abril de 2026
**Status:** Fases 1-6.5 concluidas. Todas as funcionalidades core implementadas: CRUD completo, chat IA com 3 modos, memoria de contexto, kanban, taticas, analytics, avatar upload, wa.me integration. Proximo: LGPD, Stripe, Deploy Cloudflare.

@AGENTS.md
