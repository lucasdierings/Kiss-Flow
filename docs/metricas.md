# Métricas — o que é medido, como, e com que frequência

Este documento existe porque a pergunta "esses números vêm de onde?" não tinha
resposta. Em setembro de 2026 dois gráficos foram auditados e os dois estavam
mostrando invenção com cara de medição.

## Princípio

**Meio da escala não significa "médio". Significa que ninguém olhou.**

Todo número exibido precisa responder três coisas: de onde veio, quando foi
medido, e com que confiança. É o contrato de dados do Gate 0 para atributos
derivados — "Origem, timestamp, confiança, correção e exclusão individual".

Sem as três respostas, o certo é dizer que não há dado.

## Métricas do alvo (Mistério, Tensão, Encantamento, Receptividade, Escassez)

**Origem:** calculadas pelo `engine.ts`, **no servidor**, a cada interação
registrada. O cliente manda o fato ocorrido (tipo, sentimento, quem procurou);
o motor decide o efeito. O cliente nunca envia métrica — foi assim que a
migração fechou o buraco de gravar receptividade 100.

**Frequência:** a cada interação. Nada muda sozinho com o tempo, exceto o que
depende de data (dias desde o último contato).

**Histórico:** cada interação guarda o instantâneo em `mystery_after`,
`tension_after` e `enchantment_after`. É dessa série que o gráfico vive.

**Passa por IA?** Não. É determinístico e auditável — mesma entrada, mesmo
resultado.

## Gráfico "Tensão e encantamento"

**O que era:** recebia um único número — a tensão atual — e desenhava duas
retas por sete dias fixos (Seg a Dom), aplicando `jitter = (i - 3) * 5` com o
comentário "variação para interesse visual". Não havia série temporal: os dias
eram decorativos e a subida era artefato do jitter. As legendas "Ansiedade" e
"Desejo" também não existiam no motor, que tem um escalar só de tensão.

**O que é:** um ponto por interação, na ordem em que aconteceram, lendo
`tension_after` e `enchantment_after`. Últimas 12. Interações antigas sem
instantâneo são omitidas, não zeradas.

**Liberação:** precisa de 2 pontos. Uma linha com um ponto não tem direção.

## Radar de traços (as seis "vulnerabilidades")

**O que era:** seis colunas em `contacts`, padrão 50, escritas uma vez na
criação e **nunca atualizadas por nada**. O hexágono aparecia cheio e simétrico,
com cara de diagnóstico.

**O que é:** tabela `contact_traits`, um registro por eixo, com procedência.
Eixo sem registro é lacuna na interface — não meio-termo.

### Origem

| | Quem mede | Confiança | Quando muda |
|---|---|---|---|
| `declarado` | o usuário | 1 | quando ele editar |
| `inferido` | IA lendo as anotações | 0,3 a 0,9, dada pelo modelo | quando ele pedir |

**Inferência nunca sobrescreve declaração.** Quem convive com a pessoa sabe
mais que a leitura automática de notas; quando a IA discorda de um eixo
declarado, a divergência é devolvida como sugestão, não aplicada.

### Como a IA infere

`POST /api/ai/infer-traits` lê **só as anotações escritas pelo usuário** — não
as métricas. Métrica é consequência do que ele registrou, não observação nova
sobre a pessoa.

Regras no prompt: estimar apenas eixos com evidência real, omitir os demais,
nunca completar com 50, e devolver a evidência em até 200 caracteres. Cada
traço volta com `confidence` e o trecho que o justificou, para o usuário poder
discordar.

Custa uma análise da cota, como qualquer chamada de modelo, e a cota é
estornada se o provedor falhar.

### Frequência

Sob demanda, com mínimo de **4 interações com nota** desde a última leitura.
Reinferir a cada registro gastaria cota e faria o radar tremer sem o
comportamento ter mudado — o mesmo defeito que o diagnóstico comportamental
tinha ao oscilar com pouco dado.

### Envelhecimento

Um traço inferido há 15 interações descreve outra fase do relacionamento.
`observed_at` permite mostrar a idade, e a interface avisa em vez de apresentar
como atual.

## Diagnóstico comportamental do usuário

**Origem:** `user-scoring.ts`, determinístico, a partir de todas as interações.

**Auditado:** `npm run auditar:scoring`. As seis dimensões reagem ao
comportamento (Mistério vai de 5 a 95 entre perfis opostos), mas **abaixo de 20
interações o resultado oscila cerca de 9 pontos entre históricos do mesmo
perfil** — muda por acaso, não por conduta. Por isso só abre aos 20 registros.

**Passa por IA?** Não. A IA usa o resultado para calibrar o tom, mas não o
produz.

## Ao criar uma métrica nova

1. Diga de onde vem o número, e escreva isso no código.
2. Se for derivado, guarde origem, timestamp e confiança.
3. Meça a partir de quando ele é confiável e registre o recurso em
   `src/lib/progression.ts` com o motivo do limiar.
4. Se não houver dado, a interface diz que não há. Nunca preencha com o meio
   da escala.
