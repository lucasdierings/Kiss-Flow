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
- **PUBLICADO** em https://kissflow.lucasdierings.workers.dev, com os sete
  segredos definidos. Conferido no ar: API sem sessão 401, /login e /signup
  200, / redireciona para o login, webhook sem segredo 401, cadastro fora do
  ALLOWED_EMAILS 403
- **Build para o Cloudflare passando** (`npx opennextjs-cloudflare build` gera
  `.open-next/worker.js`); runbook de publicação em `docs/deploy.md`
- **Carteira visível** (`src/components/Carteira.tsx`): saldo no perfil e ao
  lado do botão que gasta. A recarga detecta o ambiente — loja dentro do app
  (exigência da Apple e do Google), Pix ou cartão na web
- **Táticas contextuais** em `/alvos/[id]`: filtradas pela fase da pessoa e
  ordenadas por risco, vindas do catálogo real
- **Consumo de tokens medido e cobrado**: cada chamada grava tokens, custo em
  micro-dólares e créditos debitados; `settleAnalysis()` acerta a conta depois
  da resposta. `GET /api/billing/usage` devolve consumo e extrato
- **Foto de perfil e campos novos** (cidade, objetivo, linguagem do amor,
  bio): upload no R2 por `/api/media/upload`, servido por `/api/media/<chave>`
  com o dono conferido pelo prefixo — o bucket é privado
- **Traços do alvo com procedência** (`contact_traits`): cada eixo guarda
  origem, confiança, evidência e quando foi medido. Eixo sem registro é
  **lacuna**, não 50
- **Leitura de traços por IA** em `/api/ai/infer-traits`, lendo só as
  anotações do usuário e nunca sobrescrevendo o que foi declarado
- **Gráfico de tensão usando a série real** gravada em `tension_after` e
  `enchantment_after`
- **Liberação progressiva** (`src/lib/progression.ts`): cada gráfico abre
  quando passa a ter dado suficiente para ser confiável, e o painel mostra o
  que falta para o próximo. Os limiares saem da auditoria, não de palpite
- **Quadro de gestão** em `/kanban`, com a transição de fase **aplicada**
  (evidência obrigatória), e não apenas sugerida
- **Widgets do dashboard lendo o banco**: PipelineFunnel, ActiveContacts e
  ConversionAnalytics recebem o estado por propriedade
- **O loop do Gate 0 fecha na web**: cadastrar alvo (`/alvos/novo`), listar
  (`/alvos`), registrar interação e pedir leitura da IA (`/alvos/[id]`).
  Verificado ponta a ponta: as métricas são recalculadas pelo servidor
  (receptividade 10→13, mistério 85→84, tensão 30→36) e a IA responde
- **Onboarding guiado e obrigatório** (regra nº 1 do produto): `/onboarding`
  explica os quatro passos, colhe identidade, aplica o quiz de **18
  perguntas** e termina apontando a próxima ação. O arquétipo é calculado
  **no servidor**, e `requireOnboarded()` barra o app antes da conclusão
- **Quiz equilibrado e auditável.** `npm run auditar:quiz` mede a
  distribuição e falha se ela se perder
- **Dashboard com dados reais**, vindos de `/api/crm/state` e `/api/profile`.
  Sem interações, os widgets dizem que não há dados em vez de exibir padrões
