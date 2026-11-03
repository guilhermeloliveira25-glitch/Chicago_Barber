-- Chicago Barber: leitura e gerenciamento de agendamentos pelo administrador.
-- Pré-requisito: public.is_admin() e as tabelas appointments,
-- appointment_services e services já existentes.

create or replace function public.admin_list_appointments(
  p_start_date date,
  p_end_date date
)
returns table (
  id uuid,
  user_id uuid,
  customer_email text,
  customer_name text,
  appointment_date date,
  start_time time,
  end_time time,
  total_duration integer,
  total_price numeric,
  status text,
  services jsonb
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
      nullif(u.raw_user_meta_data ->> 'full_name', ''),
      nullif(u.raw_user_meta_data ->> 'name', ''),
      u.email,
      'Cliente'
    )::text,
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
  left join public.appointment_services aps on aps.appointment_id = a.id
  left join public.services s on s.id = aps.service_id
  where a.date >= p_start_date
    and a.date <= p_end_date
  group by a.id, u.email, u.raw_user_meta_data
  order by a.date, a.start_time;
end;
$$;

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
  v_new_date date;
  v_new_start time;
  v_new_end time;
  v_new_status text;
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

  v_new_date := coalesce(p_date, v_appointment.date);
  v_new_start := coalesce(p_start_time, v_appointment.start_time);
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

revoke all on function public.admin_list_appointments(date, date) from public, anon;
revoke all on function public.admin_update_appointment(uuid, date, time, text) from public, anon;
grant execute on function public.admin_list_appointments(date, date) to authenticated;
grant execute on function public.admin_update_appointment(uuid, date, time, text) to authenticated;
