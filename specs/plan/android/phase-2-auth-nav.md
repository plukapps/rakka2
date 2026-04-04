# Android — Fase 2: Auth y navegación

**Estado:** ⏳ pendiente  
**Depende de:** Fase 1 ✅

## Objetivo

Construir la navegación completa de la app con todas las rutas, las pantallas de login/register mockeadas, el layout base con bottom navigation bar y el selector de establecimiento activo.

---

## Tareas

### Navegación (`ui/navigation/`)
- [ ] `Screen.kt` — sealed class con todas las rutas de la app (ver lista abajo)
- [ ] `NavGraph.kt` — `NavHost` con todas las rutas, separando auth flow y app flow
- [ ] `MainActivity.kt` — `@AndroidEntryPoint`, `setContent { NavGraph() }`

### Rutas definidas
```
Auth: Login, Register
App:  Home, AnimalList, AnimalDetail(animalId), AnimalEntry,
      LotList, LotDetail(lotId), LotNew,
      ActivitySelector, SanitaryNew, CommercialNew,
      FieldControlNew, MovementNew, ReproductionNew, GeneralNew,
      RfidReader,
      Traceability(animalId), Alerts,
      EstablishmentList, EstablishmentNew, EstablishmentDetail(estId)
```

### Pantallas de auth
- [ ] `LoginScreen.kt` + `LoginViewModel.kt` — email/password, mock login (cualquier credencial), navega a Home
- [ ] `RegisterScreen.kt` + `RegisterViewModel.kt` — nombre/email/password, mock register

### Layout base de la app
- [ ] `MainScaffold.kt` — Scaffold con `BottomNavigation` y slot de contenido
- [ ] Bottom nav items: Inicio, Animales, Lotes, Actividades, Alertas
- [ ] `TopAppBar` con nombre del establecimiento activo y botón de cambio
- [ ] `EstablishmentSelectorDialog.kt` — dialog/bottomsheet para cambiar establecimiento activo

### Pantallas stub
- [ ] Crear todas las pantallas como stubs con `Text("NombrePantalla")` para que el NavGraph compile

### Tema visual
- [ ] `ui/theme/Theme.kt` — Material3 theme
- [ ] `ui/theme/Color.kt` — paleta de colores del producto
- [ ] `ui/theme/Type.kt` — tipografía

---

## Archivos a crear

```
code/android-app/app/src/main/java/com/rakka/app/
├── MainActivity.kt
├── ui/
│   ├── navigation/Screen.kt
│   ├── navigation/NavGraph.kt
│   ├── theme/Theme.kt, Color.kt, Type.kt
│   ├── components/MainScaffold.kt
│   ├── components/EstablishmentSelectorDialog.kt
│   └── screens/
│       ├── auth/LoginScreen.kt, LoginViewModel.kt
│       ├── auth/RegisterScreen.kt, RegisterViewModel.kt
│       └── [todas las demás como stubs]
```

---

## Criterios de done

- [ ] Login con cualquier credencial navega a Home
- [ ] Bottom navigation funciona entre las 5 tabs
- [ ] Cambiar establecimiento desde el TopAppBar actualiza el nombre visible
- [ ] Todas las rutas del NavGraph son navegables sin crash
