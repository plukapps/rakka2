# Web — Fase 7: Home y Establecimientos

**Estado:** ⏳ pendiente  
**Depende de:** Fase 6 ✅

## Objetivo

Implementar la home screen orientada a gestión (el punto de entrada principal de la app) y la gestión de establecimientos. Son las últimas pantallas porque consumen datos de todos los módulos anteriores.

Specs funcionales: `specs/functional/08-home-screen.md`, `specs/functional/01-establecimientos.md`

---

## Tareas

### Home (`/`)

- [ ] **Header de contexto**: nombre del establecimiento activo + botón para cambiar
- [ ] **Sección actividad reciente**: últimas 5 actividades (cualquier tipo) con tipo, descripción, fecha, link al detalle. Reutilizar `ActivityFeedItem`.
- [ ] **Sección próximas acciones**: primeras 3 alertas activas ordenadas por urgencia. Reutilizar `AlertItem`. Link "Ver todas las alertas".
- [ ] **Accesos rápidos**: 4 botones fijos:
  - Registrar actividad sanitaria → `/actividades/sanitarias/nueva`
  - Ingresar animal → `/animales/nuevo`
  - Ver lotes → `/lotes`
  - Ver animales → `/animales`
- [ ] **Búsqueda global**: barra de búsqueda que filtra animales por caravana/nombre en el establecimiento activo. Resultados en dropdown. Click navega al perfil del animal.
- [ ] **Estado vacío**: si el establecimiento no tiene animales, mostrar EmptyState con call to action "Ingresar primer animal"
- [ ] **Estado sin establecimiento** (onboarding): si el usuario no tiene establecimientos, mostrar pantalla de bienvenida con "Crear mi primer establecimiento"

### Establecimientos (`/establecimientos`)

- [ ] Listado de establecimientos del usuario (activos y archivados)
- [ ] Card por establecimiento: nombre, ubicación, cantidad de animales activos, estado
- [ ] Botón "Crear establecimiento" → `/establecimientos/nuevo`
- [ ] Click en establecimiento → `/establecimientos/[estId]`
- [ ] Botón "Seleccionar" en cada card para cambiar el establecimiento activo

### Formulario de creación (`/establecimientos/nuevo`)
- [ ] Campos: nombre (obligatorio), descripción, ubicación
- [ ] Al confirmar: crear en mock store + seleccionar como activo automáticamente + redirigir a home

### Detalle/edición (`/establecimientos/[estId]`)
- [ ] Ver y editar: nombre, descripción, ubicación
- [ ] Métricas: total de animales activos, lotes activos
- [ ] Botón "Archivar" (deshabilitado si tiene animales activos, con tooltip explicativo)
- [ ] Al archivar: establecimiento pasa a `archived`, no aparece como activo seleccionable

---

## Archivos a modificar/crear

```
code/web-app/
├── app/(app)/
│   ├── page.tsx                       ← Home completa
│   └── establecimientos/
│       ├── page.tsx
│       ├── nuevo/page.tsx
│       └── [estId]/page.tsx
```

---

## Criterios de done

- [ ] La home muestra las últimas actividades reales del mock store
- [ ] La búsqueda global encuentra animales por caravana parcial
- [ ] Cambiar de establecimiento activo desde la home actualiza todo el contenido
- [ ] El usuario sin establecimientos ve la pantalla de onboarding
- [ ] Crear un establecimiento nuevo lo selecciona automáticamente como activo
- [ ] Archivar un establecimiento con animales activos muestra el error bloqueante
- [ ] La app completa es navegable de punta a punta sin errores
