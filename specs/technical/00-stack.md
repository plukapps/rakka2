# Stack Tecnológico

## Resumen

| Capa | Tecnología | Versión mínima |
|---|---|---|
| Web (app + admin) | Next.js + TypeScript + Tailwind CSS | Next.js 14+ (App Router) |
| Android | Kotlin + Jetpack Compose + Coroutines | Kotlin 1.9+, Compose BOM 2024+ |
| iOS | Swift + SwiftUI + Combine | iOS 16+, Swift 5.9+ |
| Base de datos | Firebase Realtime Database | SDK v10+ |
| Autenticación | Firebase Authentication | Email/password |
| Lógica backend | Firebase Cloud Functions | Node.js 20 runtime |
| Hosting web | Firebase Hosting (o Vercel) | — |
| Herramientas dev | Firebase CLI, Firebase Emulator Suite | firebase-tools 13+ |

---

## Justificación de decisiones

### Firebase Realtime Database (no Firestore)

Firebase RTDB fue elegido por el equipo. Implicancias a tener en cuenta durante el desarrollo:

- Los datos se almacenan como un **árbol JSON único**. No hay colecciones ni documentos.
- **No soporta queries compuestas** (no se puede filtrar por múltiples campos a la vez). Las queries se limitan a `orderByChild` + `equalTo`/`startAt`/`endAt` sobre un único campo.
- Para simular relaciones "muchos a muchos" o queries por campo secundario, se requieren **índices de denormalización** escritos manualmente (ej: `lot_animals/{estId}/{lotId}/{animalId}: true`).
- La **persistencia offline** está integrada en los SDK nativos y JS. Con una línea de configuración, el SDK guarda datos localmente y aplica escrituras pendientes al reconectar.
- Los datos se leen en tiempo real vía listeners (`.on("value", ...)` en JS, `observe` en iOS, `addValueEventListener` en Android).

### Next.js para web

- Cubre tanto la app mobile-first (usuario en campo desde el navegador) como el panel de administración en desktop.
- App Router con React Server Components para rutas estáticas/SSR y Client Components para datos en tiempo real desde Firebase.
- Tailwind CSS para UI consistente y rápida.

### Arquitectura MVVM en mobile

- **Android**: ViewModel + StateFlow. El ViewModel expone un `UiState` como `StateFlow<T>`. La UI en Compose observa con `collectAsStateWithLifecycle()`.
- **iOS**: ViewModel como `ObservableObject` con propiedades `@Published`. Las vistas SwiftUI usan `@StateObject` o `@ObservedObject`.
- En ambos casos, el ViewModel no conoce Firebase: habla con un Repository que abstrae el acceso a datos.

### Firebase Cloud Functions

- Lógica que no puede quedar solo en el cliente: generación de trazabilidad, validación final de carencia antes de confirmar egreso comercial, alertas programadas.
- Runtime: Node.js 20 con TypeScript.
- Se usa la v2 de Cloud Functions (basada en Cloud Run).

---

## Herramientas de desarrollo

### Firebase Emulator Suite

Todos los servicios de Firebase (RTDB, Auth, Functions) tienen emuladores locales. El equipo debe usar los emuladores durante el desarrollo para no afectar datos de producción y trabajar sin conexión.

```
firebase emulators:start
```

Emuladores a activar: `auth`, `database`, `functions`.

### Firebase CLI

```bash
# Instalar
npm install -g firebase-tools

# Login
firebase login

# Inicializar proyecto
firebase init
```

Seleccionar: `Realtime Database`, `Functions`, `Hosting` (si se usa Firebase Hosting).

---

## Variables de entorno y configuración

- Cada cliente tiene su archivo de configuración de Firebase (`google-services.json` en Android, `GoogleService-Info.plist` en iOS, variables de entorno en Next.js).
- **Nunca commitear** archivos de configuración con claves de producción. Usar `.gitignore` para excluirlos y documentar las variables necesarias en un `.env.example`.
- El proyecto Firebase tendrá dos entornos: `development` y `production` (dos proyectos Firebase separados o dos apps dentro del mismo proyecto).
