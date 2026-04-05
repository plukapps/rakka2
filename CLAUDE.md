# CLAUDE.md — Rakka2 (App de Gestión Ganadera)

## Proyecto

App de gestión ganadera para productores rurales y veterinarios. Multi-plataforma (iOS, Android, Web), offline-first, con Firebase como backend.

**Specs completas**: `specs/functional/` (qué hace), `specs/technical/` (cómo se hace), `specs/design/` (cómo se ve) y `specs/plan/` (estado de implementación).
**Antes de escribir código en cualquier módulo, leer el spec correspondiente.**

---

## Estructura del repo

```
specs/
  functional/        ← Reglas de negocio, flujos, entidades
  technical/         ← Stack, arquitectura, modelo de datos, convenciones
  design/            ← Specs de diseño visual por módulo (desktop web)
  plan/              ← Estado de implementación por plataforma y fase
    web/             ← Fases de la web app
    android/         ← Fases de la app Android
    ios/             ← Fases de la app iOS
    functions/       ← Fases de Cloud Functions
code/
  web-app/           ← Next.js + TypeScript + Tailwind
  android-app/       ← Kotlin + Jetpack Compose
  ios-app/           ← Swift + SwiftUI (pendiente de crear)
  functions/         ← Firebase Cloud Functions (Node.js + TypeScript)
```

---

## Stack (resumen rápido)

| Capa | Tech |
|---|---|
| Web | Next.js 14 App Router, TypeScript, Tailwind, Zustand |
| Android | Kotlin, Jetpack Compose, Coroutines/Flow, Hilt, MVVM |
| iOS | Swift, SwiftUI, Combine, MVVM |
| Backend | Firebase Realtime Database, Auth (email/password), Cloud Functions v2 (Node 20 TS) |
| Offline | RTDB persistence nativa (`setPersistenceEnabled(true)`) |

Detalle completo: `specs/technical/00-stack.md`

---

## Modelo de datos (Firebase RTDB)

Nodos raíz: `users / establishments / animals / lots / lot_animals / activities / traceability / alerts`

- `traceability` y `alerts` son **solo lectura para el cliente** — solo las Cloud Functions escriben ahí.
- `lot_animals/{estId}/{lotId}/{animalId}: true` es el índice de denormalización para animales por lote.
- `hasActiveCarencia` y `carenciaExpiresAt` en el animal son campos calculados por Cloud Function — no calcular en el cliente.

Modelo completo: `specs/technical/02-modelo-de-datos.md`

---

## Reglas de negocio críticas

1. La **caravana** es inmutable. Nunca permitir editarla tras el ingreso.
2. Un animal **egresado** no puede recibir actividades ni ser asignado a lotes.
3. Un animal con **carencia activa** no puede incluirse en una venta/despacho.
4. Actividad sobre lote → se crea **un registro individual por animal**. La Function maneja esto; el cliente crea una actividad por animal directamente.
5. Los **eventos de trazabilidad** no se eliminan ni editan. Solo se agregan correcciones.

---

## Convenciones por plataforma

### Android (Kotlin/Compose)
- Arquitectura: `UI (Compose) → ViewModel → Repository → Firebase SDK`
- Estado: `data class XxxUiState`, expuesto como `StateFlow` desde el ViewModel
- Async: `callbackFlow` para listeners de RTDB, `suspend` + `.await()` para escrituras
- DI: Hilt. Proveer `FirebaseDatabase` y `FirebaseAuth` desde `FirebaseModule`
- Navegación: `Screen` sealed class + Navigation Compose

### iOS (Swift/SwiftUI)
- Arquitectura: `SwiftUI View → @MainActor ViewModel (ObservableObject) → Repository → Firebase SDK`
- Estado: propiedades `@Published` en ViewModel, `@StateObject` en la vista raíz
- Async: `AsyncStream` para listeners RTDB, `async/await` para escrituras
- Inyección: `@EnvironmentObject` para `AuthState` y `AppState`
- Navegación: `NavigationStack` con `NavigationLink(value:)`

### Web (Next.js)
- Client Components para todo lo que use Firebase listeners o estado de Zustand
- Repositories en `lib/repositories/` con `onValue` de Firebase + custom hooks
- Estado global: `authStore` y `appStore` en Zustand
- No usar `getServerSideProps` con datos de RTDB

