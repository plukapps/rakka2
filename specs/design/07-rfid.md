# Diseño Desktop — Actividad de Lectura RFID

**Rutas**: `/activities/new/reading` (formulario) · `/activities/[activityId]` (detalle, cuando es tipo `reading`)  
**Propósito**: Registrar lecturas de caravanas electrónicas como actividad, ya sea via Bluetooth o por carga de archivo.

> **Nota**: La lectura RFID es un tipo de actividad (`type: "reading"`). Se accede desde el hub de actividades como cualquier otro tipo. El historial de lecturas se ve en el listado general de actividades filtrando por tipo "Lectura".

---

## 1. Formulario: Nueva lectura (`/activities/new/reading`)

### Layout

```
┌──────────────────────────────────────────────────────────┐
│ Page Header: "Lectura RFID"                 [← Tipo]     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Método: ● Bluetooth  ○ Archivo                          │
│                                                          │
│  [Panel de lectura según método]                         │
│                                                          │
│  Responsable: [____________]                             │
│  Notas: [____________]                                   │
│                                                          │
│  [Registrar lectura (N)]                                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

A diferencia de otros tipos de actividad, el formulario de lectura NO tiene el layout de dos columnas (selector de animales + datos). La lectura en sí misma ES la selección de animales.

### Método Bluetooth

```
┌────────────────────────────────────────────────────────┐
│  Método: ● Bluetooth  ○ Archivo                        │
│                                                        │
│  Estado Bluetooth: [Desconectado / Conectado / Leyendo]│
│                                                        │
│  [  Iniciar lectura  ]                                 │
│                                                        │
│  Caravanas leídas: (lista en tiempo real)              │
│  ● 858000000011234 — Vaca (Lote Norte)                 │
│  ● 858000000022345 — Toro (Sin lote)                   │
│  ● 858000099999999 — ⚠ No encontrada                  │
│                                                        │
│  Responsable: [____________]                           │
│  Notas: [____________]                                 │
│                                                        │
│  [Registrar lectura (3)]                               │
└────────────────────────────────────────────────────────┘
```

- **Estado Bluetooth**: indicador de conexión (gris = desconectado, verde = conectado, azul parpadeante = leyendo).
- **Botón "Iniciar lectura"**: activa el escaneo. Cambia a "Detener lectura" mientras está activo.
- **Lista en tiempo real**: se actualiza a medida que llegan caravanas. Duplicados se ignoran.
- **Caravanas no encontradas**: badge warning "No encontrada en el establecimiento".
- **Botón "Registrar lectura (N)"**: muestra la cantidad de caravanas capturadas.

### Método Archivo

```
┌────────────────────────────────────────────────────────┐
│  Método: ○ Bluetooth  ● Archivo                        │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Arrastrá un archivo .txt o .csv aquí           │  │
│  │   o [Seleccionar archivo]                        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Archivo cargado: "terneros sopas.txt" (48 caravanas)  │
│                                                        │
│  ✔ Reconocidas (45):                                   │
│    858000000011234 — Vaca (Lote Norte)                 │
│    ...                                                 │
│                                                        │
│  ⚠ No encontradas (3):                                │
│    858000054596559                                     │
│    ...                                                 │
│                                                        │
│  Responsable: [____________]                           │
│  Notas: [____________]                                 │
│                                                        │
│  [Registrar lectura (48)]                              │
└────────────────────────────────────────────────────────┘
```

- **Drag & drop**: área destacada. Acepta `.txt` y `.csv`.
- **Preview post-carga**: lista separada en "Reconocidas" y "No encontradas".
- Las no encontradas se almacenan como `unknownCaravanas` en la actividad.

---

## 2. Detalle de lectura (`/activities/[activityId]` donde `type: "reading"`)

El detalle de una actividad tipo `reading` tiene un layout especializado que prioriza la grilla de caravanas.

### Layout general

```
┌────────────────────────────────────────────────────────┐
│ [← Actividades]  [Badge Lectura]  "Lectura — 28 mar"   │
├────────────────────────────────────────────────────────┤
│ Metadatos: Método · Responsable · Notas · Archivo       │
├────────────────────────────────────────────────────────┤
│ Tabs: [Todas (48)] [En stock (45)] [Sin registro (3)]   │
├───────────────────────┬────────────────────────────────┤
│  858000000011234      │  858000000033456               │
│  Vaca · Lote Norte    │  Ternera · Sin lote            │
│                       │                                │
│  858000000022345      │  858000054596559               │
│  Toro · Sin lote      │  ⚠ Sin registro               │
│  ...                  │                                │
└───────────────────────┴────────────────────────────────┘
```

### Metadatos
- Método: Bluetooth / Archivo (con nombre del archivo si aplica).
- Fecha y hora exacta.
- Responsable.
- Notas (si tiene).

### Grilla de caravanas
- Tabs: **Todas** / **En stock** / **Sin registro**, cada uno con contador.
- Cada caravana se muestra como `TagView` tamaño `md`.
- Caravanas en stock: clickeables → `/animals/[id]`.
- Caravanas sin registro: indicador visual diferenciado (amber). No clickeables.

---

## 3. Lectura en el listado de actividades (`/activities`)

Las actividades tipo `reading` aparecen en el listado general de actividades como cualquier otro tipo.

### ActivityRow para tipo `reading`

```
┌────────────────────────────────────────────────────────┐
│ [Lectura]  48 caravanas · Bluetooth                     │
│            Responsable: Juan Pérez · hace 3 días       │
└────────────────────────────────────────────────────────┘
```

- **Badge**: "Lectura" con color teal/cyan (diferenciado de los demás tipos).
- **Descripción corta**: "N caravanas · [Bluetooth/Archivo]". Si es archivo, opcionalmente incluye el nombre del archivo.
- **Metadatos**: responsable, fecha relativa.

### Filtro por tipo

El filtro de tipo en la toolbar de actividades incluye "Lectura" como opción, permitiendo ver solo las lecturas RFID.
