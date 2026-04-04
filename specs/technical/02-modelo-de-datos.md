# Modelo de Datos — Firebase Realtime Database

## Estructura del árbol JSON

Firebase Realtime Database almacena todo como un árbol JSON. La raíz del árbol tiene los siguientes nodos de primer nivel:

```
/
├── users/
├── establishments/
├── animals/
├── lots/
├── lot_animals/          ← índice de denormalización
├── activities/
├── traceability/
└── alerts/
```

Cada nodo de datos que pertenece a un establecimiento está particionado por `{estId}` como segunda clave, para facilitar las Security Rules y el acceso por establecimiento activo.

---

## Nodos detallados

### `/users/{uid}`

```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "establishmentIds": {
    "est_abc123": true,
    "est_def456": true
  },
  "createdAt": 1712000000000
}
```

- `uid` es el mismo ID que genera Firebase Auth.
- `establishmentIds` es un map de IDs para facilitar la query "establecimientos de este usuario" sin leer todos los establecimientos.

---

### `/establishments/{estId}`

```json
{
  "name": "La Esperanza",
  "description": "Campo en zona norte",
  "location": "Gral. Pico, La Pampa",
  "ownerId": "uid_usuario",
  "status": "active",
  "createdAt": 1712000000000
}
```

- `status`: `"active"` | `"archived"`
- `ownerId`: referencia al `uid` del usuario propietario.

---

### `/animals/{estId}/{animalId}`

```json
{
  "caravana": "AR-1234-5678",
  "status": "active",
  "category": "vaca",
  "breed": "Angus",
  "sex": "female",
  "birthDate": "2021-03-15",
  "entryWeight": 280,
  "origin": "Establecimiento Los Pinos",
  "entryType": "purchase",
  "entryDate": 1712000000000,
  "lotId": "lot_xyz789",
  "exitDate": null,
  "exitType": null,
  "hasActiveCarencia": false,
  "carenciaExpiresAt": null,
  "createdAt": 1712000000000,
  "updatedAt": 1712000000000
}
```

- `status`: `"active"` | `"exited"`
- `category`: `"vaca"` | `"toro"` | `"ternero"` | `"ternera"` | `"vaquillona"` | `"novillo"` | `"otro"`
- `entryType`: `"purchase"` | `"birth"` | `"transfer"`
- `lotId`: ID del lote actual, o `null` si no tiene lote asignado.
- `hasActiveCarencia`: campo calculado y persistido para facilitar filtros y alertas sin recalcular en cliente.
- `carenciaExpiresAt`: timestamp de vencimiento de la carencia más lejana activa. `null` si no tiene carencia activa.
- `exitType`: `"sale"` | `"dispatch"` | `"death"` | `"transfer"` | `null`

> **Nota**: `hasActiveCarencia` y `carenciaExpiresAt` son escritos por la Cloud Function `onSanitaryActivityCreated` al registrar una actividad con carencia. El cliente no los calcula: los lee directamente.

---

### `/lots/{estId}/{lotId}`

```json
{
  "name": "Lote Norte",
  "description": "Animales en potrero norte",
  "status": "active",
  "animalCount": 47,
  "createdAt": 1712000000000
}
```

- `status`: `"active"` | `"dissolved"`
- `animalCount`: campo denormalizado para mostrar el conteo sin leer `lot_animals`. Lo mantiene la Cloud Function.

---

### `/lot_animals/{estId}/{lotId}/{animalId}`

```json
true
```

Índice de denormalización. Permite obtener todos los animales de un lote en una sola read sin escanear todos los animales del establecimiento.

```
lot_animals/
  est_abc123/
    lot_xyz789/
      animal_111: true
      animal_222: true
      animal_333: true
```

Este nodo se escribe/borra en conjunto con el campo `lotId` del animal. La Cloud Function mantiene ambos sincronizados.

---

### `/activities/{estId}/{activityId}`

Todas las actividades comparten este nodo, diferenciadas por `type`. Ver tipos en `specs/functional/04-actividades-framework.md`.

