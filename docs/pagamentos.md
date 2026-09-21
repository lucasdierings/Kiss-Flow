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

A decisão muda o resto, e ainda não foi tomada:

| | Lojas (RevenueCat) | Web (Stripe) |
|---|---|---|
| Taxa | 15–30% da Apple/Google | ~4% + R$ 0,39 |
| Obrigatório? | Sim, para conteúdo digital consumido no app | Não, se a compra acontece fora do app |
| Pix | Não | Sim |
| Esforço | webhook já escrito | criar checkout e webhook |

Apple e Google **exigem** o IAP para desbloqueio dentro do app e proíbem
apontar para pagamento externo dentro dele. Em compensação, a taxa é alta e o
Pix — que é como o brasileiro paga — fica de fora.

O caminho comum é os dois: IAP no app e Stripe/Pix na web. Note que o código
de webhook hoje existe só para a RevenueCat.

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
