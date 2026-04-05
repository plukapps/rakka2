# Cloud Functions

## Principio

Las Cloud Functions contienen la lógica de negocio que no puede quedar en el cliente:
- Operaciones que deben garantizarse aunque el cliente falle o se desconecte tras escribir.
- Generación de trazabilidad (fuente de verdad inmutable, no puede ser escrita por el cliente).
- Escritura de campos de alertas (el cliente no puede escribir en `/alerts/`).
- Operaciones que afectan múltiples nodos de forma atómica.

**Lo que NO va en Functions**: cálculos de UI, validaciones de formulario, lógica puramente de presentación. La validación de carencia previa a una venta se hace en el cliente antes de confirmar; la Function solo consolida el resultado post-confirmación.

---

## Runtime y configuración

- Runtime: **Node.js 20** con TypeScript.
- Cloud Functions v2 (basadas en Cloud Run).
- El Admin SDK de Firebase se usa dentro de las Functions (omite Security Rules, acceso total).
- Todas las Functions del proyecto viven en `/functions/src/`.

---

## Listado de Functions

### 1. `onSanitaryActivityCreated`

**Trigger**: `database.onValueCreated("/activities/{estId}/{activityId}")`

**Condición**: solo se ejecuta si `type === "sanitary"`.

**Responsabilidades**:
1. Leer la actividad creada (`animalIds`, `carenciaDays`, `applicationDate`).
2. Para cada `animalId` en `animalIds`:
   a. Calcular `carenciaExpiresAt = applicationDate + (carenciaDays * 86400000)`.
   b. Leer la carencia actual del animal (`/animals/{estId}/{animalId}/carenciaExpiresAt`).
   c. Si la nueva carencia vence después que la actual (o el animal no tiene carencia activa), actualizar:
      - `hasActiveCarencia: true`
      - `carenciaExpiresAt: <nuevo vencimiento>`
      - `updatedAt: <now>`
   d. Crear evento en `/traceability/{estId}/{animalId}/{activityId}_{animalId}` con tipo `"sanitary_activity"`.

---

### 2. `onCommercialActivityConfirmed`

**Trigger**: `database.onValueUpdated("/activities/{estId}/{activityId}")`

**Condición**: solo se ejecuta si cambió de `status: "draft"` a `status: "confirmed"` y `type === "commercial"`.

**Responsabilidades**:
1. Leer la actividad confirmada (`animalIds`, `subtype`, `activityDate`).
2. Para cada `animalId` en `animalIds`:
   a. Verificar `hasActiveCarencia === false`. Si alguno tiene carencia activa: escribir `status: "error_carencia"` en la actividad con lista de IDs bloqueados. Abortar.
   b. Actualizar animal: `status: "exited"`, `exitType: subtype`, `exitDate`, `lotId: null`, `updatedAt`.
   c. Si tenía `lotId`: borrar de `/lot_animals/`, decrementar `animalCount` en el lote.
   d. Crear evento de trazabilidad tipo `"exit"` con referencia a la actividad.
3. Actualizar `updatedAt` de la actividad.

---

### 3. `onActivityCreated` (actividades no sanitarias ni comerciales)

**Trigger**: `database.onValueCreated("/activities/{estId}/{activityId}")`

**Condición**: `type` es uno de `"field_control"`, `"movement"`, `"reproduction"`, `"general"`.

**Responsabilidades**:
1. Para cada `animalId` en `animalIds`: crear evento de trazabilidad con el tipo correspondiente:
   - `field_control` → `"field_control"`
   - `movement` → `"movement"`
   - `reproduction` → `"reproduction"`
   - `general` → `"general_activity"`
2. **Casos especiales**:
   - Si `type === "movement"` y `subtype === "field_transfer"`: para cada animal, crear egreso en el establecimiento origen e ingreso en `destinationEstablishmentId`.
   - Si `type === "reproduction"` y `subtype === "birth"` y `offspringCaravana` está presente: crear el nuevo animal en el establecimiento con `entryType: "birth"` y `entryDate: activityDate`.
   - Si `type === "field_control"` y `subtype === "weighing"` y `weightsByAnimal` está presente: ejecutar la lógica de denormalización de peso (ver sección 4).

---

### 4. `onWeighingDenormalization`

**Trigger**: se ejecuta dentro de `onActivityCreated` cuando `type === "field_control"`, `subtype === "weighing"` y `weightsByAnimal` está presente.

