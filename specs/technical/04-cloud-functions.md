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

**Condición**: solo se ejecuta si el nodo creado tiene `type === "sanitary"`.

**Responsabilidades**:
1. Leer la actividad sanitaria creada.
2. Generar el evento de trazabilidad en `/traceability/{estId}/{animalId}/{eventId}` con tipo `"sanitary_activity"`.
3. Calcular `carenciaExpiresAt = applicationDate + (carenciaDays * 86400000)`.
4. Leer la carencia actual del animal (`/animals/{estId}/{animalId}/carenciaExpiresAt`).
5. Si la nueva carencia vence **después** que la actual (o el animal no tiene carencia), actualizar en el animal:
   - `hasActiveCarencia: true`
   - `carenciaExpiresAt: <nuevo vencimiento>`
6. Actualizar `updatedAt` del animal.

**Nota sobre lotes**: si `appliedToLot === true`, la actividad ya fue creada con `animalId` individual (el cliente crea una actividad por animal al registrar sobre lote). La Function no necesita expandir lotes.

---

### 2. `onCommercialActivityConfirmed`

**Trigger**: `database.onValueUpdated("/activities/{estId}/{activityId}")`

**Condición**: solo se ejecuta si el nodo cambió de `status: "draft"` a `status: "confirmed"` y `type === "commercial"`.

**Responsabilidades**:
1. Leer la actividad comercial confirmada (`animalIds`, `subtype`, `operationDate`).
2. Para cada `animalId` en la lista:
   a. Leer el animal en `/animals/{estId}/{animalId}`.
   b. Verificar que `hasActiveCarencia === false`. Si alguno tiene carencia activa, **no procesar** y escribir `status: "error_carencia"` en la actividad + lista de IDs bloqueados. (Esto es una segunda línea de defensa; el cliente ya validó antes de confirmar.)
   c. Actualizar el animal:
      - `status: "exited"`
      - `exitType: <subtype de la actividad>`
      - `exitDate: <operationDate>`
      - `lotId: null`
      - `updatedAt: <now>`
   d. Si el animal tenía `lotId`, borrar `/lot_animals/{estId}/{lotId}/{animalId}` y decrementar `animalCount` en el lote.
   e. Crear evento de trazabilidad en `/traceability/{estId}/{animalId}/{eventId}` con tipo `"exit"` y referencia a la actividad comercial.
3. Actualizar `updatedAt` de la actividad.

---

### 3. `onLotDissolved`

**Trigger**: `database.onValueUpdated("/lots/{estId}/{lotId}")`

**Condición**: solo se ejecuta si el nodo cambió de `status: "active"` a `status: "dissolved"`.

**Responsabilidades**:
1. Leer todos los animales del lote desde `/lot_animals/{estId}/{lotId}`.
2. Para cada animal:
   a. Actualizar `/animals/{estId}/{animalId}/lotId` a `null`.
   b. Borrar `/lot_animals/{estId}/{lotId}/{animalId}`.
   c. Crear evento de trazabilidad tipo `"lot_removal"` con el nombre del lote disuelto.
3. Actualizar `animalCount: 0` en el lote.

---

### 4. `onAnimalLotChanged`

**Trigger**: `database.onValueUpdated("/animals/{estId}/{animalId}")`

**Condición**: solo se ejecuta si cambió el campo `lotId`.

**Responsabilidades**:
1. Leer el `lotId` anterior y el nuevo.
2. Si había lote anterior:
   - Borrar `/lot_animals/{estId}/{lotIdAnterior}/{animalId}`.
   - Decrementar `animalCount` en el lote anterior.
3. Si hay lote nuevo:
   - Escribir `/lot_animals/{estId}/{lotIdNuevo}/{animalId}: true`.
   - Incrementar `animalCount` en el lote nuevo.
4. Crear evento de trazabilidad tipo `"lot_change"` (o `"lot_assignment"` si no había lote anterior).

---

### 5. `generateAlerts` (programada)

**Trigger**: `scheduler.onSchedule("every 24 hours")`

**Responsabilidades**:
1. Leer todos los establecimientos activos.
2. Para cada establecimiento:
   a. **Alertas de carencia próxima a vencer**: leer animales con `hasActiveCarencia === true`. Para cada uno, calcular días hasta `carenciaExpiresAt`. Si los días son ≤ 7 (umbral por defecto), crear o actualizar alerta en `/alerts/{estId}/`:
      - Si ya existe alerta activa de tipo `"carencia_expiring"` para ese animal, actualizar `daysUntilExpiry`.
      - Si no existe, crear nueva.
   b. **Resolver alertas vencidas**: leer alertas activas de tipo `"carencia_expiring"`. Si `relevantDate < now`, marcar como `status: "resolved"`.
   c. **Alertas de lote inactivo**: leer lotes activos. Para cada lote, buscar la última actividad sanitaria en `/activities/{estId}` con `lotId === lotId` y `type === "sanitary"`. Si la última fue hace más de 30 días (o nunca hubo), crear alerta de tipo `"lot_inactive"` si no existe ya una activa.
   d. **Resolver alertas de lote**: si se registró actividad sanitaria reciente, marcar la alerta de lote como `status: "resolved"`.

---

## Estructura de carpetas

```
functions/
├── src/
│   ├── index.ts                    ← Exporta todas las functions
│   ├── sanitaryActivity.ts         ← onSanitaryActivityCreated
│   ├── commercialActivity.ts       ← onCommercialActivityConfirmed
│   ├── lot.ts                      ← onLotDissolved, onAnimalLotChanged
│   └── alerts.ts                   ← generateAlerts
├── package.json
└── tsconfig.json
```

---

## Idempotencia y errores

- Las Functions deben ser **idempotentes**: si se ejecutan dos veces por el mismo evento (puede pasar por reintentos de Firebase), el resultado debe ser el mismo.
- Para eventos de trazabilidad: usar el `activityId` como parte del `eventId` de trazabilidad para evitar duplicados.
- En caso de error dentro de una Function, el error queda en los logs de Cloud Functions. No se revierte automáticamente lo escrito antes del error; diseñar las operaciones para que los pasos intermedios no dejen el sistema en estado inconsistente.
