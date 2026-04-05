# Diseño Desktop — Módulo Animales

**Rutas**: `/animals` · `/animals/new` · `/animals/[id]`  
**Propósito**: Gestionar el stock de animales del establecimiento activo.

---

## 1. Listado de animales (`/animals`)

### Layout general

```
┌────────────────────────────────────────────────────────┐
│ Page Header: "Animales"  [+ Ingresar animal]           │
├────────────────────────────────────────────────────────┤
│ Toolbar de filtros                                     │
│ [Buscar caravana...] [Lote ▾] [Categoría ▾]           │
│ [Estado ▾] [Con carencia ☐]      "142 animales"        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [Card] [Card] [Card] [Card]                           │
│  [Card] [Card] [Card] [Card]                           │
│  [Card] [Card] [Card] [Card]  (grilla 4 col, virtual) │
│  ...                                                   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Toolbar de filtros

- **Búsqueda**: input de texto, busca por caravana (cualquier parte del número).
- **Lote**: select con los lotes activos del establecimiento + opción "Sin lote".
- **Categoría**: select con las categorías (vaca, toro, ternero/a, vaquillona, novillo, otro).
- **Estado**: select (Todos / Activos / Egresados).
- **Con carencia activa**: checkbox.
- **Contador**: texto "X / Y" (filtrados / total) junto al título, actualiza en tiempo real.
- **Limpiar filtros**: botón `secondary` (con fondo) que aparece cuando hay al menos un filtro activo.

### AnimalCard

```
┌──────────────────────────────┐
│  [TagView]  [Activo] [Carencia]  ← badges en fila
│             Vaca · Angus         ← categoría · raza
│             Lote Norte           ← lote (tono más suave), omitido si sin lote
└──────────────────────────────┘
```

- Click en la card → navega a `/animals/[id]`.
- **StatusBadge** lógica tres casos: `status=active` → "Activo" (success); `exited+death` → "Inactivo" (neutral); `exited+otros` → "Egresado" (neutral).
- **StatusBadge** y **CarenciaIndicator**: `border-radius: 4px` (rectangular, no pill).
- El lote aparece en línea propia debajo de categoría · raza, en color `muted-foreground/70`.
- Si no tiene lote, la línea de lote no se renderiza.
- Hover: sombra elevada + cursor pointer.

### Estados
- **Cargando**: skeleton de 12 cards en grilla 4x3.
- **Vacío (sin animales)**: EmptyState "Todavía no hay animales registrados" + botón "Ingresar primer animal".
- **Sin resultados de filtros**: EmptyState "No hay animales con esos filtros" + botón "Limpiar filtros".

---

## 2. Ingreso de animales (`/animals/new`)

### Selector de método

Al entrar a `/animals/new`, el usuario primero elige cómo ingresar:

```
┌────────────────────────────────────────────────────────┐
│ Page Header: "Ingresar animales"   [← Volver]          │
├────────────────────────────────────────────────────────┤
│                                                        │
│   ┌──────────────────────┐  ┌──────────────────────┐   │
│   │                      │  │                      │   │
│   │   Individual         │  │   Desde lectura RFID │   │
│   │   Un animal a la vez │  │   Importar caravanas │   │
│   │                      │  │   de una lectura     │   │
│   └──────────────────────┘  └──────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

- Dos cards con ícono + título + descripción corta.
- Click en una card muestra el formulario correspondiente debajo (o navega a subvista).

---

### 2a. Formulario individual

**Sección: Identificación**
- Caravana * (input texto, 15 dígitos, validación en tiempo real)
  - Formato esperado: `CCCFFFSSSSSNNNN`
  - Error inline si el formato no cumple o ya existe.
- Vista previa de caravana (TagView) que se actualiza al tipear.

**Sección: Datos del animal**
- Categoría (select: vaca / toro / ternero / ternera / vaquillona / novillo / otro)
- Sexo (radio: Macho / Hembra)
- Raza (input texto, opcional)
- Fecha de nacimiento (date picker, opcional)

**Sección: Ingreso**
- Tipo de ingreso * (radio: Compra / Nacimiento / Transferencia)
- Fecha de ingreso * (date picker, default hoy)
- Peso de ingreso en kg (input número, opcional)
- Procedencia / Origen (input texto, opcional)

