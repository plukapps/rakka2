# iOS — Fase 2: Auth y navegación

**Estado:** ⏳ pendiente  
**Depende de:** Fase 1 ✅

## Objetivo

Construir `RakkaApp`, las pantallas de login/register mockeadas, el layout con `TabView` + `NavigationStack` por tab y el selector de establecimiento activo.

---

## Tareas

### App entry point
- [ ] `RakkaApp.swift` — `@main`, configura Firebase, inyecta `AppState` y `AuthState` como `@StateObject`, muestra `RootView`
- [ ] `RootView.swift` — si `authState.currentUser == nil` → `AuthFlow`; si no → `MainTabView`

### Auth
- [ ] `LoginView.swift` + `LoginViewModel.swift` — email/password, mock login (cualquier credencial), navega a main
- [ ] `RegisterView.swift` + `RegisterViewModel.swift` — nombre/email/password, mock register

### Navegación principal
- [ ] `MainTabView.swift` — `TabView` con 5 tabs: Inicio, Animales, Lotes, Actividades, Alertas
- [ ] Cada tab tiene su propio `NavigationStack`
- [ ] `AppHeader.swift` — view modifier o toolbar con nombre del establecimiento activo + botón cambiar
- [ ] `EstablishmentSelectorSheet.swift` — `.sheet` con lista de establecimientos para cambiar activo

### Pantallas stub
- [ ] Crear todas las `View` como stubs con `Text("NombreVista")` para que el `TabView` compile

### Tema visual
- [ ] `Assets.xcassets` — colores del producto como Color Assets (para uso en SwiftUI)
- [ ] `Core/Theme/AppColors.swift` — extensión de `Color` con los colores semánticos del producto

---

## Criterios de done

- [ ] Login con cualquier credencial muestra el `MainTabView`
- [ ] Las 5 tabs son navegables
- [ ] Cambiar establecimiento activo actualiza el nombre en el toolbar
- [ ] Todas las rutas stub son accesibles sin crash
