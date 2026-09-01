-- Cierre de ventas: un interruptor que el admin baja cuando ya no quiere que
-- nadie más aparte números (la rifa juega el viernes a las 11 p.m.).
--
-- Vive en la base y no en el navegador porque tiene que verse en el celular de
-- todo el mundo, no solo en el del admin.

create table if not exists public.raffle_settings (
  -- Una sola fila: el check impide que aparezca una segunda por accidente
  id int primary key default 1 check (id = 1),
  sales_closed boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.raffle_settings (id) values (1) on conflict (id) do nothing;

alter table public.raffle_settings enable row level security;

-- El estado del cierre es público: el tablero tiene que poder leerlo sin login.
-- No hay nada sensible en la tabla, solo un booleano.
drop policy if exists "todos leen ajustes" on public.raffle_settings;
create policy "todos leen ajustes" on public.raffle_settings
  for select to anon, authenticated
  using (true);

drop policy if exists "admin cambia ajustes" on public.raffle_settings;
create policy "admin cambia ajustes" on public.raffle_settings
  for update to authenticated
  using ((auth.jwt() ->> 'email') = 'diegoassia@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'diegoassia@gmail.com');

grant select on public.raffle_settings to anon, authenticated;
grant update on public.raffle_settings to authenticated;

-- El cierre se hace de verdad aquí: aunque alguien tenga la página vieja
-- abierta, o le pegue directo a la función, la solicitud no entra.
create or replace function public.request_number(
  p_number int,
  p_name text,
  p_phone text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from raffle_settings where id = 1 and sales_closed) then
    raise exception 'Las ventas ya están cerradas';
  end if;
  if p_number is null or p_number < 0 or p_number > 99 then
    raise exception 'Número inválido';
  end if;
  if p_name is null or length(trim(p_name)) < 2 then
    raise exception 'Escribe tu nombre';
  end if;
  -- el teléfono es obligatorio: sin él no hay forma de confirmar
  if p_phone is null or length(regexp_replace(p_phone, '\D', '', 'g')) < 7 then
    raise exception 'Escribe un teléfono válido';
  end if;
  if exists (
    select 1 from raffle_numbers
    where number = p_number and status <> 'available'
  ) then
    raise exception 'Ese número ya está vendido';
  end if;
  if exists (
    select 1 from number_requests
    where number = p_number and status = 'pending'
  ) then
    raise exception 'Ese número ya tiene una solicitud pendiente';
  end if;

  insert into number_requests (number, name, phone)
  values (p_number, trim(p_name), trim(p_phone));
end;
$$;

grant execute on function public.request_number(int, text, text) to anon, authenticated;
