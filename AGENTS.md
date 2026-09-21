# AURA / Kiss Flow — instruções do projeto

> **Este é o único arquivo de instruções.** `CLAUDE.md` apenas aponta para cá.
> Não duplique conteúdo entre os dois: a duplicação foi a causa de este arquivo
> ter passado meses descrevendo um projeto que não existia mais.
>
> **Estado verificado em:** 21/09/2026, commit `6daf0c8`, branch `feat/cloudflare-d1`.

---

## Leia isto primeiro

**Produto:** CRM de relacionamentos. O usuário cadastra pessoas com quem quer
evoluir um vínculo, registra interações, e uma IA devolve leitura da situação +
sugestões de próxima ação justificadas.

**Onde estamos:** antes do Gate 0. O backend está ligado — as rotas de API
autenticam, leem e escrevem no D1, e respeitam as cotas do plano. O que ainda
falta para o loop fechar ponta a ponta é o **app mobile**, que continua com
login falso e dados fixos no código.

**Se você for escrever código:** a próxima coisa é tirar os mocks do mobile
(login de verdade contra `/api/auth`, dados vindos de `/api/crm/contacts`).
Nada de features novas antes disso.

---

## Estado real do código

Esta seção é o coração do arquivo. Mantenha-a honesta, mesmo (principalmente)
quando for constrangedora.

### Verifique você mesmo

Não confie nesta seção sem checar. Os comandos abaixo revelam o estado real em
segundos — se algum contradisser o que está escrito aqui, **o código está certo
e este arquivo está errado**; corrija-o.

```bash
# Alguma rota de API usa a camada de servidor? (vazio = continua órfã)
grep -rn "@/server" src/app

# O Better Auth tem handler HTTP? (vazio = autenticação não funciona)
find src/app -path "*auth*" -name "route.ts"

# O schema bate com o banco? (esperado: "No schema changes")
npx drizzle-kit generate --name=verificacao_drift

# O que de fato existe no D1 remoto
npx wrangler d1 migrations list kissflow --remote

# Onde ainda há mock/demo/TODO
grep -rn "TODO\|DEMO_\|mock" src/app src/lib apps/mobile/app apps/mobile/services
```

### Ligado e funcionando

- Build e typecheck limpos nos dois apps (`npm run build`, `npx tsc --noEmit`)
- D1 remoto com 17 tabelas, em sincronia com `src/server/db/schema.ts`
- Histórico de migrations íntegro em `drizzle/` (baseline conferida objeto a
  objeto contra o `sqlite_master` do remoto)
- **Autenticação funcionando:** `/api/auth/[...all]` responde; cadastro cria
  `user` + `account` + `user_profile`; `ALLOWED_EMAILS` barra quem não está na
  lista; rota protegida sem sessão devolve 401
- **Rotas ligadas ao D1**, todas atrás de `withApi`: `/api/crm/contacts` (lista
  e cria, respeitando o limite de pessoas ativas do plano), `/api/billing/wallet`
  (plano, consumo do mês e saldo reais), `/api/ai/advise` (sessão + cota +
  telemetria)
- **Cotas com reserva atômica** em `src/server/usage.ts`: verificado que a 6ª
  reserva é recusada quando o limite é 5, sem janela de corrida
- **Geração com o Gemini funcionando** de ponta a ponta, com `GEMINI_API_KEY`
  configurada localmente. O nível gratuito devolve 503 de capacidade com
  frequência; quando isso acontece a cota é **estornada**, então falha do
  provedor não custa análise ao usuário
- **Webhook da loja** creditando de verdade e idempotente: reentrega do mesmo
  evento não credita duas vezes, e a cadeia assinatura → plano → limites foi
  exercitada de ponta a ponta
- Motores puros, sem dependência de I/O e prontos para uso: `engine.ts`,
  `analytics.ts`, `user-scoring.ts`, `alerts-engine.ts`, `rag-engine.ts`,
  `tactics-data.ts`, `archetype-quiz.ts`, `persona.ts`, `prompts.ts`

