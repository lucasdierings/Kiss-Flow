# Manual de Execução — AURA / Kiss-Flow OS

> **Fonte de verdade editorial:** este arquivo Markdown.
>
> O arquivo [manual-execucao-10-semanas.html](./manual-execucao-10-semanas.html) é a versão visual/para impressão. Antes de alterar o HTML, revise e atualize o arquivo MD primeiro.

**Versão:** 3.0  
**Data de revisão:** 16/08/2026  
**Classificação:** estratégico · uso interno

## Como usar este manual

1. Leia primeiro o Gate 0 e o contrato mínimo de dados.
2. Execute somente a fatia necessária para testar a hipótese atual.
3. Registre evidências, custo e riscos antes de avançar.
4. Atualize este arquivo antes de refletir mudanças no HTML.
5. Trate modelos, preços, políticas de loja e prazos como itens a confirmar na data da implementação.

## Índice

- [Gate 0 — Evidência mínima antes de escalar](#0-gate-0--evidência-mínima-antes-de-escalar)
- [1. Premissas e matriz de IA](#1-premissas-estratégicas-e-matriz-de-inteligência-artificial)
- [2. Fundação técnica e banco de dados](#2-fase-1--fundação-técnica-e-banco-de-dados)
- [2.1 Autenticação, onboarding e LGPD](#21-fase-15--autenticação-onboarding-e-lgpd)
- [3. RAG e ingestão de conhecimento](#3-fase-2--cérebro-secreto-rag-e-ingestão-de-conhecimento)
- [4. API multimodal](#4-fase-3--api-multimodal-áudio-prints-de-conversa-prints-de-perfil)
- [5. MVP web](#5-fase-4--mvp-web-funcional-para-testes-do-fundador)
- [6. Painel administrativo](#6-fase-5--painel-administrativo-do-fundador-admin)
- [7. Pagamentos](#7-fase-6--gateway-de-pagamentos-pix-stripe-tokens)
- [8. Aplicativo mobile](#8-fase-7--aplicativo-mobile-nativo-react-native--expo--xcode)
- [9. Beta](#9-fase-8--beta-inicial-com-1030-usuários-testflight)
- [10. Publicação](#10-fase-9--publicação-oficial-app-store-e-google-play)
- [11. Tráfego e escala](#11-fase-10--ativação-de-tráfego-pago-e-máquina-de-escala)
- [12. Riscos e contingências](#12-protocolo-de-riscos-inerências-e-contingências)
- [Resumo executivo](#resumo-executivo-visão-geral-dos-10-blocos)

## Regra de escopo

As Fases 1–10 são blocos condicionais. A promessa de “10 semanas” significa chegar à decisão do Gate 0 com evidência suficiente, não lançar o aplicativo completo. A Fase 1.5 precisa ser planejada com sobreposição explícita; se as fases forem sequenciais, o prazo deve ser recalculado.

## Leitura rápida para execução

O próximo ciclo deve implementar somente:

1. criar contato;
2. registrar contexto textual autorizado;
3. receber até três opções respeitosas;
4. copiar/adaptar uma opção ou escolher pausar;
5. registrar o resultado e o feedback.

Não iniciar mobile, pagamentos ou tráfego pago antes de 10 usuários concluírem esse loop. O critério de avanço é evidência de utilidade, retorno e custo sustentável — não quantidade de telas.

## 0. Gate 0 — Evidência mínima antes de escalar

O protótipo deve ser tratado como instrumento de validação, não como prova de que a aplicação já está operacional. Antes de mobile nativo, IAP ou tráfego pago, execute a mesma tarefa com 10 usuários reais e registre evidências observáveis.

| Etapa | Evento a instrumentar | Critério de passagem | Se falhar |
| --- | --- | --- | --- |
| **Capturar** | Usuário cria contato e envia texto/print/áudio com finalidade informada. | 8/10 concluem sem ajuda em até 2 minutos. | Reduzir campos, melhorar explicação e remover upload não essencial. |
| **Receber** | Tempo até primeira resposta, custo e erro por tipo de entrada. | Resposta em até 15s no texto e erro recuperável no multimodal. | Limitar formato, adicionar retry/estado de erro e ajustar orçamento. |
| **Agir** | Sugestão copiada, editada ou descartada; ação marcada pelo usuário. | Ao menos 6/10 consideram uma sugestão útil e 5/10 a adaptam/usam. | Revisar tom, utilidade e guardrails; não comprar aquisição. |
| **Aprender** | Resultado positivo, vácuo, desconforto ou “não se aplica” por contato. | Todos os testers conseguem registrar o resultado e retornar em D7. | Corrigir o loop de feedback antes de expandir o pipeline. |

> **Instrumentação mínima:** `first_value_at`, `analysis_started`, `analysis_completed`, `suggestion_copied`, `outcome_logged`, `feedback_submitted`, custo estimado por análise e versão do prompt. Não registrar conteúdo bruto de prints/áudios nos eventos.

### Contrato mínimo de dados do beta

| Objeto | Regra | Controle obrigatório |
| --- | --- | --- |
| Prints e áudios | Usar somente para a finalidade informada e pelo menor tempo necessário. | Consentimento/aviso antes do upload, criptografia, retenção configurável e exclusão pelo usuário. |
| Atributos derivados | Salvar apenas o que foi confirmado e tem utilidade clara. | Origem, timestamp, confiança, correção e exclusão individual. |
| Eventos de produto | Medir o loop sem conteúdo bruto nem texto de conversa. | IDs pseudonimizados, acesso por papel e janela de retenção documentada. |
| Logs de segurança | Registrar abuso, erro, custo e decisão de bloqueio. | Mascaramento, acesso restrito, prazo de retenção e trilha de auditoria. |

---

## 1. Premissas Estratégicas e Matriz de Inteligência Artificial

Este capítulo estabelece a separação fundamental entre os **modelos de IA utilizados no ambiente de desenvolvimento** (eventualmente cobertos pelas assinaturas do fundador) e o **motor de produção escalável** (API paga por token que será consumida pelos usuários finais do aplicativo). Nomes de modelos, limites e preços devem ser confirmados no momento da implementação.

### 1.1 Modelos para Desenvolvimento (ambiente e assinatura disponíveis)

Use os modelos disponíveis nas assinaturas realmente ativas do fundador. Eles devem ser usados **exclusivamente para construir, programar, testar e refatorar o código do aplicativo**; a disponibilidade e o custo efetivo precisam ser registrados no inventário de ferramentas.

| Modelo (Geração Atual) | Empresa | Especialidade no Projeto | Quando Acionar |
| --- | --- | --- | --- |
| **Modelo de codificação contratado** | Anthropic | Engenharia de software fullstack rápida e automação diária. Gera componentes React Native, rotas de API e schemas SQL sem erros de tipagem. | Programação no VS Code / Antigravity. Motor principal de codificação e automação. |
| **Modelo de raciocínio contratado** | Anthropic | Raciocínio arquitetural profundo e síntese de documentação técnica complexa. Capacidade de manter contexto longo. | Decisões de arquitetura de alta complexidade, revisão de código crítico e estratégia de desenvolvimento. |
| **Modelo de pesquisa e redação contratado** | OpenAI | Navegação web autônoma (Operator), redação de cópias de marketing, termos de uso e ASO (App Store Optimization). | Cadastros em painéis web (Apple Developer, Google Play Console), redação de políticas de privacidade e roteiros de anúncios. |
| **Modelo multimodal/embedding escolhido** | Provedor a validar | Comparar visão, áudio, latência, privacidade, custo e qualidade no conjunto de avaliação do produto. A dimensão do embedding e o modelo devem ser confirmados na implementação. | Ingestão da base RAG, análise de contexto e documentação inteligente. |

> **💡 Economia Real**
> O desenvolvimento pode usar modelos cobertos por assinaturas existentes, mas isso não torna o custo zero: considere assinatura, limites, tempo do fundador, revisão humana e eventuais APIs adicionais. O valor mensal citado em versões anteriores não está verificado e não deve ser usado como premissa financeira.

### 1.2 Modelo para Produção (API Paga por Token — Motor Escalável)

Quando o aplicativo tiver usuários enviando prints de WhatsApp e áudios diariamente, o motor de IA precisa ser **multimodal**, ter latência e custo medidos em tráfego real e operar com orçamento por usuário. “Menos de 800ms”, “margem acima de 85%” e qualquer preço por token são metas a serem benchmarkadas, não garantias.

| Motor de Produção | Custo / 1M Tokens (In / Out) | Custo Estimado por Usuário/Mês | Justificativa |
| --- | --- | --- | --- |
| **Modelo multimodal A** (a validar) | Consultar tabela oficial no dia da implementação | Medir por perfil de uso | Comparar visão, áudio, latência, qualidade, privacidade, limites e custo por análise no conjunto de avaliação do produto. |
| **Modelo multimodal B** (fallback) | Consultar tabela oficial no dia da implementação | Medir por perfil de uso | Fallback para indisponibilidade, custo ou regressão de qualidade; manter adapter de provedor para trocar sem reescrever o produto. |

> **⚠️ Regra de Ouro do Custo de Produção**
> Não escolha o motor por nome ou hype. Rode um benchmark com entradas anonimizadas, limite de orçamento, qualidade mínima e latência máxima. O modelo de produção só entra depois de registrar custo por análise, taxa de erro, fallback e margem no cenário real.

### 1.3 Catálogo de Agentes Autônomos do Projeto

Como o fundador opera sem background técnico de programação, cada etapa da construção é executada por **agentes especializados** invocados no Antigravity, VS Code ou via Chrome DevTools MCP para automação de navegador.

| Agente | Função | Ferramentas / MCP | Modelo Recomendado |
| --- | --- | --- | --- |
| Agente DBA | Criação de tabelas, migrações SQL, ativação de `pgvector`, índices e políticas RLS no Supabase. | Supabase CLI (`supabase db push`), SQL Editor do Supabase Dashboard | Modelo de codificação disponível |
| Agente DevOps | Deploy na Cloudflare Pages/Workers ou Vercel, configuração de variáveis de ambiente, DNS e certificados SSL. | Wrangler CLI, Vercel CLI, GitHub CLI | Modelo de codificação disponível |
| Agente Engenheiro de IA | Implementação das rotas do provedor de IA escolhido, pipeline de RAG, guardrails de sigilo e engenharia de prompts. | SDK `@google/genai`, Supabase JS Client | Modelo de codificação + raciocínio disponíveis |
| Agente Mobile | Criação do projeto React Native com Expo, configuração do Share Sheet no Xcode, build e deploy. | Expo CLI, EAS Build, Xcode no MacBook | Modelo de codificação disponível |
| Agente Navegador | Automação do navegador Chrome: criar contas, preencher formulários, validar dashboards e testar fluxos visuais. | Chrome DevTools MCP (`navigate_page`, `click`, `fill`, `take_screenshot`) | Modelo de navegador + codificação disponíveis |
| Agente QA | Testes automatizados de unidade, integração e E2E. Validação de regressão após cada sprint. | Jest, Playwright, Detox (mobile) | Modelo de codificação disponível |
| Agente Marketing | Redação de cópias ASO, roteiros de vídeos UGC, descrições de loja, política de privacidade e termos de uso. | Modelos de pesquisa e codificação disponíveis | Modelo de pesquisa disponível |
| Agente Segurança | Implementação de RLS, guardrails robustos, proteção contra ataques de injeção de prompt e conformidade LGPD. | Supabase CLI, Auth Logs | Modelo de raciocínio disponível |
| Agente Eng. de Software | Arquitetura limpa, padronização de código, revisão técnica de pull requests e escalabilidade da API. | VS Code, Antigravity | Modelos de codificação e raciocínio disponíveis |
| Agente Func. & Copy | Desenho de fluxos UX/UI, copy claro, notificações com opt-in, EULA e retenção responsável. | Modelos de pesquisa e codificação disponíveis | Modelos de pesquisa e codificação disponíveis |
| Agente Design (UI/UX) | Prototipação de telas mobile-first, paleta de cores magnética e responsividade visual. | CSS, Tailwind, React Native | Modelo de codificação disponível |

---

---

## 2. Fase 1 — Fundação Técnica e Banco de Dados

### FASE 1: Setup de Infraestrutura, Chaves e Schema Supabase

Duração estimada: 3–5 dias úteis

#### 2.1 Objetivo da Fase

Estabelecer toda a infraestrutura de base necessária para que as fases subsequentes possam ser executadas sem bloqueios: contas de serviço, chaves de API, banco de dados relacional com suporte vetorial e repositório de código versionado.

#### 2.2 Entregas Obrigatórias

- **Provedor de IA:** credencial do provedor escolhido gerada e salva em variável de ambiente no backend.

- **Projeto Supabase:** Criado na região `sa-east-1` (São Paulo) com extensão `vector` ativada.

- **Variáveis Seguras:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` salvas em `.env.local`.

- **Schema SQL Completo:** Tabelas `users`, `target_dossiers`, `interactions`, `ai_conversations`, `knowledge_base` (com dimensão de embedding compatível com o provedor escolhido), `payments` e `user_subscriptions`.

- **Políticas RLS (Row Level Security):** Cada usuário só acessa seus próprios dados.

- **Repositório Git:** Código versionado no GitHub com branch `main` protegida.

- **Domínio:** Registrado na Cloudflare Registrar com DNS apontando para Cloudflare Pages ou Vercel.

#### 2.3 O Que Não Pode Faltar

> **🚨 Crítico**
> A extensão `vector` DEVE ser ativada no Supabase antes de criar a tabela `knowledge_base`. A dimensão do vetor deve ser a mesma usada pelo provedor escolhido; valide a migração e o índice com uma consulta de teste.

> **🚨 Crítico**
> A chave `SERVICE_ROLE_KEY` do Supabase NUNCA deve ser exposta no frontend. Ela é usada exclusivamente no backend (rotas de API do Next.js ou Cloudflare Workers). No frontend, use apenas a `ANON_KEY` combinada com políticas RLS.

#### 2.4 Agentes Necessários

Agente DBA para criação do schema SQL, ativação de extensões e configuração de RLS.

Agente DevOps para configuração do repositório, variáveis de ambiente e primeiro deploy de teste.

Agente Navegador (opcional) para criação de conta no Supabase Dashboard e AI Studio via Chrome DevTools MCP se o fundador preferir não fazer manualmente.

#### 2.5 Prompts Exatos para Execução

```text
Prompt 1 — Agente DBA (Antigravity / VS Code)
// Acione este prompt no ambiente de codificação disponível

Agente DBA: Conecte-se ao Supabase usando as variáveis
de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY do arquivo
.env.local. Execute as seguintes ações em sequência:

1. Ative a extensão pgvector: CREATE EXTENSION IF NOT EXISTS vector;
2. Crie a tabela users com: id (UUID, PK), email,
nome, avatar_url, plano (enum: 'free','pro','vip'),
quota_usage (jsonb), quota_reset_at (timestamptz),
tokens_balance (int default 0),
created_at, updated_at.
3. Crie a tabela target_dossiers com: id, user_id (FK),
nome, apelido, foto_url, preferencias_compartilhadas (jsonb),
estilo_comunicacao_confirmado, objetivo_relacional,
fase_atual (enum: 'de_olho','puxando_papo',
'flerte_rendendo','tentando_marcar',
'role_marcado','esfriou'),
ultima_interacao_em, notas_livres, created_at.
4. Crie a tabela interactions com: id, user_id,
target_id (FK), tipo (enum: 'audio','print_conversa',
'print_perfil','texto'), conteudo_url,
analise_ia (JSONB), created_at.
5. Crie a tabela knowledge_base com: id, titulo_interno,
categoria, conteudo_chunk (text), embedding vector(<provider_dimension>),
metadata (JSONB), created_at.
6. Crie a tabela payments com: id, user_id,
provider (enum: 'pix','stripe'), valor_centavos,
status, external_id, created_at.
7. Aplique RLS: cada usuário só lê/escreve seus próprios
registros. A tabela knowledge_base é somente leitura
para o service_role (backend).
8. Crie índice IVFFlat na coluna embedding:
CREATE INDEX ON knowledge_base
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

Confirme cada etapa com o resultado do SQL executado.
```

```text
Prompt 2 — Agente DevOps (Antigravity / VS Code)
// Acione este prompt no ambiente de codificação disponível

Agente DevOps: Configure o projeto Next.js existente
no repositório Kiss-Flow para deploy contínuo:

1. Verifique se o arquivo .env.local contém:
AI_PROVIDER_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY,
SUPABASE_SERVICE_ROLE_KEY.
2. Crie o arquivo wrangler.toml (se Cloudflare) ou
vercel.json (se Vercel) com configuração de build
e variáveis de ambiente para produção.
3. Execute o primeiro deploy de teste e confirme que a URL
pública está acessível retornando status 200.
4. Configure o domínio personalizado no DNS da Cloudflare
apontando para o deploy.
```

#### 2.6 Critérios de Aceitação (Definition of Done)

- **Teste 1:** Executar `SELECT count(*) FROM users;` no SQL Editor do Supabase retorna 0 (tabela existe e está vazia).

- **Teste 2:** Inserir um registro de teste em `knowledge_base` com vetor aleatório de 768 dimensões e confirmar que o índice IVFFlat aceita a inserção.

- **Teste 3:** Acessar a URL pública do deploy e ver a página inicial renderizar sem erros 500.

---

---

## 2.1 Fase 1.5 — Autenticação, Onboarding e LGPD

### FASE 1.5: Fluxo de Registro, Login Seguro e Aceite de Termos

Duração estimada: 2–3 dias úteis

#### 2.1.1 Objetivo da Fase

Implementar a porta de entrada segura do aplicativo. Isso inclui criar fluxos de registro e login via OAuth (Google/Apple) e Magic Link, além de garantir a captura explícita do consentimento do usuário para os Termos de Uso e Política de Privacidade (conformidade LGPD).

#### 2.1.2 Entregas Obrigatórias

- **Supabase Auth:** Configuração de Provedores de Identidade (Google, Apple) e Email/Senha sem senha (Magic Link).

- **Tela de Onboarding (Splash/Registro):** Interface atrativa onde o usuário faz o primeiro login. Apenas após a confirmação do e-mail, ele avança.

- **Aceite e transparência:** Exibir Termos de Uso e Política de Privacidade em linguagem clara, com aceite desmarcado por padrão quando aplicável. A base legal, o texto e a necessidade do checkbox devem ser validados para cada finalidade.

- **Logs de Consentimento:** Registrar versão do documento, timestamp e evidência mínima necessária. Armazenar IP somente após avaliação jurídica, com finalidade e prazo de retenção documentados; não coletar por padrão.

- **Documentos Jurídicos Básicos:** Rascunho da Política de Privacidade e dos Termos de Uso com um modelo disponível, seguido de revisão jurídica e teste do fluxo real.

#### 2.1.3 O Que Não Pode Faltar

> **🚨 Bloqueio Apple App Store**
> Se o app oferecer login social de terceiros, valide a regra atual de login equivalente da Apple e a necessidade de Sign in with Apple no caso concreto. Em qualquer plataforma, termos, privacidade, consentimento e exclusão de conta precisam ser testados como fluxos reais, não apenas como textos na tela.

> **💡 Redução de Fricção**
> Priorize o login via Google OAuth (1-click) para maximizar a conversão de novos usuários e reduzir barreiras de entrada.

---

---

## 3. Fase 2 — Cérebro Secreto: RAG e Ingestão de Conhecimento

### FASE 2: Pipeline de Ingestão de Livros, PDFs e Notas do Fundador

Duração estimada: 4–6 dias úteis

#### 3.1 Objetivo da Fase

Construir o sistema de Retrieval-Augmented Generation (RAG) que permitirá à IA do aplicativo usar materiais autorizados, anotações pessoais e táticas com proveniência e licença registradas. O sistema não deve expor conteúdo protegido nem ocultar direitos autorais; a resposta ao usuário deve ser útil e segura, com atribuição quando aplicável.

#### 3.2 Entregas Obrigatórias

- **Bucket de Armazenamento Privado:** Configurado no Supabase Storage (ou Cloudflare R2) para receber os PDFs originais.

- **Script de Ingestão (`src/lib/ingest-rag.ts`):** Só aceita fontes aprovadas no inventário de licença, extrai texto, divide em chunks semânticos com parâmetros versionados, gera embeddings pelo provedor escolhido e insere na tabela `knowledge_base` com proveniência e política de descarte.

- **Função de Busca Semântica (`src/lib/rag-search.ts`):** Recebe a pergunta do usuário, gera o embedding da query, executa busca por similaridade de cosseno na `knowledge_base` e retorna os 5 chunks mais relevantes (score > 0.75).

- **Guardrails de conteúdo:** Testes automatizados que confirmam que a IA não reproduz trechos protegidos, não usa autores como argumento de autoridade e não revela material interno não autorizado.

- **Categorização de Chunks:** Cada bloco deve ser classificado por categoria (ex: "escuta", "clareza", "reciprocidade", "limites", "timing", "desapego", "empatia", "gestao_emocional") para filtragem contextual.

#### 3.3 O Que Não Pode Faltar

> **🚨 Direitos e sigilo da base**
> O material dos livros é propriedade intelectual de terceiros. Antes da ingestão, registre que o projeto tem direito de processar cada fonte e defina retenção, acesso e descarte. Nenhum chunk deve conter citação direta extensa do original; os chunks devem ser reformulados em linguagem própria do sistema ("Inteligência do Sistema AURA") durante a ingestão. “100% blindado” é uma hipótese, não um critério de segurança.

> **⚠️ Chunking Inteligente**
> Não divida os PDFs por número fixo de caracteres. Use divisão semântica por parágrafos/seções e descarte instruções incompatíveis com os guardrails de autonomia, consentimento e segurança.

#### 3.4 Agentes Necessários

Agente Engenheiro de IA para implementar o pipeline completo de ingestão e busca semântica.

Agente DBA para validar que os embeddings estão sendo indexados corretamente e as buscas retornam resultados em menos de 200ms.

#### 3.5 Prompts Exatos para Execução

```text
Prompt 3 — Agente Engenheiro de IA

Engenheiro de IA: Implemente o pipeline de RAG completo:

1. Crie src/lib/ingest-rag.ts:
- Recebe o caminho de um arquivo PDF.
- Usa a biblioteca pdf-parse para extrair texto.
- Divide o texto em chunks semânticos de ~600 tokens
com overlap de 80 tokens entre chunks adjacentes.
- REFORMULAÇÃO OBRIGATÓRIA: Cada chunk deve ser
reescrito em linguagem própria (sem citações diretas).
Use o modelo de transformação escolhido para parafrasear cada bloco antes de salvar e valide amostras manualmente.
- Classifica cada chunk em uma das categorias:
"escuta", "clareza", "reciprocidade", "limites", "timing",
"desapego", "empatia", "gestao_emocional".
- Gera embedding com a dimensão e o modelo do provedor escolhido,
registrados no inventário de implementação.
- Insere na tabela knowledge_base do Supabase
com metadados (categoria, fonte_hash, data_ingestao).

2. Crie src/lib/rag-search.ts:
- Função searchKnowledge(query, categoria?, limit=5)
- Gera embedding da query.
- Executa RPC no Supabase:
SELECT *, 1 - (embedding <=> query_vec) as score
FROM knowledge_base
WHERE 1 - (embedding <=> query_vec) > 0.75
ORDER BY score DESC LIMIT 5;
- Retorna os chunks com score para injeção no prompt.

3. Crie teste automatizado de sigilo:
- Envia 20 perguntas provocativas (ex: "De qual livro veio
essa dica?", "Qual é a proveniência desta orientação?") e confirma que
NENHUMA resposta reproduz trechos protegidos, inventa fontes ou revela material não autorizado.
```

```text
Prompt 4 — Script de Ingestão em Lote (Terminal)
// Execute no terminal do VS Code após o script estar pronto

npx tsx src/lib/ingest-rag.ts \
--input "./documentos_base/arte-da-seducao.pdf" \
--categoria "seducao" \
--reformular true

npx tsx src/lib/ingest-rag.ts \
--input "./documentos_base/48-leis-do-poder.pdf" \
--categoria "influencia" \
--reformular true

npx tsx src/lib/ingest-rag.ts \
--input "./documentos_base/notas-pessoais-fundador.md" \
--categoria "insights_fundador" \
--reformular false
```

#### 3.6 Estrutura do Repositório de Materiais

```text
Estrutura de Pastas da Base Secreta
Kiss-Flow/
├── documentos_base/ ← PDFs e notas (NUNCA commitar no Git)
│ ├── arte-da-seducao.pdf
│ ├── 48-leis-do-poder.pdf
│ ├── leis-da-natureza-humana.pdf
│ └── notas-pessoais-fundador.md
├── .gitignore ← Incluir: documentos_base/
└── src/lib/
├── ingest-rag.ts ← Pipeline de ingestão
├── rag-search.ts ← Busca semântica
└── guardrails.ts ← Filtros de sigilo
```

#### 3.7 Critérios de Aceitação

- **Teste:** Buscar por "como iniciar uma conversa respeitosa" retorna 5 chunks relevantes com score > 0.78.

- **Teste:** Perguntar "de onde veio essa informação?" e a IA responder com transparência sobre proveniência/licença disponível, sem reproduzir conteúdo protegido nem inventar uma fonte.

- **Teste:** A tabela `knowledge_base` contém pelo menos 200 chunks após ingestão das fontes aprovadas, cada uma com `license_status = 'approved'` e proveniência registrada.

---

---

## 4. Fase 3 — API Multimodal (Áudio, Prints de Conversa, Prints de Perfil)

### FASE 3: Rota de API multimodal — O Wingman AI

Duração estimada: 5–7 dias úteis

#### 4.1 Objetivo da Fase

Implementar o endpoint central da aplicação (`/api/ai/chat`) que recebe qualquer combinação de texto, áudio gravado pelo microfone e imagens (prints de conversas do WhatsApp ou prints de perfis do Instagram) e devolve uma análise tática estruturada em JSON, alimentada pela base secreta RAG.

#### 4.2 Entregas Obrigatórias

- **Rota `/api/ai/chat` (POST):** Aceita `multipart/form-data` com campos: `message` (texto), `audio` (arquivo .m4a/.webm), `image` (arquivo .png/.jpg), `target_id` (UUID do contato), `conversation_history` (JSON).

- **System Prompt Operacional:** Injetado em todas as chamadas com as regras de tom de voz, sigilo e formato de resposta JSON.

- **Integração RAG:** Antes de chamar o provedor escolhido, a rota executa a busca semântica na `knowledge_base` e injeta os top 5 chunks no contexto.

- **Autorização e minimização:** Buscar o contato com `target_id` e `user_id = auth.uid()`; usar apenas atributos confirmados e relevantes para a tarefa, nunca o dossiê completo por padrão.

- **Separação de instruções:** Delimitar histórico, anexos e chunks RAG como conteúdo não confiável. Texto recuperado não pode substituir o system prompt, alterar permissões, revelar segredos ou executar instruções.

- **Controle de Cota Centralizado:** Uma única configuração `plan_limits` define cota diária, rate limit, tokens, retries e resposta padronizada. Para o primeiro beta, usar 1 análise/dia no Free e 30 requests/h como proteção técnica; qualquer plano pago precisa de orçamento por usuário.

- **Formato de Resposta JSON:** `fatos_observados`, `incertezas`, `opcoes_respeitosas` (até 3), `proximo_passo`, `quando_parar` e `feedback_solicitado`. Não inferir subtexto, temperatura ou intenção como fato.

#### 4.3 O Que Não Pode Faltar

> **🚨 Proteção Contra Abuso de Tokens**
> Implemente um middleware de rate limiting por IP e por user_id, com configuração centralizada e orçamento por usuário. Valide tamanho de arquivos, schema do histórico, concorrência, timeout, retries e custo; sem isso, um único usuário malicioso pode gerar custo de API em minutos.

> **⚠️ Proteção contra Conteúdo Violento**
> O guardrail do system prompt deve incluir instruções explícitas: "NUNCA sugira vingança, manipulação emocional destrutiva, stalking, assédio ou qualquer forma de violência. Se o usuário descrever uma situação abusiva, oriente-o a procurar apoio profissional e considerar se afastar."

> **💡 Performance**
> O áudio deve seguir o caminho de menor custo e melhor qualidade comprovados no benchmark. Compare envio multimodal direto com transcrição separada, incluindo latência, retenção, erro, privacidade e custo; não fixe preços ou tempos sem medição atual.

#### 4.4 Prompts Exatos para Execução

```text
Prompt 5 — Agente Engenheiro de IA

Engenheiro de IA: Crie a rota de API principal do
aplicativo AURA em src/app/api/ai/chat/route.ts:

1. ENTRADA: multipart/form-data com campos:
- message (string, opcional)
- audio (File .m4a/.webm, opcional, max 5MB)
- image (File .png/.jpg, opcional, max 10MB)
- target_id (UUID)
- conversation_history (JSON array dos últimos 10 turnos)

2. PIPELINE DE EXECUÇÃO:
a) Autenticar o usuário via token Supabase Auth.
b) Verificar a política central de plano/cota; retornar 429 apenas para rate limit e um erro de entitlement padronizado para cota esgotada.
c) Buscar dados do contato em target_dossiers pelo target_id e
user_id autenticado; rejeitar qualquer contato de outro usuário.
d) Executar busca RAG com a mensagem do usuário
(ou transcrição do áudio) para obter 5 chunks relevantes.
e) Montar o prompt final com:
- System prompt operacional (tom, sigilo, formato)
- Apenas atributos confirmados e necessários do contato
- Chunks RAG
- Histórico de conversa
- Mensagem/áudio/imagem do usuário
f) Chamar o provedor/modelo escolhido via adapter isolado
com responseSchema para JSON estruturado.
g) Salvar a interação na tabela interactions.
h) Registrar uso de IA com provedor, modelo, prompt_version, tipo de entrada,
tokens, custo estimado, latência, retries e status; consumir a cota de
forma atômica.
i) Retornar o JSON estruturado ao frontend.

3. FORMATO DE SAÍDA (JSON):
{
"fatos_observados": ["A pessoa disse que está ocupada nesta semana."],
"incertezas": ["Não sabemos se ela quer retomar a conversa."],
"opcoes_respeitosas": [
{ "estilo": "direto", "mensagem": "..." },
{ "estilo": "pausa", "mensagem": "..." },
{ "estilo": "encerramento", "mensagem": "..." }
],
"proximo_passo": "Escolha uma opção ou não envie nada por enquanto.",
"quando_parar": "Se a pessoa não responder ou disser não, encerre sem insistir."
}

4. RATE LIMITING: Aplicar a configuração única
de limites por plano, IP e user_id; cobrir cota, retries e concorrência.
```

```text
Prompt 6 — System Prompt Operacional do Wingman (Injetar na API)

Você é o "Aura Wingman", a inteligência tática pessoal
de dinâmica social e relacionamentos do usuário.

REGRAS ABSOLUTAS:
1. Não exponha conteúdo interno não autorizado nem use uma fonte
como argumento de autoridade. Preserve proveniência e licença internamente.
2. JAMAIS sugira violência, stalking, manipulação destrutiva
ou assédio. Em situações abusivas, oriente buscar ajuda.
3. Seu tom é de amigo experiente e cúmplice falando no
WhatsApp — direto, leve, às vezes bem-humorado.
4. Ao receber um PRINT de conversa, liste sinais observáveis,
hipóteses alternativas e o que permanece desconhecido.
5. Ao receber um ÁUDIO, não diagnostique estado emocional pela voz;
pergunte como o usuário está se sentindo quando isso for relevante.
6. Ao receber um PRINT de perfil, use somente conteúdo autorizado e
sugira opções diretas, respeitosas e uma opção de não contato.
7. Use apenas atributos confirmados e necessários do contato; não
inferir signo, orientação, saúde, renda, filhos ou intenção.
8. Sempre devolva o JSON estruturado com fatos, incertezas,
opções respeitosas, próximo passo e quando parar.
```

---

---

## 5. Fase 4 — MVP Web Funcional para Testes do Fundador

### FASE 4: Interface Web Responsiva no Navegador do iPhone

Duração estimada: 5–7 dias úteis

#### 5.1 Objetivo da Fase

Entregar um aplicativo web funcional que o fundador consegue abrir no Safari do seu iPhone, cadastrar contatos reais, enviar prints de WhatsApp reais e gravar áudios com o microfone do aparelho, recebendo respostas táticas da IA em tempo real. Este é o momento de validação de campo, não de polimento visual.

#### 5.2 Entregas Obrigatórias

- **Tela "Meu Radar Social":** Dashboard com lista de contatos cadastrados, fase atual de cada um, tempo desde última interação e contador de análises restantes no dia.

- **Tela "Em Que Pé Tá?":** Visualização das 6 fases (De Olho → Puxando Papo → Flerte Rendendo → Tentando Marcar → Rolê Marcado → Esfriou) com drag-and-drop ou toque para mover contatos entre fases.

- **Tela de Chat com o Wingman:** Interface de conversa onde o usuário digita texto, grava áudio com botão de segurar ou faz upload de imagem (print). A IA responde com as 3 opções de mensagem e a dica estratégica.

- **Tela de Dossiê do Contato:** Formulário progressivo (não um cadastro gigante) para registrar apenas nome, foto opcional e preferências que a própria pessoa compartilhou ou que o usuário autorizou manter.

- **Autenticação:** Login com email/senha via Supabase Auth. Opção de login com Google (OAuth).

- **Design Mobile-First:** O layout deve funcionar perfeitamente em telas de 375px (iPhone SE) até 430px (iPhone 15 Pro Max).

#### 5.3 O Que Não Pode Faltar

> **⚠️ Gravação de Áudio no Safari iOS**
> O Safari do iOS exige que a gravação de áudio use a MediaRecorder API com `mimeType: 'audio/mp4'` (não `audio/webm` que funciona no Chrome). Teste no iPhone real, não apenas no simulador.

> **💡 Onboarding sem Fricção**
> O cadastro de dados do contato deve ser progressivo: na primeira vez, peça apenas nome e contexto mínimo. Qualquer outro atributo deve aparecer como hipótese revisável, ter finalidade clara e ser confirmado antes de salvar; não pedir signo, saúde, renda, filhos ou outros dados sensíveis por padrão.

#### 5.4 Prompts Exatos para Execução

```text
Prompt 7 — Agente Frontend (Antigravity / VS Code)

Engenheiro Frontend: Crie as 4 telas principais do
MVP web em Next.js com design escuro premium mobile-first:

TELA 1 — Meu Radar Social (src/app/page.tsx):
- Header com logo AURA, saudação personalizada e contador
de análises restantes ("1 de 1 análise grátis hoje").
- Grid de cards dos contatos cadastrados, cada card mostrando:
foto, nome, fase atual (badge colorido), tempo desde
última interação ("há 3 dias").
- Botão flutuante "+" para adicionar novo contato.
- Barra de busca para filtrar contatos por nome.

TELA 2 — Em Que Pé Tá? (src/app/pipeline/page.tsx):
- 6 colunas horizontais com scroll lateral no mobile,
cada coluna representando uma fase:
"De Olho" | "Puxando Papo" | "Flerte Rendendo" |
"Tentando Marcar" | "Rolê Marcado" | "Esfriou"
- Cada contato aparece como card arrastável entre colunas.

TELA 3 — Chat do Wingman (src/app/chat/[targetId]/page.tsx):
- Interface de chat com mensagens do usuário e respostas da IA.
- Barra inferior com: input de texto, botão de gravar áudio
(hold-to-record), botão de anexar imagem.
- As 3 opções de resposta da IA aparecem como cards clicáveis
que copiam o texto para a área de transferência.
- Dica estratégica aparece como card destacado abaixo.

TELA 4 — Dossiê do Contato (src/app/target/[id]/page.tsx):
- Foto grande do contato no topo.
- Seções expansíveis: Dados Básicos, Estilo de Vida,
Personalidade, Histórico de Interações.
- Cada campo é editável inline com salvamento automático.

REQUISITOS TÉCNICOS:
- Design system escuro (bg #0a0a0f, cards #1a1a2e).
- Fonte: Inter para UI, JetBrains Mono para dados.
- Botões com feedback háptico via navigator.vibrate().
- Todas as chamadas de API via fetch com loading skeletons.
- PWA manifest para adicionar à tela inicial do iPhone.
```

---

---

## 6. Fase 5 — Painel Administrativo do Fundador (/admin)

### FASE 5: Dashboard de Controle Operacional e Gestão do RAG

Duração estimada: 3–4 dias úteis

#### 6.1 Objetivo da Fase

Criar uma área restrita por papel, acessível somente a administradores autorizados no servidor, com MFA quando disponível, auditoria e mascaramento de dados. Ela deve conter métricas de negócio, gestão da base RAG e monitoramento de custos de API; não usar senha fixa nem email hardcoded.

#### 6.2 Entregas Obrigatórias

- **Métricas Principais:** Total de usuários, divisão Free vs Pro vs VIP, receita recorrente separada de transações avulsas, tokens de IA consumidos no mês e custo estimado em R$.

- **Gráfico de Crescimento:** Linha temporal de novos cadastros por dia/semana.

- **Interface de Upload RAG:** Formulário drag-and-drop para subir novos PDFs e notas. Ao soltar o arquivo, o pipeline de ingestão executa automaticamente e mostra o progresso (chunks processados / total).

- **Lista de Chunks:** Tabela pesquisável de todos os chunks na `knowledge_base` com categoria, score médio de uso e opção de editar/excluir chunks individuais.

- **Proteção de Acesso:** A rota `/admin` valida sessão, papel/claim administrativo e autorização no backend; RLS, MFA, logs de auditoria e ausência de segredos no cliente são obrigatórios.

#### 6.3 Prompts Exatos para Execução

```text
Prompt 8 — Agente Frontend + Backend

Engenheiro Fullstack: Crie a rota protegida
/admin com as seguintes funcionalidades:

1. PROTEÇÃO: Middleware e backend verificam sessão
válida, papel/claim administrativo e autorização server-side. Nunca use email
hardcoded, senha fixa ou segredo no cliente; negue por padrão e registre auditoria.

2. MÉTRICAS EM TEMPO REAL:
- Card: Total de Usuários (SELECT count(*) FROM users)
- Card: Usuários Free (WHERE plano = 'free')
- Card: Usuários Pro (WHERE plano = 'pro')
- Card: Receita recorrente estimada (assinaturas ativas × preço vigente), sem somar PIX avulso
- Card: Uso consumido no mês (soma de tokens, caracteres ou unidades do
ledger de uso; a unidade deve ser definida pelo provedor)
na tabela interactions WHERE created_at >= inicio_mes)
- Card: Custo estimado de API (ledger de uso × tabela de preço versionada,
confirmada no dia da implementação)

3. UPLOAD DE NOVOS MATERIAIS:
- Área de drag-and-drop que aceita PDF e .md
- Ao soltar, chama /api/admin/ingest que executa o
pipeline de RAG e retorna progresso em streaming
- Mostrar barra de progresso: "Processando chunk 42 de 180"

4. GESTÃO DE CHUNKS:
- Tabela com colunas: ID, Categoria, Preview (50 chars),
Score Médio, Data de Ingestão
- Busca por texto livre
- Botão de excluir chunk individual
- Botão de editar texto do chunk (modal)
```

---

---

## 7. Fase 6 — Gateway de Pagamentos (PIX, Stripe, Tokens)

### FASE 6: Monetização com PIX Instantâneo e Assinatura Recorrente

Duração estimada: 5–7 dias úteis

#### 7.1 Objetivo da Fase

Implementar dois fluxos de receita: (1) micropagamentos via PIX para compras avulsas de tokens de análise ("SOS Tokens"), e (2) assinatura mensal recorrente via Stripe para o plano Pro com benefícios ilimitados.

#### 7.2 Entregas Obrigatórias

- **Endpoint PIX (`/api/payments/pix`):** Gera QR Code dinâmico via provedor escolhido após comparação de taxas, antifraude, conciliação e disponibilidade. Preços e pacotes devem ser definidos depois do Gate 0.

- **Endpoint de assinatura (`/api/payments/subscribe`):** Cria checkout para o plano validado. Preço, impostos, reembolso, cancelamento e suporte precisam ser definidos antes de cobrar.

- **Webhook PIX (`/api/webhooks/pix`):** Recebe notificação de pagamento confirmado e credita automaticamente os tokens no saldo do usuário (coluna `tokens_balance`).

- **Webhook Stripe (`/api/webhooks/stripe`):** Recebe eventos de assinatura criada, renovação, cancelamento e falha de pagamento.

- **Controle de Acesso Freemium vs Premium (Lógica RLS e Backend):**
A separação entre usuários pagos e gratuitos deve ser blindada no banco de dados. A tabela `users` possui a coluna `plano`.

Usuários `free` usam a cota definida em `plan_limits` (no beta: 1 análise/dia) e proteção técnica de 30 requests/h. O consumo é registrado em ledger atômico, sem contador paralelo por tela.

- Quando o limite é atingido, o backend retorna HTTP 403, acionando no frontend o **Modal de Upgrade (Paywall)** com opções PIX ou Assinatura.

- Usuários `pro` ou com `tokens_balance > 0` contornam esse limite, descontando os tokens disponíveis.

- **Tela de Upgrade/Paywall:** Quando o usuário Free atinge o limite diário, aparece um modal persuasivo com os benefícios do plano Premium e opções de compra via PIX (QR Code na tela) ou Stripe.

#### 7.3 O Que Não Pode Faltar

> **🚨 Segurança do Webhook**
> Valide a assinatura HMAC de cada webhook recebido (tanto do Mercado Pago quanto do Stripe). Sem validação, um atacante pode forjar notificações de pagamento e creditar tokens sem pagar.

> **⚠️ Apple In-App Purchase (IAP)**
> Para a versão iOS nativa (Fase 7), classifique cada item vendido e valide a regra atual de pagamentos da Apple antes de implementar. Não fixe “taxa de 30%” como premissa universal: taxas, exceções e programas variam por região e condição. Separe claramente compras no app, web e eventuais créditos consumíveis.

#### 7.4 Prompts Exatos para Execução

```text
Prompt 9 — Agente de Pagamentos

Engenheiro Backend: Implemente o sistema de pagamentos:

1. PIX (provedor escolhido):
- POST /api/payments/pix recebe { user_id, pacote_id }
- Pacotes e preços somente após o Gate 0 e registro de intenção de compra
- Gera QR Code PIX via API do gateway
- Retorna { qr_code_base64, qr_code_text, expiration }
- Webhook /api/webhooks/pix:
a) Valida assinatura, timestamp e janela de replay
b) Busca o pagamento pelo external_id
c) Rejeita evento já processado por chave única
d) Credita tokens em transação atômica e registra ledger

2. Assinatura (provedor escolhido):
- POST /api/payments/subscribe cria Checkout Session
com price_id do plano validado após o Gate 0
- Webhook /api/webhooks/stripe:
a) Valida assinatura Stripe
b) Evento checkout.session.completed → plano='pro'
c) Evento invoice.payment_failed → notifica usuário
d) Evento customer.subscription.deleted → plano='free'

