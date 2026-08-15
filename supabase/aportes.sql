-- Aportes: donaciones y pagos extra que entran por fuera del precio del número.
-- Pegar completo en el SQL Editor de Supabase y ejecutar UNA sola vez.
-- (Complementa supabase/schema.sql; no modifica los datos que ya tienes.)

create table public.donations (
  id bigint generated always as identity primary key,
  name text not null,
  phone text,
  amount int not null check (amount > 0),
  -- 'donation': aporta sin llevar boleta · 'extra': pagó de más sobre su número
  kind text not null default 'donation'
    check (kind in ('donation', 'extra')),
  number int references public.raffle_numbers(number),
  note text,
  created_at timestamptz not null default now()
);

create index donations_created_at on public.donations (created_at desc);

alter table public.donations enable row level security;

-- Solo el admin registra y consulta los aportes (nunca son públicos)
create policy "admin lee aportes" on public.donations
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'diegoassia@gmail.com');

create policy "admin registra aportes" on public.donations
  for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'diegoassia@gmail.com');

create policy "admin actualiza aportes" on public.donations
  for update to authenticated
  using ((auth.jwt() ->> 'email') = 'diegoassia@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'diegoassia@gmail.com');

create policy "admin borra aportes" on public.donations
  for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'diegoassia@gmail.com');

revoke all on public.donations from anon;