**Sección: Lote (opcional)**
- Asignar a lote (select con lotes activos + "Sin lote")

**Acciones**
- Botón primario: "Ingresar animal"
- Botón secundario: "Cancelar" (vuelve a `/animals`)
- Al guardar exitoso: redirige al detalle del animal recién creado.

**Validaciones visibles**
- Caravana duplicada: error "Ya existe un animal con esta caravana".
- Campos obligatorios: marcados con * y mensaje de error al intentar guardar.

---

### 2b. Flujo desde lectura RFID

#### Paso 1: Seleccionar lectura

```
┌────────────────────────────────────────────────────────┐
│  Seleccioná una lectura RFID                           │
│                                                        │
│  [ReadingRow]  "terneros sopas.txt" · 3 sin registrar  │
│  [ReadingRow]  Bluetooth · 12 sin registrar            │
│  [ReadingRow]  "campo norte.txt" · 0 sin registrar     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

- Lista de lecturas RFID del establecimiento activo, ordenadas por fecha desc.
- Por cada lectura: método (badge), nombre de archivo (si aplica), fecha, y **cantidad de caravanas no registradas** en el sistema.
- Lecturas con 0 caravanas sin registrar aparecen al final con estado deshabilitado y tooltip: "Todos los animales de esta lectura ya están registrados."
- Click en una lectura → avanza al paso 2.

#### Paso 2: Revisar y completar datos

```
┌────────────────────────────────────────────────────────┐
│ [← Cambiar lectura]  "terneros sopas.txt" — 3 animales │
├──────────────────────────────────────────────────────  │
│  Datos comunes (se aplican a todos)                    │
│  Tipo de ingreso * [Compra ▾]  Fecha * [05/04/2025]   │
│  Procedencia [________________]  Categoría [Ternero ▾] │
│  Raza [________________]                               │
├────────────────────────────────────────────────────────┤
│  Animales a ingresar (3)                               │
│                                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☑  858 000 054 596 559              [Expandir ▾]│   │
│  │    Usando datos comunes                         │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☑  858 000 054 365 782  ⚠ Ya existe  [—]       │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☑  858 000 054 201 093              [Expandir ▾]│   │
│  │    Usando datos comunes                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  Lote (opcional): [Sin lote ▾]                         │
│                                                        │
│  [  Ingresar 2 animales  ]   [Cancelar]                │
└────────────────────────────────────────────────────────┘
```

**Sección: Datos comunes**
- Tipo de ingreso * (select: Compra / Transferencia — Nacimiento no aplica para ingreso masivo)
- Fecha de ingreso * (date picker, default hoy)
- Procedencia (input texto, opcional)
- Categoría (select, opcional — se puede dejar sin categoría)
- Raza (input texto, opcional)

**Lista de animales**
- Checkbox por animal para excluir de la operación.
- Cada fila muestra la caravana.
- Estado "Ya existe": badge de error, checkbox deshabilitado y excluido automáticamente.
- Expandir fila: permite sobrescribir atributos individuales (categoría, raza, procedencia) para ese animal.

**Sección: Lote (opcional)**
- Select con lotes activos + "Sin lote" + "Crear lote nuevo" (abre input de nombre inline).

**Botón de confirmación**
- Texto dinámico: "Ingresar N animales" donde N es la cantidad seleccionada (sin los excluidos ni los que ya existen).
- Deshabilitado si N = 0.

**Al confirmar**
- Crea todos los animales seleccionados en estado `activo`.
- Si se eligió lote: los asigna al lote.
- Redirige a `/animals` con un banner de éxito: "X animales ingresados correctamente."

---

## 3. Detalle de animal (`/animals/[id]`)

### Layout general

```
┌────────────────────────────────────────────────────────┐
│ [← Animales]   Breadcrumb                              │
├─────────────────────────┬──────────────────────────────┤
│  PANEL IZQUIERDO (~40%) │  PANEL DERECHO (~60%)        │
│                         │                              │
│  Identificación         │  Historial de actividades    │
│  Datos del animal       │  (últimas 10 con link a más) │
│  Estado                 │                              │
│  Lote actual            │                              │
│  Carencia               │                              │
│                         │                              │
├─────────────────────────┴──────────────────────────────┤
│  Acciones                                              │
└────────────────────────────────────────────────────────┘
```

### Panel izquierdo

**Identificación**
- TagView grande de la caravana (visual estilo etiqueta).
- Caravana en texto: formato `858 · 000 · 00001 · 234`.
- StatusBadge con tres casos:
  - `status === "active"` → variant "success", texto "Activo".
  - `status === "exited" && exitType === "death"` → variant "neutral", texto "Inactivo".
  - `status === "exited" && exitType !== "death"` → variant "neutral", texto "Egresado".
- Botón "⋮" (MoreVertical icon) en la esquina superior derecha del card (`absolute top-3 right-3`), solo visible para animales activos.

**Datos del animal**
- Categoría, Sexo, Raza (si tiene), Fecha de nacimiento (si tiene).
- Fecha de ingreso + tipo (Compra / Nacimiento / Transferencia).
- Peso de ingreso (si tiene).
- Procedencia (si tiene).

**Lote actual**
- Nombre del lote como link → `/lots/[lotId]`.
- Si no tiene lote: "Sin lote" en gris.

**Carencia**
- Si no hay carencia activa: "Sin carencia activa" en verde.
- Si hay carencia próxima (≤7 días): badge amber + "Vence el [fecha] — en X días".
- Si hay carencia activa: badge rojo + "Carencia activa — vence el [fecha]". Advertencia: "Este animal no puede ser incluido en una venta".

**Egreso (si aplica)**
- Si `exitType === "death"`: muestra "Fecha de baja" (exitDate) y "Causa" (exitNotes o "—").
- Otros tipos: muestra "Fecha de egreso" y "Tipo de egreso" (Venta / Despacho / Transferencia).
- El animal está en modo solo lectura.

**Historial de peso**
- Card "Historial de peso" entre los datos del animal y la carencia.
- **Stats row** (3 columnas): Último peso (`lastWeight` + fecha) | GDP Reciente (`gdpRecent` kg/día) | GDP Acumulada (`gdpAccumulated` kg/día).
- **Gráfico de evolución**: línea de peso vs tiempo (recharts LineChart, 200px alto). Incluye peso de ingreso como primer punto. Tooltip con fecha y peso.
- **Lista de pesajes** (colapsable): fecha, peso, GDP respecto al pesaje anterior. Clickeable → detalle de la actividad.
- **Sin datos**: si el animal no tiene pesajes individuales, mostrar mensaje "Sin pesajes individuales registrados. La GDP se calcula cuando hay pesos por animal."

### Panel derecho: Historial de actividades

- Lista de las **últimas 10 actividades** del animal, ordenadas por fecha desc.
- Por cada actividad: tipo (badge), descripción, fecha, responsable.
- Link al final: "Ver trazabilidad completa" → `/traceability/[id]`.
- Si no hay actividades: "Sin actividades registradas".

### Acciones — menú "..."

Botón "..." (MoreHorizontal) en la fila de badges del encabezado, alineado a la derecha. Solo se renderiza para animales activos.

**Menú items (animal activo):**
- "Dar de baja" → abre modal de baja por fallecimiento.

Para animal **egresado**: el botón "..." no se renderiza.

### Modal: Dar de baja

Trigger: ítem "Dar de baja" del menú "...".

```
┌─ Dar de baja ─────────────────────────┐
│                                        │
│  Fecha de fallecimiento *              │
│  [date picker — default hoy, max hoy] │
│                                        │
│  Causa del fallecimiento               │
│  [textarea, "Causa opcional..."]       │
│                                        │
│  ⚠ Esta acción no se puede deshacer.  │
│                                        │
│  [Cancelar]       [Confirmar baja]     │
└────────────────────────────────────────┘
```

- "Confirmar baja": variant destructive, loading state durante procesamiento.
- "Cancelar": cierra sin cambios.
- Al confirmar: animal pasa a `egresado` con `exitType: "death"`, badge cambia a "Inactivo", menú "..." desaparece.
