-- Renomeia a fase "agendamento" para "encontro".
--
-- Migration escrita À MÃO, e não gerada pelo drizzle-kit, porque não há
-- mudança de esquema: o `enum` do drizzle em `text(...)` é uma restrição de
-- TypeScript, e a coluna no SQLite é `text NOT NULL` sem CHECK. O que muda é
-- o DADO já gravado.
--
-- Sem isto, contatos existentes ficariam com uma fase que o código não
-- reconhece mais, e sumiriam do funil sem erro nenhum.
--
-- A fase "radar", que entrou junto, não precisa de migration: nenhum registro
-- antigo a usa.

UPDATE contacts SET pipeline_stage = 'encontro' WHERE pipeline_stage = 'agendamento';
--> statement-breakpoint
UPDATE phase_transitions SET old_phase = 'encontro' WHERE old_phase = 'agendamento';
--> statement-breakpoint
UPDATE phase_transitions SET new_phase = 'encontro' WHERE new_phase = 'agendamento';
