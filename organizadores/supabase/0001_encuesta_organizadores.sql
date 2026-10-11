-- 0001 · Encuesta para organizadores de carreras (sitio público, aparte de la app).
-- Destino: el proyecto de Supabase del sitio (el de la encuesta y la lista de espera), como migración nueva en runapp/supabase/migrations/.
-- Dos tablas separadas a propósito:
--   organizer_responses → respuestas ANÓNIMAS. Desde internet solo se puede insertar.
--   organizer_leads     → contacto VOLUNTARIO al final (Ley 787). Nadie lee ni escribe la tabla desde el sitio:
--                         todo entra por submit_organizer_lead (security definer), que valida y no revela nada.
-- Ambas comparten client_id (id aleatorio del teléfono): así el equipo ve la respuesta junto al contacto
-- solo cuando la persona decidió dejarlo. El aviso del sitio lo dice.

-- ───────── Respuestas anónimas ─────────
create table public.organizer_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  version text not null check (char_length(version) between 1 and 20),
  -- activo = organizó al menos un evento en 12 meses; planea = todavía no
  path text not null check (path in ('activo', 'planea')),
  -- de dónde vino el enlace (?c=ig, ?c=directo…); 'prueba' marca envíos del equipo
  channel text check (channel is null or channel ~ '^[a-z0-9_-]{1,40}$'),
  -- quién del equipo compartió el enlace (?ref=kenneth): el acercamiento es híbrido
  ref text check (ref is null or ref ~ '^[a-z0-9_-]{1,24}$'),
  answers jsonb not null check (jsonb_typeof(answers) = 'object' and pg_column_size(answers) <= 16000),
  client_id uuid not null unique
);

comment on table public.organizer_responses is
  'Respuestas anónimas de la encuesta para organizadores de carreras. Solo inserción desde anon. Sin datos personales.';

create or replace function public.validate_organizer_answers()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  k text;
  v jsonb;
  item jsonb;
