# Scaffold Web Page

Crea una nueva página Next.js para: $ARGUMENTS

Seguir la arquitectura definida en `specs/technical/06-cliente-web.md`:

1. **`page.tsx`** — Client Component (`"use client"`), usa el custom hook correspondiente
2. **`useXxx.ts`** — Custom hook en `lib/hooks/`, llama al Repository y expone estado local con `useState`
3. Si necesita escrituras, agregar el método al Repository en `lib/repositories/`

Ubicar la página en `code/web-app/app/(app)/<ruta>/page.tsx`.

No llamar a Firebase directamente desde el componente — siempre a través del Repository.
No usar `useEffect` para leer datos — usar el custom hook que encapsula el listener.
