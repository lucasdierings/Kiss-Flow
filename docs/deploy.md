# Publicação — Cloudflare Workers

Runbook do deploy. A stack é Next.js sobre Workers via `@opennextjs/cloudflare`,
com D1 e R2 ligados por binding (ver `wrangler.jsonc`).

> **Estado:** publicado em **https://kissflow.lucasdierings.workers.dev**
> (primeiro deploy em 21/09/2026). Os sete segredos já estão definidos no
> Worker. A sequência de primeiro deploy abaixo fica registrada porque é
> diferente dos deploys seguintes — `wrangler secret put` exige que o Worker
> já exista — e vale para recriar o ambiente do zero.
>
> Deploys seguintes: `npm run deploy`, só isso.
>
> **Sempre `npm run deploy`, nunca `npx opennextjs-cloudflare deploy` sozinho.**
> O script do package.json é `build && deploy`; chamar só o `deploy` publica o
> conteúdo antigo de `.open-next/` e relata sucesso. Aconteceu em 21/09/2026:
> as rotas novas responderam 404 em produção com o deploy dado como concluído.
>
> **Pendente:** registrar as URLs de retorno no Google Cloud Console (seção
> "OAuth do Google" abaixo). Enquanto isso não for feito, o botão "Continuar
> com Google" falha; o login por e-mail e senha funciona normalmente.

## Antes de publicar

- [ ] `npx tsc --noEmit` e `npm run build` limpos
- [ ] `npx drizzle-kit generate` respondendo "No schema changes"
- [ ] `npx wrangler d1 migrations apply kissflow --remote` sem pendências
- [ ] `npx wrangler whoami` na conta certa

## Primeiro deploy

O ovo e a galinha: os segredos precisam do Worker, e o Worker precisa de um
deploy. A primeira publicação sobe sem segredos e falha em tempo de execução —
é esperado. Os passos 2 e 3 consertam.

### 1. Criar o Worker

```bash
npm run deploy
```

Anote a URL da saída (`https://kissflow.lucasdierings.workers.dev`). Ela é o
valor de `BETTER_AUTH_URL` no passo seguinte.

### 2. Definir os segredos

Um `wrangler secret put` por variável. O comando pede o valor em um prompt e
**não** deve receber a chave na linha de comando — o histórico do shell guarda.

```bash
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put BETTER_AUTH_URL          # a URL do passo 1
npx wrangler secret put ALLOWED_EMAILS           # lista separada por vírgula
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put REVENUECAT_WEBHOOK_AUTH_KEY
```

`BETTER_AUTH_SECRET` em produção deve ser **diferente** do valor local. Gere um:

```bash
openssl rand -base64 32
```

As variáveis `APPLE_*` só entram quando o Sign in with Apple for configurado.
Enquanto estiverem vazias o Better Auth apenas registra um aviso, e o botão da
Apple não aparece na interface — ver `src/app/login/page.tsx`.

### 3. Redeploy e conferência

```bash
npm run deploy
```

## OAuth do Google

O Google recusa o retorno se a URL não estiver registrada. No Google Cloud
Console → Credenciais → o OAuth Client usado:

- **Origem JavaScript autorizada:** `https://kissflow.lucasdierings.workers.dev`
- **URI de redirecionamento autorizado:**
  `https://kissflow.lucasdierings.workers.dev/api/auth/callback/google`

Ao trocar por domínio próprio, repetir com o domínio novo **antes** de mudar o
`BETTER_AUTH_URL`, senão o login social quebra entre um passo e outro.

## Depois de publicar — conferir

```bash
BASE=https://kissflow.lucasdierings.workers.dev

# rota protegida sem sessão deve dar 401
curl -s -o /dev/null -w "%{http_code}\n" $BASE/api/crm/contacts

# telas públicas devem dar 200
curl -s -o /dev/null -w "%{http_code}\n" $BASE/login

# rota protegida deve redirecionar para o login
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" $BASE/prototipo

# o webhook sem segredo deve recusar
curl -s -o /dev/null -w "%{http_code}\n" -X POST $BASE/api/webhooks/revenuecat
```

Esperado: `401`, `200`, `307` para `/login?redirectTo=…`, `401`.

Depois, pela interface: criar conta em `/signup` com um e-mail da lista,
cadastrar uma pessoa e pedir uma análise.

## Migrations em produção

Sempre local antes de remoto, e o remoto **antes** do deploy que depende do
schema novo — o Worker publicado passa a falhar assim que sobe se a coluna
ainda não existir.

```bash
npx wrangler d1 migrations apply kissflow --local
npx wrangler d1 migrations apply kissflow --remote
npm run deploy
```

## Voltar atrás

```bash
npx wrangler deployments list
npx wrangler rollback [--message "motivo"]
```

O rollback devolve o **código**, não o banco. Migration aplicada continua
aplicada, e é por isso que elas devem ser aditivas sempre que possível: uma
coluna a mais não incomoda a versão antiga, uma coluna removida derruba.

## Pendências antes de abrir ao público

O acesso hoje é fechado por `ALLOWED_EMAILS`, o que torna a publicação um beta
controlado. Antes de tirar essa trava:

- [ ] Termos de Uso e Política de Privacidade de verdade, na web e no app
      (os do app são rascunho, citam Supabase e não têm base legal nem prazo
      de retenção)
- [ ] fluxo de consentimento gravando em `user_consents` — hoje o app só grava
      uma marca local
- [ ] exclusão de conta e dos dados a pedido do usuário
- [ ] latência da IA dentro do critério do Gate 0 (medido 6,8s a 22,1s; o
      manual pede até 15s)
