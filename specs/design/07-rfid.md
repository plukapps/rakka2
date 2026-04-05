# Diseño Desktop — Módulo Lecturas RFID

**Rutas**: `/rfid` · `/rfid/[readingId]`  
**Propósito**: Registrar y consultar lecturas de caravanas electrónicas, ya sea via Bluetooth o por carga de archivo.

---

## 1. Listado y carga de lecturas (`/rfid`)

### Layout general

```
┌────────────────────────────────────────────────────────┐
│ Page Header: "Lecturas RFID"                           │
├────────────────────────────────────────────────────────┤
│ ┌──── Nueva lectura (colapsable) ────────────────────┐ │
│ │  [Método ▾]  [Campos del formulario]  [Registrar] │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ Historial de lecturas                                  │
│                                "N lecturas registradas"│
│ [ReadingRow]                                           │
│ [ReadingRow]                                           │
│ [ReadingRow]                                           │
│ ...                                                    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Panel: Nueva lectura

Panel colapsable en la parte superior. Expandido por defecto.

### Método de lectura (radio/tabs)
- **Bluetooth**: lectura en tiempo real desde dispositivo.
- **Archivo**: carga de archivo `.txt` / `.csv`.

### Formulario — método Bluetooth

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

### Formulario — método Archivo

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
- Las no encontradas se guardan en el registro pero no se asocian a animales del sistema.

---

## 3. Historial de lecturas

### ReadingRow

```
┌────────────────────────────────────────────────────────┐
│  [Bluetooth / Archivo]  48 caravanas                   │
│  Responsable: Juan Pérez · hace 3 días                 │
│  "terneros sopas.txt"  (si es por archivo)             │
│                                   [Ver detalle →]      │
└────────────────────────────────────────────────────────┘
```

- Badge de método: "Bluetooth" (azul) / "Archivo" (amber).
- Cantidad de caravanas (total, no solo las reconocidas).
- Responsable y fecha relativa.
- Nombre del archivo (si es por archivo).
- Click → `/rfid/[readingId]`.

### Estados
- **Vacío**: EmptyState "No hay lecturas registradas."
- **Cargando**: skeleton de filas.

---

## 4. Detalle de lectura (`/rfid/[readingId]`)

### Layout general

```
┌────────────────────────────────────────────────────────┐
│ [← Lecturas RFID]  Breadcrumb                          │
├────────────────────────────────────────────────────────┤
│ Page Header: "Lectura — 28 mar 2025"                   │
├────────────────────────────────────────────────────────┤
│ Metadatos: Método · Responsable · Notas · Actividad    │
├───────────────────────┬────────────────────────────────┤
│  RECONOCIDAS (45)     │  NO ENCONTRADAS (3)            │
│                       │                                │
│  858000000011234      │  858000054596559               │
│  Vaca · Lote Norte    │  858000054365782               │
│                       │  858000054201093               │
│  858000000022345      │                                │
│  Toro · Sin lote      │                                │
│  ...                  │                                │
└───────────────────────┴────────────────────────────────┘
```

### Metadatos
- Método: Bluetooth / Archivo (con nombre del archivo si aplica).
- Fecha y hora exacta.
- Responsable.
- Notas (si tiene).
- Actividad asociada (si la lectura derivó en una actividad): link a la actividad.

### Panel izquierdo: Caravanas reconocidas
- Lista de animales del sistema identificados.
- Por cada animal: caravana, categoría, lote actual.
- Click en animal → `/animals/[id]`.

### Panel derecho: No encontradas
- Lista de caravanas que no se encontraron en el establecimiento.
- Texto sin link, solo el número de caravana.
- Botón opcional: "Registrar animal con esta caravana" → `/animals/new` con la caravana pre-completada.
