-- =====================================================================
-- Chicago Barber: serviços gerenciados pelo admin (fotos, vídeos, ordem)
-- Pré-requisito: a migração 20261014000000_admin_roles.sql já rodada
-- (ela cria a função public.is_admin()).
-- Rodar no Supabase: SQL Editor > New query > colar tudo > Run
-- É seguro rodar mais de uma vez.
-- =====================================================================

-- 0) is_admin() também precisa funcionar para visitantes (anon): a policy
--    de leitura abaixo a usa. Para quem não está logado ela devolve false.
grant execute on function public.is_admin() to anon;

-- 1) Colunas novas na tabela de serviços
alter table public.services add column if not exists description text;
alter table public.services add column if not exists image_path  text;
alter table public.services add column if not exists video_path  text;
alter table public.services add column if not exists active      boolean not null default true;
alter table public.services add column if not exists sort_order  integer not null default 0;

-- 2) O "slug" identifica o serviço no agendamento (a API já usa isso).
--    Se este comando falhar por duplicidade, dois serviços têm o mesmo slug.
create unique index if not exists services_slug_unique on public.services (slug);

-- 3) Validações básicas
do $$
begin
  alter table public.services
    add constraint services_price_not_negative check (price >= 0);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.services
    add constraint services_duration_positive check (duration > 0);
exception when duplicate_object then null;
end $$;

-- 4) Quem pode ler / escrever na tabela de serviços
--    - qualquer visitante lê os serviços ATIVOS (catálogo público)
--    - admin lê todos (inclusive desativados), cria e edita
--    - ninguém apaga: serviço antigo é DESATIVADO, para não quebrar o
--      histórico de agendamentos
alter table public.services enable row level security;

drop policy if exists "Usuários podem visualizar serviços" on public.services;
drop policy if exists "Catálogo público de serviços ativos" on public.services;
create policy "Catálogo público de serviços ativos"
  on public.services
  for select
  to anon, authenticated
  using (active = true or public.is_admin());

drop policy if exists "Admin cria serviços" on public.services;
create policy "Admin cria serviços"
  on public.services
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin edita serviços" on public.services;
create policy "Admin edita serviços"
  on public.services
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5) Bucket de fotos e vídeos (leitura pública, escrita só do admin)
--    Limite de 50 MB por arquivo (teto do plano gratuito).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'service-media',
  'service-media',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admin envia mídia dos serviços" on storage.objects;
create policy "Admin envia mídia dos serviços"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'service-media' and public.is_admin());

drop policy if exists "Admin lê mídia dos serviços" on storage.objects;
create policy "Admin lê mídia dos serviços"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'service-media' and public.is_admin());

drop policy if exists "Admin atualiza mídia dos serviços" on storage.objects;
create policy "Admin atualiza mídia dos serviços"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'service-media' and public.is_admin())
  with check (bucket_id = 'service-media' and public.is_admin());

drop policy if exists "Admin remove mídia dos serviços" on storage.objects;
create policy "Admin remove mídia dos serviços"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'service-media' and public.is_admin());
