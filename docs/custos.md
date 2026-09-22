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

## A IA está funcionando — e o alerta de custo está no lugar errado

Resolvido em 21/09/2026. A chave em uso é a do projeto **Google Ads API**
(`tribal-sunbeam-502217-v2`), que está em Nível 1 · Pré-pagamento na
**My Billing Account 3**, com crédito carregado.

Medição real da primeira chamada:

| | |
|---|---|
| Modelo | gemini-flash-latest |
| Tokens | 855 entrada / 370 saída |
| Custo | US$ 0,001182 = **R$ 0,0069** |
| Créditos cobrados | 1 |
| Latência | 6,7 s |

R$ 0,0069 por análise é **menos da metade** da estimativa de R$ 0,0152 que o
simulador usava. A margem é ainda maior que a projetada.

### PENDÊNCIA: o alerta de orçamento não cobre este gasto

O alerta "Kiss Flow - custo mensal" (R$ 50) foi criado na **My Billing
Account 1**, restrito ao projeto **Kiss Flow** (`triple-hour-492210-i2`). Mas
o consumo de IA está caindo na **My Billing Account 3**, projeto Google Ads
API. **O alerta atual não vai disparar por esse gasto.**

Duas saídas:

1. Criar um alerta equivalente na My Billing Account 3, restrito ao
   `tribal-sunbeam-502217-v2`. Rápido, mas o custo do Kiss Flow fica
   misturado com o do Google Ads API.
2. Importar `triple-hour-492210-i2` para o AI Studio, configurar o nível pago
   nele e mover a chave para lá. Recupera o isolamento por projeto, que é o
   que torna o custo do produto legível.

A segunda é a correta a médio prazo. A primeira serve enquanto só o fundador
usa.

### Por que o 402 durava

Dois sistemas separados, e foi isso que confundiu o diagnóstico:

| | Onde se configura | Estado |
|---|---|---|
| Google Cloud (a conta) | console.cloud.google.com/billing | Account 1: crédito de R$ 50, pós-pago |
| Gemini API (o nível) | aistudio.google.com/projects | por projeto, pré-pago |

Ter conta de faturamento no Cloud **não basta**. O nível pago da Gemini é por
projeto, dentro do AI Studio, e só projetos **importados** aparecem lá. A
chave criada em `triple-hour-492210-i2` não tinha nível nenhum — nem o
gratuito — porque o projeto não estava importado.