- **Login e cadastro na web** em `/login` e `/signup`, falando com o Better
  Auth; testados pela interface no navegador, não só por curl
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
| Nível pago da Gemini API | AI Studio | A chave autentica, mas a API responde **402**. A conta do Cloud está saudável (crédito de R$ 50, pós-pago) — o nível pago da Gemini é configurado **por projeto no AI Studio**, e `triple-hour-492210-i2` não está importado lá. Ver `docs/custos.md`. |
| Inferência de traços na interface | `/alvos/[id]` | A rota existe e foi exercitada, mas não há botão para pedir a leitura nem tela para declarar eixo à mão. |
| Latência da IA acima do critério | `/api/ai/advise` | Medido 6,8s / 15,5s / 22,1s. O Gate 0 exige resposta em até 15s. Caminhos: streaming, prompt menor, ou modelo lite. |
| URLs de retorno do OAuth do Google | Google Cloud Console | Não registradas para o domínio publicado; o botão \"Continuar com Google\" falha até isso ser feito. Ver `docs/deploy.md`. |
| Login/signup do mobile | `apps/mobile/app/login.tsx` | Grava `'mock_token'` no AsyncStorage. |
| Dados do mobile | `apps/mobile/context/AppContext.tsx` | `INITIAL_TARGETS` fixos. Só `mentor.tsx` chama a API. |
| URL da API no mobile | `apps/mobile/services/api.ts` | IP local fixo (`192.168.3.35`). |
| RevenueCat | `apps/mobile/app/paywall.tsx` | SDK comentado. |
| Consentimento LGPD | `apps/mobile/app/onboarding.tsx` | Só grava flag local, não escreve em `user_consents`. |
| Termos e privacidade | `apps/mobile/app/{terms,privacy}.tsx` | Rascunhos. Citam Supabase, sem base legal/DPO/retenção. Reprovam nas lojas. |
| Resíduo de Supabase | `AvatarUpload` | `Sidebar` e `UserProfileCard` já migraram para `/api/profile`. `src/lib/store.ts` (localStorage) só é usado por componentes ainda não religados. |
| Componentes órfãos | `src/components/` | `ActionBar` (substituída por `TaticasSugeridas`), `ActionModal`, `AvatarUpload`, `ConfirmDeleteModal`, `EditContactModal`, `EditInteractionModal`, `EncounterPlanner`, `SalesToRelationshipMatrix`, `WhatsAppStudio`, `DemoDataLoader` |
| `QuickLogFAB` em localStorage | `src/components/QuickLogFAB.tsx` | Único widget que ainda lê `src/lib/store.ts`. |
| Telas do app na web | — | Faltam chat, táticas, analytics, WhatsApp Studio, Matriz de Vendas e Encontros. Estão **ocultas da sidebar** (`ativo: false`) em vez de dar 404 — ao construir a tela, vire a chave. |
| Transição de fase em `/alvos/[id]` | `/alvos/[id]` | O Kanban já aplica transições; na tela de detalhe a sugestão ainda é só um aviso. |

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
/                      app web (Next.js 16) — cliente completo, espelho do app
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

**O app web é um cliente completo, espelho do app mobile.** (21/09/2026)

