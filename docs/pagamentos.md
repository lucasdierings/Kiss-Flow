# Pagamentos — o que já existe e o que falta

Documento de preparação. **Nada aqui está ligado a dinheiro real ainda**, e é
proposital: o Gate 0 vem antes de monetizar. O objetivo é que, quando a fase
chegar, não seja preciso redesenhar nada.

## Modelo

Duas camadas que se somam:

| | Gratuito | Pro |
|---|---|---|
| Preço | R$ 0 | **R$ 29,90/mês** |
| Pessoas ativas | 3 | ilimitadas |
| Análises de IA | 5/mês | 100/mês |
| Envios de imagem | 3/mês | ilimitados |
| Créditos avulsos | pode comprar | pode comprar |

Acima da franquia mensal, entra a **carteira de créditos**: comprados à parte,
não expiram, e só são debitados depois que a franquia do mês acabou.

O plano pago tira o teto de pessoas mas **não** dá análises ilimitadas. Cada
análise custa API de verdade; franquia infinita por preço fixo é apostar
contra o usuário mais pesado.

Fonte da verdade: `src/lib/plans.ts` (`PLAN_LIMITS`, `PLAN_INFO`, `CREDIT_PACKS`).
Mudar preço ou limite é editar esse arquivo e publicar — não há migração.

## Medição de consumo

Cada chamada de IA registra em `usage_events`: modelo, tokens de entrada e
saída, custo em **micro-dólares** (inteiro, porque somar frações de centavo em
ponto flutuante acumula erro) e quantos créditos foram debitados.

**A cobrança é por análise, não por token.** Uma análise custa 1 crédito desde
que caiba em 20.000 tokens; acima disso, proporcional. Isso é deliberado: o
usuário precisa prever o gasto, e "sua análise custou 2,7 créditos" é uma
péssima frase. O caso de cobrar mais é raro — quem cola um histórico enorme.

Como não dá para saber o consumo antes da chamada, funciona como
pré-autorização de cartão: reserva 1 crédito, chama o modelo, e
`settleAnalysis()` acerta a diferença depois. A cobrança extra nunca é barrada
por saldo — o trabalho já foi feito e já custou; recusar o débito só passaria
o prejuízo para nós. O saldo pode ficar negativo, e a próxima reserva barra.

Rode `npm run simular:custo` para ver a conta fechar. Com os preços de
referência de setembro de 2026:

| | |
|---|---|
| Análise típica (2.800 + 700 tokens) | R$ 0,0152 em API |
| Margem dos pacotes de crédito | 97% a 98% |
| Plano Pro no pior caso (100 análises) | 94,9% de margem |
| Plano Pro empata em | 1.966 análises/mês |
| Bancar 1.000 usuários gratuitos | R$ 76/mês |

A última linha é a que responde "dá para bancar o início?". Dá, com folga.

O usuário vê o próprio consumo e o extrato em `GET /api/billing/usage`. O
custo em dólar **não** vai para ele: ele compra créditos, não tokens, e expor
nosso custo de API na tela dele só confundiria. A soma existe para o painel do
fundador.

## O que já está pronto

- **Cobrança em duas camadas.** `reserveAnalysis()` em `src/server/usage.ts`
  debita a franquia do mês e, esgotada, cai na carteira. Reserva atômica, sem
  janela de corrida.
- **Estorno.** Falha do provedor de IA devolve a unidade cobrada
  (`refundReservation`). Verificado.
- **Carteira e extrato.** Tabelas `ai_credit_wallets` e
  `ai_credit_transactions`, com índice único parcial garantindo idempotência
  das concessões.
- **Webhook da loja.** `POST /api/webhooks/revenuecat` credita a carteira,
  promove e rebaixa o plano. Falha fechado sem o segredo, e reentrega do mesmo
  evento não credita duas vezes — testado.
- **Estado da conta.** `GET /api/billing/wallet` devolve plano, consumo do mês
  e saldo reais.
- **Limite de pessoas.** `POST /api/crm/contacts` recusa com 402 acima do teto
  do plano.
- **Campos no banco.** `user_profile.plan`, `plan_expires_at`,
  `stripe_customer_id`, `stripe_subscription_id`.

## O que falta

### 1. Escolher o meio de pagamento

Decidido que a recarga aceita **Pix e cartão de crédito**. Isso tem uma
consequência que vale entender antes de implementar.

**Apple e Google exigem o IAP** para desbloqueio de conteúdo digital dentro do
app, e proíbem apontar para pagamento externo lá dentro. Ou seja: Pix não pode
ser oferecido dentro do app das lojas. A saída usual é vender na **web** — onde
Pix e cartão são livres — e manter o IAP no app.

| | Lojas (RevenueCat) | Web (Stripe ou Mercado Pago) |
|---|---|---|
| Taxa | 15–30% | ~4% + taxa fixa |
| Pix | não | sim |
| Obrigatório? | sim, dentro do app | não |
| Esforço | webhook já escrito | criar checkout e webhook |

A diferença de taxa é grande: num pacote de R$ 39,90, a loja fica com R$ 6 a
R$ 12; o gateway web, com cerca de R$ 2.

**Provedores para Pix:** Stripe suporta Pix no Brasil mas exige entidade
brasileira e aprovação. Mercado Pago e Asaas são alternativas com Pix nativo e
menos burocracia. A escolha depende de onde a empresa está constituída — é
decisão sua, não técnica.

Qualquer que seja, o trabalho no nosso lado é o mesmo: um endpoint que cria a
cobrança e um webhook que chama `addCredits()` depois de conferir a assinatura.
Toda a parte de creditar, extrato e idempotência já existe e foi testada.

### 2. Implementação, qualquer que seja a escolha

- [ ] Tela de planos com `PLAN_INFO` e `CREDIT_PACKS`
- [ ] Iniciar compra (SDK da loja, ou sessão de checkout)
- [ ] Restaurar compras — exigido pela Apple
- [ ] Cancelamento e o que acontece com os créditos já comprados
- [ ] Tela de extrato lendo `ai_credit_transactions`
- [ ] Avisar quando a franquia estiver perto do fim, antes do 402
- [ ] `REVENUECAT_WEBHOOK_AUTH_KEY` já está definido em produção; o `app_user_id`
      enviado ao SDK **precisa** ser o nosso `user.id`, senão o webhook não
      acha o dono

### 3. Antes de cobrar de alguém

- [ ] Termos de Uso e Política de Privacidade de verdade
- [ ] Política de reembolso e cancelamento visível
- [ ] CNPJ e emissão de nota
- [ ] Direito de arrependimento de 7 dias (Código de Defesa do Consumidor)

## Cuidados

**Nunca creditar a partir do cliente.** Existiu um `POST /api/billing/wallet`
que aceitava `creditsAmount` do corpo da requisição: qualquer um cunhava
crédito. Foi removido. Crédito entra **só** por `addCredits()`, chamado pelo
webhook depois de conferir o segredo.

**Idempotência não é opcional.** A loja reentrega o evento até receber 2xx. Na
primeira versão a carteira era somada antes de a transação ser lançada, e uma
reentrega dobrou o saldo — 60 créditos viraram 120. Hoje as duas escritas vão
no mesmo `db.batch()`, com a transação protegida pelo índice único em
primeiro lugar.

**Preço de exibição não é preço cobrado.** Os valores em `plans.ts` servem para
a tela; quem manda é a loja, em tempo de execução, com a moeda e os impostos
do país de quem compra.
