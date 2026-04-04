# Android — Fase 3: Módulo Animales

**Estado:** ⏳ pendiente  
**Depende de:** Fase 2 ✅

## Objetivo

Implementar las tres pantallas del módulo de animales: listado con filtros, formulario de ingreso y perfil del animal.

Spec funcional: `specs/functional/02-animales.md`

---

## Tareas

### AnimalList
- [ ] `AnimalListViewModel.kt` — `UiState` con lista filtrada, carga desde `AnimalRepository`, filtros como estado
- [ ] `AnimalListScreen.kt` — `LazyColumn` de animales, barra de búsqueda, chips de filtro (lote, categoría, carencia)
- [ ] `AnimalCard.kt` — ítem de lista con caravana, categoría, lote, badge de carencia
- [ ] `CarenciaChip.kt` — badge con días restantes y color por urgencia (verde/amarillo/rojo)
- [ ] FAB "+" → `AnimalEntry`
- [ ] Estado vacío con `EmptyState` composable

### AnimalEntry
- [ ] `AnimalEntryViewModel.kt` — validación de caravana única contra MockStore
- [ ] `AnimalEntryScreen.kt` — formulario: caravana, categoría, raza, sexo, fecha nacimiento, peso ingreso, procedencia, motivo ingreso, lote opcional
- [ ] `DatePickerField.kt` — campo de fecha reutilizable
- [ ] Al confirmar: `createAnimal()` en repository + evento de trazabilidad `"entry"` + navegar al perfil

### AnimalDetail
- [ ] `AnimalDetailViewModel.kt` — carga animal + actividades recientes + alertas activas
- [ ] `AnimalDetailScreen.kt`:
  - Header: caravana + categoría + badge de estado
  - Sección datos: todos los atributos
  - Sección lote: nombre o "Sin lote", chip navegable
  - Sección carencia: si activa → producto + días restantes (destacado en rojo/naranja). Si no → "Sin carencia activa"
  - Sección últimas actividades: 3 más recientes
  - Botones: "Ver trazabilidad", "Registrar actividad", "Registrar egreso" (si activo)
- [ ] `ExitAnimalDialog.kt` — bottomsheet con tipo de egreso (muerte/transferencia) + observaciones

### Componentes UI base (reutilizables desde esta fase)
- [ ] `EmptyState.kt` — icono + título + descripción + acción opcional
- [ ] `SectionHeader.kt` — título de sección con línea divisoria
- [ ] `InfoRow.kt` — label + valor en fila

---

## Archivos a crear

```
code/android-app/.../ui/screens/animals/
├── AnimalListScreen.kt + AnimalListViewModel.kt
├── AnimalEntryScreen.kt + AnimalEntryViewModel.kt
├── AnimalDetailScreen.kt + AnimalDetailViewModel.kt
└── components/AnimalCard.kt, CarenciaChip.kt, ExitAnimalDialog.kt, DatePickerField.kt
```

---

## Criterios de done

- [ ] Listado muestra 40 animales mock, filtros funcionan
- [ ] Filtrar por carencia activa muestra exactamente 3
- [ ] Ingresar animal con caravana duplicada muestra error en el campo
- [ ] Animal nuevo aparece inmediatamente en el listado (Flow reactivo)
- [ ] Egreso por muerte cambia el estado del animal a egresado
