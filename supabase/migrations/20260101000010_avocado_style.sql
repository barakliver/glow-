-- Which avocado you are, and how often you mean to train.
--
-- The club sits inside an avocado grove and the ripeness score was already
-- built around that: points come from showing up, and the fruit ripens. This
-- adds the half that was missing - a member says at the start what kind of
-- training they are here for, and the app addresses them as that.
--
-- Deliberately a training style and not a body shape. A goal you can act on
-- ("I am here to get strong") is something the app can help with; a body you
-- are meant to become is a promise it cannot keep and has no business making.

do $$ begin
  create type public.avocado_style as enum ('strong', 'lean', 'flow');
exception when duplicate_object then null;
end $$;

alter table public.profiles
  add column if not exists avocado_style public.avocado_style,
  -- How many sessions a week this member is aiming for. The home screen counts
  -- toward it; nothing scolds anyone for missing it.
  add column if not exists weekly_goal_sessions integer not null default 3
    check (weekly_goal_sessions between 1 and 14);