Isto **substitui** a decisão anterior do mesmo dia ("landing page + API, não
cliente do D1"), revista pelo fundador. O que vale agora:

- a web tem login próprio e espelha o que acontece no app
- ela consome as **rotas de API**, nunca o D1 direto — `withApi` continua sendo
  a única fronteira de autorização
- por consequência, os componentes de dashboard em `src/components/` deixam de
  ser descartáveis: precisam trocar `src/lib/store.ts` (localStorage) por
  `fetch` nas rotas, não ser apagados
- ainda haverá uma landing, com captação de beta

Em aberto: hoje `/` é o dashboard. Quando a landing entrar, decidir se ela toma
`/` e o app vai para `/app`, ou se `/` alterna conforme a sessão.

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
- **`withApi()` é o portão** das rotas de API (sessão + validação Zod), e
  `requireSession()` em `src/server/session.ts` protege as páginas.
- **Não existe proxy/middleware, e não pode existir.** No Next 16 o Proxy roda
  só no runtime Node, e o @opennextjs/cloudflare **aborta o build** ao
  encontrar middleware Node — com `src/proxy.ts` no lugar não havia deploy
  possível. Ele também nunca funcionou: a lista de rotas públicas começava com
  "/" e era conferida com `startsWith`. Proteção de página é server-side.
- **Cotas:** reserva atômica (`INSERT ... ON CONFLICT DO UPDATE ... WHERE count <
  limite`), porque o D1 não tem transação interativa. Sem cron: mês novo é chave
  nova em `usage_counters`.
- **Métricas 0–100 são `REAL`, não `INTEGER`.** O `engine.ts` arredonda para uma
  casa decimal; `INTEGER` truncaria e deslocaria todos os limiares de progressão.

### Métricas — de onde vêm os números

Regra: **meio da escala não significa "médio", significa que ninguém olhou.**

Dois gráficos foram auditados em 21/09/2026 e os dois mostravam invenção com
cara de medição:

- **Tensão** recebia UM número e desenhava duas retas por sete dias fixos, com
  `jitter = (i - 3) * 5` e o comentário "variação para interesse visual". Os
  dias eram decorativos e a subida era artefato. "Ansiedade" e "Desejo" nem
  existiam no motor. Hoje lê a série real de `tension_after` /
  `enchantment_after`.
- **Vulnerabilidades** eram seis colunas com padrão 50, escritas na criação do
  alvo e **nunca atualizadas por nada**. Hoje vivem em `contact_traits` com
  origem, confiança, evidência e data.

Regras completas, incluindo com que frequência cada coisa muda e o que passa
por IA: `docs/metricas.md`. Leia antes de criar qualquer métrica nova.

### Táticas — onde entram

A `ActionBar` ficava no painel com cinco botões fixos e foi removida. Tinha
cinco defeitos, e o primeiro é o que importa: **lista fixa não conhece
contexto**. Oferecia "Recuo Estratégico" — risco alto, fases avançadas — para
alguém que o usuário acabou de conhecer.

Os outros quatro: dois dos cinco números apontavam para outra tática ("Tática
10 · Poetizar Presença", mas a 10 é "Use o Poder das Palavras"); "Tática 21"
não diz nada a ninguém e é a numeração da fonte, que a regra nº 1 proíbe
expor; não havia nenhum "porquê", contra a regra nº 4; e ficava no painel,
que é visão geral, usando silenciosamente o "contato ativo".

Hoje as táticas aparecem em `TaticasSugeridas`, na página da pessoa,
filtradas pela fase dela e ordenadas por risco. Risco alto aparece com aviso,
não escondido — esconder seria decidir pelo usuário.

`alerts-engine.ts` também escolhe tática por contexto (interações em 24h,
mistério, escassez), e é o mecanismo certo para sugestão proativa.

**Ao mexer em `PIPELINE_STAGES`, revise `tactics-data.ts`.** A fase
`agendamento` entrou no pipeline depois e ficou sem nenhuma tática: a seção
inteira sumia para quem estivesse nela, sem aviso.

### Liberação progressiva

`src/lib/progression.ts` decide quais gráficos aparecem. **Não confundir com
plano**: limite comercial vive em `plans.ts`; aqui é maturidade de dado, e
vale igual para quem paga e quem não paga.

Os limiares vêm de medição, não de palpite. `npm run auditar:scoring` mostrou
que, abaixo de 20 interações, o Poder geral oscila cerca de 9 pontos entre
históricos do MESMO perfil de comportamento — o número muda por acaso. Daí o
diagnóstico só abrir aos 20 registros.

Efeito colateral desejado: a evolução vira percurso, e o painel mostra o que
falta para o próximo recurso. Progressão honesta — nada é escondido para
forçar uso.

Ao criar um gráfico novo, registre o recurso em `RECURSOS` com o motivo do
limiar em uma frase que o usuário entenda.

### Planos e créditos

Duas camadas que se somam: franquia mensal do plano, e carteira de créditos
avulsos usada só depois que a franquia acaba. Gratuito: 3 pessoas ativas e 5
análises/mês. Pro: R$ 29,90/mês, pessoas ilimitadas e 100 análises/mês.

O plano pago **não** dá análises ilimitadas de propósito: cada uma custa API
de verdade, e franquia infinita por preço fixo é apostar contra o usuário
mais pesado.

Preparação de pagamento e o que falta decidir: `docs/pagamentos.md`.

### Quiz de arquétipo

O arquétipo alimenta a persona da IA e o scoring do usuário, então um quiz
enviesado contamina tudo o que vem depois. A versão de 10 perguntas dava
**29,1% de "Estrela" contra 2,5% de "Encantador"** — 11,6 vezes de diferença,
qualquer que fosse a resposta.

O desenho atual tem 18 perguntas e é equilibrado **por construção**: 72
posições, cada arquétipo dominante 8 vezes e secundário 8 vezes, 32 pontos
disponíveis para cada um. A razão caiu para 1,41x.

Duas armadilhas que já apareceram e estão cobertas pela auditoria:

- **Resposta uniforme.** Como as perguntas seguem a rotação dos arquétipos,
  clicar sempre na mesma posição produzia empate perfeito entre os nove, e o
  desempate entregava "Sereia" a todo mundo. As opções são giradas de forma
  determinística para desfazer isso.
- **Auditar pelo texto do arquivo.** A primeira versão do script lia o
  código-fonte e não enxergava a rotação aplicada em tempo de carga,
  concluindo errado. Agora importa o módulo.

Rode `npm run auditar:quiz` sempre que mexer nas perguntas.

### Custos e chaves

Tudo do Kiss Flow vive no projeto Google Cloud `triple-hour-492210-i2`
("Kiss Flow"), o que torna o custo isolável por projeto. A chave do Gemini é
restrita à Gemini API e **vinculada a uma conta de serviço** — exigência de
política da organização `fluxorural.com.br`, que é por que ela tem prefixo
`AQ.` em vez de `AIza`.

Alerta de orçamento **Kiss Flow - custo mensal**: R$ 50/mês, restrito ao
projeto, disparando em 50%, 90% e 100%. É somente alerta, não limite de
gastos — limite pausaria os serviços, e app que para sozinho é pior que conta
alta com aviso.

Detalhes, limites da Cloudflare e o que ainda não é medido: `docs/custos.md`.

### Consumo e créditos

Cada chamada de IA grava tokens, custo em micro-dólares (inteiro — somar
frações de centavo em ponto flutuante acumula erro) e créditos debitados.

**Cobrança por análise, não por token.** 1 crédito cobre até 20.000 tokens;
acima disso, proporcional. O usuário precisa prever o gasto, e "sua análise
custou 2,7 créditos" é uma péssima frase.

Como o consumo só é conhecido depois, funciona como pré-autorização: reserva 1
crédito, chama, e `settleAnalysis()` acerta. A cobrança extra **nunca** é
barrada por saldo — o trabalho já custou; recusar passaria o prejuízo para
nós. O saldo pode ficar negativo e a próxima reserva barra.

`npm run simular:custo` mostra a conta: análise típica R$ 0,0152, margem de
97% nos pacotes, 94,9% no Pro em pior caso, e R$ 76/mês para bancar mil
usuários gratuitos.

O custo em dólar não vai para o cliente — ele compra créditos, não tokens.

### Modelo de IA

`MODEL_CHAIN` em `src/lib/gemini.ts` é uma **cadeia**, não um nome. Duas coisas
foram aprendidas medindo, e as duas estão no comentário do arquivo:

- versão fixa apodrece: `gemini-2.0-flash` foi aposentado e a rota quebrou com
  404 sem ninguém mexer numa linha;
- um nome só não basta: com faturamento ativo, `gemini-flash-latest` acertou
  2/4 e `gemini-3-flash-preview` 4/4. O 503 de capacidade é comum e não atinge
  todos os modelos ao mesmo tempo.

O alias vem primeiro e um modelo concreto cobre a indisponibilidade. Com a
cadeia mais o retry, 3/3 chamadas passaram.

Quando o provedor falha, a cota é **estornada** — ver `refundReservation` em
`src/server/usage.ts`. Falha de infraestrutura não custa análise ao usuário.

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
6. **Nunca mostrar valor padrão como se fosse medição.** Uma conta nova exibia
   "Seducer Pro", poder 45 e barras em 50 — números de `getDefaultUserScore()`
   apresentados como diagnóstico do usuário. Num produto sobre autoconhecimento
   isso destrói a confiança. Sem dado, o widget diz que não há dado.
7. **LGPD.** Prints e áudios só para a finalidade informada, pelo menor tempo
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
- **Planos:** free (3 pessoas ativas, 5 análises/mês, 3 uploads) e Pro a
  R$ 29,90/mês (pessoas ilimitadas, 100 análises). Em `src/lib/plans.ts`.
- **Traços do alvo:** seis eixos em `contact_traits`, com origem e confiança.
  Ver `src/lib/traits.ts` e `docs/metricas.md`.

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

npm run auditar:quiz        # mede o equilíbrio do quiz de arquétipo
npm run auditar:scoring     # mede se o diagnóstico comportamental tem sinal
npm run simular:custo       # custo por análise e margem dos planos

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
