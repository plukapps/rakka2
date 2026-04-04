# Cliente iOS — Swift + SwiftUI

## Stack

- **Lenguaje**: Swift 5.9+
- **UI**: SwiftUI
- **Async/reactive**: Combine + async/await
- **Arquitectura**: MVVM
- **Navegación**: NavigationStack (iOS 16+)
- **Firebase SDK**: FirebaseDatabase, FirebaseAuth (via Swift Package Manager)
- **Versión mínima**: iOS 16

---

## Integración de Firebase (Swift Package Manager)

```
File → Add Package Dependencies
URL: https://github.com/firebase/firebase-ios-sdk
Productos a agregar: FirebaseDatabase, FirebaseAuth
```

No usar CocoaPods. SPM es el método oficial y recomendado actualmente.

---

## Estructura de carpetas

```
Rakka/
├── RakkaApp.swift                    ← @main, configuración de Firebase, AppDelegate
├── GoogleService-Info.plist          ← NO commitear en producción
│
├── Core/
│   ├── Firebase/
│   │   ├── FirebaseConfig.swift      ← Inicialización y referencias singleton
│   │   └── DatabasePaths.swift      ← Constantes de paths del RTDB
│   └── State/
│       ├── AuthState.swift           ← @MainActor ObservableObject con usuario actual
│       └── AppState.swift            ← @MainActor ObservableObject con est. activo, isOffline
│
├── Models/
│   ├── Animal.swift
│   ├── Lot.swift
│   ├── SanitaryActivity.swift
│   ├── CommercialActivity.swift
│   ├── TraceabilityEvent.swift
│   └── Alert.swift
│
├── Repositories/
│   ├── AnimalRepository.swift
│   ├── LotRepository.swift
│   ├── ActivityRepository.swift
│   ├── TraceabilityRepository.swift
│   └── AlertRepository.swift
│
└── Features/
    ├── Auth/
    │   ├── LoginView.swift
    │   ├── LoginViewModel.swift
    │   ├── RegisterView.swift
    │   └── RegisterViewModel.swift
    ├── Home/
    │   ├── HomeView.swift
    │   └── HomeViewModel.swift
    ├── Animals/
    │   ├── AnimalListView.swift
    │   ├── AnimalListViewModel.swift
    │   ├── AnimalDetailView.swift
    │   ├── AnimalDetailViewModel.swift
    │   ├── AnimalEntryView.swift
    │   └── AnimalEntryViewModel.swift
    ├── Lots/
    │   ├── LotListView.swift
    │   ├── LotListViewModel.swift
    │   ├── LotDetailView.swift
    │   └── LotDetailViewModel.swift
    ├── Activities/
    │   ├── SanitaryActivityView.swift
    │   ├── SanitaryActivityViewModel.swift
    │   ├── CommercialActivityView.swift
    │   └── CommercialActivityViewModel.swift
    ├── Traceability/
    │   ├── TraceabilityView.swift
    │   └── TraceabilityViewModel.swift
    └── Alerts/
        ├── AlertsView.swift
        └── AlertsViewModel.swift
```

---

## Arquitectura MVVM

### Capa de datos: Repository

Los repositories usan `AsyncStream` o `Combine` para exponer datos en tiempo real:

```swift
class AnimalRepository {
    private let db = Database.database().reference()

    func observeAnimals(estId: String) -> AsyncStream<[Animal]> {
        AsyncStream { continuation in
            let ref = db.child("animals/\(estId)")
            let handle = ref.observe(.value) { snapshot in
                var animals: [Animal] = []
                for child in snapshot.children {
                    if let snap = child as? DataSnapshot,
                       let animal = Animal(snapshot: snap) {
                        animals.append(animal)
                    }
                }
                continuation.yield(animals)
            }
            continuation.onTermination = { _ in
                ref.removeObserver(withHandle: handle)
            }
        }
    }

    func createAnimal(estId: String, animal: Animal) async throws -> String {
        let ref = db.child("animals/\(estId)").childByAutoId()
        try await ref.setValue(animal.toDictionary())
        return ref.key!
    }
}
```

### Modelos con `Decodable` desde DataSnapshot