### Existe mas NÃO está ligado

| O quê | Onde | Situação |
|---|---|---|
| Segredo do webhook em produção | Cloudflare | `.dev.vars` tem só um placeholder. Definir com `wrangler secret put REVENUECAT_WEBHOOK_AUTH_KEY` antes de apontar a loja para cá. |
| Login/signup do mobile | `apps/mobile/app/login.tsx` | Grava `'mock_token'` no AsyncStorage. |
| Dados do mobile | `apps/mobile/context/AppContext.tsx` | `INITIAL_TARGETS` fixos. Só `mentor.tsx` chama a API. |
| URL da API no mobile | `apps/mobile/services/api.ts` | IP local fixo (`192.168.3.35`). |
| RevenueCat | `apps/mobile/app/paywall.tsx` | SDK comentado. |
| Consentimento LGPD | `apps/mobile/app/onboarding.tsx` | Só grava flag local, não escreve em `user_consents`. |
| Termos e privacidade | `apps/mobile/app/{terms,privacy}.tsx` | Rascunhos. Citam Supabase, sem base legal/DPO/retenção. Reprovam nas lojas. |
| Resíduo de Supabase | `AvatarUpload`, `Sidebar`, `UserProfileCard`, `store.ts` | `store.ts` ainda é localStorage. |
| Componentes órfãos | `src/components/` | `ActionModal`, `AvatarUpload`, `ConfirmDeleteModal`, `EditContactModal`, `EditInteractionModal`, `EncounterPlanner`, `SalesToRelationshipMatrix`, `WhatsAppStudio` |

---

## Roadmap — o Gate 0 manda

A régua está em `docs/manual-execucao-10-semanas.md` (fonte de verdade
editorial; o `.html` é a versão visual e se atualiza depois do `.md`).

**Gate 0:** 10 usuários reais completando capturar → receber → agir → aprender.
O manual é explícito: **não iniciar mobile, pagamentos ou tráfego pago antes
disso.** Parte do mobile e do paywall já foi construída fora de ordem — isso não
autoriza construir mais.

| Etapa | Escopo | Estado |
|---|---|---|
| 1 | Salvar trabalho, reconstruir migrations | ✅ concluída em 21/09/2026 |
| 2a | Ligar `src/server/` às rotas e criar o handler de auth | ✅ concluída em 21/09/2026 |
| 2b | Tirar os mocks do mobile e construir a landing | ⬜ próxima |
| 3 | Instrumentar eventos e rodar o Gate 0 com 10 usuários | ⬜ |
| 4 | RevenueCat real, webhook creditando, jurídico de verdade | ⬜ só depois do Gate 0 |

Eventos mínimos do Gate 0: `first_value_at`, `analysis_started`,
`analysis_completed`, `suggestion_copied`, `outcome_logged`,
`feedback_submitted`, custo por análise, versão do prompt. **Nunca registrar
conteúdo bruto de prints ou áudios nos eventos.**

---

## Arquitetura

```
/                      app web (Next.js 16) — landing page + API. NÃO é cliente do D1.
  src/app/api/         rotas de API (consumidas pelo mobile) — todas mock ainda
  src/server/          D1 + Better Auth + repositórios  ← órfã
  src/lib/             motores puros e tipos
  src/components/      componentes do dashboard web
  drizzle/             migrations do D1 (NÃO apagar — já se perdeu uma vez)
apps/mobile/           app Expo + expo-router  ← o produto de verdade
docs/                  manual de execução e base de conhecimento
```

**Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 ·
Cloudflare Workers/D1/R2 via `@opennextjs/cloudflare` · Drizzle ORM ·
Better Auth · Google Gemini · Expo/React Native · RevenueCat (IAP).

**Abas do mobile:** dashboard (`index`), `cadastros`, `mentor`, `indicadores`,
`carteira`.

