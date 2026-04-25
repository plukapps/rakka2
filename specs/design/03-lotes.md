# Diseño Desktop — Módulo Lotes

**Rutas**: `/lots` · `/lots/new` · `/lots/[lotId]` · `/lots/move`  
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

## 2. Wizard de creación de lote (modal desde `/lots`)

Modal siempre `h-[85vh]` fijo, `max-w-4xl`. No cambia de tamaño entre pasos.

### Header del modal

```
┌─────────────────────────────────────────────────────────────┐
│  Nuevo lote              [1]─[2]─[3]─[4]              [×]  │
│  Título del paso actual                                     │
└─────────────────────────────────────────────────────────────┘
```

- StepIndicator de 4 pasos: Información · Método · Animales · Revisar.
- Pasos completados: círculo relleno tenue. Paso actual: círculo negro. Pasos futuros: borde.

### Footer del modal

```
┌─────────────────────────────────────────────────────────────┐
│  Texto de contexto                 [← Atrás]  [Continuar →] │
└─────────────────────────────────────────────────────────────┘
```

- Texto izquierda: "Los datos se pueden modificar luego." (pasos 1–3) / "¿Todo bien? Una vez creado, podés agregar o quitar animales en cualquier momento." (paso 4).
- Botón derecho paso 1: submits form `lot-wizard-info`.
- Botón derecho paso 4: "✓ Crear lote".
- Botón izquierdo en paso 1: "Cancelar". En el resto: "← Atrás".

---

### Paso 1 — Información

Contenido centrado horizontalmente. Formulario `max-w-lg`.

- **Nombre** * (input)
- **Descripción** (input, opcional)
- **Notas** (textarea 3 filas, opcional)

---

### Paso 2 — Método

Contenido centrado horizontalmente. Lista de opciones `max-w-lg`.

5 opciones como radio buttons en cards:
- Selección manual
- Lectura RFID en vivo *(implementado)*
- Importar archivo de lectura
- Por filtro automático
- Mover desde otro lote *(implementado)*

Card seleccionada: `border-foreground`. Card no seleccionada: `border-border hover:border-foreground/40`.

---

### Paso 3 — Animales (depende del método)

**Lectura RFID / Mover desde lote:**
- Select de lectura o lote origen en el tope (`max-w-lg`).
- Contador "X de Y seleccionados" + botones "Seleccionar todos" · "Descartar todos".
- Input de búsqueda `max-w-xs`.
- Grilla `flex-wrap gap-3` de TagView `md`. Tags activos: `opacity-100`. Tags descartados: `opacity-35` + label "Descartado".
- Tags desconocidos (caravanas nuevas): label "Nuevo" azul cuando activos.
- Tags de lote existente con indicador del lote origen (amber) cuando activos.

**Métodos no implementados:**
- Pantalla centrada con ícono 🚧 + nombre del método + mensaje "Disponible próximamente. El lote se creará sin animales."

---

### Paso 4 — Revisar

Contenido centrado horizontalmente. Ancho máximo `max-w-2xl`.

```
┌──────────────────────────────────────────────────────┐
│  NUEVO LOTE                                          │
│  Nombre del lote (text-3xl bold)                     │
│  [descripción]  [notas]  ← pills/badges              │
└──────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  ANIMALES    │  │  ORIGEN      │  │  LOTE ORIGEN │ ← solo si aplica
│  6           │  │  Lectura ... │  │  Nombre lote │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────────────────────────────────────────────┐
│ ✓  Al crear el lote, los N animales se asignarán...  │
│    ...mensaje descriptivo según los grupos           │
└──────────────────────────────────────────────────────┘
```

