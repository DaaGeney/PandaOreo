-- Cierre de ventas: un interruptor que el admin baja cuando ya no quiere que
-- nadie más aparte números (la rifa juega el viernes a las 11 p.m.).
--
-- Vive en la base y no en el navegador porque tiene que verse en el celular de
-- todo el mundo, no solo en el del admin.
--
-- A propósito NO se toca nada de lo que ya existe: esta migración solo crea
-- una tabla nueva que nada más usa. Quien aplica el cierre es la app, que
-- bloquea el tablero público. Si alguien tenía la página abierta justo cuando
-- se cierra y alcanza a mandar una solicitud, esa solicitud cae igual en
-- «Solicitudes pendientes», donde el admin decide si la acepta.

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