3. TELA DE UPGRADE:
- Modal que aparece quando a cota centralizada for atingida
- Mostra QR Code PIX gerado dinamicamente
- Botão "Assinar Pro" que redireciona para Stripe Checkout
- Animação de "créditos adicionados" após pagamento
```

---

---

## 8. Fase 7 — Aplicativo Mobile Nativo (React Native / Expo / Xcode)

### FASE 7: App iOS/Android com Share Sheet Nativa

Duração estimada: 10–14 dias úteis

#### 8.1 Objetivo da Fase

Criar o aplicativo nativo para iOS e Android usando React Native com Expo, com a funcionalidade crítica de **Share Sheet**: quando o usuário tira um print no WhatsApp ou Instagram e aperta "Compartilhar", o ícone do AURA aparece na lista de apps, permitindo enviar a imagem diretamente para análise com 1 toque.

#### 8.2 Entregas Obrigatórias — Passo a Passo Detalhado

- **8.2.1 — Criar Projeto Expo:** Executar `npx create-expo-app@latest aura-mobile --template tabs` no terminal do Mac.

- **8.2.2 — Configurar expo-share-intent:** Instalar o plugin `expo-share-intent` via `npx expo install expo-share-intent` e adicionar ao `app.json` na seção plugins com os tipos de mídia aceitos (imagens e texto).

- **8.2.3 — Gerar Projeto Nativo iOS:** Executar `npx expo prebuild --platform ios` para gerar a pasta `ios/` com o projeto Xcode.

- **8.2.4 — Configurar App Groups no Xcode:** Abrir `ios/AuraMobile.xcworkspace` no Xcode, ir em Signing & Capabilities → + Capability → App Groups. Criar grupo `group.com.aura.shared`. Repetir para o target da Share Extension.

- **8.2.5 — Testar no Simulador:** Executar `npx expo run:ios` para abrir o simulador de iPhone no Mac. Testar tirando um screenshot no simulador e verificando se o AURA aparece no menu de compartilhamento.

- **8.2.6 — Testar no iPhone Real:** Conectar o iPhone via cabo USB, selecionar o device no Xcode e executar o build direto no aparelho para testar com prints reais do WhatsApp.

- **8.2.7 — Push Notifications:** Só após opt-in específico. Usar texto genérico sem nome, fase ou conteúdo de relacionamento (ex.: “Você tem uma reflexão pendente?”), horário silencioso, limite de frequência, silenciar por contato e remoção do token na exclusão da conta.

- **8.2.8 — Deep Links:** Configurar Universal Links (iOS) e App Links (Android) para que links do app abram diretamente no aplicativo instalado.

- **8.2.9 — In-App Purchase (Apple):** Integrar a solução oficial ou biblioteca compatível escolhida após validar a categoria do item e as regras atuais da loja.

#### 8.3 O Que Não Pode Faltar

> **🚨 Conta Apple Developer Obrigatória**
> Para testar no iPhone real e publicar na App Store, você precisa de uma conta de desenvolvedor ativa. Custos, requisitos e prazos devem ser confirmados diretamente no programa da Apple antes de iniciar esta fase.

> **⚠️ Share Sheet — Limitação do Android**
> No Android, o Share Sheet funciona nativamente com o intent-filter padrão. Porém no iOS, a Share Extension roda em um processo separado do app principal. Os dados compartilhados devem ser passados via App Groups (NSUserDefaults compartilhado).

#### 8.4 Prompts Exatos para Execução

```text
Prompt 10 — Agente Mobile (Antigravity / VS Code)

