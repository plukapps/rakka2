# Diseño Desktop — Módulo Lotes

**Rutas**: `/lots` · `/lots/new` · `/lots/[lotId]`  
**Propósito**: Gestionar agrupaciones operativas de animales.

---

## 1. Listado de lotes (`/lots`)

### Layout general

```
┌────────────────────────────────────────────────────────┐
│ Page Header: "Lotes"                [+ Crear lote]     │
├────────────────────────────────────────────────────────┤
│ Toolbar: [Buscar lote...]  [☐ Mostrar disueltos]       │
│                                       "8 lotes activos"│
├────────────────────────────────────────────────────────┤
│  [LotCard]                                             │
│  [LotCard]                                             │
│  [LotCard]                                             │
│  ...                                                   │
└────────────────────────────────────────────────────────┘
```

### Toolbar
- **Búsqueda**: input texto, busca por nombre de lote.
- **Mostrar disueltos**: checkbox. Por defecto desactivado (solo lotes activos).
- **Contador**: texto "X lotes activos" o "X lotes" si el filtro incluye disueltos.

### LotCard

```
┌───────────────────────────────────────────────────────┐
│  Lote Norte                   [activo / disuelto]     │
│  47 animales                                          │
│  Descripción: Animales en potrero norte (si tiene)    │
│  Creado: 12 feb 2025                                  │
│                                      [Ver detalle →]  │
└───────────────────────────────────────────────────────┘
```

- Layout: card de ancho completo (no grilla), lista vertical con separación `space-y-3`.
- Click en la card o en "Ver detalle" → `/lots/[lotId]`.
- Lotes disueltos: card con opacity reducida + badge "Disuelto".

### Estados
- **Cargando**: skeleton de 4 cards verticales.
- **Vacío (sin lotes)**: EmptyState "Todavía no hay lotes" + botón "Crear primer lote".
- **Sin resultados de búsqueda**: EmptyState "Sin lotes con ese nombre" + link "Limpiar búsqueda".

---

## 2. Formulario nuevo lote (`/lots/new`)

### Layout

Formulario en columna central, ancho máximo 480px.

```
┌────────────────────────────────────────────────────────┐
│ Page Header: "Crear lote"      [← Volver]              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Formulario                                            │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Campos

- **Nombre** * (input texto, ej. "Lote Norte")
- **Descripción** (textarea, opcional, ej. "Animales en potrero norte")

### Acciones
- "Crear lote" (primario)
- "Cancelar" → vuelve a `/lots`
- Al guardar: redirige al detalle del lote recién creado.

---

## 3. Detalle de lote (`/lots/[lotId]`)

### Layout general

```
┌────────────────────────────────────────────────────────┐
│ [← Lotes]  Breadcrumb                                  │
├────────────────────────────────────────────────────────┤
│ Page Header                                            │
│ "Lote Norte"  [activo/disuelto]    [Registrar actividad│
│                                    sobre este lote]    │
├────────────────────────────────────────────────────────┤
│ Info del lote: descripción · fecha creación · animales │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Toolbar: [Buscar caravana...]     "47 animales"       │
│                                [+ Agregar animales]    │
│                                                        │
│  [AnimalCard] [AnimalCard] [AnimalCard]                │
│  [AnimalCard] [AnimalCard] [AnimalCard]                │
│  ...                                                   │
│                                                        │
├────────────────────────────────────────────────────────┤
│  Acciones del lote                                     │
└────────────────────────────────────────────────────────┘
```

### Header del lote
- Nombre del lote como título.
- StatusBadge: activo / disuelto.
- Descripción (si tiene) en subtítulo.
- Fecha de creación.
- Total de animales.
- **Botón primario**: "Registrar actividad sobre este lote" → `/activities/new` (con lote preseleccionado).

### Lista de animales del lote

- Grilla compacta de caravanas: muestra solo el TagView de cada animal en tamaño `md` (sin detalle de categoría, raza ni lote).
- Columnas: wrap automático (`flex-wrap`).
- Cada caravana es clickeable → `/animals/[animalId]`.
- Búsqueda por caravana dentro del lote.
- Contador "X animales".
- **Botón "Agregar animales"**: abre panel inline de selección.

### Modal: Agregar animales al lote

- Input de búsqueda por caravana.
- Lista de animales activos sin lote (o en otro lote) que coinciden.
- Checkbox por animal para seleccionar múltiples.
- Info: si el animal ya está en otro lote, se muestra esa info y se puede reasignar.
- Acciones: "Agregar seleccionados (N)" + "Cancelar".

### Acciones del lote (footer)

Para lote **activo**:
- "Editar nombre/descripción" → abre modal inline de edición.
- "Disolver lote" → abre modal de confirmación.

Para lote **disuelto**:
- Todas las acciones de modificación deshabilitadas.
- Solo se puede consultar el historial.
- Lista de animales vacía o con nota "Este lote fue disuelto".

### Modal: Disolver lote

- Advertencia: "Al disolver el lote, los animales quedarán sin lote. Esta acción no se puede deshacer."
- Muestra cantidad de animales afectados.
- Botón "Disolver lote" (danger) + "Cancelar".
