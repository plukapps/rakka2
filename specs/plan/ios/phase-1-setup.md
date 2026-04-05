# iOS — Fase 1: Setup y arquitectura base

**Estado:** ⏳ pendiente

## Objetivo

Crear el proyecto Xcode, configurar dependencias via SPM y construir toda la capa de datos en memoria (modelos, mock data, repositories). Sin UI todavía.

Spec técnica: `specs/technical/08-cliente-ios.md`

---

## Tareas

### Proyecto
- [ ] Crear proyecto en Xcode en `code/ios-app/`: App, SwiftUI, Swift, nombre `Rakka`
- [ ] Configurar deployment target: iOS 16
- [ ] Agregar Firebase via Swift Package Manager: `FirebaseDatabase`, `FirebaseAuth`
- [ ] Agregar `GoogleService-Info.plist` (dev) — no commitear producción

### Modelos de dominio (`Models/`)
- [ ] `Animal.swift` — struct con todos los campos + enums `AnimalStatus`, `AnimalCategory`, `AnimalSex`, `EntryType`, `ExitType`
- [ ] `Lot.swift` — `Lot`, `LotStatus`
- [ ] `Activity.swift` — `Activity` base + `ActivityType` (incluye `reading`), `SelectionMethod` + extensiones por tipo
- [ ] `TraceabilityEvent.swift` — `TraceabilityEvent`, `TraceabilityEventType`
- [ ] `Alert.swift` — `Alert`, `AlertType`, `AlertUrgency`, `AlertStatus`
- [ ] `Establishment.swift` — `Establishment`, `EstablishmentStatus`
- [ ] `UserProfile.swift`

### Mock data (`Core/Mock/MockData.swift`)
- [ ] `enum MockData` con propiedades estáticas: mismos datos que web y Android
- [ ] Génerar IDs únicos con `UUID().uuidString`

### Mock store (`Core/Mock/MockStore.swift`)
- [ ] `@MainActor class MockStore: ObservableObject`
- [ ] `@Published var animals: [String: [Animal]]` (por estId)
- [ ] `@Published var lots`, `activities`, `traceability`, `alerts`, `establishments`
- [ ] Métodos mutadores: `createAnimal()`, `updateAnimal()`, `createActivity()`, etc.
- [ ] Inicializado con `MockData` en `init()`

### Repositories (`Repositories/`)
- [ ] `AnimalRepository.swift` — `func animals(estId:) -> AnyPublisher<[Animal], Never>`; `func createAnimal(_:)`
- [ ] `LotRepository.swift`
- [ ] `ActivityRepository.swift` — `func createActivity(_:)` genérico (incluye tipo `reading`)
- [ ] `TraceabilityRepository.swift`
- [ ] `AlertRepository.swift`
- [ ] `EstablishmentRepository.swift`

### Estado global
- [ ] `Core/State/AppState.swift` — `@MainActor ObservableObject`: `activeEstablishmentId`, `setActiveEstablishment()`
- [ ] `Core/State/AuthState.swift` — `@MainActor ObservableObject`: `currentUser: UserProfile?`, `login()` mock, `logout()`

---

## Archivos a crear

```
code/ios-app/Rakka/
├── RakkaApp.swift
├── Models/Animal.swift, Lot.swift, Activity.swift,
│         TraceabilityEvent.swift, Alert.swift, Establishment.swift, UserProfile.swift
├── Core/
│   ├── Mock/MockData.swift, MockStore.swift
│   └── State/AppState.swift, AuthState.swift
└── Repositories/AnimalRepository.swift, LotRepository.swift, ActivityRepository.swift,
                  TraceabilityRepository.swift,
                  AlertRepository.swift, EstablishmentRepository.swift
```

---

## Criterios de done

- [ ] El proyecto compila sin warnings en Xcode
- [ ] `MockStore` se inicializa con los datos mock y expone `@Published` actualizables
- [ ] Un `PreviewProvider` de prueba puede leer animales del `MockStore`
