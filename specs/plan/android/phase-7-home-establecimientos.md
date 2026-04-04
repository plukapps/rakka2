# Android — Fase 7: Home y Establecimientos

**Estado:** ⏳ pendiente  
**Depende de:** Fase 6 ✅

## Objetivo

Implementar la home screen orientada a gestión y la gestión de establecimientos. Es la última fase porque consume datos de todos los módulos.

---

## Tareas

### Home (`HomeScreen.kt`)
- [ ] `HomeViewModel.kt` — combina actividades recientes + alertas priorizadas + establecimiento activo
- [ ] `HomeScreen.kt`:
  - Header con nombre del establecimiento + botón cambiar
  - Sección "Actividad reciente": últimas 5 actividades, reusa `ActivityFeedItem`
  - Sección "Próximas acciones": primeras 3 alertas, reusa `AlertItem`
  - Grid de accesos rápidos: Registrar actividad, Ingresar animal, Ver lotes, Ver animales
  - `SearchBar` con búsqueda por caravana → navega al perfil del animal
- [ ] `QuickActionGrid.kt` — grid 2x2 de accesos rápidos
- [ ] Estado onboarding si no hay establecimientos

### Establecimientos
- [ ] `EstablishmentListScreen.kt` + VM — lista de establecimientos, botón seleccionar, botón crear
- [ ] `EstablishmentNewScreen.kt` + VM — nombre, descripción, ubicación
- [ ] `EstablishmentDetailScreen.kt` + VM — ver/editar datos, métricas (animales, lotes), archivar

---

## Criterios de done

- [ ] Home muestra datos reales del mock store
- [ ] Búsqueda por caravana parcial encuentra animales
- [ ] Cambiar establecimiento activo actualiza toda la app
- [ ] Crear establecimiento → se selecciona automáticamente como activo
- [ ] App completa navegable de punta a punta sin crash
