# Web — Fase 4: Módulo Lotes

**Estado:** ✅ completo  
**Depende de:** Fase 3 ✅

## Objetivo

Implementar la gestión de lotes dinámicos: listado, creación, detalle con lista de animales, y operaciones de movimiento de animales entre lotes.

Spec funcional: `specs/functional/03-lotes.md`

---

## Tareas

### Listado de lotes (`/lotes`)
- [x] Cards de lotes activos con: nombre, descripción, contador de animales, fecha creación
- [x] Badge de estado (activo/disuelto)
- [x] Botón "Crear lote" → `/lotes/nuevo`
- [x] Click en lote → `/lotes/[lotId]`
- [x] Estado vacío si no hay lotes
- [x] Mostrar lotes disueltos con toggle (off por defecto)

### Componentes nuevos
- [x] `components/lots/LotCard.tsx` — card de lote con contador y acciones rápidas

### Formulario de creación (`/lotes/nuevo`)
- [x] Campos: nombre (obligatorio), descripción
- [x] Selector multi-animal para asignar animales al crear (opcional)
- [x] Al confirmar: crear lote en mock store, asignar animales seleccionados

### Detalle del lote (`/lotes/[lotId]`)
- [x] Header: nombre, descripción, estado, fecha creación, contador de animales
- [x] Lista de animales del lote (reusa `AnimalCard`)
- [x] Búsqueda dentro del lote por caravana
- [x] Botón "Agregar animales" → modal de búsqueda/selección de animales activos sin lote o de otro lote
- [x] Al mover animal de otro lote: confirmación ("Este animal está en Lote Sur, ¿moverlo aquí?")
- [x] Botón "Registrar actividad sanitaria" → `/activities/new/sanitary?lotId=xxx`
- [x] Botón "Disolver lote" → modal de confirmación
- [x] Al disolver: todos los animales quedan sin lote, lote pasa a `disuelto`

---

## Archivos a modificar/crear

```
code/web-app/
├── app/(app)/lots/
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [lotId]/page.tsx
└── components/lots/
    └── LotCard.tsx
```

---

## Criterios de done

- [x] Los 4 lotes mock aparecen en el listado con contadores correctos
- [x] Crear lote nuevo aparece inmediatamente en el listado
- [x] Mover animal entre lotes actualiza el `lotId` del animal y ambos contadores de lote
- [x] Disolver lote cambia su estado y quita el `lotId` de todos sus animales
- [x] El detalle del lote muestra exactamente los animales asignados a ese lote