- Tarjeta principal: nombre en `text-3xl bold`, descripción y notas como pills con borde.
- Stats en 2 o 3 columnas según si hay nombre de origen.
- Mensaje descriptivo menciona cantidad, movimientos y/o ingresos al stock según corresponda.

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
- **Estructura del header**: ambas cards usan la misma estructura de header: `[Título / badge]` a la izquierda · `[botón de acción] [⋮]` a la derecha.
  - Card info general: botón "Registrar actividad" + menú ⋮ (solo lote activo).
  - Card animales: botón "Mover animales" (solo lote activo). Sin ⋮.

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
- Búsqueda por caravana dentro del lote. Input con ancho máximo `max-w-xs` (no ocupa todo el ancho en pantallas anchas).
- Contador "X animales".
- **Botón "Agregar animales"**: abre panel inline de selección.

### Botón: Mover animales

- Botón "Mover animales" en el header de la sección de animales (solo lote activo).
- Navega a `/lots/move?to=[lotId]`, con el lote actual pre-seleccionado como destino.

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

---

## 4. Pantalla mover animales (`/lots/move`)

Pantalla dedicada para mover animales entre lotes o asignar animales sin lote a un lote. Accesible desde el detalle de lote (con destino pre-seleccionado) o desde el listado de lotes.

### Layout

```
┌────────────────────────────────────────────────────────┐
│ [← Lotes]   Mover animales                             │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Origen                        Destino                 │
│  [Sin lote ▼                 ] [Seleccionar lote... ▼] │
│                                                        │
├────────────────────────────────────────────────────────┤
│  47 animales disponibles    [Buscar por caravana...]   │
│  [Seleccionar todos]  [Deseleccionar todos]            │
│                                                        │
│  [TAG] [TAG] [TAG] [TAG] [TAG] [TAG]                   │
│  [TAG] [TAG] [TAG] ...                                 │
│                                                        │
├────────────────────────────────────────────────────────┤
│  12 animales seleccionados                             │
│  [Mover 12 animales]                                   │
└────────────────────────────────────────────────────────┘
```

### Selectores origen / destino

- **Origen**: select con opción "Sin lote" (primera opción, siempre visible) + todos los lotes activos. Muestra nombre + conteo de animales. Default: "Sin lote".
- **Destino**: select con todos los lotes activos. Excluye el lote seleccionado como origen (si es un lote). Placeholder "Seleccionar lote destino...".
- Si la página recibe `?to=lotId`: pre-selecciona ese lote como destino al cargar.
- Si la página recibe `?from=lotId`: pre-selecciona ese lote como origen al cargar.

### Grilla de animales (origen)

- Se muestra solo cuando hay origen seleccionado (siempre, ya que "Sin lote" es el default).
- Requiere además destino seleccionado para habilitar la selección de animales.
- Input de búsqueda por caravana. Ancho máximo `max-w-xs` (no ocupa todo el ancho en pantallas anchas).
- Botones "Seleccionar todos" / "Deseleccionar todos" (visibles si hay animales en la grilla).
- Grilla `flex-wrap gap-2` de TagView `md`. Tags seleccionados: `ring-2 ring-primary ring-offset-2`. Tags sin selección: `opacity-60 hover:opacity-100`.
- Si el origen no tiene animales: EmptyState "Sin animales en este origen".
- Contador "X animales disponibles" sobre la grilla.

### Acción de mover

- Botón "Mover X animales" visible cuando hay ≥1 animal seleccionado y destino seleccionado.
- Al hacer click: abre un `ConfirmModal` (ver `00-sistema-desktop.md`) con:
  - Título: "Mover animales"
  - Descripción: "¿Mover X animales desde [Origen] a [Destino]?"
  - Botón principal: "Mover" (variante `default`)
- Al confirmar: se ejecutan los movimientos, se crean eventos `lot_change` por animal (excepto si el origen es "Sin lote", donde no hay lote anterior).
- Tras confirmar exitosamente: se limpia la selección, se mantiene la configuración origen/destino para permitir más movimientos. Muestra mensaje de éxito bajo los selectores.

### Estados vacíos

- **Sin destino seleccionado**: grilla deshabilitada con mensaje "Seleccioná un destino para poder mover animales."
- **Origen sin animales**: EmptyState "No hay animales en este origen."
- **Sin lotes activos**: EmptyState "No hay lotes activos. Creá un lote primero." con link a `/lots/new`.