#### Campos comunes a todas las actividades

```json
{
  "type": "sanitary | commercial | field_control | movement | reproduction | general",
  "subtype": "...",
  "animalIds": ["animal_111", "animal_222"],
  "selectionMethod": "rfid_bluetooth | rfid_file | lot | individual",
  "rfidReadingId": "reading_abc",
  "activityDate": 1712000000000,
  "responsible": "Dr. González",
  "notes": "",
  "createdAt": 1712000000000,
  "createdBy": "uid_usuario"
}
```

- `type`: `"sanitary"` | `"commercial"` | `"field_control"` | `"movement"` | `"reproduction"` | `"general"`
- `animalIds`: siempre una lista. Un solo animal = lista de uno. Nunca campo `animalId` singular.
- `selectionMethod`: cómo se seleccionaron los animales. `"rfid_bluetooth"` | `"rfid_file"` | `"lot"` | `"individual"`
- `rfidReadingId`: referencia al nodo `/rfid_readings/{estId}/{readingId}` si la selección fue por RFID. `null` si no aplica.

#### Campos adicionales por tipo

**Sanitaria** (`type: "sanitary"`):
```json
{
  "subtype": "vaccination | treatment",
  "product": "Ivermectina 1%",
  "dose": "5 ml",
  "route": "subcutaneous | intramuscular | oral | topical | other",
  "carenciaDays": 28,
  "carenciaExpiresAt": 1714592000000
}
```

**Comercial** (`type: "commercial"`):
```json
{
  "subtype": "sale | dispatch",
  "buyer": "Frigorífico Central",
  "destination": "Buenos Aires",
  "pricePerHead": 1500,
  "totalPrice": 3000,
  "status": "draft | confirmed"
}
```
- `status`: `"draft"` → `"confirmed"` dispara `onCommercialActivityConfirmed`.

**Control de campo** (`type: "field_control"`):
```json
{
  "subtype": "weighing | count | body_condition | pregnancy_check | other",
  "weightKg": 320.5,
  "scale": "Báscula Potrero Norte",
  "result": "texto libre para otros subtipos"
}
```

**Movimiento** (`type: "movement"`):
```json
{
  "subtype": "paddock_move | field_transfer | external_transfer",
  "origin": "Potrero Norte",
  "destination": "Potrero Sur",
  "destinationEstablishmentId": null
}
```

**Reproducción** (`type: "reproduction"`):
```json
{
  "subtype": "service | pregnancy_diagnosis | birth | weaning",
  "serviceType": "natural | artificial_insemination | embryo_transfer",
  "pregnancyResult": "positive | negative | uncertain",
  "birthResult": "live | stillborn | abortion",
  "offspringCaravana": "AR-9999"
}
```

**General** (`type: "general"`):
```json
{
  "title": "Revisión veterinaria general"
}
```

---

### `/rfid_readings/{estId}/{readingId}`

Registra cada lectura RFID como evento independiente. Existe aunque no esté asociada a ninguna actividad.

```json
{
  "method": "bluetooth | file_upload",
  "fileName": "lectura_2024-04-03.txt",
  "animalIds": ["animal_111", "animal_222", "animal_333"],
  "unknownCaravanas": ["AR-XXXX"],
  "activityId": "activity_zzz",
  "responsible": "Juan Pérez",
  "notes": "",
  "timestamp": 1712000000000,
  "createdBy": "uid_usuario"
}
```

- `method`: `"bluetooth"` (tiempo real) | `"file_upload"` (archivo previo)
- `unknownCaravanas`: caravanas leídas que no existen en el establecimiento activo
- `activityId`: referencia a la actividad que usó esta lectura. `null` si fue una lectura independiente.

---

### `/traceability/{estId}/{animalId}/{eventId}`

```json
{
  "type": "sanitary_activity",
  "description": "Vacunación — Ivermectina 1%",
  "activityId": "activity_zzz",
  "lotId": null,
  "lotName": null,
  "responsibleName": "Dr. González",
  "timestamp": 1712000000000,
  "createdAt": 1712000000000
}
```

