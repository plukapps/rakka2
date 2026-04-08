# Diseño Desktop — Módulo Actividades

**Rutas**: `/activities` · `/activities/[activityId]` · `/activities/new` · `/activities/new/[tipo]`  
**Propósito**: Registrar y consultar todas las actividades sobre animales.

---

## 1. Listado de actividades (`/activities`)

### Layout general

```
┌────────────────────────────────────────────────────────┐
│ Page Header: "Actividades"   [+ Registrar actividad]   │
├────────────────────────────────────────────────────────┤
│ Toolbar: [Tipo ▾] [Fecha desde] [Fecha hasta]          │
│                                    "38 actividades"    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [ActivityRow]                                         │
│  [ActivityRow]                                         │
│  [ActivityRow]                                         │
│  ...                                                   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Toolbar
- **Tipo**: select multi (Lectura, Sanitaria, Comercial, Campo, Movimiento, Reproducción, General).
- **Fecha desde / hasta**: date pickers para filtrar por rango.
- **Contador**: "X actividades" (las que cumplen los filtros).

### ActivityRow

```
┌────────────────────────────────────────────────────────┐
│ [Badge Tipo]  Descripción corta                        │
│               X animales · Responsable · hace 2 días  │
└────────────────────────────────────────────────────────┘
```

- Layout: lista vertical, filas separadas por divider o con gap.
- **Badge de tipo**: color-coded.
  - Lectura: teal
  - Sanitaria: azul
  - Comercial: verde
  - Campo: amber
  - Movimiento: violeta
  - Reproducción: rosa
  - General: gris
- **Descripción corta**: generada según el tipo de actividad:
  - Lectura: "Lectura N caravanas · archivo.csv" (archivo) / "Lectura N caravanas" (bluetooth).
  - Sanitaria: "Vacunación Ivermectina 1%" / "Tratamiento Oxitetraciclina".
  - Comercial: "Venta Frigorífico Norte" / "Despacho Juan Pérez".
  - Control de campo: "Pesaje · 380 kg", "Conteo · 145", "Condición corporal · 6", "Revisión de preñez · Positivo".
  - Movimiento: "Potrero 3 → Potrero 7".
  - Reproducción: subtipo traducido ("Servicio", "Parto", "Destete", "Diagnóstico de preñez").
  - General: título libre ingresado por el usuario.
- **Metadatos**: cantidad de animales, nombre del responsable, fecha relativa.
- Click en la fila → (si existe) detalle de actividad; si no, sin acción (MVP).

### Estados
- **Cargando**: skeleton de filas.
- **Vacío**: EmptyState "No hay actividades registradas" + botón "Registrar primera actividad".
- **Sin resultados de filtros**: EmptyState + botón "Limpiar filtros".

---

## 2. Hub selector de tipo (`/activities/new`)

### Layout

```
┌────────────────────────────────────────────────────────┐
│ Page Header: "¿Qué tipo de actividad?"   [← Cancelar] │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [Lectura RFID]  [Sanitaria]    [Comercial]            │
│  (bluetooth,     (vacunación,   (venta,                │
│   archivo)        tratamiento)   despacho)             │
│                                                        │
│  [Control campo] [Movimiento]   [Reproducción]         │
│  (pesaje, conteo,(traslado,     (servicio,             │
│   cond. corp...) transferencia)  diagnóstico...)       │
│                                                        │
│  [General]                                             │
│  (libre)                                               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

- Grilla 3x2 de cards.
- Cada card: ícono grande + nombre + descripción de 1 línea.
- Click → navega al formulario del tipo correspondiente.

---

## 3. Componente: Selector de animales (transversal)

Presente en todos los formularios de actividad. Permite seleccionar los animales sobre los que aplica la actividad.

### Métodos de selección (tabs)

```
[  RFID Bluetooth  |  Archivo RFID  |  Por lote  |  Individual  ]
```

#### Tab 1: RFID Bluetooth
- Botón "Iniciar lectura Bluetooth".
- Lista de caravanas detectadas en tiempo real.
- Indicador de dispositivo conectado / desconectado.
- Contador de animales leídos.
- Botón "Detener lectura".

#### Tab 2: Archivo RFID
- Zona de drag & drop para archivo `.txt` / `.csv`.
- También: botón "Seleccionar archivo".
- Al cargar: lista de caravanas reconocidas vs. desconocidas.
  - Reconocidas: se muestran como animales (caravana + categoría + lote).
  - Desconocidas: badge warning "No encontrada en el establecimiento".
