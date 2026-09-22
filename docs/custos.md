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

## Por que o Gemini responde 402 — diagnóstico corrigido

A primeira leitura foi **errada**. O 402 diz "prepayment credits are depleted"
e a conclusão óbvia seria falta de saldo na conta de faturamento. Não é isso.

**A conta do Cloud está saudável.** Em 21/09/2026, My Billing Account 1:
crédito de R$ 50,00, modalidade **pós-pagamento**, sem saldo devedor, e
R$ 200,00 de limite disponível.

O que existe são **dois sistemas de cobrança separados**:

| | Onde se configura | Estado |
|---|---|---|
| Google Cloud (a conta) | console.cloud.google.com/billing | saudável, pós-pago |
| Gemini API (o nível) | **aistudio.google.com/projects** | por projeto, pré-pago |

O nível pago da Gemini API é definido **por projeto, dentro do AI Studio**, e
é pré-pago — compra-se crédito. Ter conta de faturamento no Cloud não basta.

E o projeto onde a chave foi criada (`triple-hour-492210-i2`, o "Kiss Flow"
com os clients OAuth) **não aparece no AI Studio**: só projetos importados
são listados lá.

### O que resolve

Em https://aistudio.google.com/projects, um dos dois:

1. **Importar** `triple-hour-492210-i2` e usar "Configurar faturamento" nele.
   Mantém tudo no mesmo projeto, que é o que torna o custo isolável.
2. Comprar crédito no `tribal-sunbeam-502217-v2`, que já está em "Nível 1 ·
   Pré-pagamento" e mostra "Não há créditos" — mas a chave teria de ser
   recriada lá, e o custo passaria a se misturar com o do Google Ads API.

A primeira é melhor pelo isolamento de custo. A compra de crédito é ação do
fundador — envolve meio de pagamento.