# Kiss Flow - Gerenciador de Conquistas

## Visao Geral
CRM de Conquistas baseado nas 24 taticas de seducao de Robert Greene. O sistema gerencia relacionamentos interpessoais atraves de um pipeline (Lead Generation -> Qualification -> Nurturing -> Closing -> Retention) com metricas psicologicas (Mystery, Tension, Vulnerability, Enchantment, Scarcity).

## Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + CSS variables (dark theme Luxury Noir)
- **Deploy:** Cloudflare (planejado)
- **Database:** Supabase (planejado) - atualmente localStorage
- **Fonts:** Geist Sans + Geist Mono

## Estrutura
```
src/
  app/
    page.tsx          - Dashboard principal (bento grid)
    layout.tsx        - Root layout (pt-BR, dark mode)
    globals.css       - CSS vars, glassmorphism, bento-card
    alvos/            - CRUD de alvos (targets)
  components/         - Componentes do dashboard
  lib/
    store.ts          - Estado local (localStorage)
    types.ts          - Tipos TypeScript
    engine.ts         - Regras de negocio (dopamina, timing, metricas)
```

## Design System
- Background: #0D0D0D, Cards: #161616, Borders: #262626
- Accent: Purple #7c3aed/#8b5cf6, Rose #e11d48, Emerald #059669, Amber #d97706, Cyan #06b6d4
- Glassmorphism: `.glass` e `.glass-strong`
- Cards: `.bento-card` com hover e gradient top border

## Conceitos de Negocio
- **9 Arquetipos de Sedutores:** Sereia, Libertino, Amante Ideal, Dandi, Natural, Coquete, Encantador, Carismatico, Estrela
- **18 Tipos de Vitimas:** Sonhador Decepcionado, Realeza Mimada, Novo Prudente, Estrela Ofuscada, Novico, Conquistador, etc.
- **5 Linguagens do Amor (Chapman):** Palavras, Presentes, Atos, Tempo, Toque
- **Pipeline:** Lead Generation -> Qualification -> Nurturing -> Closing -> Retention
- **Metricas:** Mystery (0-100), Tension (ansiedade vs desejo), Vulnerability (radar 6 eixos), Enchantment (timeline sentimento), Scarcity (escassez)
- **Motor de Dopamina:** Reforco intermitente, jejum de dopamina, recuo estrategico, alerta de friendzone

## Comandos
```bash
cd kissflow-dashboard && npm run dev   # Dev server porta 3000
npm run build                          # Build producao
npm run lint                           # ESLint
```

@AGENTS.md
