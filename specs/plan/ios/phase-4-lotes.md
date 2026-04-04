# iOS — Fase 4: Módulo Lotes

**Estado:** ⏳ pendiente  
**Depende de:** Fase 3 ✅

## Objetivo

Implementar gestión de lotes con listado, creación, detalle y operaciones de movimiento de animales.

Spec funcional: `specs/functional/03-lotes.md`

---

## Tareas

### LotListView
- [ ] `LotListViewModel.swift` + `LotListView.swift` — lista de lotes activos con `LotRowView`
- [ ] `LotRowView.swift` — nombre, contador de animales, fecha
- [ ] Toggle "Mostrar disueltos"
- [ ] Botón "+" → `LotNewView`

### LotNewView
- [ ] `LotNewViewModel.swift` + `LotNewView.swift` — `Form` con nombre y descripción
- [ ] `MultiAnimalPickerView.swift` — selector de animales para asignar al lote al crear

### LotDetailView
- [ ] `LotDetailViewModel.swift` + `LotDetailView.swift`:
  - Header con métricas
  - Lista de animales del lote (reusa `AnimalRowView`)
  - Búsqueda dentro del lote
  - Toolbar: "Agregar animales", "Registrar actividad", "Disolver"
- [ ] `AddAnimalsSheet.swift` — `.sheet` con buscador de animales activos
- [ ] `DissolveLotAlert.swift` — `Alert` de confirmación

---

## Criterios de done

- [ ] Mover animal entre lotes actualiza contadores inmediatamente
- [ ] Disolver lote desvincula todos sus animales