begin
  if (select count(*) from jsonb_object_keys(new.answers)) > 60 then
    raise exception 'too many answers';
  end if;
  for k, v in select * from jsonb_each(new.answers) loop
    if k !~ '^[A-Z][A-Z0-9]{1,3}$' then
      raise exception 'invalid question key';
    end if;
    if jsonb_typeof(v) = 'string' then
      if char_length(v #>> '{}') > 600 then raise exception 'answer too long'; end if;
    elsif jsonb_typeof(v) = 'array' then
      if jsonb_array_length(v) > 14 then raise exception 'too many options'; end if;
      for item in select * from jsonb_array_elements(v) loop
        if jsonb_typeof(item) <> 'string' or char_length(item #>> '{}') > 40 then
          raise exception 'invalid option';
        end if;
      end loop;
    else
      raise exception 'invalid answer type';
    end if;
  end loop;
  return new;
end;
$$;

create trigger organizer_responses_validate
  before insert on public.organizer_responses
  for each row execute function public.validate_organizer_answers();

alter table public.organizer_responses enable row level security;

create policy "Cualquiera puede enviar una respuesta"
  on public.organizer_responses
  for insert
  to anon, authenticated
  with check (true);

revoke all on table public.organizer_responses from anon, authenticated;
grant insert on table public.organizer_responses to anon, authenticated;
revoke execute on function public.validate_organizer_answers() from public, anon, authenticated;

create index organizer_responses_created_at_idx on public.organizer_responses (created_at);

-- ───────── Contacto voluntario: postulación a Organizador Fundador, llamada o informe ─────────
create table public.organizer_leads (
  id bigint generated always as identity primary key,
  client_id uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 80),
  organization text check (char_length(organization) <= 100),
  whatsapp text check (whatsapp ~ '^\+[1-9][0-9]{7,14}$'),
  email text check (char_length(email) <= 254 and email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$'),
  -- fundador = se postula · llamada = quiere conversar · informe = solo el resumen de resultados
  interests text[] not null check (cardinality(interests) between 1 and 3 and interests <@ array['fundador', 'llamada', 'informe']),
  meet text check (meet in ('videollamada', 'llamada', 'persona', 'escribir')),
  slot text check (slot in ('manana', 'mediodia', 'tarde', 'noche', 'cualquiera')),
  next_event text check (char_length(next_event) <= 80),
  channel text check (channel ~ '^[a-z0-9_-]{1,40}$'),
  ref text check (ref ~ '^[a-z0-9_-]{1,24}$'),
  consent_version text not null check (consent_version ~ '^[0-9a-z.-]{1,20}$'),
  -- CRM del equipo: estado, responsable y notas (solo desde el panel de Supabase)
  status text not null default 'nuevo'
    check (status in ('nuevo', 'contactado', 'llamada_agendada', 'conversado', 'fundador', 'siguiente_ronda', 'cerrado')),
  owner text,
  notes text,
  constraint organizer_leads_contact check (whatsapp is not null or email is not null)
);

comment on table public.organizer_leads is
  'Contacto que un organizador dejó a propósito al final de la encuesta (Ley 787). Solo entra por submit_organizer_lead.';

create unique index organizer_leads_whatsapp_key on public.organizer_leads (whatsapp) where whatsapp is not null;
create unique index organizer_leads_email_key on public.organizer_leads (email) where email is not null;
create index organizer_leads_created_at_idx on public.organizer_leads (created_at);

alter table public.organizer_leads enable row level security;
revoke all on public.organizer_leads from public, anon, authenticated;

create function public.submit_organizer_lead(
  p_client_id uuid,
  p_name text,
  p_organization text,
  p_whatsapp text,
  p_email text,
  p_interests text[],
  p_meet text,
  p_slot text,
  p_next_event text,
  p_consent_version text,
  p_channel text default null,
  p_ref text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_wa text := nullif(ltrim(regexp_replace(coalesce(p_whatsapp, ''), '[^0-9]', '', 'g'), '0'), '');
  v_email text := nullif(lower(btrim(coalesce(p_email, ''))), '');
  -- la atribución nunca tumba un envío: lo que no tiene forma válida se descarta
  v_channel text := case when lower(p_channel) ~ '^[a-z0-9_-]{1,40}$' then lower(p_channel) end;
  v_ref text := case when lower(p_ref) ~ '^[a-z0-9_-]{1,24}$' then lower(p_ref) end;
  v_org text := nullif(btrim(coalesce(p_organization, '')), '');
  v_next text := nullif(btrim(coalesce(p_next_event, '')), '');
begin
  if p_client_id is null then
    raise exception 'client_id requerido';
  end if;
  if coalesce(p_consent_version, '') = '' then
    raise exception 'falta el consentimiento';
  end if;

  -- WhatsApp en formato internacional: 8 dígitos son un número de Nicaragua
  if v_wa is not null then
    v_wa := '+' || case when length(v_wa) = 8 then '505' || v_wa else v_wa end;
  end if;

  -- el mismo aparato corrige lo que ya había mandado
  if exists (select 1 from public.organizer_leads where client_id = p_client_id) then
    update public.organizer_leads set
      name = btrim(p_name), organization = v_org, whatsapp = v_wa, email = v_email,
      interests = p_interests, meet = p_meet, slot = p_slot, next_event = v_next,
      consent_version = p_consent_version, updated_at = now()
    where client_id = p_client_id;
    return jsonb_build_object('ok', true, 'existing', false);
  end if;

  -- el mismo contacto desde otro aparato: no se duplica ni se revela nada
  if exists (select 1 from public.organizer_leads
             where (v_wa is not null and whatsapp = v_wa) or (v_email is not null and email = v_email)) then
    return jsonb_build_object('ok', true, 'existing', true);
  end if;

  -- freno simple contra envíos automatizados en masa
  if (select count(*) from public.organizer_leads where created_at > now() - interval '1 minute') >= 30 then
    raise exception 'demasiados envíos seguidos' using errcode = 'P0001', hint = 'reintentar';
  end if;

  insert into public.organizer_leads
    (client_id, name, organization, whatsapp, email, interests, meet, slot, next_event, channel, ref, consent_version)
  values
    (p_client_id, btrim(p_name), v_org, v_wa, v_email, p_interests, p_meet, p_slot, v_next, v_channel, v_ref, p_consent_version);

  return jsonb_build_object('ok', true, 'existing', false);
exception when unique_violation then
  return jsonb_build_object('ok', true, 'existing', true);
end;
$$;

comment on function public.submit_organizer_lead(uuid, text, text, text, text, text[], text, text, text, text, text, text) is
  'Pública a propósito (encuesta de organizadores): guarda un contacto con consentimiento. No devuelve datos.';

revoke execute on function public.submit_organizer_lead(uuid, text, text, text, text, text[], text, text, text, text, text, text) from public;
grant execute on function public.submit_organizer_lead(uuid, text, text, text, text, text[], text, text, text, text, text, text) to anon, authenticated;

-- ───────── Embudo sin datos personales: sumas por día, evento y canal ─────────
create table public.organizer_funnel (
  day date not null default current_date,
  event text not null check (event in ('visita', 'inicio', 'fin', 'contacto', 'compartir')),
  channel text not null default 'directo' check (channel ~ '^[a-z0-9_-]{1,40}$'),
  n int not null default 0,
  primary key (day, event, channel)
);

alter table public.organizer_funnel enable row level security;
revoke all on public.organizer_funnel from public, anon, authenticated;

create function public.track_organizer(p_event text, p_channel text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_channel text := coalesce(case when lower(p_channel) ~ '^[a-z0-9_-]{1,40}$' then lower(p_channel) end, 'directo');
begin
  if p_event not in ('visita', 'inicio', 'fin', 'contacto', 'compartir') or v_channel = 'prueba' then
    return;
  end if;
  insert into public.organizer_funnel (day, event, channel, n) values (current_date, p_event, v_channel, 1)
  on conflict (day, event, channel) do update set n = public.organizer_funnel.n + 1;
end;
$$;

revoke execute on function public.track_organizer(text, text) from public;
grant execute on function public.track_organizer(text, text) to anon, authenticated;
