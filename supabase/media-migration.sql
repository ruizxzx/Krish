-- Existing project migration for CMS visual assets.
alter table public.portfolio_projects
  add column if not exists media jsonb not null default '[]'::jsonb;

alter table public.portfolio_site
  add column if not exists profile_media jsonb not null default '{}'::jsonb;

insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do update set public = true;


values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do update set public = true;

drop policy if exists "portfolio media public read" on storage.objects;
drop policy if exists "portfolio media authenticated upload" on storage.objects;
drop policy if exists "portfolio media authenticated update" on storage.objects;
drop policy if exists "portfolio media authenticated delete" on storage.objects;

create policy "portfolio media public read"
on storage.objects
for select
using (bucket_id = 'portfolio-media');

create policy "portfolio media authenticated upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'portfolio-media');

create policy "portfolio media authenticated update"
on storage.objects
for update
to authenticated
using (bucket_id = 'portfolio-media')
with check (bucket_id = 'portfolio-media');

create policy "portfolio media authenticated delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'portfolio-media');

grant usage on schema public to service_role;

grant select, insert, update, delete
on public.portfolio_projects
to service_role;
