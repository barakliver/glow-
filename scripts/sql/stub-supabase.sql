-- Minimal, idempotent stand-in for the parts of a Supabase instance the GLoW
-- migrations depend on: the auth schema, auth.uid(), the API roles and the
-- realtime publication. Enough to run and exercise the real SQL locally.
create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin; end if;
end $$;

create schema if not exists auth;

create table if not exists auth.users (
  instance_id uuid,
  id uuid primary key default gen_random_uuid(),
  aud text,
  role text,
  email text,
  encrypted_password text,
  email_confirmed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb
);

-- Supabase derives the caller from the JWT; locally we set it with set_config.
create or replace function auth.uid() returns uuid
language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;