**Responsabilidades**:
Para cada `animalId` que tiene una entrada en `weightsByAnimal`:
1. Leer el animal actual: `entryWeight`, `entryDate`, `lastWeight`, `lastWeightDate`.
2. Determinar el peso anterior de referencia:
   - Si el animal tiene `lastWeight` (ya fue pesado antes): usar `lastWeight` y `lastWeightDate`.
   - Si no: usar `entryWeight` y `entryDate`.
3. Calcular `gdpRecent`:
   - `(nuevo_peso - peso_anterior) / ((fecha_actividad - fecha_anterior) / 86400000)`
   - Si no hay peso anterior o las fechas son iguales: `null`.
4. Calcular `gdpAccumulated`:
   - `(nuevo_peso - entryWeight) / ((fecha_actividad - entryDate) / 86400000)`
   - Si no hay `entryWeight` o las fechas son iguales: `null`.
5. Escribir en el nodo del animal:
   - `lastWeight`: el nuevo peso
   - `lastWeightDate`: `activityDate` de la actividad
   - `gdpRecent`: calculado en paso 3
   - `gdpAccumulated`: calculado en paso 4
   - `updatedAt`: timestamp actual

---

### 5. `onReadingActivityCreated`

**Trigger**: `database.onValueCreated("/rfid_readings/{estId}/{readingId}")`

**Responsabilidades**:
1. Para cada `animalId` en `animalIds` (los reconocidos): crear evento de trazabilidad tipo `"rfid_reading"` con `method`, `activityId` (si tiene uno asociado) y `readingId`.
2. Los `unknownCaravanas` se loguean pero no generan trazabilidad (no hay animal a quien asignarlos).

---

### 6. `onLotDissolved`

**Trigger**: `database.onValueUpdated("/lots/{estId}/{lotId}")`

**Condición**: cambió de `status: "active"` a `status: "dissolved"`.

**Responsabilidades**:
1. Leer todos los animales del lote desde `/lot_animals/{estId}/{lotId}`.
2. Para cada animal: actualizar `lotId: null`, borrar de `/lot_animals/`, crear evento de trazabilidad `"lot_removal"`.
3. Actualizar `animalCount: 0` en el lote.

---

### 6. `onAnimalLotChanged`

**Trigger**: `database.onValueUpdated("/animals/{estId}/{animalId}")`

**Condición**: cambió el campo `lotId`.

**Responsabilidades**:
1. Leer `lotId` anterior y nuevo.
2. Si había lote anterior: borrar de `/lot_animals/{anterior}/`, decrementar `animalCount`.
3. Si hay lote nuevo: escribir `/lot_animals/{nuevo}/{animalId}: true`, incrementar `animalCount`.
4. Crear evento de trazabilidad: `"lot_change"` si venía de un lote, `"lot_assignment"` si no tenía lote previo.

---

### 7. `generateAlerts` (programada)

**Trigger**: `scheduler.onSchedule("every 24 hours")`

**Responsabilidades**:
1. Para cada establecimiento activo:
   a. **Carencia próxima a vencer**: animales con `hasActiveCarencia === true` y `carenciaExpiresAt` ≤ 7 días. Crear/actualizar alerta `"carencia_expiring"`.
   b. **Resolver alertas de carencia**: si `carenciaExpiresAt < now`, marcar `status: "resolved"` y actualizar `hasActiveCarencia: false` en el animal.
   c. **Lote inactivo**: lotes activos sin actividad de `type === "sanitary"` en los últimos 30 días. Crear alerta `"lot_inactive"` si no existe una activa.
   d. **Resolver alertas de lote**: si se registró actividad sanitaria reciente en el lote, marcar alerta como `"resolved"`.

---

## Estructura de carpetas

```
functions/
├── src/
│   ├── index.ts                    ← Exporta todas las functions
│   ├── sanitaryActivity.ts         ← onSanitaryActivityCreated
│   ├── commercialActivity.ts       ← onCommercialActivityConfirmed
│   ├── activity.ts                 ← onActivityCreated (field_control, movement, reproduction, general)
│   ├── rfidReading.ts              ← onRfidReadingCreated
│   ├── lot.ts                      ← onLotDissolved, onAnimalLotChanged
│   └── alerts.ts                   ← generateAlerts
├── package.json
└── tsconfig.json
```

---

## Idempotencia y errores

- Todas las Functions deben ser **idempotentes**: usar `{activityId}_{animalId}` como clave del evento de trazabilidad para evitar duplicados en reintentos.
- En `onActivityCreated` y `onSanitaryActivityCreated`: iterar `animalIds` y procesar cada uno en un bloque try/catch individual para que el fallo de un animal no aborte el procesamiento de los demás.
- Los errores quedan en Cloud Functions logs. No hay rollback automático: diseñar los pasos para que sean safe en caso de ejecución parcial.
