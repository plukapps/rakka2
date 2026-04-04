# Web — Fase 2: Layout y navegación

**Estado:** ⏳ pendiente  
**Depende de:** Fase 1 ✅

## Objetivo

Construir el esqueleto navegable de la app: root layout, auth pages (login/register mockeados), app layout con sidebar + header + selector de establecimiento, y todos los componentes UI base. Al final de esta fase se puede navegar entre todas las rutas aunque las páginas internas estén vacías.

---

## Tareas

### Root layout (`app/layout.tsx`)
- [ ] Fuentes (Inter o similar via `next/font`)
- [ ] Provider de Zustand wrapping toda la app
- [ ] Metadata básica (title, description)

### Auth (`app/(auth)/`)
- [ ] `login/page.tsx` — formulario email/password, mock login (cualquier credencial funciona), redirige a `/`
- [ ] `register/page.tsx` — formulario nombre/email/password, mock register, redirige a `/`
- [ ] Layout visual: pantalla centrada, logo/nombre de la app, card con el formulario

### App layout (`app/(app)/layout.tsx`)
- [ ] Verificar auth (si no hay usuario en authStore, redirigir a `/login`)
- [ ] Estructura: `Sidebar` fijo izquierda + contenido principal derecho
- [ ] `Header` en la parte superior del contenido
- [ ] `EstablishmentSelector` en el Header o Sidebar

### Componentes de layout (`components/layout/`)
- [ ] `Sidebar.tsx` — links de navegación: Inicio, Animales, Lotes, Actividades, Alertas, Establecimientos
- [ ] `Header.tsx` — nombre del establecimiento activo, búsqueda global (placeholder), avatar/menu usuario
- [ ] `EstablishmentSelector.tsx` — dropdown para cambiar de establecimiento activo

### Componentes UI base (`components/ui/`)
- [ ] `Button.tsx` — variantes: `primary`, `secondary`, `ghost`, `danger`; tamaños: `sm`, `md`, `lg`
- [ ] `Input.tsx` — con label, error message, icono opcional
- [ ] `Badge.tsx` — variantes: `default`, `success`, `warning`, `danger`, `info`
- [ ] `Card.tsx` — contenedor con padding y borde estándar
- [ ] `Select.tsx` — dropdown nativo estilizado con Tailwind
- [ ] `EmptyState.tsx` — icono + título + descripción + acción opcional
- [ ] `LoadingSpinner.tsx` — spinner centrado

### Páginas stub (para navegación)
- [ ] Crear todas las páginas de `(app)/` como stubs (`<h1>Nombre de la sección</h1>`) para que las rutas resuelvan sin errores:
  - `animales/page.tsx`, `animales/nuevo/page.tsx`, `animales/[animalId]/page.tsx`
  - `lotes/page.tsx`, `lotes/nuevo/page.tsx`, `lotes/[lotId]/page.tsx`
  - `actividades/sanitarias/nueva/page.tsx`, `actividades/comerciales/nueva/page.tsx`
  - `trazabilidad/[animalId]/page.tsx`
  - `alertas/page.tsx`
  - `establecimientos/page.tsx`, `establecimientos/nuevo/page.tsx`, `establecimientos/[estId]/page.tsx`

---

## Archivos a crear

```
code/web-app/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (app)/
│       ├── layout.tsx
│       ├── page.tsx (stub)
│       └── [todas las rutas como stubs]
└── components/
    ├── layout/Sidebar.tsx
    ├── layout/Header.tsx
    ├── layout/EstablishmentSelector.tsx
    └── ui/Button.tsx, Input.tsx, Badge.tsx, Card.tsx, Select.tsx, EmptyState.tsx, LoadingSpinner.tsx
```

---

## Criterios de done

- [ ] Login con cualquier email/pass redirige a la home
- [ ] Logout redirige a `/login`
- [ ] Todos los links del sidebar navegan sin errores 404
- [ ] El selector de establecimiento cambia el establecimiento activo visible en el header
- [ ] Responsive básico: sidebar colapsable en mobile