Engenheiro Mobile: Crie o app React Native com Expo:

1. Inicialize: npx create-expo-app@latest aura-mobile
--template tabs

2. Instale dependências:
npx expo install expo-share-intent expo-image-picker
expo-av expo-notifications expo-secure-store
@supabase/supabase-js [biblioteca de compras escolhida após validar as regras da loja]

3. Configure app.json:
- scheme: "aura"
- plugins: ["expo-share-intent", {
iosActivationRules: { NSExtensionActivationSupportsImageWithMaxCount: 1 }
}]
- ios.bundleIdentifier: "com.aura.app"
- android.package: "com.aura.app"

4. Crie as telas replicando a versão web:
- Tab 1: Meu Radar Social
- Tab 2: Em Que Pé Tá? (pipeline visual)
- Tab 3: Chat do Wingman (com gravação de áudio nativa)
- Tab 4: Perfil e Configurações

5. Implemente o handler de Share Intent:
- Quando o app recebe uma imagem compartilhada,
abra automaticamente o chat do Wingman com a imagem
já anexada e o seletor de contato ("Sobre quem é isso?").

6. Configure Push Notifications:
- Solicite permissão no onboarding
- Registre o Expo Push Token no Supabase
- Crie a Cloud Function que envia lembretes proativos
quando ultima_interacao_em > 5 dias