- Se puede deseleccionar cualquier animal antes de continuar.

#### Tab 3: Por lote
- Select de lote activo.
- Al seleccionar: muestra la lista de animales del lote.
- Contador "X animales seleccionados".
- Se puede deseleccionar animales individuales de la lista.

#### Tab 4: Individual
- Input de búsqueda por caravana.
- Selección múltiple: click agrega a la lista.
- Lista de animales seleccionados con botón para remover cada uno.

### Panel de selección final (presente en todos los tabs)
- Lista compacta de los animales seleccionados: caravana corta + categoría.
- Contador total.
- Botón "Limpiar selección".

---

## 4. Formulario: Actividad sanitaria (`/activities/new/sanitary`)

### Layout

```
┌──────────────────────────────────────────────────────────┐
│ Page Header: "Actividad sanitaria"      [← Tipo]         │
├──────────────────────────┬───────────────────────────────┤
│  SELECTOR DE ANIMALES    │  DATOS DE LA ACTIVIDAD        │
│  (componente transversal)│                               │
│                          │                               │
└──────────────────────────┴───────────────────────────────┘
```

Layout de **dos columnas**: selector de animales (izq) + formulario de datos (der).

### Campos (columna derecha)

**Tipo**
- Radio: Vacunación / Tratamiento

**Producto**
- Input texto * (nombre del producto)

**Dosis**
- Input texto (ej. "5 ml")

**Vía de administración**
- Select: Subcutánea / Intramuscular / Oral / Tópica / Otra

**Días de carencia**
- Input número (0 = sin carencia)
- Al ingresar valor > 0: muestra preview "Carencia hasta [fecha calculada]"

**Fecha**
- Date picker * (default hoy)

**Responsable**
- Input texto * (nombre del veterinario o usuario)

**Observaciones**
- Textarea (opcional)

### Validaciones visibles
- Si algún animal seleccionado tiene carencia activa: advertencia "N animales tienen carencia activa. Continuarás sobrescribiéndola."
- Al menos 1 animal seleccionado para poder guardar.

### Acciones
- "Registrar actividad" (primario) → al confirmar, redirige a `/activities`.
- "Cancelar" → vuelve al hub.

---

## 5. Formulario: Actividad comercial (`/activities/new/commercial`)

### Campos

**Tipo**
- Radio: Venta / Despacho

**Comprador / Destinatario**
- Input texto * 

**Destino**
- Input texto (ej. "Frigorífico Central, Buenos Aires")

**Precio por cabeza** (solo en Venta)
- Input número (moneda local, opcional)

**Precio total** (solo en Venta)
- Input número. Se puede llenar cualquiera de los dos; el otro se calcula automáticamente si hay cantidad de animales seleccionados.

**Fecha**
- Date picker * (default hoy)

**Responsable**
- Input texto *

**Observaciones**
- Textarea (opcional)

### Validaciones críticas

**Animales con carencia activa**:
- Al intentar guardar con animales bloqueados por carencia:
  - Banner de advertencia destacado: "X animales tienen carencia activa y no pueden ser incluidos en una venta."
  - Lista de los animales bloqueados.
  - Opciones: "Remover animales con carencia" (automático) o "Cancelar".
- No se puede confirmar mientras haya animales con carencia activa en la selección.

### Acciones
- "Confirmar [venta/despacho]" (primario, danger/success según tipo).
- "Cancelar".
- Al confirmar: los animales pasan a estado `egresado`.

---

## 6. Formulario: Control de campo (`/activities/new/field-control`)

### Subtipo (tabs o radio al inicio)
Pesaje / Conteo / Condición corporal / Revisión de preñez / Otro

### Campos comunes
- Fecha *, Responsable *, Observaciones.

### Campos por subtipo

**Pesaje**
- Peso promedio (kg) — o individual si hay pocos animales.
- Báscula / Fuente (input texto).
- Condición corporal (1-9, opcional).

**Conteo**
- Resultado del conteo (número).
- Total esperado (calculado del establecimiento).
- Diferencia: calculada automáticamente, mostrada con color (verde si coincide, rojo si hay diferencia).

**Condición corporal**
- Score (1-9).
- Observaciones adicionales.

**Revisión de preñez**
- Resultado (select: Positivo / Negativo / Incierto).
- Meses de preñez (número, si aplica).

**Otro**
- Título * (texto libre).
- Resultado (texto libre).

---

## 7. Formulario: Movimiento (`/activities/new/movement`)

