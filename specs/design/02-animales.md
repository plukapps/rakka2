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
│  [Card] [Card] [Card]                                  │
│  [Card] [Card] [Card]                                  │
│  [Card] [Card] [Card]   (grilla 3 col, virtualizada)  │
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
- **Contador**: texto "X animales" a la derecha de los filtros, actualiza en tiempo real.
- **Limpiar filtros**: link/botón que aparece cuando hay al menos un filtro activo.

### AnimalCard

```
┌──────────────────────────────┐
│  [StatusBadge activo/egresado]
│                              │
│  858 · 000 · 00001 · 234     │  ← caravana formato visual
│  Vaca · Angus                │  ← categoría · raza
│                              │
│  Lote: Lote Norte            │  ← o "Sin lote" en gris
│                              │
│  [CarenciaIndicator]         │  ← solo si carencia activa
└──────────────────────────────┘
```

- Click en la card → navega a `/animals/[id]`.
- **CarenciaIndicator**: badge rojo "Carencia activa — vence en X días" o amber "Vence en X días" (si es próxima).
- Hover: sombra elevada + cursor pointer.

### Estados
- **Cargando**: skeleton de 9 cards en grilla 3x3.
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
- StatusBadge: activo / egresado.

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
- Fecha y tipo de egreso.
- Nota: el animal está en modo solo lectura.

### Panel derecho: Historial de actividades

- Lista de las **últimas 10 actividades** del animal, ordenadas por fecha desc.
- Por cada actividad: tipo (badge), descripción, fecha, responsable.
- Link al final: "Ver trazabilidad completa" → `/traceability/[id]`.
- Si no hay actividades: "Sin actividades registradas".

### Acciones (footer del panel izq o barra superior)

Para animal **activo**:
- "Registrar actividad" → `/activities/new` (con el animal preseleccionado).
- "Ver trazabilidad" → `/traceability/[id]`.
- "Registrar egreso" → abre modal de egreso.

Para animal **egresado**:
- Solo "Ver trazabilidad" disponible.
- Las demás acciones están deshabilitadas con tooltip explicativo.

### Modal: Registrar egreso

- Trigger: botón "Registrar egreso" en el detalle.
- Campos:
  - Tipo de egreso * (select: Venta / Despacho / Muerte / Transferencia)
  - Fecha de egreso * (date picker, default hoy)
  - Observaciones (textarea, opcional)
  - Si hay carencia activa: advertencia destacada antes de confirmar.
- Acciones: "Confirmar egreso" (danger) + "Cancelar".
- Al confirmar: el animal pasa a estado `egresado`, se deshabilitan acciones.
