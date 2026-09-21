# Custos — onde estão e como acompanhar

## Google Cloud (Gemini)

**Projeto:** `triple-hour-492210-i2` ("Kiss Flow"), na organização
`fluxorural.com.br`
**Conta de faturamento:** My Billing Account 1 · `0196FD-3C05C3-72C033`

Tudo do Kiss Flow mora nesse projeto — os três clients OAuth e agora a chave
do Gemini. Isso é o que torna o custo isolável: o relatório por projeto mostra
exatamente o gasto deste produto, sem misturar com o resto da conta.

### A chave

Nome: **Kiss Flow - Gemini (producao)**, restrita à **Gemini API** e vinculada
à conta de serviço `kiss-flow@triple-hour-492210-i2.iam.gserviceaccount.com`.

A vinculação não foi escolha: uma **política da organização** do
`fluxorural.com.br` exige que chaves da Gemini API sejam ligadas a uma conta de
serviço. Por isso a chave tem prefixo `AQ.` em vez do `AIza` usual — é o
formato de chave vinculada. Ela vale em local (`.dev.vars`) e em produção
(`wrangler secret`).

Restringir à Gemini API significa que, vazando, a chave não abre nenhuma outra
API do projeto.

### Alerta de orçamento

**Kiss Flow - custo mensal** — mensal, R$ 50, **restrito ao projeto Kiss Flow**,
disparando em 50% (R$ 25), 90% (R$ 45) e 100% (R$ 50), por e-mail aos
administradores de faturamento.

É **somente alerta**, não limite de gastos. Limite pausaria os serviços ao
estourar, e um app que para sozinho no meio do dia é pior que uma conta alta
com aviso.

R$ 50/mês é folgado para a fase atual: o Flash custa cerca de US$ 0,001 por
análise, e o plano gratuito dá 5 análises por usuário no mês. Reveja quando o
número de usuários crescer.

Onde olhar: Faturamento → Relatórios, filtrando pelo projeto Kiss Flow.

### Cota que não é custo

O limite do **nível gratuito** é separado do dinheiro: 20 requisições por dia,
por projeto, por modelo. Ele derrubou os testes em 21/09/2026 com
`GenerateRequestsPerDayPerProjectPerModel-FreeTier`. Projeto com faturamento
ativo não tem esse teto.

## Cloudflare

Workers, D1 e R2 estão no plano gratuito e não têm alerta configurado. Os
limites relevantes hoje:

- Workers: 100 mil requisições/dia
- D1: 5 GB de armazenamento, 5 milhões de linhas lidas por dia
- R2: 10 GB, sem custo de egresso

Nada disso é apertado para a fase atual. Quando passar a ser, o painel da
Cloudflare tem alerta próprio — e vale registrar aqui.

## O que ainda custa e não está medido

| | Situação |
|---|---|
| Custo por análise | `usage_events` grava latência e modelo, mas **não grava tokens** — `tokensIn` e `tokensOut` existem no schema e ninguém os preenche. Sem eles não dá para calcular o custo real por usuário, que é um dos critérios do Gate 0. |
| Custo por usuário | Depende do acima. |
| Cloudflare | Sem alerta. |

## Estado do faturamento em 21/09/2026

A chave autentica, mas a API respondeu **402 — "Your prepayment credits are
depleted"**. A conta de faturamento é **pré-paga e está sem saldo**, então
nenhuma chamada ao Gemini passa até que crédito seja adicionado.

Isso não é problema de configuração: chave, projeto, API e orçamento estão
todos corretos. É só falta de saldo.
