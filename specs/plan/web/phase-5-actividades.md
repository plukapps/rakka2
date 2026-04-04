# Web — Fase 5: Actividades (Sanitarias y Comerciales)

**Estado:** ⏳ pendiente  
**Depende de:** Fase 4 ✅

## Objetivo

Implementar los dos formularios de registro de actividades: sanitarias (vacunas/tratamientos con carencia) y comerciales (ventas/despachos con validación de carencia). Son los formularios más complejos de la app por sus reglas de negocio.

Specs funcionales: `specs/functional/04-actividades-sanitarias.md`, `specs/functional/05-actividades-comerciales.md`

---

## Tareas

### Actividad sanitaria (`/actividades/sanitarias/nueva`)

- [ ] Selector de destino: "Animal individual" o "Lote completo"
- [ ] Si animal individual: buscador de animal por caravana (solo activos)
- [ ] Si lote: selector de lote + preview de cuántos animales recibirán la actividad
- [ ] Campos del formulario: tipo (vacunación/tratamiento), producto, dosis, vía de administración, días de carencia, fecha de aplicación, responsable, observaciones
- [ ] Preview de fecha de vencimiento de carencia calculada en tiempo real (`aplicación + días`)
- [ ] Al confirmar sobre **animal individual**: crear actividad en mock store + actualizar `hasActiveCarencia` y `carenciaExpiresAt` del animal + crear evento de trazabilidad
- [ ] Al confirmar sobre **lote**: crear una actividad por cada animal activo del lote + actualizar carencia de cada uno + crear eventos de trazabilidad
- [ ] Feedback de éxito: "Actividad registrada para N animales"
- [ ] Soporte para `?animalId=xxx` y `?lotId=xxx` en la URL (preseleccionar destino)

### Componentes nuevos
- [ ] `components/activities/ActivityFeedItem.tsx` — ítem de actividad para el feed (reutilizado en Home y Trazabilidad)

### Actividad comercial (`/actividades/comerciales/nueva`)

- [ ] **Paso 1 — Selección de animales**:
  - Opción A: seleccionar desde un lote (muestra todos los animales del lote, checkboxes)
  - Opción B: búsqueda y agregado individual por caravana
  - Tabla de animales seleccionados con caravana, categoría y badge de carencia activa (si aplica)
  - Botón para remover animales de la selección
- [ ] **Paso 2 — Validación de carencia**:
  - Si hay animales con carencia activa: mostrar listado con producto, días restantes
  - Bloquear "Confirmar" hasta que el usuario los remueva
  - Mensaje: "X animales tienen carencia activa y no pueden ser incluidos"
- [ ] **Paso 3 — Datos de la operación**:
  - Tipo: venta / despacho
  - Comprador/destinatario, destino, precio por cabeza (calcula total automáticamente), fecha, observaciones
- [ ] Al confirmar: crear actividad comercial en mock store + cambiar status de cada animal a `exited` + quitar de lote + crear eventos de trazabilidad de egreso
- [ ] Soporte para `?lotId=xxx` en la URL (precargar animales del lote)

---

## Archivos a modificar/crear

```
code/web-app/
├── app/(app)/actividades/
│   ├── sanitarias/nueva/page.tsx
│   └── comerciales/nueva/page.tsx
└── components/activities/
    └── ActivityFeedItem.tsx
```

---

## Criterios de done

- [ ] Registrar vacuna sobre animal individual actualiza su carencia en el perfil del animal
- [ ] Registrar vacuna sobre lote de 10 animales crea 10 actividades individuales en el mock store
- [ ] El formulario comercial no permite confirmar con animales con carencia activa
- [ ] Remover los animales bloqueados desbloquea la confirmación
- [ ] Al confirmar venta: los animales aparecen como egresados en `/animales`
- [ ] El precio total se calcula automáticamente al ingresar precio por cabeza