### Cloud Functions
- Triggers de RTDB (no HTTP endpoints en MVP)
- Usar Admin SDK (omite Security Rules)
- Hacer todas las funciones **idempotentes**
- Usar el `activityId` como parte del `eventId` de trazabilidad para evitar duplicados

---

## Comandos frecuentes

```bash
# Firebase emuladores (desarrollo)
firebase emulators:start

# Web
cd code/web-app && npm run dev

# Android
cd code/android-app && ./gradlew assembleDebug

# Functions (compilar TypeScript)
cd code/functions && npm run build
```

---

## Reglas para Claude

### Specs como fuente de verdad — REGLA PRINCIPAL

**Las specs son la única fuente de verdad. El código existe para implementar las specs, nunca al revés.**

#### Orden obligatorio para cualquier tarea de implementación:

1. **Leer** el spec del módulo afectado antes de escribir una sola línea de código.
2. **Actualizar la spec primero** si la tarea introduce algo nuevo (campo, flujo, regla, decisión técnica) — la spec se actualiza *antes* de implementar, no después.
3. **Implementar** el código alineado con la spec ya actualizada.
4. **Verificar** al terminar que specs y código están sincronizados.

Este orden es siempre: **spec → código**. No hay excepciones.

#### Cambios que SIEMPRE requieren actualizar spec antes del código:
- Cualquier cambio visual: layout, columnas, spacing, colores, radius, tipografía
- Cualquier cambio de comportamiento en UI: orden de elementos, condiciones de visibilidad
- Cualquier campo, flujo o regla nueva

→ Si dudás si algo necesita spec update: sí lo necesita. No hay excepciones por "es pequeño".

#### Qué hacer en cada caso:

- **Nueva feature o cambio de comportamiento**: actualizar `specs/functional/` → luego implementar.
- **Nueva decisión técnica, nuevo campo, nuevo patrón**: actualizar `specs/technical/` → luego implementar.
- **Cambio de diseño visual**: actualizar `specs/design/` → luego implementar.
- **Avance de fase**: actualizar `specs/plan/{plataforma}/` para reflejar el estado real.
- **Conflicto spec vs. código**: la spec manda — salvo que el usuario indique explícitamente lo contrario.
- **Algo en el código que no tiene spec**: crear o actualizar la spec correspondiente antes de continuar.

Specs funcionales: `specs/functional/` — qué hace el sistema  
Specs técnicas: `specs/technical/` — cómo está construido  
Specs de diseño: `specs/design/` — cómo se ve (layout, componentes, estados visuales)  
Planes: `specs/plan/{web,android,ios,functions}/` — estado de implementación por fase

---

### Hacer siempre
- **Leer el spec del módulo antes de implementar cualquier feature** — sin excepción
- Usar `keepSynced(true)` al cambiar de establecimiento activo
- Manejar el estado `isOffline` visible en UI
- En Android: limpiar listeners en `awaitClose {}` del `callbackFlow`
- En iOS: cancelar Tasks en `deinit` del ViewModel

### No hacer
- No escribir en `/traceability/` ni `/alerts/` desde el cliente
- No calcular `hasActiveCarencia` en el cliente — leerlo del nodo del animal
- No usar Firestore (el proyecto usa Realtime Database)
- No implementar Room ni Core Data — el offline lo maneja el SDK de RTDB
- No agregar tests en MVP — documentado como fuera de alcance
- No agregar features fuera del alcance definido en `specs/functional/00-overview.md`
- No hacer `git push` sin confirmación explícita del usuario
- No hacer `firebase deploy` sin confirmación explícita del usuario

### Eficiencia de tokens
- Si ya leíste un archivo en esta sesión, no lo releas a menos que haya cambiado
- Para buscar convenciones, leer primero este CLAUDE.md antes de explorar el código
- Al crear un archivo nuevo, seguir el patrón existente más cercano en el mismo módulo

## Git workflow

- Branches: `feature/nombre-corto` o `hotfix/descripcion`
- PRs contra `main`
- Usar `gh` CLI para crear PRs (instalar con `brew install gh`)