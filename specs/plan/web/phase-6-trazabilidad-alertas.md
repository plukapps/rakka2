# Web — Fase 6: Trazabilidad y Alertas

**Estado:** ⏳ pendiente  
**Depende de:** Fase 5 ✅

## Objetivo

Implementar la vista de trazabilidad (línea de vida del animal) y el listado completo de alertas con acciones. Son vistas de consulta que consumen datos generados por todos los módulos anteriores.

Specs funcionales: `specs/functional/06-trazabilidad.md`, `specs/functional/07-alertas-y-dashboard.md`

---

## Tareas

### Trazabilidad del animal (`/trazabilidad/[animalId]`)

- [ ] Header: datos del animal (caravana, categoría, estado)
- [ ] Línea de tiempo cronológica invertida (más reciente primero)
- [ ] Cada evento muestra: ícono por tipo, fecha, descripción resumida, responsable
- [ ] Expandible: al hacer click en un evento, mostrar todos sus atributos
- [ ] Íconos y colores por tipo de evento:
  - `ingreso` → verde
  - `asignación/cambio de lote` → azul
  - `actividad sanitaria` → naranja
  - `actividad comercial` → morado
  - `egreso` → rojo
  - `corrección` → gris
- [ ] Filtros: por tipo de evento, por rango de fechas
- [ ] Si animal egresado: banner indicando fecha y tipo de egreso
- [ ] Acceso desde: perfil del animal, link directo

### Componentes nuevos
- [ ] `components/traceability/TimelineEvent.tsx` — evento individual en la línea de tiempo

### Alertas (`/alertas`)

- [ ] Listado de alertas activas del establecimiento activo
- [ ] Ordenado por urgencia: `crítica` → `advertencia` → `informativa`
- [ ] Cada alerta muestra: nivel de urgencia (color/ícono), descripción, animal/lote afectado, fecha relevante, días restantes
- [ ] Filtros: por tipo de alerta, por urgencia
- [ ] Acción "Desestimar" en alertas de tipo `informativa` y `advertencia` (no en críticas)
- [ ] Al desestimar: alerta pasa a estado `dismissed`, desaparece del listado activo
- [ ] Link al animal o lote afectado desde cada alerta
- [ ] Estado vacío: "No hay alertas activas — todo al día ✓"

### Componentes nuevos
- [ ] `components/alerts/AlertItem.tsx` — ítem de alerta con acciones

---

## Archivos a modificar/crear

```
code/web-app/
├── app/(app)/
│   ├── trazabilidad/[animalId]/page.tsx
│   └── alertas/page.tsx
└── components/
    ├── traceability/TimelineEvent.tsx
    └── alerts/AlertItem.tsx
```

---

## Criterios de done

- [ ] La trazabilidad de un animal muestra todos sus eventos en orden cronológico correcto
- [ ] Registrar una actividad sanitaria (Fase 5) y luego ver la trazabilidad: el nuevo evento aparece
- [ ] Las 5 alertas mock se muestran ordenadas por urgencia
- [ ] Desestimar una alerta la elimina del listado activo
- [ ] Filtrar por tipo de alerta funciona correctamente