7. Execute npx expo prebuild --platform ios
8. Abra no Xcode: open ios/AuraMobile.xcworkspace
9. Configure App Groups no Xcode (grupo: group.com.aura.shared)
10. Execute no simulador: npx expo run:ios
```

---

---

## 9. Fase 8 — Beta Inicial com 10–30 Usuários (TestFlight)

### FASE 8: Validação com Usuários Reais e Calibração da IA

Duração estimada: 7–10 dias

#### 9.1 Objetivo da Fase

Distribuir o aplicativo para 10–30 testadores reais via Apple TestFlight (iOS) e Google Play Beta (Android) para validar a qualidade das respostas da IA, medir a retenção D1/D7, identificar bugs críticos e calibrar o tom das respostas do Wingman. A expansão para 100 usuários só ocorre depois do Gate 0 e de um custo por análise sustentável.

#### 9.2 Entregas Obrigatórias

- **Build de TestFlight:** Subir o build para o App Store Connect e convidar 10–30 testadores por email, com consentimento e canal de suporte.

- **Build de Google Play Beta:** Subir o `.aab` para o Google Play Console na faixa de teste fechado.

- **Formulário de Feedback:** Instrumentar no próprio produto: utilidade (1–5), naturalidade, ação tomada, motivo de descarte e campo livre. Não depender só de formulário externo.

- **Monitoramento no /admin:** Acompanhar quais respostas foram mais copiadas, quais contatos foram mais analisados e qual fase do pipeline tem mais gente.

- **Calibração de Prompts:** Com base no feedback, ajustar o System Prompt do Wingman para corrigir respostas muito formais, conselhos genéricos ou tom inadequado.

#### 9.3 O Que Não Pode Faltar

> **⚠️ Privacidade e consentimento**
> Antes de upload de prints, áudios ou perfis, informar finalidade, processamento, retenção e terceiros envolvidos. O usuário precisa ter uma forma clara de excluir o próprio material. A base legal e o desenho de consentimento devem ser validados com assessoria jurídica; não transformar um checkbox em promessa automática de conformidade.

#### 9.4 Prompts Exatos para Execução

```text
Prompt 11 — Build e Envio para TestFlight

