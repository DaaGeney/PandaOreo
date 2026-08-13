# Rifa Oreo y Panda 🐾

App para llevar el control de la rifa solidaria: quién tiene cada número (00–99),
quién pagó y quién debe, con tablero público para compartir y exportación de
imagen estilo afiche.

## Correr en local

```bash
npm install
npm run dev
```

Sin configurar nada corre en **modo demo** (datos guardados en el navegador),
perfecto para probar. Rutas:

- `/` — panel de administración
- `/tablero` — tablero público (solo disponible/vendido, sin nombres)

## Conectar Supabase (datos en la nube + login)

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. En **SQL Editor**, pega y ejecuta el contenido de [`supabase/schema.sql`](supabase/schema.sql).
3. Crea tu usuario admin: **Authentication → Users → Add user**, con el correo
   `diegoassia@gmail.com` y una contraseña (marca "Auto confirm user").
4. Desactiva el registro de extraños: **Authentication → Sign In / Up →
   Allow new users to sign up → OFF**.
5. Copia `.env.example` a `.env` y llena `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` (Project Settings → API).
6. Reinicia `npm run dev`.

Solo el email `diegoassia@gmail.com` puede administrar (definido en las
políticas de `supabase/schema.sql` y en `src/lib/supabase.ts`); aunque alguien
creara otra cuenta, RLS le bloquea lecturas y escrituras.

## Deploy en Vercel

1. Sube el proyecto a un repo de GitHub y conéctalo en [vercel.com](https://vercel.com)
   (framework: Vite), o usa `npx vercel` desde la terminal.
2. Agrega las dos variables de entorno del `.env` en Vercel.
3. El link público para compartir será `https://tu-app.vercel.app/tablero`.

> Nota: para que `/tablero` funcione al entrar directo, Vercel ya reescribe las
> rutas de SPA automáticamente con la config de [`vercel.json`](vercel.json).
