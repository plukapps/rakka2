# Arquitectura General

## Diagrama de capas

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTES                          │
│                                                     │
│  ┌──────────┐   ┌──────────────┐   ┌─────────────┐ │
│  │ iOS App  │   │ Android App  │   │  Next.js    │ │
│  │ SwiftUI  │   │   Compose    │   │  Web App    │ │
│  └────┬─────┘   └──────┬───────┘   └──────┬──────┘ │
└───────┼────────────────┼──────────────────┼─────────┘
        │                │                  │
        │    Firebase SDKs (iOS / Android / JS)
        │                │                  │
┌───────▼────────────────▼──────────────────▼─────────┐
│                    FIREBASE                          │
│                                                     │
│  ┌─────────────────────┐   ┌──────────────────────┐ │
│  │  Realtime Database  │   │   Authentication     │ │
│  │  (datos + offline)  │   │   (email/password)   │ │
│  └──────────┬──────────┘   └──────────────────────┘ │
│             │ triggers                               │
│  ┌──────────▼──────────────────────────────────┐    │
│  │          Cloud Functions (Node.js)           │    │
│  │  - onSanitaryActivityCreated                 │    │
│  │  - onCommercialActivityConfirmed             │    │
│  │  - onLotDissolved                            │    │
│  │  - generateAlerts (scheduled)                │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## Principios de comunicación

### Clientes → Firebase

- Los tres clientes (iOS, Android, Web) se conectan **directamente a Firebase** usando los SDKs oficiales.
- No hay una API REST intermediaria propia. Firebase es el backend.
- La autenticación se maneja con Firebase Auth. Cada request a RTDB incluye el token JWT del usuario autenticado, que es validado por las Security Rules.
- Las Security Rules garantizan que un usuario solo puede leer/escribir los establecimientos que le pertenecen.

### Clientes → Cloud Functions

- Los clientes **no llaman a Functions directamente** (no son HTTP endpoints en el MVP).
- Las Functions se disparan mediante **triggers de RTDB**: cuando el cliente escribe un nodo específico, la Function reacciona.
- Excepción: `generateAlerts` es una función programada (cron), sin trigger de cliente.

### Flujo de escritura (online)

```
1. Usuario realiza acción en la UI
2. ViewModel llama al Repository
3. Repository escribe en RTDB (operación instantánea, optimistic update)
4. RTDB trigger dispara la Cloud Function correspondiente
5. Cloud Function escribe eventos de trazabilidad, actualizaciones de estado, alertas
6. Los listeners del cliente reciben los cambios en tiempo real
7. UI se actualiza automáticamente
```

### Flujo de escritura (offline)

```
1. Usuario realiza acción en la UI
2. ViewModel llama al Repository
3. Repository escribe en RTDB → el SDK guarda la escritura en el cache local
4. La UI refleja el cambio inmediatamente (optimistic update local)
5. [sin conexión] La Cloud Function NO se dispara todavía
6. Al reconectar, el SDK aplica las escrituras pendientes al servidor en orden
7. Las Cloud Functions se disparan entonces, generando trazabilidad y alertas
```

> **Importante**: durante el período offline, las Cloud Functions no corren. Esto significa que los eventos de trazabilidad y las alertas se generan cuando se recupera conexión, no en el momento del registro. El usuario ve los datos locales correctos; la trazabilidad completa se consolida al sincronizar.

---

## Capas por cliente

### Capa de UI

- Renderiza el estado recibido del ViewModel.
- No contiene lógica de negocio ni acceso a datos.
- Emite eventos de usuario hacia el ViewModel (clicks, formularios).

### Capa ViewModel

- Transforma los datos del dominio en `UiState` que la UI puede renderizar.
- Contiene la lógica de presentación (validaciones de formulario, formateo de fechas).
- Llama al Repository para leer y escribir datos.
- **No conoce Firebase**. Solo habla con el Repository.

### Capa Repository

- Abstrae el acceso a Firebase RTDB.
- Expone métodos de dominio: `getAnimals(estId)`, `registerSanitaryActivity(activity)`, etc.
- Convierte los datos raw de RTDB (JSON) en modelos de dominio.
- Es la única capa que importa el SDK de Firebase.

### Modelos de dominio

- Structs/data classes que representan las entidades del negocio: `Animal`, `Lot`, `SanitaryActivity`, etc.
- Son independientes de Firebase: no tienen lógica de serialización específica del SDK.

---

## Entornos

| Entorno | Firebase Project | Uso |
|---|---|---|
| `development` | `rakka2-dev` | Desarrollo local con emuladores o proyecto dev |
| `production` | `rakka2-prod` | Datos reales de usuarios |

Cada cliente tiene su archivo de configuración por entorno. Los builds de release apuntan a producción.
