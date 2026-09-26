-- KRISH PORTFOLIO CMS
-- Run in a dedicated Supabase project.
create extension if not exists pgcrypto;

create table if not exists public.portfolio_site (
  id text primary key default 'default',
  display_name text not null default 'KRISH / 26',
  nav_label text not null default 'Independent creative developer',
  hero_kicker text not null default 'Creative developer · engineer · product builder',
  hero_title_a text not null default 'I BUILD',
  hero_title_b text not null default 'DIGITAL',
  hero_title_c text not null default 'WORLDS.',
  hero_body text not null default '',
  hero_meta text not null default '',
  location text not null default 'Kolkata / India',
  availability text not null default 'Available for selected work',
  marquee text not null default '',
  intro_kicker text not null default '01 / point of view',
  intro_title text not null default '',
  intro_body text not null default '',
  about_kicker text not null default '04 / about',
  about_title text not null default '',
  about_body text not null default '',
  contact_kicker text not null default '06 / contact',
  contact_title text not null default '',
  contact_body text not null default '',
  contact_email text not null default '',
  footer_note text not null default '',
  motion jsonb not null default '{"enabled":true,"intensity":1,"webgl":true}'::jsonb,
  updated_at timestamptz not null default now(),
  profile_media jsonb not null default '{}'::jsonb
);

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  sort_index integer not null default 0,
  title text not null,
  eyebrow text not null default '',
  category text not null default '',
  year text not null default '',
  status text not null default '',
  role text not null default '',
  stack text not null default '',
  intro text not null default '',
  short text not null default '',
  accent text not null default 'acid' check (accent in ('acid','violet','cyan','orange')),
  metric_label text not null default '',
  metric_value text not null default '',
  live_url text,
  repo_url text,
  featured boolean not null default true,
  media jsonb not null default '[]'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_experience (
  id uuid primary key default gen_random_uuid(),
  sort_index integer not null default 0,
  year text not null default '',
  company text not null default '',
  role text not null default '',
  description text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_services (
  id uuid primary key default gen_random_uuid(),
  sort_index integer not null default 0,
  title text not null default '',
  description text not null default '',
  tags text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_socials (
  id uuid primary key default gen_random_uuid(),
  sort_index integer not null default 0,
  label text not null default '',
  url text not null default '',
  updated_at timestamptz not null default now()
);

-- Explicit privileges are required in addition to RLS policies.
-- The public site reads through the publishable key; CMS writes happen server-side
-- using the privileged service_role used by the Supabase secret key.

grant usage on schema public to anon, authenticated, service_role;


-- Profile portrait stored in the portfolio-media bucket.
alter table public.portfolio_site
  add column if not exists profile_media jsonb not null default '{}'::jsonb;

-- Project visual assets.
alter table public.portfolio_projects
  add column if not exists media jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public)
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



grant select on public.portfolio_site to anon, authenticated;
grant select on public.portfolio_projects to anon, authenticated;
grant select on public.portfolio_experience to anon, authenticated;
grant select on public.portfolio_services to anon, authenticated;
grant select on public.portfolio_socials to anon, authenticated;

grant select, insert, update, delete on public.portfolio_site to service_role;
grant select, insert, update, delete on public.portfolio_projects to service_role;
grant select, insert, update, delete on public.portfolio_experience to service_role;
grant select, insert, update, delete on public.portfolio_services to service_role;
grant select, insert, update, delete on public.portfolio_socials to service_role;

alter table public.portfolio_site enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_experience enable row level security;
alter table public.portfolio_services enable row level security;
alter table public.portfolio_socials enable row level security;

drop policy if exists "public can read portfolio site" on public.portfolio_site;
drop policy if exists "public can read portfolio projects" on public.portfolio_projects;
drop policy if exists "public can read portfolio experience" on public.portfolio_experience;
drop policy if exists "public can read portfolio services" on public.portfolio_services;
drop policy if exists "public can read portfolio socials" on public.portfolio_socials;

create policy "public can read portfolio site" on public.portfolio_site for select using (true);
create policy "public can read portfolio projects" on public.portfolio_projects for select using (true);
create policy "public can read portfolio experience" on public.portfolio_experience for select using (true);
create policy "public can read portfolio services" on public.portfolio_services for select using (true);
create policy "public can read portfolio socials" on public.portfolio_socials for select using (true);

insert into public.portfolio_site (
  id, display_name, nav_label, hero_kicker, hero_title_a, hero_title_b, hero_title_c, hero_body, hero_meta,
  location, availability, marquee, intro_kicker, intro_title, intro_body, about_kicker, about_title, about_body,
  contact_kicker, contact_title, contact_body, contact_email, footer_note
) values (
  'default', 'KRISH / 26', 'Independent creative developer', 'Creative developer · engineer · product builder',
  'I BUILD', 'DIGITAL', 'WORLDS.',
  'I design and engineer digital products where systems, motion and visual identity become one experience.',
  'NEXT.JS · REACT · THREE.JS · GSAP · SUPABASE', 'Kolkata / India', 'Available for selected work',
  'BUILD — BREAK — MOVE — REPEAT — BUILD — BREAK — MOVE — REPEAT —', '01 / point of view',
  'Interfaces should not just work. They should leave a trace.',
  'The best digital experiences use hierarchy, motion and interaction with restraint. I build products that are useful first, then unforgettable.',
  '04 / about', 'Engineer brain. Art direction eye.',
  'My work lives between front-end engineering, product systems and visual experimentation. I care about the invisible layer: state, performance, content, timing and the tiny details that make an interface feel alive.',
  '06 / contact', 'LET’S MAKE SOMETHING MOVE.',
  'Product work, creative development, interaction systems and digital worlds.', 'hello@krish.dev',
  'Built with Next.js / Three.js / GSAP / Supabase'
) on conflict (id) do nothing;

insert into public.portfolio_projects (slug, sort_index, title, eyebrow, category, year, status, role, stack, intro, short, accent, metric_label, metric_value, featured, sections)
select 'tablely',1,'TABLELY','Restaurant operating system','Product system','2026','Building','Product / Full-stack','Next.js · Supabase · Realtime',
'A restaurant ordering operating system designed around the table, not the checkout page.',
'Sessions, carts, orders, payments and operator workflows in one live system.','acid','SYSTEM STATE','REALTIME',true,
'[{"kicker":"01 / idea","heading":"Make the table the interface.","body":"TABLELY treats the physical table as the primary context for ordering. Guest ordering, restaurant operations and payment state share one continuous experience."},{"kicker":"02 / system","heading":"State before decoration.","body":"The architecture is explicit about sessions, visits and orders so realtime changes remain understandable across guests, staff and counters."},{"kicker":"03 / result","heading":"Less friction between intention and action.","body":"The product removes duplicate handoffs and turns restaurant order flow into one coherent operating surface."}]'::jsonb
where not exists (select 1 from public.portfolio_projects where slug='tablely');

insert into public.portfolio_projects (slug, sort_index, title, eyebrow, category, year, status, role, stack, intro, short, accent, metric_label, metric_value, featured, sections)
select 'instaly',2,'INSTALY','Creator commerce platform','Creator commerce','2026','Building','Product / Full-stack','Next.js · Supabase · Razorpay',
'A creator storefront combining identity, link-in-bio, digital products and freelance services.',
'A creator operating layer: profile, storefront, marketplace, analytics and audience capture.','violet','CREATOR SURFACES','01 → ∞',true,
'[{"kicker":"01 / identity","heading":"One profile. Many surfaces.","body":"INSTALY gives creators a flexible home for links, products, services, analytics and audience capture without making each feature feel bolted on."},{"kicker":"02 / commerce","heading":"Selling should feel native.","body":"Discovery, checkout, digital delivery and creator-owned presentation share the same visual language."},{"kicker":"03 / marketplace","heading":"Products meet services.","body":"A future-facing layer where creators can sell assets, packages and freelance offers from the same identity."}]'::jsonb
where not exists (select 1 from public.portfolio_projects where slug='instaly');

insert into public.portfolio_projects (slug, sort_index, title, eyebrow, category, year, status, role, stack, intro, short, accent, metric_label, metric_value, featured, sections)
select 'offscrpt',3,'OFFSCRPT','Editorial digital commerce','Digital products','2026','Concept','Brand / Interface','React · Motion · Commerce',
'A sharper storefront language for creators selling assets, templates, experiments and small digital objects.',
'An editorial commerce system that refuses to look like a template marketplace.','cyan','ART DIRECTION','EDITORIAL',true,
'[{"kicker":"01 / language","heading":"Commerce can have a point of view.","body":"OFFSCRPT explores a product layout where the storefront is part of the product story rather than a neutral wrapper."},{"kicker":"02 / interaction","heading":"Every click earns its motion.","body":"Hover, scroll and transition effects reinforce hierarchy, discovery and intent instead of adding noise."},{"kicker":"03 / rhythm","heading":"Show less. Make it feel more.","body":"A restrained visual system makes small digital objects feel collectible and deliberate."}]'::jsonb
where not exists (select 1 from public.portfolio_projects where slug='offscrpt');

insert into public.portfolio_projects (slug, sort_index, title, eyebrow, category, year, status, role, stack, intro, short, accent, metric_label, metric_value, featured, sections)
select 'portfolio-lab',4,'PORTFOLIO LAB','Interaction laboratory','Experiments','2026','Live system','Creative developer','Three.js · GSAP · WebGL',
'The portfolio itself as a laboratory for interaction, motion, typography and procedural graphics.',
'A living testbed for spatial UI, motion systems and browser-native 3D.','orange','MOTION','∞',false,
'[{"kicker":"01 / principle","heading":"The interface should move with intent.","body":"Large type, spatial shifts and a responsive WebGL layer create a sense of depth without hiding the content."},{"kicker":"02 / engineering","heading":"Motion is infrastructure.","body":"Animation primitives are centralized so interactions stay consistent across pages, sections and responsive states."},{"kicker":"03 / experiment","heading":"The browser becomes material.","body":"The system treats the browser as a canvas for typography, geometry, timing and interaction."}]'::jsonb
where not exists (select 1 from public.portfolio_projects where slug='portfolio-lab');

insert into public.portfolio_experience (sort_index,year,company,role,description)
select 1,'2025 — now','Independent','Creative developer / product builder','Building TABLELY, INSTALY and a growing library of interfaces, experiments and product systems.'
where not exists (select 1 from public.portfolio_experience where sort_index=1);

insert into public.portfolio_experience (sort_index,year,company,role,description)
select 2,'2024 — 2025','Product experiments','Full-stack / interaction','Exploring creator commerce, realtime systems, payment flows and interaction-heavy product surfaces.'
where not exists (select 1 from public.portfolio_experience where sort_index=2);

insert into public.portfolio_services (sort_index,title,description,tags)
select 1,'Creative development','Premium front-end engineering for ambitious products and digital experiences.',array['Next.js','React','TypeScript','WebGL']
where not exists (select 1 from public.portfolio_services where sort_index=1);

insert into public.portfolio_services (sort_index,title,description,tags)
select 2,'Interaction systems','GSAP motion, scroll choreography, cursor systems, transitions and responsive behavior.',array['GSAP','Lenis','Motion','3D']
where not exists (select 1 from public.portfolio_services where sort_index=2);

insert into public.portfolio_services (sort_index,title,description,tags)
select 3,'Product interfaces','Design-minded product work where flows, data, states and visual language ship together.',array['UX','Systems','Realtime','CMS']
where not exists (select 1 from public.portfolio_services where sort_index=3);

insert into public.portfolio_services (sort_index,title,description,tags)
select 4,'Digital worlds','WebGL scenes, procedural graphics and spatial interfaces that make the web feel physical.',array['Three.js','R3F','Shaders','Interaction']
where not exists (select 1 from public.portfolio_services where sort_index=4);

insert into public.portfolio_socials (sort_index,label,url)
select 1,'GitHub','https://github.com/ruizxzx'
where not exists (select 1 from public.portfolio_socials where sort_index=1);

insert into public.portfolio_socials (sort_index,label,url)
select 2,'LinkedIn','https://www.linkedin.com/'
where not exists (select 1 from public.portfolio_socials where sort_index=2);
