---
name: sdlc-team-coordinator
description: >-
  Coordenar o desenvolvimento de projetos full-stack dividindo-os em Sprints, ativando personas do SDLC e validando a compilação a cada entrega.
---

# SDLC Team Coordinator

## Overview
Esta skill orquestra o desenvolvimento de projetos complexos (como aplicações full-stack com mobile e backend) através de um fluxo iterativo baseado em Sprints. Ela automatiza o ciclo de planejamento, execução, revisão de código por múltiplas personas e validação rigorosa (compilação e testes) antes de avançar para a próxima fase.

## Dependencies
- **sdlc-agents**: Esta skill invoca diretamente as personas da equipe de Engenharia de Software (SDLC) para planejar, codificar, revisar e validar a segurança do código.

## Quick Start
Para usar esta skill, basta dizer:
"Inicie o desenvolvimento do app X usando a skill sdlc-team-coordinator" ou "Configure as Sprints para a nova funcionalidade usando a equipe SDLC."

## Workflow

### 1. Definição do Escopo e Sprints
- Analise os requisitos do usuário.
- Divida o trabalho em fases sequenciais lógicas (Sprint 1, Sprint 2, etc.).
- Não inicie o código até que as Sprints sejam aprovadas pelo usuário.

### 2. Execução da Sprint (Iterativo)
Para cada Sprint:
- **Acione a equipe SDLC:** Se precisar de arquitetura, chame o Arquiteto. Se precisar de frontend, chame o Frontend Engineer, etc.
- **Implementação:** Escreva ou atualize os arquivos necessários.
- **Validação Rigorosa:** Você **DEVE** rodar ferramentas de validação (ex: `npx tsc --noEmit`, `npm run build`, `npm run lint`) no terminal após escrever o código da Sprint.
- Se houver erros, corrija-os analisando os logs. Repita até compilar com 0 erros.

### 3. Fechamento da Sprint
- Apresente um resumo claro (Walkthrough) do que foi entregue.
- Se necessário, informe comandos para o usuário testar (ex: `npm run dev`).
- Aguarde a confirmação ou prossiga para a próxima Sprint se estiver em modo autônomo (/goal).

## Common Mistakes
- **Ignorar a Compilação**: Avançar para a próxima Sprint com erros de TypeScript. A validação é inegociável.
- **Não Acionar o Time**: Tentar fazer todo o código sozinho em vez de usar as personas do `sdlc-agents` para revisão e segurança.
