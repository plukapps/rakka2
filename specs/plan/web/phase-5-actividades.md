# Web — Fase 5: Actividades

**Estado:** ✅ completo  
**Depende de:** Fase 4 ✅

## Objetivo

Implementar el flujo completo de registro de actividades. Todas comparten el mismo mecanismo de selección de animales (RFID en tiempo real, carga de archivo RFID, lote, individual). Los tipos de actividad son: sanitaria, comercial, control de campo, movimiento, reproducción y general.

Specs: `specs/functional/04-actividades-framework.md` y los archivos `04` al `13`.

---

## Tareas

### Mecanismo de selección de animales (compartido, toda la fase depende de esto)

- [x] **Componente `AnimalSelector`**: paso 1 de cualquier formulario de actividad. Ofrece 4 métodos:
  - **Individual**: buscador por caravana con autocomplete
  - **Por lote**: dropdown de lotes → carga todos sus animales activos
  - **Archivo RFID**: uploader de `.txt` / `.csv` → parsea → cruza con animales del establecimiento → muestra lista con "desconocidas" marcadas
  - **RFID Bluetooth**: UI de conexión (simulada en mock) → lista de caravanas leídas en tiempo real → revisión final
- [x] Lista editable de animales seleccionados: ver caravana + categoría + carencia activa (badge), poder remover
- [x] Caravanas no reconocidas: mostrar en sección separada con advertencia (no bloquean, el usuario decide ignorar)
- [x] Al confirmar selección, pasar la lista + `selectionMethod` + `rfidReadingId` (si aplica) al formulario de la actividad

### Actividad sanitaria (`/actividades/sanitarias/nueva`)
- [x] Paso 1: `AnimalSelector`
- [x] Paso 2: tipo (vacunación/tratamiento), producto, dosis, vía, días de carencia, fecha, responsable, observaciones
- [x] Preview de fecha de vencimiento de carencia calculada en tiempo real
- [x] Al confirmar: crear actividad en mock store + actualizar `hasActiveCarencia` / `carenciaExpiresAt` del animal + crear evento de trazabilidad por cada animal
- [x] Soporte para `?animalId=xxx` y `?lotId=xxx` en URL (pre-llenar selección)

### Actividad comercial (`/actividades/comerciales/nueva`)
- [x] Paso 1: `AnimalSelector`
- [x] Paso 2: validación de carencia — bloquear animales con carencia activa, mostrar cuáles son y días restantes. El usuario debe removerlos para continuar.
- [x] Paso 3: tipo (venta/despacho), comprador, destino, precio por cabeza → total calculado, fecha, observaciones
- [x] Al confirmar: crear actividad, cambiar animales a `exited`, quitar de lote, crear eventos de trazabilidad
- [x] Soporte para `?lotId=xxx` en URL

### Control de campo (`/actividades/campo/nueva`)
- [x] Paso 1: `AnimalSelector`
- [x] Paso 2: subtipo (pesaje, conteo, condición corporal, revisión preñez, otro)
- [x] Si pesaje: campo de peso por animal (si el archivo RFID tenía segunda columna con peso, pre-cargar)
- [x] Si conteo: mostrar total seleccionado vs. total activo en el establecimiento (diferencia automática)
- [x] Al confirmar: crear actividad + eventos de trazabilidad

### Movimiento (`/actividades/movimiento/nueva`)
- [x] Paso 1: `AnimalSelector`
- [x] Paso 2: subtipo (potrero, traslado entre campos propios, traslado externo), origen, destino
- [x] Si traslado entre campos propios: selector del establecimiento destino
- [x] Al confirmar: crear actividad + eventos de trazabilidad. Si es `field_transfer`: egreso en origen + ingreso en destino

### Reproducción (`/actividades/reproduccion/nueva`)
- [x] Paso 1: `AnimalSelector` (filtrado a hembras si subtipo es servicio/preñez/parto)
- [x] Paso 2: subtipo (servicio, diagnóstico preñez, parto, destete) con campos específicos por subtipo
- [x] Si parto con caravana de cría: crear el nuevo animal automáticamente en el establecimiento
- [x] Al confirmar: crear actividad + eventos de trazabilidad

### General (`/actividades/general/nueva`)
- [x] Paso 1: `AnimalSelector`
- [x] Paso 2: título (obligatorio), descripción
- [x] Al confirmar: crear actividad + evento de trazabilidad tipo `general_activity`

### Lectura RFID independiente (`/rfid`)
- [x] Flujo simplificado: solo `AnimalSelector` en modo RFID (archivo o Bluetooth)
- [x] Sin paso 2: la lectura en sí misma es el registro
- [x] Al confirmar: crear evento `rfid_reading` en trazabilidad de cada animal leído, sin actividad asociada

### Entrada unificada
- [x] Página `/activities/new`: selector de tipo de actividad con iconos → redirige al formulario correspondiente
- [x] Acceso desde: perfil del animal, detalle del lote

### Componentes nuevos
- [x] `components/activities/AnimalSelector.tsx` — componente central de selección multi-método
- [ ] `components/activities/ActivityFeedItem.tsx` — ítem de actividad para feed (no en criterios de done)

---

## Archivos creados/modificados

```
code/web-app/
├── app/(app)/activities/
│   ├── page.tsx
│   ├── new/page.tsx
│   ├── new/sanitary/page.tsx
│   ├── new/commercial/page.tsx
│   ├── new/field-control/page.tsx
│   ├── new/movement/page.tsx
│   ├── new/reproduction/page.tsx
│   └── new/general/page.tsx
├── app/(app)/rfid/
│   ├── page.tsx
│   └── [readingId]/page.tsx
├── components/activities/
│   ├── AnimalSelector.tsx
│   └── ActivityTypeSelector.tsx
└── lib/utils.ts  ← parseRfidLineWithWeight añadido
```

---

## Criterios de done

- [x] `AnimalSelector` funciona en los 4 modos: individual, lote, archivo, Bluetooth (mock)
- [x] Subir un archivo `.txt` con caravanas parsea correctamente y muestra los animales reconocidos
- [x] Caravanas no reconocidas en el archivo se muestran como advertencia pero no bloquean
- [x] Actividad sanitaria con carencia actualiza el estado del animal en toda la UI
- [x] Actividad comercial no permite confirmar con animales con carencia activa
- [x] Pesaje pre-carga pesos si el archivo RFID tiene columna de peso (CSV: caravana,peso)
- [x] Parto con caravana de cría crea el nuevo animal en el establecimiento
- [x] Lectura RFID independiente crea evento de trazabilidad sin actividad asociada
