# Android — Fase 5: Actividades y RFID

**Estado:** ⏳ pendiente  
**Depende de:** Fase 4 ✅

## Objetivo

Implementar el selector de tipo de actividad, el componente de selección de animales (con RFID Bluetooth y carga de archivo), y los formularios de cada tipo de actividad.

Specs: `specs/functional/04-actividades-framework.md` y `04` al `13`.

---

## Tareas

### Selector de tipo (`ActivitySelectorScreen.kt`)
- [ ] Grid de iconos con los 6 tipos: Sanitaria, Comercial, Control de campo, Movimiento, Reproducción, General
- [ ] Navega al formulario del tipo seleccionado

### Componente de selección de animales (`AnimalSelectorComposable.kt`)
- [ ] 4 tabs o cards de método: Individual, Por lote, Archivo RFID, RFID Bluetooth
- [ ] **Individual**: buscador con `TextField` + lista de resultados
- [ ] **Por lote**: `DropdownMenu` de lotes → carga animales del lote
- [ ] **Archivo RFID**: `ActivityResultContracts.GetContent()` para abrir archivo `.txt`/`.csv` → parseo → lista de reconocidos + desconocidos
- [ ] **RFID Bluetooth**: UI de simulación (mock) con botón "Iniciar lectura" → agrega caravanas random del mock con delay para simular lectura en tiempo real
- [ ] Lista editable de animales seleccionados con `DismissibleItem` para remover

### Formularios por tipo
- [ ] `SanitaryActivityScreen.kt` + VM — producto, dosis, vía, carencia, fecha, responsable; preview de vencimiento calculado
- [ ] `CommercialActivityScreen.kt` + VM — validación de carencia (bloqueo por animal), comprador, destino, precio
- [ ] `FieldControlScreen.kt` + VM — subtipo, peso (con soporte columna en archivo RFID), resultado
- [ ] `MovementScreen.kt` + VM — origen, destino, tipo de movimiento
- [ ] `ReproductionScreen.kt` + VM — subtipo con campos dinámicos; si parto con cría: crear animal
- [ ] `GeneralActivityScreen.kt` + VM — título, descripción

### Lectura RFID como actividad (`ReadingActivityScreen.kt`)
- [ ] Formulario de lectura: método RFID (Bluetooth/archivo), responsable, notas
- [ ] Al confirmar: crea actividad `type: "reading"` con `animalIds` + `unknownCaravanas` + `fileName`

---

## Criterios de done

- [ ] `AnimalSelectorComposable` funciona en los 4 modos
- [ ] Parseo de archivo `.txt` con caravanas funciona correctamente
- [ ] Carencia activa se actualiza en toda la UI tras registrar actividad sanitaria
- [ ] Actividad comercial bloquea animales con carencia
- [ ] Parto con caravana de cría crea el nuevo animal