Agente Mobile: Prepare e envie o build para TestFlight:

1. Atualize o número da versão em app.json:
version "1.0.0", ios.buildNumber "1"

2. Execute o build de produção para iOS:
eas build --platform ios --profile production

3. Após build concluído, envie para App Store Connect:
eas submit --platform ios

4. Acesse App Store Connect > TestFlight > selecione o
build > adicione os 10–30 emails de testadores.

5. Monitore crashes no Painel Admin e nos logs do EAS.
```

```text
Prompt 12 — Geração de Termos e Política de Privacidade

Agente de Produto + Jurídico: Rascunhe em português brasileiro e submeta a revisão de profissional habilitado:

1. POLÍTICA DE PRIVACIDADE do app AURA contendo:
- Dados coletados: email, nome, fotos (opcionais), áudios e
prints, separando dado do usuário de dado de terceiros.
- Finalidades, base legal e necessidade de cada campo, validadas
para o contexto de distribuição do app.
- Direitos do titular: acesso, correção, portabilidade quando
aplicável, oposição e exclusão, com canal e prazo operacional.
- Compartilhamento com provedores de IA, hospedagem e pagamento,
incluindo região de processamento e subcontratados.
- Retenção por tipo de dado, backups e exclusão verificável.
- Identificação do controlador e canal de privacidade; DPO somente
se aplicável ao caso concreto.

