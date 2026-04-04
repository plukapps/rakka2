# Scaffold iOS Screen

Crea una nueva pantalla iOS para el feature: $ARGUMENTS

Seguir exactamente la arquitectura definida en `specs/technical/08-cliente-ios.md`:

1. **`XxxViewModel`** — `@MainActor`, `ObservableObject`, propiedades `@Published`, recibe el Repository como dependencia en `init`
2. **`XxxView`** — SwiftUI View, usa `@StateObject` para el ViewModel, recibe `@EnvironmentObject var appState: AppState` si necesita el establecimiento activo

Ubicar en `code/ios-app/Rakka/Features/<Feature>/`.

No usar `DispatchQueue.main` manualmente — el `@MainActor` lo garantiza.
No hacer llamadas a Firebase desde la View — todo a través del ViewModel.
