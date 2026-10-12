-- New classes start with the weekly league switched off.
--
-- The league shipped on by default (20260928120000_weekly_class_league.sql).
-- A teacher now opts in from Class tools, so no class shows students a
-- ranking its teacher has not chosen. Existing classes keep their current
-- setting; only the default for new rows changes.
alter table public.classes alter column league_enabled set default false;

comment on column public.classes.league_enabled is
  'Whether students in this class see the weekly XP league. Off for new classes; teachers switch it on or off from Class tools.';
