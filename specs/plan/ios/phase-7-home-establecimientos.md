# iOS — Fase 7: Home y Establecimientos

**Estado:** ⏳ pendiente  
**Depende de:** Fase 6 ✅

## Objetivo

Implementar la home screen y la gestión de establecimientos. Última fase porque consume todos los módulos.

---

## Tareas

### HomeView
- [ ] `HomeViewModel.swift` + `HomeView.swift`:
  - Header con establecimiento activo + botón cambiar (`.sheet` con `EstablishmentSelectorSheet`)
  - `Section` actividad reciente: últimas 5, reusa `ActivityFeedRowView`
  - `Section` próximas acciones: 3 alertas priorizadas, reusa `AlertRowView`
  - Grid de accesos rápidos: 4 botones (`QuickActionGrid`)
  - `SearchBar` con resultados en `.searchable` overlay
- [ ] `QuickActionGrid.swift` — grid 2x2 de acciones
- [ ] `ActivityFeedRowView.swift` — icono de tipo, descripción, fecha
- [ ] Estado onboarding si no hay establecimientos

### Establecimientos
- [ ] `EstablishmentListView.swift` + VM — lista con botón "Seleccionar" y "+"
- [ ] `EstablishmentNewView.swift` + VM — `Form` con nombre, descripción, ubicación
- [ ] `EstablishmentDetailView.swift` + VM — ver/editar, métricas, archivar

---

## Criterios de done

- [ ] Home muestra datos reales del `MockStore`
- [ ] `.searchable` encuentra animales por caravana parcial
- [ ] Cambiar establecimiento activo actualiza toda la app reactivamente
- [ ] App completa navegable sin crash
