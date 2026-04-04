# iOS — Fase 3: Módulo Animales

**Estado:** ⏳ pendiente  
**Depende de:** Fase 2 ✅

## Objetivo

Implementar listado de animales con filtros, formulario de ingreso y perfil del animal.

Spec funcional: `specs/functional/02-animales.md`

---

## Tareas

### AnimalListView
- [ ] `AnimalListViewModel.swift` — `@Published var animals`, filtros como `@Published`, suscripción a `AnimalRepository`
- [ ] `AnimalListView.swift` — `List` con `AnimalRowView`, `SearchBar`, `FilterChipsView` (lote, categoría, carencia)
- [ ] `AnimalRowView.swift` — caravana, categoría, lote, `CarenciaTag`
- [ ] `CarenciaTag.swift` — badge con días y color según urgencia
- [ ] `.toolbar` con botón "+" → `AnimalEntryView`
- [ ] Estado vacío con `ContentUnavailableView` (iOS 17) o `EmptyStateView` custom

### AnimalEntryView
- [ ] `AnimalEntryViewModel.swift` — validación de caravana única contra `MockStore`
- [ ] `AnimalEntryView.swift` — `Form` con todos los campos: caravana, categoría, raza, sexo, `DatePicker`, peso, procedencia, motivo, lote
- [ ] Al confirmar: `createAnimal()` + evento trazabilidad `"entry"` + `dismiss()`

### AnimalDetailView
- [ ] `AnimalDetailViewModel.swift` — carga animal + últimas actividades + alertas activas
- [ ] `AnimalDetailView.swift`:
  - `Section` de datos base
  - `Section` de lote actual con `NavigationLink` al lote
  - `Section` de carencia (destacada si activa)
  - `Section` de últimas actividades con "Ver trazabilidad" link
  - `Section` de acciones: "Registrar actividad", "Registrar egreso" (si activo)
- [ ] `ExitAnimalSheet.swift` — `.sheet` con tipo de egreso y observaciones

---

## Criterios de done

- [ ] Listado reactivo: nuevo animal aparece inmediatamente sin refetch manual
- [ ] Ingresar caravana duplicada muestra error inline en el campo
- [ ] Perfil muestra carencia con días restantes correctos
- [ ] Egreso cambia el estado del animal en toda la app