### Subtipo (radio)
- Movimiento entre potreros
- Transferencia a otro establecimiento
- Transferencia externa

### Campos comunes
- Origen (input texto).
- Destino (input texto).
- Fecha *, Responsable *, Observaciones.

### Campos adicionales por subtipo

**Transferencia a otro establecimiento**
- Establecimiento destino (select de establecimientos del usuario).
- Nota: genera egreso en el establecimiento actual e ingreso en el destino.

**Transferencia externa**
- Establecimiento destino (input texto libre, no en el sistema).

### Nota sobre carencia
- Los movimientos no validan carencia activa.

---

## 8. Formulario: Reproducción (`/activities/new/reproduction`)

### Subtipo (radio)
- Servicio
- Diagnóstico de preñez
- Parto
- Destete

### Campos por subtipo

**Servicio**
- Tipo: Natural / Inseminación artificial / Transferencia embrionaria.
- Toro / Material genético (input texto).
- Fecha *, Responsable *, Observaciones.

**Diagnóstico de preñez**
- Resultado: Positivo / Negativo / Incierto.
- Meses de preñez (número, si es positivo).
- Fecha *, Responsable *.

**Parto**
- Resultado: Vivo / Mortinato / Aborto.
- Sexo de la cría (si es vivo).
- Caravana de la cría (input, si es vivo → genera ingreso automático del nuevo animal).
- Peso al nacer (opcional).
- Fecha *, Responsable *.
- Info inline: "Si ingresás la caravana, se creará automáticamente el registro del animal."

**Destete**
- Peso al destete (kg).
- Edad al destete (días o semanas).
- Fecha *, Responsable *.

---

## 9. Formulario: General (`/activities/new/general`)

### Campos
- Título * (input texto, ej. "Revisión veterinaria general").
- Descripción (textarea, libre).
- Fecha *, Responsable *, Observaciones.

### Nota
- No modifica ningún estado del animal.
- Compatible con cualquier método de selección de animales.

---

## 10. Detalle de actividad (`/activities/[activityId]`)

### Layout general

```
┌────────────────────────────────────────────────────────┐
│ [← Actividades]  [Badge Tipo]  Descripción corta       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  DATOS GENERALES                                       │
│  ─────────────────────────────────────────────────     │
│  Fecha           Método de selección                   │
│  Responsable     Notas                                 │
│                                                        │
│  DETALLES [según tipo]                                 │
│  ─────────────────────────────────────────────────     │
│  (campos específicos del tipo)                         │
│                                                        │
│  ANIMALES  (N animales)                                │
│  ─────────────────────────────────────────────────     │
│  [AnimalRow] [AnimalRow] [AnimalRow] ...               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Header
- Botón "← Actividades" que navega a `/activities`.
- Badge de tipo (mismo color que en el listado).
- Descripción corta generada (ej: "Vacunación — Ivermectina 1%").
- Fecha relativa (ej: "hace 2 días").

### Sección: Datos generales
Grid 2 columnas con los campos comunes:
- Fecha completa (día/mes/año hora)
- Responsable
- Método de selección (label legible: "RFID Bluetooth", "Archivo RFID", "Por lote", "Individual")
- Notas (si tiene, ancho completo)

### Sección: Detalles por tipo

**Sanitaria**: Tipo (Vacunación/Tratamiento), Producto, Dosis, Vía, Días de carencia, Fecha de vencimiento de carencia.

**Comercial**: Tipo (Venta/Despacho), Comprador/Destinatario, Destino, Precio por cabeza, Precio total.

**Lectura RFID**: Método (Bluetooth/Archivo), nombre del archivo (si aplica). La sección "Animales" se reemplaza por la grilla de caravanas con tabs (Todas / En stock / Sin registro). Ver detalle en `specs/design/07-rfid.md`.

**Control de campo**: Subtipo, campos específicos según subtipo (peso, resultado, etc.).

**Movimiento**: Subtipo, Origen, Destino.

**Reproducción**: Subtipo, campos específicos según subtipo (tipo de servicio, resultado, etc.).

**General**: Título, Descripción.

### Sección: Animales
- Título "Animales" con contador "(N animales)".
- Lista de filas: caravana + categoría del animal. Cada fila es clickeable → perfil del animal (`/animals/[id]`).
- Si el animal fue egresado por esta actividad (comercial): badge "Egresado" en la fila.

### Estados
- **Cargando**: skeleton.
- **No encontrado**: EmptyState "Actividad no encontrada" + botón volver.
