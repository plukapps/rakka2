# Android — Fase 4: Módulo Lotes

**Estado:** ⏳ pendiente  
**Depende de:** Fase 3 ✅

## Objetivo

Implementar gestión de lotes: listado, creación, detalle con animales y operaciones de movimiento.

Spec funcional: `specs/functional/03-lotes.md`

---

## Tareas

### LotList
- [ ] `LotListViewModel.kt` + `LotListScreen.kt` — lista de lotes activos con nombre, contador de animales, fecha
- [ ] `LotCard.kt` — card de lote con acciones rápidas
- [ ] Toggle "Mostrar disueltos"
- [ ] FAB "+" → `LotNew`

### LotNew
- [ ] `LotNewViewModel.kt` + `LotNewScreen.kt` — nombre (obligatorio), descripción
- [ ] Selector multi-animal opcional para asignar al crear (buscador por caravana)

### LotDetail
- [ ] `LotDetailViewModel.kt` + `LotDetailScreen.kt`:
  - Header con nombre, descripción, estado, contador
  - `LazyColumn` de animales del lote (reusa `AnimalCard`)
  - Búsqueda dentro del lote
  - Botón "Agregar animales" → `AddAnimalsToLotSheet`
  - Botón "Registrar actividad" → `ActivitySelector` con lotId pre-seleccionado
  - Botón "Disolver lote" → `DissolveLotDialog`
- [ ] `AddAnimalsToLotSheet.kt` — BottomSheet con buscador de animales activos
- [ ] `DissolveLotDialog.kt` — confirmación con lista de animales que quedan sin lote

---

## Criterios de done

- [ ] 4 lotes mock con contadores correctos
- [ ] Mover animal entre lotes actualiza ambos contadores inmediatamente
- [ ] Disolver lote desvincula todos sus animales