### Decisões de arquitetura

**O app web é landing page + API. Não volta a ser cliente do D1.** (21/09/2026)
O produto é o app mobile; a web existe para apresentar o produto e levar à
instalação, e para hospedar as rotas que o mobile consome. Consequências:

- o dashboard em `src/app/page.tsx` dá lugar à landing
- `src/lib/store.ts` (localStorage) sai, junto com os componentes do dashboard
  e o resíduo de Supabase
- nenhuma tela web nova deve ler o D1 direto

A landing anterior está no histórico (`git show fbd7748:src/app/landing/page.tsx`,
671 linhas). Serve de base visual, mas a copy está vencida: vende
funcionalidades web que não existem mais, aponta para `/login`, é gendrada
("como **ela** está se sentindo") e não tem acentos — viola as regras 2 e 5.

### Backend — armadilhas que já custaram caro

- **Instância por requisição, nunca singleton de módulo.** `getDb()` e
  `getAuth()` constroem tudo a cada request. Um singleton captura o binding D1
  da primeira requisição: funciona no `next dev` e quebra no Worker publicado.
- **D1 não tem RLS.** Multi-tenancy é responsabilidade da aplicação. Todo índice
  composto começa por `userId`, e `userId` **nunca** vem do corpo da requisição —
  vem sempre da sessão, via `requireUser()`.
- **`withApi()` é o portão.** Toda rota que toca dado passa por ele (sessão +
  validação Zod). O `src/proxy.ts` só faz redirecionamento otimista pela
  assinatura do cookie, sem I/O — não é autorização.
- **Cotas:** reserva atômica (`INSERT ... ON CONFLICT DO UPDATE ... WHERE count <
  limite`), porque o D1 não tem transação interativa. Sem cron: mês novo é chave
  nova em `usage_counters`.
- **Métricas 0–100 são `REAL`, não `INTEGER`.** O `engine.ts` arredonda para uma
  casa decimal; `INTEGER` truncaria e deslocaria todos os limiares de progressão.

### Modelo de IA

`FLASH_MODEL` em `src/lib/gemini.ts` é um **alias** (`gemini-flash-latest`),
não uma versão fixa. O código estava preso em `gemini-2.0-flash`, que o Google
aposentou: a API passou a responder 404 e a rota quebrou sem ninguém mexer numa
linha. Não há operação aqui para perseguir depreciação de modelo.

O nível gratuito da API sofre 503 de capacidade com frequência. A rota estorna
a cota nesses casos — ver `refundReservation` em `src/server/usage.ts`.

### Migrations — regras

`drizzle.config.ts` gera, o wrangler aplica. O `out` do config e o
`migrations_dir` do `wrangler.jsonc` apontam para a mesma pasta (`drizzle/`);
mudar um sem o outro faz o wrangler aplicar um conjunto vazio sem reclamar.

- Nunca usar `drizzle-kit push` nem o studio contra o remoto — contornam o
  histórico. É por isso que não há `driver: "d1-http"` no config.
- Nunca apagar `drizzle/`. Já aconteceu e a recuperação foi cara.
- Sempre aplicar em `--local` antes de `--remote`.

---

## Regras de produto — não negociáveis

1. **Nunca citar fontes.** Jamais mencionar Robert Greene, títulos de livros ou
   a origem das estratégias na interface ou nas respostas da IA. Usar
   "estratégias comprovadas", "psicologia comportamental", "inteligência AURA".
   As referências em `docs/` são internas.
2. **Acentuação correta em todo texto em português.** Vale para UI, prompts,
   comentários, commits e este arquivo.
3. **Linguagem harmônica.** Não é ferramenta para sexo. Adaptar ao objetivo do
   usuário com cada pessoa (amizade, romance, companheirismo, reconquista) e ser
   empático com inseguranças.
4. **Toda sugestão explica o porquê** — contexto + princípio aplicado.
5. **Inclusão.** Todos os gêneros e orientações. Personas: Don Juan (masculino),
   Cleópatra (feminino), Neutro (não-binário/outros).
