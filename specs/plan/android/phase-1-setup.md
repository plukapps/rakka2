# Android — Fase 1: Setup y arquitectura base

**Estado:** ⏳ pendiente

## Objetivo

Inicializar el proyecto Android y construir toda la capa de datos en memoria (modelos, mock data, repositories, DI). Sin UI todavía. Al final de esta fase, los ViewModels pueden obtener datos del mock store.

Spec técnica: `specs/technical/07-cliente-android.md`

---

## Tareas

### Proyecto
- [ ] Crear proyecto en Android Studio en `code/android-app/`: Empty Activity, Kotlin, min SDK 26
- [ ] Configurar Gradle (Kotlin DSL): agregar BOM de Compose, Hilt, Firebase, Coroutines, Navigation
- [ ] Agregar `google-services.json` (dev) — no commitear producción
- [ ] Habilitar `buildFeatures { compose = true }` en `build.gradle.kts`

### Dependencias (`build.gradle.kts`)
- [ ] `androidx.compose:compose-bom`
- [ ] `androidx.compose.ui`, `material3`, `ui-tooling-preview`
- [ ] `androidx.lifecycle:lifecycle-viewmodel-compose`, `lifecycle-runtime-compose`
- [ ] `androidx.navigation:navigation-compose`
- [ ] `com.google.dagger:hilt-android`, `hilt-navigation-compose`
- [ ] `org.jetbrains.kotlinx:kotlinx-coroutines-android`
- [ ] `com.google.firebase:firebase-database-ktx`, `firebase-auth-ktx`

### Modelos de dominio (`data/model/`)
- [ ] `Animal.kt` — data class con todos los campos del spec + `AnimalStatus`, `AnimalCategory`, `AnimalSex`, `EntryType`, `ExitType`
- [ ] `Lot.kt` — `Lot`, `LotStatus`
- [ ] `Activity.kt` — `Activity` base unificada + `ActivityType` (incluye `reading`), `SelectionMethod`, subtipos por tipo
- [ ] `TraceabilityEvent.kt` — `TraceabilityEvent`, `TraceabilityEventType`
- [ ] `Alert.kt` — `Alert`, `AlertType`, `AlertUrgency`, `AlertStatus`
- [ ] `Establishment.kt` — `Establishment`, `EstablishmentStatus`
- [ ] `UserProfile.kt`

### Mock data (`data/mock/MockData.kt`)
- [ ] Mismos datos que el web: 2 establecimientos, 40 animales, 4 lotes, actividades variadas (incluyendo tipo reading), alertas
- [ ] Object singleton `MockData` con listas inmutables de datos iniciales

### Mock store (`data/mock/MockStore.kt`)
- [ ] `object MockStore`: estado mutable con `StateFlow` por entidad
- [ ] `fun getAnimals(estId: String): StateFlow<List<Animal>>`
- [ ] `fun updateAnimal(animal: Animal)`
- [ ] Idem para lotes, actividades, trazabilidad, alertas
- [ ] Inicializado con `MockData` al arrancar

### Repositories (`data/repository/`)
- [ ] `AnimalRepository.kt` — `getAnimals(estId): Flow<List<Animal>>`, `getAnimal(id)`, `createAnimal()`, `updateAnimal()`
- [ ] `LotRepository.kt` — `getLots(estId)`, `createLot()`, `updateLot()`, `dissolveLot()`
- [ ] `ActivityRepository.kt` — `getActivities(estId)`, `createActivity()` (incluye tipo `reading`)
- [ ] `TraceabilityRepository.kt` — `getTraceability(estId, animalId)`, `addEvent()`
- [ ] `AlertRepository.kt` — `getAlerts(estId)`, `dismissAlert()`
- [ ] `EstablishmentRepository.kt` — `getEstablishments(userId)`, `createEstablishment()`, `updateEstablishment()`

### Inyección de dependencias (Hilt)
- [ ] `RakkaApplication.kt` — `@HiltAndroidApp`, init de Firebase, `MockStore`
- [ ] `di/RepositoryModule.kt` — provee todos los repositories como singletons
- [ ] `di/AppStateModule.kt` — provee `AppStateHolder` (establecimiento activo, estado offline)

### Estado global
- [ ] `AppStateHolder.kt` — `@Singleton`, expone `activeEstablishmentId: StateFlow<String?>` y `isOffline: StateFlow<Boolean>`
- [ ] `AuthStateHolder.kt` — `@Singleton`, expone `currentUser: StateFlow<UserProfile?>`

---

## Archivos a crear

```
code/android-app/app/src/main/java/com/rakka/app/
├── RakkaApplication.kt
├── data/
│   ├── model/Animal.kt, Lot.kt, Activity.kt,
│   │         TraceabilityEvent.kt, Alert.kt, Establishment.kt, UserProfile.kt
│   ├── mock/MockData.kt
│   ├── mock/MockStore.kt
│   └── repository/AnimalRepository.kt, LotRepository.kt, ActivityRepository.kt,
│                   TraceabilityRepository.kt,
│                   AlertRepository.kt, EstablishmentRepository.kt
└── di/
    ├── RepositoryModule.kt
    └── AppStateModule.kt
```

---

## Criterios de done

- [ ] El proyecto compila sin errores (`./gradlew assembleDebug`)
- [ ] Hilt se inicializa correctamente (no crash en arranque)
- [ ] Un test manual en un `@HiltAndroidTest` o en un ViewModel temporal puede leer animales del MockStore
