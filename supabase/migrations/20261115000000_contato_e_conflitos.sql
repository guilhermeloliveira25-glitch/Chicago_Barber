-- =====================================================================
-- Chicago Barber: contato do cliente + agendamento sem conflito de horário
--
-- Pré-requisitos (já existentes no seu banco): public.is_admin(), as tabelas
-- appointments / appointment_services / services e as funções
-- admin_list_appointments e admin_update_appointment da migração 20261103.
--
-- Rodar no Supabase: SQL Editor > New query > colar tudo > Run.
-- ANTES de publicar o site novo. Só adiciona/atualiza: o site atual continua
-- funcionando. Depois de publicar, rodar a migração "hardening" seguinte.
-- É seguro rodar mais de uma vez.
-- =====================================================================

-- 1) Contato do cliente (para o barbeiro poder avisar)
create table if not exists public.client_details (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null check (char_length(btrim(full_name)) >= 2),
  phone      text not null check (phone ~ '^[0-9]{10,11}$'),
  updated_at timestamptz not null default now()
);

alter table public.client_details enable row level security;

drop policy if exists "Cliente lê o próprio contato; admin lê todos" on public.client_details;
create policy "Cliente lê o próprio contato; admin lê todos"
  on public.client_details for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Cliente cria o próprio contato" on public.client_details;
create policy "Cliente cria o próprio contato"
  on public.client_details for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Cliente edita o próprio contato" on public.client_details;
create policy "Cliente edita o próprio contato"
  on public.client_details for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 2) Cliente cria o agendamento: validação + checagem de conflito + gravação
--    numa transação só. A trava por data faz dois pedidos simultâneos
--    entrarem na fila (o segundo enxerga o primeiro e recebe "slot_taken").
create or replace function public.create_appointment(
  p_service_slugs text[],
  p_date          date,
  p_start         time
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_now       timestamp := (now() at time zone 'America/Sao_Paulo');
  v_wanted    integer;
  v_found     integer;
  v_duration  integer;
  v_price     numeric;
  v_start_min integer;
  v_end       time;
  v_row       public.appointments;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (select 1 from public.client_details c where c.user_id = v_uid) then
    raise exception 'missing_contact';
  end if;

  if p_service_slugs is null or cardinality(p_service_slugs) = 0
     or p_date is null or p_start is null then
    raise exception 'invalid_request';
  end if;

  select count(distinct t.slug) into v_wanted
  from unnest(p_service_slugs) as t(slug);

  select count(*), coalesce(sum(s.duration), 0)::integer, coalesce(sum(s.price), 0)
    into v_found, v_duration, v_price
  from public.services s
  where s.slug = any (p_service_slugs)
    and s.active = true;

  if v_found = 0 or v_found <> v_wanted then
    raise exception 'service_not_found';
  end if;

  if p_date < v_now::date or p_date > (v_now::date + interval '1 month')::date then
    raise exception 'invalid_date';
  end if;

  if extract(dow from p_date) = 0 then
    raise exception 'closed_day';
  end if;

  v_start_min := extract(hour from p_start)::integer * 60 + extract(minute from p_start)::integer;

  if v_start_min < 9 * 60 or v_start_min + v_duration > 19 * 60 then
    raise exception 'invalid_time';
  end if;

  if (p_date + p_start) <= v_now then
    raise exception 'past';
  end if;

  perform pg_advisory_xact_lock(hashtext('agenda:' || p_date::text));

  v_end := p_start + make_interval(mins => v_duration);

  if exists (
    select 1
    from public.appointments a
    where a.date = p_date
      and a.status <> 'cancelled'
      and p_start < a.end_time
      and v_end   > a.start_time
  ) then
    raise exception 'slot_taken';
  end if;

  insert into public.appointments
    (user_id, date, start_time, end_time, total_duration, total_price, status)
  values
    (v_uid, p_date, p_start, v_end, v_duration, v_price, 'confirmed')
  returning * into v_row;

  insert into public.appointment_services (appointment_id, service_id, price, duration)
  select v_row.id, s.id, s.price, s.duration
  from public.services s
  where s.slug = any (p_service_slugs)
    and s.active = true;

  return jsonb_build_object(
    'appointmentId', v_row.id::text,
    'date',          p_date,
    'startTime',     to_char(p_start, 'HH24:MI'),
    'endTime',       to_char(v_end,   'HH24:MI'),
    'totalDuration', v_duration,
    'totalPrice',    v_price
  );
end;
$$;

revoke all on function public.create_appointment(text[], date, time) from public, anon;
grant execute on function public.create_appointment(text[], date, time) to authenticated;

-- 3) Cliente vê quais horários do dia já estão ocupados (só intervalos, sem dados de ninguém)
create or replace function public.get_busy_slots(p_date date)
returns table (starts_at text, ends_at text)
language sql
stable
security definer
set search_path = public
as $$
  select to_char(a.start_time, 'HH24:MI'),
         to_char(a.end_time,   'HH24:MI')
  from public.appointments a
  where a.date = p_date
    and a.status <> 'cancelled'
  order by a.start_time;
