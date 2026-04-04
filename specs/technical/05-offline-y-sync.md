# Offline y Sincronización

## Cómo funciona el offline con Firebase RTDB

Firebase Realtime Database tiene **persistencia offline integrada** en sus SDKs nativos (Android, iOS) y web. Con una sola línea de configuración, el SDK:

1. Guarda un cache local de los datos leídos.
2. Encola las escrituras realizadas sin conexión.
3. Al reconectar, aplica las escrituras pendientes al servidor en orden.
4. Actualiza el cache local con los cambios del servidor.

No se requiere implementar una base de datos local separada (no Room, no Core Data, no IndexedDB custom).

---

## Configuración por plataforma

### Android

```kotlin
// En Application.onCreate() o antes de cualquier uso de Firebase
FirebaseDatabase.getInstance().setPersistenceEnabled(true)
```

### iOS

```swift
// En AppDelegate.application(_:didFinishLaunchingWithOptions:)
Database.database().isPersistenceEnabled = true
```

### Web (Next.js)

```typescript
// En el módulo de inicialización de Firebase, solo en cliente
import { getDatabase, enableIndexedDbPersistence } from "firebase/database"

// RTDB web no tiene persistencia offline tan robusta como los SDK nativos.
// En web se usa connectDatabaseEmulator en dev y en prod se recomienda
// manejar el estado offline con onValue + onDisconnect.
// La persistencia offline completa en web tiene limitaciones (service worker necesario).
```

> **Nota web**: La persistencia offline de Firebase RTDB en web es más limitada que en mobile. En el cliente web, el offline es parcial: los datos cacheados de la sesión actual están disponibles, pero no persisten entre cierres del navegador. Para el MVP, esto es aceptable dado que el uso offline crítico ocurre en los clientes mobile.

---

## Configuración de `keepSynced`

Para que los datos estén disponibles offline aunque el usuario no haya navegado a esa sección, se debe activar `keepSynced` en los nodos del establecimiento activo.

Al seleccionar un establecimiento como activo, el cliente activa la sincronización continua de sus datos:

### Android

```kotlin
fun syncEstablishment(estId: String) {
    val db = FirebaseDatabase.getInstance()
    db.getReference("animals/$estId").keepSynced(true)
    db.getReference("lots/$estId").keepSynced(true)
    db.getReference("lot_animals/$estId").keepSynced(true)
    db.getReference("activities/$estId").keepSynced(true)
    db.getReference("traceability/$estId").keepSynced(true)
    db.getReference("alerts/$estId").keepSynced(true)
}
```

Al cambiar de establecimiento activo, se desactiva el `keepSynced` del establecimiento anterior y se activa en el nuevo.

### iOS

```swift
func syncEstablishment(estId: String) {
    let db = Database.database().reference()
    db.child("animals/\(estId)").keepSynced(true)
    db.child("lots/\(estId)").keepSynced(true)
    // ... idem para los demás nodos
}
```

---

## Comportamiento al reconectar

1. El SDK detecta que hay conexión disponible.
2. Aplica las escrituras pendientes al servidor en el orden en que fueron realizadas (FIFO).
3. Las Cloud Functions se disparan en ese momento (generación de trazabilidad, alertas, etc.).
4. El SDK recibe los cambios del servidor y actualiza el cache local.
5. Los listeners activos notifican a la UI los cambios.

El usuario **no necesita hacer nada**: la sincronización es automática y transparente.

---

## Indicador de estado de conexión

Firebase provee un nodo especial `.info/connected` que refleja el estado de conexión en tiempo real:

### Android

```kotlin
val connectedRef = FirebaseDatabase.getInstance().getReference(".info/connected")
connectedRef.addValueEventListener(object : ValueEventListener {
    override fun onDataChange(snapshot: DataSnapshot) {
        val connected = snapshot.getValue(Boolean::class.java) ?: false
        // Emitir al ViewModel para que actualice UiState
    }
    override fun onCancelled(error: DatabaseError) {}
})
```

### iOS

```swift
let connectedRef = Database.database().reference(withPath: ".info/connected")
connectedRef.observe(.value) { snapshot in
    let connected = snapshot.value as? Bool ?? false
    // Actualizar @Published var isOffline en ViewModel
}
```

### Web

```typescript
import { ref, onValue } from "firebase/database"
const connectedRef = ref(db, ".info/connected")
onValue(connectedRef, (snap) => {
  const isOnline = snap.val() === true
})
```

El estado `isOffline` se expone en un ViewModel global (o Context en web) para que cualquier pantalla pueda mostrarlo.

---

## Escrituras pendientes (cola visual)

RTDB no expone directamente cuántas escrituras hay en la cola offline. Para mostrar al usuario "N operaciones pendientes":

- Al realizar una escritura offline (SDK retorna inmediatamente sin confirmación del servidor), el cliente incrementa un contador local.
- Al recibir confirmación del servidor (el listener del nodo notifica el cambio), el contador se decrementa.
- Este contador se mantiene en el estado del ViewModel global.

Implementación simplificada para MVP: mostrar simplemente el badge "Sin conexión — cambios pendientes" mientras `isOffline === true` y haya actividad reciente sin confirmar. No es necesario el conteo exacto en el MVP.

---

## Limitaciones conocidas

| Limitación | Impacto | Mitigación |
|---|---|---|
| Las Cloud Functions no corren offline | Trazabilidad y alertas se generan al reconectar, no en el momento del registro | Documentado en spec funcional; el usuario lo entiende como comportamiento esperado |
| RTDB last-write-wins en conflictos | Si dos dispositivos escriben el mismo campo offline, gana el más reciente | Aceptable para MVP; los conflictos de negocio críticos (doble venta del mismo animal) son raros y se manejan en la Function |
| Persistencia web limitada | El cliente web no tiene offline robusto entre sesiones | El uso offline crítico está en mobile; web es secundario |
| `keepSynced` descarga todos los datos del nodo | Para establecimientos muy grandes (miles de animales) puede ser pesado | Aceptable en MVP; para escala futura, implementar sync selectivo por lote |