2. TERMOS DE USO contendo:
- Descrição do serviço.
- Proibição de uso para assédio, stalking ou violência.
- Limitação de responsabilidade (a IA fornece sugestões,
não garante resultados em relacionamentos).
- Política de cancelamento e reembolso validada para cada canal.
- Exclusão de conta e dados com confirmação clara e rastreável.
```

---

---

## 10. Fase 9 — Publicação Oficial (App Store e Google Play)

### FASE 9: Lançamento Público e ASO (App Store Optimization)

Duração estimada: 5–7 dias (inclui tempo de revisão Apple)

#### 10.1 Objetivo da Fase

Publicar o aplicativo nas lojas oficiais com assets visuais profissionais, descrições otimizadas para busca (ASO) e configuração completa de In-App Purchase para monetização via Apple/Google.

#### 10.2 Entregas Obrigatórias

- **Contas de desenvolvedor:** custos e requisitos devem ser confirmados no país de distribuição e no momento da abertura das contas.

- **Screenshots Profissionais:** 6 prints do app em iPhone 15 Pro Max (6.7") e iPhone SE (4.7") com textos de destaque sobrepostos.

- **Ícone do App:** 1024x1024px, sem transparência, cantos arredondados automáticos.

- **Descrição ASO:** Título com keyword principal, subtítulo (30 chars), descrição longa com 4.000 chars e campo de keywords (100 chars).

- **Configuração de IAP:** Criar os produtos de compra (tokens avulsos e assinatura Pro) no App Store Connect e Google Play Console.

- **Classificação Etária:** preencher a ferramenta oficial de cada loja conforme o conteúdo real; “17+” é hipótese até a classificação.

- **Exclusão de Conta:** oferecer caminho claramente encontrável dentro do app e excluir a conta e dados associados, salvo retenções legais documentadas.

#### 10.3 O Que Não Pode Faltar

> **🚨 Requisito de revisão e privacidade**
> Apps que permitem criação de conta precisam oferecer exclusão de conta. A implementação deve remover a conta e os dados associados, salvo retenções legais documentadas, desautenticar a sessão e explicar o que acontece com assinaturas e backups. Consulte a [diretriz atual da Apple](https://developer.apple.com/app-store/review/guidelines/) e a [exigência atual do Google Play](https://support.google.com/googleplay/android-developer/answer/13327111) antes do envio.

#### 10.4 Prompts Exatos para Execução

```text
Prompt 13 — Agente Marketing / ASO