- `type`: `"entry"` | `"lot_assignment"` | `"lot_change"` | `"lot_removal"` | `"sanitary_activity"` | `"commercial_activity"` | `"field_control"` | `"movement"` | `"reproduction"` | `"general_activity"` | `"rfid_reading"` | `"exit"` | `"correction"`
- Los campos `lotName`, `responsible`, etc. se **desnormalizan en el momento de creación** para que el historial sea autocontenido (no depender de leer otros nodos para mostrar el historial).
- Los eventos de trazabilidad son escritos **exclusivamente por Cloud Functions**, nunca por el cliente directamente.

---

### `/alerts/{estId}/{alertId}`

```json
{
  "type": "carencia_expiring",
  "urgency": "warning",
  "status": "active",
  "animalId": "animal_111",
  "animalCaravana": "AR-1234-5678",
  "lotId": null,
  "lotName": null,
  "description": "Carencia de Ivermectina vence en 5 días",
  "relevantDate": 1712432000000,
  "daysUntilExpiry": 5,
  "createdAt": 1712000000000,
  "resolvedAt": null,
  "dismissedAt": null
}
```

- `type`: `"carencia_expiring"` | `"lot_inactive"`
- `urgency`: `"info"` | `"warning"` | `"critical"`
- `status`: `"active"` | `"resolved"` | `"dismissed"`
- Los datos del animal/lote se desnormalizan en la alerta para mostrarla sin reads adicionales.

---

## Índices necesarios en RTDB

Firebase RTDB requiere declarar índices en `database.rules.json` para queries con `orderByChild`:

```json
{
  "rules": {
    "animals": {
      "$estId": {
        ".indexOn": ["status", "lotId", "hasActiveCarencia", "caravana"]
      }
    },
    "lots": {
      "$estId": {
        ".indexOn": ["status"]
      }
    },
    "activities": {
      "$estId": {
        ".indexOn": ["type", "operationDate", "animalId"]
      }
    },
    "alerts": {
      "$estId": {
        ".indexOn": ["status", "urgency", "type"]
      }
    },
    "traceability": {
      "$estId": {
        "$animalId": {
          ".indexOn": ["timestamp", "type"]
        }
      }
    }
  }
}
```

---

## Reglas de denormalización aplicadas

| Dato denormalizado | Dónde se guarda | Por qué |
|---|---|---|
| `hasActiveCarencia` en animal | `/animals/{estId}/{animalId}` | Filtrar animales con carencia sin calcular en cliente |
| `carenciaExpiresAt` en animal | `/animals/{estId}/{animalId}` | Mostrar días restantes y ordenar por vencimiento |
| `animalCount` en lote | `/lots/{estId}/{lotId}` | Mostrar conteo sin leer `lot_animals` |
| `lot_animals` índice | `/lot_animals/{estId}/{lotId}/` | Obtener animales de un lote eficientemente |
| Nombre/caravana en trazabilidad | `/traceability/{estId}/{animalId}/{eventId}` | Historial autocontenido, sin reads cruzados |
| Datos del animal en alertas | `/alerts/{estId}/{alertId}` | Mostrar alertas sin reads adicionales |

---

## Limitaciones conocidas de RTDB

- **No hay queries compuestas**: no se puede filtrar por `status = "active" AND category = "vaca"` en una sola query. Se debe filtrar por un campo en RTDB y luego filtrar el segundo campo en el cliente.
- **No hay paginación nativa** con cursores de tipo Firestore. Se usa `limitToFirst` / `limitToLast` con `startAt` para simular paginación.
- **El árbol se descarga completo** si se hace `.on("value")` sobre un nodo padre. Siempre escuchar nodos hoja o nodos de granularidad adecuada.
- **Escrituras concurrentes offline**: si dos dispositivos escriben el mismo nodo offline, gana la última escritura al sincronizar (last-write-wins). No hay detección de conflictos a nivel de campo.
