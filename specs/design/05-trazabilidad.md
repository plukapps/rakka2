# Diseño Desktop — Módulo Trazabilidad

**Rutas**: `/traceability` · `/traceability/[animalId]`  
**Propósito**: Consultar la línea de vida completa de un animal, desde su ingreso hasta el egreso.

---

## 1. Búsqueda de trazabilidad (`/traceability`)

### Layout general

```
┌────────────────────────────────────────────────────────┐
│ Page Header: "Trazabilidad"                            │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Búsqueda central                                      │
│  [🔍 Buscar animal por caravana...        ]            │
│                                                        │
│  Resultados (si hay búsqueda activa)                   │
│  ─────────────────────────────────────                 │
│  [AnimalResult]                                        │
│  [AnimalResult]                                        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Búsqueda

- Input de texto grande y prominente, centrado.
- Placeholder: "Buscá por número de caravana".
- Búsqueda en tiempo real (debounce 300ms).
- Busca en animales activos y egresados del establecimiento.

### Resultados

Cada resultado (AnimalResult):

```
┌───────────────────────────────────────────────────────┐
│  [activo / egresado]  858 000 00001 234               │
│  Vaca · Angus         Lote: Lote Norte                │
│                               [Ver trazabilidad →]    │
└───────────────────────────────────────────────────────┘
```

- StatusBadge: activo / egresado.
- Caravana en formato visual.
- Categoría + raza (si tiene).
- Lote actual o "Sin lote" (si activo) / fecha de egreso (si egresado).
- Botón o click en toda la fila → `/traceability/[animalId]`.

### Sin búsqueda activa

- Estado inicial: input vacío + texto descriptivo:  
  "Ingresá la caravana de un animal para ver su historial completo."
- Ilustración o ícono decorativo (opcional).

---

## 2. Timeline del animal (`/traceability/[animalId]`)

### Layout general

```
┌────────────────────────────────────────────────────────┐
│ [← Trazabilidad]  Breadcrumb                           │
├──────────────────────┬─────────────────────────────────┤
│  PANEL IZQUIERDO     │  TIMELINE                       │
│  (~30%)              │  (~70%)                         │
│                      │                                 │
│  Resumen del animal  │  [Filtros de timeline]          │
│                      │                                 │
│  Caravana visual     │  ● [Evento]  fecha              │
│  Estado              │  │                              │
│  Categoría + datos   │  ● [Evento]  fecha              │
│  Lote (si tiene)     │  │                              │
│                      │  ● [Evento]  fecha              │
│                      │  │                              │
│  [Ver perfil →]      │  ● [Evento]  fecha              │
│                      │  ...                            │
└──────────────────────┴─────────────────────────────────┘
```

### Panel izquierdo: Resumen del animal

- **TagView** de la caravana (visual grande).
- Caravana en texto.
- StatusBadge: activo / egresado.
- Categoría, Raza (si tiene).
- Fecha de ingreso + tipo.
- Lote actual (link) o "Sin lote".
- Si egresado: fecha y tipo de egreso.
- Carencia activa (si aplica): badge con días restantes.
- Link "Ver perfil completo" → `/animals/[id]`.

### Timeline

#### Filtros de timeline

```
[Tipo de evento ▾]  [Fecha desde ▾]  [Fecha hasta ▾]   [Limpiar]
```

- **Tipo de evento**: select multi con los 15 tipos de eventos:
  - Ingreso, Asignación a lote, Cambio de lote, Baja de lote
  - Actividad sanitaria, Actividad comercial, Control de campo
  - Movimiento, Reproducción, Actividad general
  - Lectura RFID, Egreso, Corrección
- **Rango de fechas**: opcionalmente filtrar el historial.

#### Estructura de la timeline

Lista vertical con línea conectora entre eventos (estilo cronológico, descendente por defecto — más reciente arriba).

```
Más reciente ↑

  ● Egreso — Venta                        [15 mar 2025]
  │  Comprador: Frigorífico Central
  │
  ● Actividad sanitaria — Vacunación      [10 mar 2025]
  │  Ivermectina 1% · 5ml subcutáneo
  │  Carencia hasta: 7 abr 2025
  │  Responsable: Dr. González
  │
  ● Cambio de lote                        [1 mar 2025]
  │  De "Lote Norte" → "Lote Sur"
  │
  ● Actividad comercial — Venta (draft)   [22 feb 2025]
  │  [Cancelada — no se confirmó]
  │
  ● Asignación a lote                     [15 ene 2025]
  │  Lote Norte
  │
  ● Ingreso                               [15 ene 2025]
     Compra · Peso: 280 kg · La Esperanza

Más antiguo ↓
```

#### TimelineEvent: contenido por tipo

| Tipo | Contenido mostrado |
|---|---|
| `entry` | Tipo de ingreso, peso, procedencia |
| `lot_assignment` | Nombre del lote |
| `lot_change` | Lote origen → Lote destino |
| `lot_removal` | Nombre del lote del que se removió |
| `sanitary_activity` | Subtipo, producto, dosis, vía, carencia (días y fecha vencimiento) |
| `commercial_activity` | Subtipo (venta/despacho), comprador, destino, precio |
| `field_control` | Subtipo, resultado relevante (peso, score, etc.) |
| `movement` | Subtipo, origen → destino |
| `reproduction` | Subtipo + dato clave (resultado preñez, caravana cría, etc.) |
| `general_activity` | Título + descripción |
| `reading` | Método (Bluetooth/Archivo), nombre de archivo si aplica |
| `exit` | Tipo de egreso, fecha |
| `correction` | Texto libre de la corrección + referencia al evento corregido |

#### Diseño de cada evento

- **Punto en la línea**: color según tipo de evento (sanitario = azul, comercial = verde, egreso = rojo, etc.).
- **Fecha**: a la derecha, alineada. Formato: "15 mar 2025". Tooltip con hora si está disponible.
- **Título del evento**: en negrita.
- **Detalles**: texto secundario con los datos relevantes.
- **Responsable**: al pie del evento, en caption.
- Eventos de corrección: diseño diferente (ícono de corrección, fondo sutil diferenciado).

### Estado sin eventos

Si la timeline está vacía (animal recién ingresado sin actividad):
- Solo muestra el evento de ingreso (siempre presente).
- Si hay filtros activos y no hay resultados: "Sin eventos con esos filtros" + link "Limpiar filtros".
