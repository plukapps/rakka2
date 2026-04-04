# Web — Fase 5: Actividades

**Estado:** ⏳ pendiente  
**Depende de:** Fase 4 ✅

## Objetivo

Implementar el flujo completo de registro de actividades. Todas comparten el mismo mecanismo de selección de animales (RFID en tiempo real, carga de archivo RFID, lote, individual). Los tipos de actividad son: sanitaria, comercial, control de campo, movimiento, reproducción y general.

Specs: `specs/functional/04-actividades-framework.md` y los archivos `04` al `13`.

---

## Tareas

### Mecanismo de selección de animales (compartido, toda la fase depende de esto)

- [ ] **Componente `AnimalSelector`**: paso 1 de cualquier formulario de actividad. Ofrece 4 métodos:
  - **Individual**: buscador por caravana con autocomplete
  - **Por lote**: dropdown de lotes → carga todos sus animales activos
  - **Archivo RFID**: uploader de `.txt` / `.csv` → parsea → cruza con animales del establecimiento → muestra lista con "desconocidas" marcadas
  - **RFID Bluetooth**: UI de conexión (simulada en mock) → lista de caravanas leídas en tiempo real → revisión final
- [ ] Lista editable de animales seleccionados: ver caravana + categoría + carencia activa (badge), poder remover
- [ ] Caravanas no reconocidas: mostrar en sección separada con advertencia (no bloquean, el usuario decide ignorar)
- [ ] Al confirmar selección, pasar la lista + `selectionMethod` + `rfidReadingId` (si aplica) al formulario de la actividad

### Actividad sanitaria (`/actividades/sanitarias/nueva`)
- [ ] Paso 1: `AnimalSelector`
- [ ] Paso 2: tipo (vacunación/tratamiento), producto, dosis, vía, días de carencia, fecha, responsable, observaciones
- [ ] Preview de fecha de vencimiento de carencia calculada en tiempo real
- [ ] Al confirmar: crear actividad en mock store + actualizar `hasActiveCarencia` / `carenciaExpiresAt` del animal + crear evento de trazabilidad por cada animal
- [ ] Soporte para `?animalId=xxx` y `?lotId=xxx` en URL (pre-llenar selección)

### Actividad comercial (`/actividades/comerciales/nueva`)
- [ ] Paso 1: `AnimalSelector`
- [ ] Paso 2: validación de carencia — bloquear animales con carencia activa, mostrar cuáles son y días restantes. El usuario debe removerlos para continuar.
- [ ] Paso 3: tipo (venta/despacho), comprador, destino, precio por cabeza → total calculado, fecha, observaciones
- [ ] Al confirmar: crear actividad, cambiar animales a `exited`, quitar de lote, crear eventos de trazabilidad
- [ ] Soporte para `?lotId=xxx` en URL

### Control de campo (`/actividades/campo/nueva`)
- [ ] Paso 1: `AnimalSelector`
- [ ] Paso 2: subtipo (pesaje, conteo, condición corporal, revisión preñez, otro)
- [ ] Si pesaje: campo de peso por animal (si el archivo RFID tenía segunda columna con peso, pre-cargar)
- [ ] Si conteo: mostrar total seleccionado vs. total activo en el establecimiento (diferencia automática)
- [ ] Al confirmar: crear actividad + eventos de trazabilidad

### Movimiento (`/actividades/movimiento/nueva`)
- [ ] Paso 1: `AnimalSelector`
- [ ] Paso 2: subtipo (potrero, traslado entre campos propios, traslado externo), origen, destino
- [ ] Si traslado entre campos propios: selector del establecimiento destino
- [ ] Al confirmar: crear actividad + eventos de trazabilidad. Si es `field_transfer`: egreso en origen + ingreso en destino

### Reproducción (`/actividades/reproduccion/nueva`)
- [ ] Paso 1: `AnimalSelector` (filtrado a hembras si subtipo es servicio/preñez/parto)
- [ ] Paso 2: subtipo (servicio, diagnóstico preñez, parto, destete) con campos específicos por subtipo
- [ ] Si parto con caravana de cría: crear el nuevo animal automáticamente en el establecimiento
- [ ] Al confirmar: crear actividad + eventos de trazabilidad

### General (`/actividades/general/nueva`)
- [ ] Paso 1: `AnimalSelector`
- [ ] Paso 2: título (obligatorio), descripción
- [ ] Al confirmar: crear actividad + evento de trazabilidad tipo `general_activity`

### Lectura RFID independiente (`/actividades/rfid`)
- [ ] Flujo simplificado: solo `AnimalSelector` en modo RFID (archivo o Bluetooth)
- [ ] Sin paso 2: la lectura en sí misma es el registro
- [ ] Al confirmar: crear evento `rfid_reading` en trazabilidad de cada animal leído, sin actividad asociada

### Entrada unificada
- [ ] Página o modal `/actividades/nueva`: selector de tipo de actividad con iconos y descripción → redirige al formulario correspondiente
- [ ] Acceso desde: botón flotante global, home (acceso rápido "Registrar actividad"), perfil del animal, detalle del lote

### Componentes nuevos
- [ ] `components/activities/AnimalSelector.tsx` — componente central de selección multi-método
- [ ] `components/activities/RfidFileUploader.tsx` — uploader con parseo de CSV/TXT
- [ ] `components/activities/RfidBluetoothReader.tsx` — UI simulada de lectura Bluetooth (mock)
- [ ] `components/activities/ActivityFeedItem.tsx` — ítem de actividad para feed y trazabilidad
- [ ] `components/activities/ActivityTypeSelector.tsx` — pantalla de selección de tipo

---

## Archivos a crear/modificar

```
code/web-app/
├── app/(app)/actividades/
│   ├── nueva/page.tsx                    ← selector de tipo
│   ├── sanitarias/nueva/page.tsx
│   ├── comerciales/nueva/page.tsx
│   ├── campo/nueva/page.tsx
│   ├── movimiento/nueva/page.tsx
│   ├── reproduccion/nueva/page.tsx
│   ├── general/nueva/page.tsx
│   └── rfid/page.tsx
└── components/activities/
    ├── AnimalSelector.tsx
    ├── RfidFileUploader.tsx
    ├── RfidBluetoothReader.tsx
    ├── ActivityFeedItem.tsx
    └── ActivityTypeSelector.tsx
```

---

## Criterios de done

- [ ] `AnimalSelector` funciona en los 4 modos: individual, lote, archivo, Bluetooth (mock)
- [ ] Subir un archivo `.txt` con caravanas parsea correctamente y muestra los animales reconocidos
- [ ] Caravanas no reconocidas en el archivo se muestran como advertencia pero no bloquean
- [ ] Actividad sanitaria con carencia actualiza el estado del animal en toda la UI
- [ ] Actividad comercial no permite confirmar con animales con carencia activa
- [ ] Pesaje pre-carga pesos si el archivo RFID tiene columna de peso
- [ ] Parto con caravana de cría crea el nuevo animal en el establecimiento
- [ ] Lectura RFID independiente crea evento de trazabilidad sin actividad asociada
