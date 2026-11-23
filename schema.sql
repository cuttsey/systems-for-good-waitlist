-- Morphise waitlist (E1). Visitors may insert; nobody but the project owner can read.
create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  email text not null check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' and length(email) <= 254),
  problem text check (length(problem) <= 80),
  who text not null default 'me' check (who in ('me','team')),
  pay text check (pay in ('yes','maybe','no')),
  consent boolean not null check (consent),
  source text check (length(source) <= 40),
  campaign text check (length(campaign) <= 60)
);
create unique index if not exists waitlist_email_key on public.waitlist (lower(email));
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  source text check (length(source) <= 40),
  campaign text check (length(campaign) <= 60)
);
alter table public.waitlist enable row level security;
alter table public.page_views enable row level security;
create policy "visitors can join" on public.waitlist for insert to anon with check (consent);
create policy "visitors count once" on public.page_views for insert to anon with check (true);
revoke select, update, delete on public.waitlist, public.page_views from anon, authenticated;
grant insert on public.waitlist, public.page_views to anon;
-- Read-out for E1:
create or replace view public.e1_readout with (security_invoker = true) as
select
  (select count(*) from public.page_views) as visits,
  count(*) as signups,
  round(100.0 * count(*) / nullif((select count(*) from public.page_views),0), 1) as signup_rate_pct,
  round(100.0 * count(problem) / nullif(count(*),0), 1) as named_problem_pct,
  round(100.0 * count(*) filter (where pay='yes') / nullif(count(*),0), 1) as pay_yes_pct,
  round(100.0 * count(*) filter (where who='team') / nullif(count(*),0), 1) as team_pct
from public.waitlist;
revoke all on public.e1_readout from anon, authenticated;