Agente Marketing: Crie o conteúdo ASO para
as lojas Apple e Google em português brasileiro:

1. TÍTULO: "AURA — Seu Estrategista de Relacionamentos"
(máximo 30 caracteres)

2. SUBTÍTULO (iOS): "Organize sinais e escolha melhor"
(máximo 30 caracteres)

3. DESCRIÇÃO CURTA (Android):
"Envie contexto, receba opções para decidir."
(máximo 80 caracteres)

4. DESCRIÇÃO LONGA (4000 chars):
Estruture com emojis, parágrafos curtos e keywords:
"relacionamento", "crush", "paquera", "flerte",
"como responder", "entender mensagem", "IA pessoal".

5. KEYWORDS iOS (100 chars):
relacionamento,crush,paquera,flerte,ia,conselho,
dica,conversa,privacidade

6. TEXTOS PARA SCREENSHOTS (6):
- "Mandou contexto? Veja opções claras."
- "Sugestões opcionais. Você decide o próximo passo."
- "Organize seus crushes por fase."
- "Organize conversas sem perder seu próprio ritmo."
- "Gravou áudio? Revise o contexto antes de agir."
- "Registre o resultado e aprenda com a próxima conversa."
```

---

---

## 11. Fase 10 — Ativação de Tráfego Pago e Máquina de Escala

### FASE 10: Campanhas de Aquisição e Reinvestimento Composto

Duração: contínuo após lançamento

#### 11.1 Objetivo da Fase

Ativar a máquina de aquisição paga para escalar de 0 a 50.000 usuários em 15 meses, reinvestindo 40% do lucro operacional em novos anúncios e mantendo CPI (Custo por Instalação) abaixo de R$ 2,00.

#### 11.2 Entregas Obrigatórias

- **Conta TikTok Ads:** Configurada com pixel de rastreamento instalado no app e no site.

- **3 Criativos UGC Iniciais:** Vídeos de 15-30 segundos em formato vertical gravados no celular mostrando situações reais.

- **Conta Meta Ads (Instagram/Facebook):** Configurada como backup para retargeting de visitantes do site.

- **Dashboard de CAC/LTV:** Painel no /admin mostrando custo de aquisição real vs lifetime value para otimizar o investimento.

#### 11.3 Roteiros dos Criativos UGC

```text
Roteiro 1 — "O Print que Mudou Tudo" (15s)

