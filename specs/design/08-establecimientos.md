# Diseño Desktop — Módulo Establecimientos

**Rutas**: `/establishments` · `/establishments/new` · `/establishments/[estId]`  
**Propósito**: Gestionar los establecimientos del usuario. El establecimiento activo es el contexto de toda la app.

---

## 1. Listado de establecimientos (`/establishments`)

Accesible desde el sidebar (ítem al fondo) o desde el EstablishmentSelector del header.

### Layout general

```
┌────────────────────────────────────────────────────────┐
│ Page Header: "Establecimientos"  [+ Nuevo establecimiento]│
├────────────────────────────────────────────────────────┤
│ Toolbar: [Buscar...]   [☐ Mostrar archivados]          │
├────────────────────────────────────────────────────────┤
│  [EstablishmentCard]                                   │
│  [EstablishmentCard]                                   │
│  ...                                                   │
└────────────────────────────────────────────────────────┘
```

### EstablishmentCard

```
┌───────────────────────────────────────────────────────┐
│  La Esperanza                      [activo/archivado]  │
│  Gral. Pico, La Pampa                                 │
│  "Campo en zona norte"                                │
│  142 animales · 8 lotes activos                       │
│                                                       │
│  [Activar]   [Ver detalle]                            │
└───────────────────────────────────────────────────────┘
```

- **Nombre** del establecimiento como título.
- StatusBadge: activo / archivado.
- **Ubicación** (si tiene).
- **Descripción** (si tiene, máx 1 línea con truncado).
- **Métricas rápidas**: cantidad de animales activos y lotes activos.
- **Botón "Activar"**: solo visible si este establecimiento no es el activo actual. Al presionar, cambia el contexto global de la app → redirige a `/home`.
- **Botón "Ver detalle"**: navega a `/establishments/[estId]`.
- El establecimiento actualmente activo puede marcarse con un ícono o borde diferenciado.

### Estados
- **Vacío (sin establecimientos)**: EmptyState "Todavía no tenés establecimientos" + botón "Crear primer establecimiento".
- **Cargando**: skeleton de 2-3 cards.

---

## 2. Formulario nuevo establecimiento (`/establishments/new`)

### Layout

Formulario en columna central, ancho máximo 480px.

```
┌────────────────────────────────────────────────────────┐
│ Page Header: "Nuevo establecimiento"   [← Volver]      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Formulario                                            │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Campos

- **Nombre** * (input texto, ej. "La Esperanza")
- **Ubicación** (input texto, opcional, ej. "Gral. Pico, La Pampa")
- **Descripción** (textarea, opcional)

### Acciones
- "Crear establecimiento" (primario).
- "Cancelar" → vuelve a `/establishments`.
- Al crear: el nuevo establecimiento se activa automáticamente + redirige a `/home`.

---

## 3. Detalle de establecimiento (`/establishments/[estId]`)

### Layout general

```
┌────────────────────────────────────────────────────────┐
│ [← Establecimientos]  Breadcrumb                       │
├────────────────────────────────────────────────────────┤
│ Page Header: "La Esperanza"  [activo/archivado]        │
│              Gral. Pico, La Pampa                      │
│              "Campo en zona norte"                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──── Métricas ─────────────────────────────────┐    │
│  │  142 animales activos  ·  8 lotes activos      │    │
│  │  3 con carencia activa · 0 alertas críticas    │    │
│  └────────────────────────────────────────────────┘    │
│                                                        │
├────────────────────────────────────────────────────────┤
│ Acciones                                               │
└────────────────────────────────────────────────────────┘
```

### Sección: Métricas

Grid 2x2 con las métricas del establecimiento:
- Total animales activos.
- Lotes activos.
- Animales con carencia activa (badge danger si > 0).
- Alertas críticas activas (badge danger si > 0).

Cada métrica: número en grande + label descriptivo.

### Sección: Acciones

Para establecimiento **activo**:
- "Editar datos" → abre modal de edición (nombre, ubicación, descripción).
- "Archivar establecimiento" → abre modal de confirmación.

Para establecimiento **archivado**:
- "Restaurar establecimiento" → lo vuelve a estado activo.
- No se puede archivar si tiene animales activos (ver validación).

### Modal: Editar establecimiento

- Campos: nombre *, ubicación, descripción.
- Botones: "Guardar" + "Cancelar".

### Modal: Archivar establecimiento

- Advertencia: "Al archivar este establecimiento, dejará de aparecer en la app. No podrás registrar actividades hasta restaurarlo."
- Validación: si tiene animales activos → mostrar error: "No podés archivar un establecimiento con animales activos. Egresá los animales primero."
- Botón: "Archivar" (danger) + "Cancelar".

---

## 4. Selector de establecimiento (Header — EstablishmentSelector)

Componente presente en el Header en todas las pantallas autenticadas.

```
┌─────────────────────────┐
│  La Esperanza        ▾  │
├─────────────────────────┤
│  ✔ La Esperanza         │
│    Campo Norte          │
│  ─────────────────────  │
│  + Crear establecimiento│
└─────────────────────────┘
```

- Muestra el nombre del establecimiento activo.
- Dropdown al hacer click: lista de todos los establecimientos activos del usuario.
- El establecimiento actual marcado con un check.
- Al seleccionar uno diferente: cambia el contexto global → redirige a `/home`.
- Link "Crear establecimiento" → `/establishments/new`.
- Estado sin establecimiento: muestra "Seleccionar establecimiento" + abre el dropdown automáticamente si es la primera vez.
