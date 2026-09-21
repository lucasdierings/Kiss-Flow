# Kiss Flow Mobile - Guia de Execução & Publicação nas Lojas

Este guia detalha o fluxo completo de desenvolvimento, teste no celular físico e deploy nas lojas (Apple App Store e Google Play Store).

---

## 1. Teste Rápido no Celular Físico

### Opção A: Protótipo Mobile Web (Sem instalar nada)
Se o seu smartphone estiver conectado na mesma rede Wi-Fi que o seu Mac:
- **URL no Navegador do Celular:** `http://192.168.3.35:3333/prototipo.html`
- Oferece alternância entre Tema Claro e Escuro, frame adaptável e fluxo completo de simulação.

### Opção B: Expo Web / Metro Bundler
- **URL no Navegador:** `http://192.168.3.35:8081`

### Opção C: No Simulador do Mac
Dentro da pasta `apps/mobile`:
```bash
npm run ios      # Abre o Simulador do iPhone no Mac
npm run android  # Abre o Emulador Android
```

---

## 2. Arquitetura do App & Mentores de Inteligência

- **Nomenclatura Obrigatória:** Nunca referenciar os modelos como "agente" ou "robô".
- **Personas Conforme o Gênero do Usuário:**
  - **Homem Hétero:** Mentor **Don Juan** (👑) — tom sofisticado, ousado e focado em controle emocional e timing.
  - **Mulher Hétero:** Mentora **Cleópatra** (✨) — tom magnético, elegante e focado em valor inegociável e atração sutil.
- **RAG & Base de Conhecimento:**
  - Sem menção a nomes de autores ou livros protegidos por copyright.
  - Princípios organizados em 10 dimensões comportamentais (Escuta, Clareza, Reciprocidade, Limites, Timing, Desapego, etc.).
- **Modelo de Monetização Híbrido:**
  - **Plano Pro (Assinatura):** Franquia mensal com 30 análises incluídas.
  - **Carteira de Créditos de IA:** Recargas avulsas (+25, +80, +200 créditos) para consultas extras quando a franquia do mês esgotar.

---

## 3. Preparação para as Lojas de Aplicativos (EAS Build)

O projeto está configurado com `eas.json` para compilação nativa na nuvem do Expo.

### Pré-requisitos
Instale a CLI global do EAS:
```bash
npm install -g eas-cli
eas login
```

### Configurar o Projeto no EAS
Dentro de `apps/mobile`:
```bash
eas project:init
```

---

## 4. Gerando Builds para Teste Interno (TestFlight / APK)

### iOS (TestFlight para iPhone):
```bash
eas build --platform ios --profile preview
```
*Gera o pacote para distribuição interna no TestFlight da Apple.*

### Android (APK direto para teste):
```bash
eas build --platform android --profile preview
```
*Gera um arquivo `.apk` pronto para instalar diretamente em qualquer celular Android.*

---

## 5. Publicação Oficial nas Lojas (Produção)

### Build Final:
```bash
eas build --platform all --profile production
```
- Gera `.ipa` assinado para a **Apple App Store**.
- Gera `.aab` (Android App Bundle) para a **Google Play Store**.

### Submissão Automatizada:
```bash
eas submit --platform ios
eas submit --platform android
```

---

## 6. Configuração de In-App Purchases (RevenueCat)

Para ativar cobranças reais nas lojas:
1. Crie uma conta no [RevenueCat Dashboard](https://app.revenuecat.com/).
2. Adicione seu projeto iOS (`com.kissflow.app`) e Android (`com.kissflow.app`).
3. Crie os identificadores de produtos consumíveis (`credits_25`, `credits_60`, `credits_150`) e da assinatura (`sub_pro_monthly`).
4. Aponte o Webhook do RevenueCat para o seu backend Kiss Flow:
   - `POST https://seu-dominio.com/api/webhooks/revenuecat`
   - Header: `Authorization: Bearer REVENUECAT_WEBHOOK_AUTH_KEY`