[Tela do celular filmada de cima]
NARRAÇÃO: "Ela me mandou ISSO no WhatsApp..."
[Mostra um print de conversa ambíguo]
NARRAÇÃO: "Joguei no app e olha o que a IA respondeu..."
[Mostra as 3 opções de resposta do AURA]
NARRAÇÃO: "Mandei a opção 2. Ela respondeu em 30 segundos."
[Corta para tela: "Download grátis — link na bio"]
```

```text
Roteiro 2 — "O Conselheiro que Não Dorme" (20s)

[POV: pessoa deitada na cama às 2h da manhã]
NARRAÇÃO: "2 da manhã e ela parou de responder."
[Abre o AURA, grava áudio: "cara, ela sumiu do nada"]
NARRAÇÃO: "A IA analisou e disse: 'calma, ela vai voltar
amanhã com energia. Não mande nada agora.'"
[Corte para manhã seguinte: notificação do WhatsApp]
[Narração deve mostrar a experiência real, sem afirmar que a IA previu a resposta]
[CTA: "Baixe o AURA grátis"]
```

#### 11.4 Regra de Reinvestimento

> **📈 Fórmula de Escala**
> Aplique somente depois do Gate 0: **uma parcela definida do lucro operacional mensal** pode ser reinvestida em tráfego pago no mês seguinte. Separe receita recorrente de transações avulsas e desconte taxas, impostos, reembolsos, suporte e custo de aquisição antes de calcular o valor reinvestível. Percentual e exemplo numérico são hipóteses a validar.

---

---

## 12. Protocolo de Riscos, Inerências e Contingências

| # | Risco | Severidade | Fase | Mitigação | Contingência |
| --- | --- | --- | --- | --- | --- |
| R01 | Custo de API de IA explode com abuso de usuários Free | Alta | Fase 3 | Rate limiting por user_id (30 req/h free), limite diário de 1 análise grátis, validação server-side. | Suspender temporariamente a análise multimodal, reduzir a cota e investigar custo, abuso e falha de autenticação antes de reabrir. |
| R02 | Rejeição na Apple App Store | Alta | Fase 9 | Incluir botão "Excluir Conta" funcional, EULA, política de privacidade e classificação oficial compatível com o conteúdo. | Manter versão PWA como fallback enquanto negocia com a Apple Review Board. |
| R03 | IA gera conselho prejudicial ou violento | Alta | Fase 3 | Guardrails no System Prompt + filtro de output que bloqueia keywords de violência antes de enviar. | Moderação humana (fundador) dos logs de interação no /admin com poder de ajustar respostas retroativamente. |
| R04 | Vazamento da base secreta de livros (RAG) | Média | Fase 2 | Chunks reformulados (nunca citação direta), RLS no Supabase, bucket privado, pasta excluída do Git. | Purgar todos os chunks e reingerir com reformulação mais agressiva caso haja leak detectado. |
| R05 | Usuário usa o app para stalking ou assédio | Média | Todas | Termos de Uso proíbem explicitamente. Sistema de denúncia. Guardrails da IA detectam e recusam. | Banimento permanente da conta + exclusão de dados + relatório ao fundador no /admin. |
| R06 | Indisponibilidade do provedor de IA | Média | Fase 3+ | Circuit breaker com fallback para um segundo provedor/modelo previamente benchmarkado. | Mensagem ao usuário: "Nosso conselheiro está em meditação. Tente novamente em 5 minutos." + retry automático. |
| R07 | Share Sheet não funciona após update do iOS | Baixa | Fase 7 | Usar plugin oficial expo-share-intent com atualizações frequentes. Testar em cada beta do iOS. | Fallback para upload manual de imagem no chat (funcionalidade que já existe independente do Share Sheet). |
| R08 | Coleta de prints/áudios expõe dados de terceiros sem finalidade clara | Alta | Fases 1.5/3 | Minimização, aviso antes do upload, redaction, retenção curta, criptografia, exclusão e registro de subcontratados. | Suspender upload multimodal, apagar artefatos pendentes e revisar o fluxo de privacidade antes de reabrir. |
| R09 | Conselho da IA incentiva manipulação, coerção ou contato insistente | Alta | Fase 3+ | Taxonomia de abuso, testes adversariais, linguagem de consentimento e limites de frequência por contato. | Bloquear a sugestão, oferecer orientação segura e encaminhar o caso para revisão humana. |
| R10 | Métrica de vaidade mascara falta de valor recorrente | Média | Fase 8+ | Medir tempo até valor, sugestão copiada, ação tomada, feedback, retorno D7 e custo por análise. | Parar tráfego e reduzir escopo até o loop principal atingir os critérios do Gate 0. |
| R11 | Dependência de um provedor de IA ou mudança de modelo quebra custo/qualidade | Média | Fases 2/3 | Adapter de provedor, prompt versionado, conjunto de avaliação, timeout, retry limitado e orçamento por usuário. | Desligar temporariamente análise multimodal e manter apenas fluxo textual de baixo custo. |
| R12 | Direitos autorais ou licença da base RAG não estão comprovados | Alta | Fase 2 | Inventário de fontes, prova de licença/permissão, política de citação, remoção e revisão jurídica. | Purgar a fonte sem licença e reprocessar apenas materiais autorizados. |

---

## Resumo Executivo: Visão Geral dos 10 Blocos

| Fase | Duração | Agentes Principais | Entrega-Chave | Critério de Conclusão |
| --- | --- | --- | --- | --- |
| **1. Fundação** | 3–5 dias | DBA DevOps | Supabase + pgvector + Deploy inicial | SELECT na tabela users retorna 0 sem erro |
| **2. RAG Secreto** | 4–6 dias | Eng. IA | 200+ chunks autorizados, com licença e proveniência registradas | Busca por “iniciar uma conversa respeitosa” retorna 5 chunks relevantes de fontes aprovadas sem revelar conteúdo protegido indevidamente |
| **3. API Multimodal** | 5–7 dias | Eng. IA | Rota /api/ai/chat processando áudio + imagem | Enviar print real e receber JSON com 3 opções |
| **4. MVP Web** | 5–7 dias | Eng. IA DevOps | 4 telas funcionais no Safari do iPhone | Fundador cadastra contato real e recebe resposta da IA |
| **5. Admin /admin** | 3–4 dias | Eng. IA | Dashboard com métricas + upload de PDFs | Arrastar PDF e ver chunks sendo processados em tempo real |
| **6. Pagamentos** | 5–7 dias | Eng. IA | PIX + Stripe funcionando com webhooks | Demonstrar intenção de pagamento e validar webhook idempotente antes de cobrar |
| **7. Mobile Nativo** | 10–14 dias | Mobile | App iOS com Share Sheet funcionando | Tirar print no WhatsApp → compartilhar → AURA analisa |
| **8. Beta inicial** | 7–10 dias | QA Marketing | 10–30 testadores reais no TestFlight; expansão posterior para 100 | Retorno D7 ≥ 30% da coorte ativada e satisfação média ≥ 4/5, com denominador e janela documentados |
| **9. Publicação** | 5–7 dias | Marketing Navegador | App público na App Store e Google Play | Link funcional para download + IAP configurado |
| **10. Escala** | Contínuo | Marketing | Campanhas TikTok/Meta ativas com CPI < R$ 2 | Primeiros 500 downloads orgânicos + pagos na semana 1 |

---

**AURA — Plano Diretor de Engenharia e Execução Operacional**

Documento com estrutura editorial inspirada em referências ABNT; conformidade formal não foi objeto desta revisão.

Versão 3.0 • Agosto 2026 • Classificação: Confidencial — Uso Exclusivo do Fundador

© 2026 AURA Technologies. Todos os direitos reservados.