```swift
struct Animal: Identifiable {
    let id: String
    let caravana: String
    let status: AnimalStatus
    let category: AnimalCategory?
    let lotId: String?
    let hasActiveCarencia: Bool
    let carenciaExpiresAt: Date?
    // ...

    init?(snapshot: DataSnapshot) {
        guard let dict = snapshot.value as? [String: Any],
              let caravana = dict["caravana"] as? String,
              let statusRaw = dict["status"] as? String,
              let status = AnimalStatus(rawValue: statusRaw)
        else { return nil }

        self.id = snapshot.key
        self.caravana = caravana
        self.status = status
        self.lotId = dict["lotId"] as? String
        self.hasActiveCarencia = dict["hasActiveCarencia"] as? Bool ?? false
        // ...
    }

    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "caravana": caravana,
            "status": status.rawValue,
            "hasActiveCarencia": hasActiveCarencia,
        ]
        if let lotId { dict["lotId"] = lotId }
        return dict
    }
}
```

### Capa de ViewModel

```swift
@MainActor
class AnimalListViewModel: ObservableObject {
    @Published var animals: [Animal] = []
    @Published var isLoading = true
    @Published var error: String?

    private let repository: AnimalRepository
    private var observeTask: Task<Void, Never>?

    init(repository: AnimalRepository = AnimalRepository()) {
        self.repository = repository
    }

    func startObserving(estId: String) {
        observeTask?.cancel()
        observeTask = Task {
            isLoading = true
            for await updatedAnimals in repository.observeAnimals(estId: estId) {
                self.animals = updatedAnimals
                self.isLoading = false
            }
        }
    }

    deinit {
        observeTask?.cancel()
    }
}
```

### Capa de UI: SwiftUI

```swift
struct AnimalListView: View {
    @StateObject private var viewModel = AnimalListViewModel()
    @EnvironmentObject private var appState: AppState

    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView()
            } else if let error = viewModel.error {
                Text(error).foregroundColor(.red)
            } else {
                List(viewModel.animals) { animal in
                    NavigationLink(value: animal.id) {
                        AnimalRowView(animal: animal)
                    }
                }
            }
        }
        .onAppear {
            if let estId = appState.activeEstablishmentId {
                viewModel.startObserving(estId: estId)
            }
        }
    }
}
```

---

## Navegación con NavigationStack

```swift
// RootView.swift
struct RootView: View {
    @EnvironmentObject var authState: AuthState

    var body: some View {
        if authState.user == nil {
            AuthFlow()
        } else {
            MainTabView()
        }
    }
}

// MainTabView.swift - Navegación principal con tabs
struct MainTabView: View {
    var body: some View {
        TabView {
            NavigationStack { HomeView() }
                .tabItem { Label("Inicio", systemImage: "house") }
            NavigationStack { AnimalListView() }
                .tabItem { Label("Animales", systemImage: "hare") }
            NavigationStack { LotListView() }
                .tabItem { Label("Lotes", systemImage: "square.stack.3d.up") }
            NavigationStack { AlertsView() }
                .tabItem { Label("Alertas", systemImage: "bell") }
        }
    }
}
```

---

## Configuración de Firebase

### `RakkaApp.swift`

```swift
import SwiftUI
import FirebaseCore
import FirebaseDatabase

@main
struct RakkaApp: App {
    @StateObject private var authState = AuthState()
    @StateObject private var appState = AppState()

    init() {
        FirebaseApp.configure()
        // Habilitar persistencia offline
        Database.database().isPersistenceEnabled = true
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(authState)
                .environmentObject(appState)
        }
    }
}
```

---

## Estado global con EnvironmentObject

En lugar de un contenedor de DI, iOS usa `@EnvironmentObject` para inyectar el estado global:

```swift
// AppState.swift
@MainActor
class AppState: ObservableObject {
    @Published var activeEstablishmentId: String?
    @Published var isOffline: Bool = false

    func setActiveEstablishment(_ estId: String) {
        activeEstablishmentId = estId
        // Activar keepSynced para este establecimiento
        let db = Database.database().reference()
        db.child("animals/\(estId)").keepSynced(true)
        db.child("lots/\(estId)").keepSynced(true)
        db.child("activities/\(estId)").keepSynced(true)
        db.child("traceability/\(estId)").keepSynced(true)
        db.child("alerts/\(estId)").keepSynced(true)
    }
}
```

---

## Consideraciones MVP

- **Sin CoreData / SwiftData**: el offline lo gestiona el SDK de Firebase. No se implementa persistencia local adicional.
- **iOS 16+ mínimo**: permite `NavigationStack`, `Charts`, y APIs modernas de Swift.
- **`@MainActor` en ViewModels**: garantiza que las actualizaciones de `@Published` ocurren en el hilo principal, evitando crashes de UI.
- **Manejo de errores**: para MVP, los errores se muestran con mensajes de texto simples. No se implementan pantallas de error elaboradas.
