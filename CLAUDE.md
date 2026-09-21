# AURA / Kiss Flow

As instruções deste projeto vivem em um único arquivo, `AGENTS.md`, para que
Claude Code, Codex e qualquer outra ferramenta leiam exatamente o mesmo texto.

**Não escreva instruções aqui.** Este arquivo antes era uma cópia de 22 KB do
`AGENTS.md`; as duas versões se desencontraram e passaram meses descrevendo um
projeto que não existia mais. Qualquer conteúdo novo vai no `AGENTS.md`.

@AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