$$;

revoke all on function public.get_busy_slots(date) from public, anon;
grant execute on function public.get_busy_slots(date) to authenticated;

-- 4) Agenda do admin: agora com nome e telefone de contato.
--    (O tipo de retorno mudou, por isso a função é recriada.)
drop function if exists public.admin_list_appointments(date, date);

create function public.admin_list_appointments(
  p_start_date date,
  p_end_date   date
)
returns table (
  id               uuid,
  user_id          uuid,
  customer_email   text,
  customer_name    text,
  customer_phone   text,
  appointment_date date,
  start_time       time,
  end_time         time,
  total_duration   integer,
  total_price      numeric,
  status           text,
  services         jsonb
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso não autorizado.' using errcode = '42501';
  end if;

  return query
  select
    a.id,
    a.user_id,
    coalesce(u.email, 'E-mail indisponível')::text,
    coalesce(
      nullif(btrim(cd.full_name), ''),
      nullif(u.raw_user_meta_data ->> 'full_name', ''),
      nullif(u.raw_user_meta_data ->> 'name', ''),
      u.email,
      'Cliente'
    )::text,
    cd.phone::text,
    a.date,
    a.start_time,
    a.end_time,
    a.total_duration::integer,
    a.total_price::numeric,
    a.status::text,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'name', s.name,
          'price', aps.price,
          'duration', aps.duration
        ) order by s.name
      ) filter (where s.id is not null),
      '[]'::jsonb
    )
  from public.appointments a
  left join auth.users u on u.id = a.user_id
  left join public.client_details cd on cd.user_id = a.user_id
  left join public.appointment_services aps on aps.appointment_id = a.id
  left join public.services s on s.id = aps.service_id
  where a.date >= p_start_date
    and a.date <= p_end_date
  group by a.id, u.email, u.raw_user_meta_data, cd.full_name, cd.phone
  order by a.date, a.start_time;
end;
$$;

revoke all on function public.admin_list_appointments(date, date) from public, anon;
grant execute on function public.admin_list_appointments(date, date) to authenticated;

-- 5) Admin remarca/muda status: mesma função de antes, agora com a MESMA trava
--    por data usada no agendamento do cliente e sem permitir remarcar para o passado.
create or replace function public.admin_update_appointment(
  p_appointment_id uuid,
  p_date date default null,
  p_start_time time default null,
  p_status text default null
)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_appointment public.appointments%rowtype;
  v_new_date    date;
  v_new_start   time;
  v_new_end     time;
  v_new_status  text;
begin
  if not public.is_admin() then
    raise exception 'Acesso não autorizado.' using errcode = '42501';
  end if;

  select ap.* into v_appointment
  from public.appointments ap
  where ap.id = p_appointment_id
  for update;

  if not found then
    raise exception 'Agendamento não encontrado.' using errcode = 'P0002';
  end if;

  v_new_date   := coalesce(p_date, v_appointment.date);
  v_new_start  := coalesce(p_start_time, v_appointment.start_time);
  v_new_status := coalesce(p_status, v_appointment.status);

  if v_new_status not in ('confirmed', 'cancelled', 'completed') then
    raise exception 'Status inválido.' using errcode = '22023';
  end if;

  if v_new_status <> 'cancelled' then
    if extract(dow from v_new_date) = 0 then
      raise exception 'A barbearia não funciona aos domingos.' using errcode = '22023';
    end if;

    v_new_end := v_new_start + make_interval(mins => v_appointment.total_duration::integer);

    if v_new_start < time '09:00' or v_new_end > time '19:00' then
      raise exception 'O horário precisa estar entre 09:00 e 19:00.' using errcode = '22023';
    end if;

    -- só barra o passado quando a data/hora está sendo trocada
    if (p_date is not null or p_start_time is not null)
       and (v_new_date + v_new_start) <= (now() at time zone 'America/Sao_Paulo') then
      raise exception 'Esse horário já passou.' using errcode = '22023';
    end if;

    perform pg_advisory_xact_lock(hashtext('agenda:' || v_new_date::text));

    if exists (
      select 1
      from public.appointments other
      where other.id <> v_appointment.id
        and other.date = v_new_date
        and other.status <> 'cancelled'
        and v_new_start < other.end_time
        and v_new_end > other.start_time
    ) then
      raise exception 'Esse horário já está ocupado.' using errcode = '23P01';
    end if;
  else
    v_new_end := v_appointment.end_time;
  end if;

  update public.appointments
  set date = v_new_date,
      start_time = v_new_start,
      end_time = v_new_end,
      status = v_new_status
  where appointments.id = v_appointment.id;

  return true;
end;
$$;

revoke all on function public.admin_update_appointment(uuid, date, time, text) from public, anon;
grant execute on function public.admin_update_appointment(uuid, date, time, text) to authenticated;
