# iOS — Fase 5: Actividades y RFID

**Estado:** ⏳ pendiente  
**Depende de:** Fase 4 ✅

## Objetivo

Implementar el selector de tipo de actividad, el componente de selección de animales (con RFID Bluetooth simulado y carga de archivo), y los formularios de cada tipo.

Specs: `specs/functional/04-actividades-framework.md` y `04` al `13`.

---

## Tareas

### Selector de tipo (`ActivitySelectorView.swift`)
- [ ] Grid de 6 items con icono y nombre del tipo de actividad
- [ ] Navega al formulario correspondiente usando `NavigationLink(value:)`

### Selector de animales (`AnimalSelectorView.swift`)
- [ ] `Picker` o `SegmentedControl` para elegir método: Individual, Por lote, Archivo, Bluetooth
- [ ] **Individual**: `TextField` de búsqueda + `List` de resultados
- [ ] **Por lote**: `Picker` de lotes → carga animales
- [ ] **Archivo RFID**: `fileImporter(allowedContentTypes: [.plainText, .commaSeparatedText])` → parseo → revisión
- [ ] **RFID Bluetooth**: simulación con `Task { await simulateBluetoothReading() }` — agrega caravanas con delay
- [ ] Lista editable de seleccionados con swipe-to-delete

### Formularios
- [ ] `SanitaryActivityView.swift` + VM — campos + preview de vencimiento de carencia
- [ ] `CommercialActivityView.swift` + VM — validación de carencia, bloqueo por animal
- [ ] `FieldControlView.swift` + VM — subtipo + campos dinámicos
- [ ] `MovementView.swift` + VM — origen, destino, tipo
- [ ] `ReproductionView.swift` + VM — campos por subtipo; parto con cría crea animal
- [ ] `GeneralActivityView.swift` + VM — título, descripción

### Lectura RFID como actividad (`ReadingActivityView.swift`)
- [ ] Formulario de lectura: método RFID (Bluetooth/archivo), responsable, notas
- [ ] Al confirmar: crea actividad `type: "reading"` con `animalIds` + `unknownCaravanas` + `fileName`

---

## Criterios de done

- [ ] `fileImporter` parsea un `.txt` de caravanas correctamente
- [ ] Simulación Bluetooth agrega caravanas progresivamente en la UI
- [ ] Carencia activa se actualiza en toda la app tras actividad sanitaria
- [ ] Actividad comercial bloquea animales con carencia