6. **LGPD.** Prints e áudios só para a finalidade informada, pelo menor tempo
   necessário, com consentimento antes do upload e exclusão pelo usuário.
   Eventos de produto nunca carregam conteúdo bruto.

## Domínio

- **Pipeline:** `prospeccao` → `qualificado` → `engajamento` → `agendamento` →
  `fechamento`. Status: `active`, `won`, `lost`, `frozen` ("Geladeira").
- **Métricas:** Mystery, Tension, Enchantment (−1..1), Receptividade
  (`victimScore` no banco — só o rótulo da UI mudou), Scarcity.
- **Vulnerabilidades:** 6 eixos — fantasia, esnobismo, solidão, ego, aventura,
  rebeldia.
- **Transição de fase** exige evidência textual. Perda exige motivo
  (`desistencia`, `rejeicao`, `sucesso_efemero`). Histórico em
  `phase_transitions`.
- **Planos:** free (1 pessoa ativa, 5 análises/mês, 3 uploads) e premium
  (ilimitado, 100 análises). Definidos em `src/lib/plans.ts`, não no banco.

## Design system

Fundo `#0D0D0D` · cards `#161616` · bordas `#262626` · roxo `#7c3aed`/`#8b5cf6` ·
rosa `#e11d48` · esmeralda `#059669` · âmbar `#d97706` · ciano `#06b6d4`.
Classes `.glass`, `.glass-strong`, `.bento-card`. Fonte Geist,
`tracking-tighter` em títulos. Dark mode apenas.

## Comandos

```bash
npm run dev                 # web em localhost:3000
npm run build               # build de produção
npm run lint
npx tsc --noEmit            # typecheck
npm run preview             # build OpenNext + preview no runtime do Worker
npm run deploy              # deploy Cloudflare
npm run cf-typegen          # regenera cloudflare-env.d.ts após mudar bindings

npx drizzle-kit generate --name=<nome>              # gera migration
npx wrangler d1 migrations apply kissflow --local   # aplica local (sempre antes)
npx wrangler d1 migrations apply kissflow --remote  # aplica remoto

cd apps/mobile && npx expo start
```

Segredos locais em `.dev.vars` (fora do git). Em produção, `wrangler secret put`.
Variáveis: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ALLOWED_EMAILS`,
`GEMINI_API_KEY`, `GOOGLE_CLIENT_ID/SECRET`, `APPLE_*`,
`REVENUECAT_WEBHOOK_AUTH_KEY`.

## Infraestrutura

- **Cloudflare D1:** `kissflow` · `e96aa979-bea5-4874-ae06-d40b8a8f45cb`
- **R2:** bucket `kissflow-media` (binding `MEDIA`)
- **GitHub:** `lucasdierings/Kiss-Flow` (privado) · branch principal `main`
- **Supabase:** legado do backend anterior. Não usar em código novo.

---

## Como manter este arquivo vivo

Ele envelheceu antes porque descrevia intenções ("Fase 6.5 concluída") em vez de
fatos verificáveis, e porque existia em duas cópias que se desencontraram.

**Regras:**

1. **Só `AGENTS.md`.** `CLAUDE.md` é um ponteiro. Nunca copie conteúdo para lá.
2. **Atualize junto com o código**, no mesmo commit — não em um commit "docs:"
   depois, que nunca vem.
3. **Descreva o que é verificável**, não o que foi planejado. Cada afirmação
   sobre o estado deve poder ser conferida com um comando da seção "Verifique
   você mesmo".
4. **Ao ligar algo**, mova a linha de "Existe mas NÃO está ligado" para "Ligado
   e funcionando". Essa tabela é o placar do projeto.
5. **Atualize o cabeçalho** (data + commit) quando revisar o estado.
6. **Em dúvida entre o arquivo e o código, o código vence.** Corrija o arquivo.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
