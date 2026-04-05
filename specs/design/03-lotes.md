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

### Sección: Animales sin lote

- Input de búsqueda por caravana.
- Grilla de TagView `md` (flex-wrap, gap-2). Cada tag es un botón clickeable.
- Tags seleccionados: `ring-2 ring-primary ring-offset-2`. Tags no seleccionados: `opacity-60 hover:opacity-100`.
- Contador "X seleccionados" cuando hay selección activa.

### Sección: Desde otro lote

- Select de lotes activos (`Seleccionar lote...`). Muestra nombre + cantidad de animales.
- Al seleccionar un lote: aparece la grilla de TagView `md` con los animales de ese lote.
- Click en tag alterna la selección (misma lógica visual que sección anterior).
- El usuario puede cambiar el lote en el select para seleccionar de múltiples lotes (los previamente seleccionados se mantienen).

### Acciones
- Contador total "X animales seleccionados" (suma de ambas secciones).
- "Crear lote" (primario) + "Cancelar" → vuelve a `/lots`.
- Al guardar: redirige al detalle del lote recién creado.
- Para animales movidos desde otro lote: se crea evento `lot_change` por animal al confirmar.

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

### Estadísticas de peso

Card "Estadísticas de peso" entre el header del lote y la lista de animales. Solo se muestra si al menos un animal del lote tiene `lastWeight`.

**Stats grid** (2x3):
| Peso promedio | Rango de peso | Animales con peso |
| GDP Reciente promedio | GDP Acumulada promedio | Último pesaje (fecha) |

**Gráfico de evolución**: peso promedio del lote a lo largo del tiempo (recharts LineChart, 250px alto). Cada punto es el peso promedio de los animales pesados en una actividad de pesaje que incluyó animales del lote.

**Calculadora de proyección**:
- Input: "Peso objetivo (kg)" — campo numérico libre.
- Output dinámico: "Estimado: X días (DD/MM/YYYY)" usando la GDP reciente promedio del lote.
- Si GDP ≤ 0 o peso actual ≥ objetivo: "No se puede proyectar con la GDP actual."
- Nota: "La proyección usa la GDP reciente promedio del lote."
- El peso objetivo NO se persiste — es un input temporal.

### Lista de animales del lote

- Grilla compacta de caravanas: muestra solo el TagView de cada animal en tamaño `md` (sin detalle de categoría, raza ni lote).
- Columnas: wrap automático (`flex-wrap`).
- Cada caravana es clickeable → `/animals/[animalId]`.
- Búsqueda por caravana dentro del lote.
- Contador "X animales".
- **Botón "Agregar animales"**: abre panel inline de selección.

### Sección inline: Agregar animales sin lote

- Trigger: botón "+ Agregar animales" en el header de la lista de animales del lote.
- Input de búsqueda por caravana.
- Grilla de TagView `md` (flex-wrap, gap-2) con animales activos sin lote.
- Click en tag → agrega inmediatamente al lote (sin confirmación). El tag desaparece de la grilla.

### Sección inline: Desde otro lote

- Trigger: botón "Mover desde otro lote".
- Select de lotes activos (excluye el lote actual).
- Al seleccionar lote origen: grilla de TagView `md` con los animales de ese lote.
- Click en tag alterna selección (ring-2 ring-primary cuando seleccionado).
- Botón "Mover X animales" visible cuando hay selección. Al hacer click:
  - Confirmación inline: "¿Mover X animales desde [Lote Y] a este lote?"
  - Botones: "Confirmar" (default) + "Cancelar".
  - Al confirmar: animales se mueven y se crean eventos `lot_change` por animal.

### Sección virtual: Sin lote (card especial en `/lots`)

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
  Sin lote asignado          [sin lote — N animales]
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```
- Card con borde punteado (`border-dashed`) para indicar que es virtual.
- Siempre visible en el listado (no responde al filtro de búsqueda ni al toggle de disueltos).
- Navega a `/lots/sin-lote`.

### Página: Sin lote (`/lots/sin-lote`)

- Header: "Sin lote asignado" + badge con conteo.
- Card de estadísticas de peso (mismo `LotWeightStatsCard`), si hay pesos registrados.
- Grilla de TagView `md` de todos los animales activos sin lote. Cada tag linkea al detalle del animal.

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
