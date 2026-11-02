-- =====================================================================
-- Chicago Barber: separação entre cliente (client) e administrador (admin)
-- Rodar no Supabase: SQL Editor > New query > colar tudo > Run
-- É seguro rodar mais de uma vez.
-- =====================================================================

-- 1) Tabela de perfis: um registro por usuário, com o papel dele
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 2) Cada usuário só consegue LER o próprio perfil.
--    Não existe policy de insert/update/delete: pelo site ninguém consegue
--    mudar o próprio papel. Quem muda é você, pelo SQL Editor.
drop policy if exists "Usuário lê o próprio perfil" on public.profiles;
create policy "Usuário lê o próprio perfil"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

-- 3) Função que diz se quem está logado é admin.
--    security definer: ela lê profiles sem depender das policies acima,
--    e assim pode ser usada dentro das policies de outras tabelas.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 4) Todo usuário novo ganha um perfil "client" automaticamente
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 5) Cria o perfil de quem já tinha conta antes desta migração
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- =====================================================================
-- 6) TORNAR ALGUÉM ADMIN (rodar à parte, trocando o e-mail):
--
--   update public.profiles
--   set role = 'admin'
--   where id = (select id from auth.users where email = 'EMAIL_DO_BARBEIRO@exemplo.com');
--
-- Para voltar a ser cliente:  set role = 'client'
-- Para conferir quem é admin: select u.email, p.role
--                             from public.profiles p join auth.users u on u.id = p.id;
-- =====================================================================

-- =====================================================================
-- EXEMPLO de como as próximas tabelas usarão a função (NÃO rodar agora;
-- vai junto com a migração dos serviços):
--
--   create policy "Admin gerencia serviços"
--     on public.services
--     for all
--     to authenticated
--     using (public.is_admin())
--     with check (public.is_admin());
-- =====================================================================
