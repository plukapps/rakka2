# Web — Fase 4: Módulo Lotes

**Estado:** ⏳ pendiente  
**Depende de:** Fase 3 ✅

## Objetivo

Implementar la gestión de lotes dinámicos: listado, creación, detalle con lista de animales, y operaciones de movimiento de animales entre lotes.

Spec funcional: `specs/functional/03-lotes.md`

---

## Tareas

### Listado de lotes (`/lotes`)
- [ ] Cards de lotes activos con: nombre, descripción, contador de animales, fecha creación
- [ ] Badge de estado (activo/disuelto)
- [ ] Botón "Crear lote" → `/lotes/nuevo`
- [ ] Click en lote → `/lotes/[lotId]`
- [ ] Estado vacío si no hay lotes
- [ ] Mostrar lotes disueltos con toggle (off por defecto)

### Componentes nuevos
- [ ] `components/lots/LotCard.tsx` — card de lote con contador y acciones rápidas

### Formulario de creación (`/lotes/nuevo`)
- [ ] Campos: nombre (obligatorio), descripción
- [ ] Selector multi-animal para asignar animales al crear (opcional)
- [ ] Al confirmar: crear lote en mock store, asignar animales seleccionados

### Detalle del lote (`/lotes/[lotId]`)
- [ ] Header: nombre, descripción, estado, fecha creación, contador de animales
- [ ] Lista de animales del lote (reusa `AnimalCard`)
- [ ] Búsqueda dentro del lote por caravana
- [ ] Botón "Agregar animales" → modal de búsqueda/selección de animales activos sin lote o de otro lote
- [ ] Al mover animal de otro lote: confirmación ("Este animal está en Lote Sur, ¿moverlo aquí?")
- [ ] Botón "Registrar actividad sanitaria" → `/actividades/sanitarias/nueva?lotId=xxx`
- [ ] Botón "Disolver lote" → modal de confirmación
- [ ] Al disolver: todos los animales quedan sin lote, lote pasa a `disuelto`

---

## Archivos a modificar/crear

```
code/web-app/
├── app/(app)/lotes/
│   ├── page.tsx
│   ├── nuevo/page.tsx
│   └── [lotId]/page.tsx
└── components/lots/
    └── LotCard.tsx
```

---

## Criterios de done

- [ ] Los 4 lotes mock aparecen en el listado con contadores correctos
- [ ] Crear lote nuevo aparece inmediatamente en el listado
- [ ] Mover animal entre lotes actualiza el `lotId` del animal y ambos contadores de lote
- [ ] Disolver lote cambia su estado y quita el `lotId` de todos sus animales
- [ ] El detalle del lote muestra exactamente los animales asignados a ese lote
