# iOS — Fase 6: Trazabilidad y Alertas

**Estado:** ⏳ pendiente  
**Depende de:** Fase 5 ✅

## Objetivo

Implementar la línea de vida del animal y el listado de alertas.

---

## Tareas

### TraceabilityView
- [ ] `TraceabilityViewModel.swift` + `TraceabilityView.swift`
- [ ] `TimelineEventView.swift` — `DisclosureGroup` para expandir/colapsar cada evento
- [ ] Icono y color por tipo de evento (SF Symbols)
- [ ] `TraceabilityFilterView.swift` — filtros de tipo y rango de fechas
- [ ] Banner de egreso si el animal está inactivo

### AlertsView
- [ ] `AlertsViewModel.swift` + `AlertsView.swift` — secciones por urgencia
- [ ] `AlertRowView.swift` — urgencia (color), descripción, fecha relevante, `NavigationLink` al animal/lote
- [ ] Swipe action `.destructive` "Desestimar" en no críticas
- [ ] `ContentUnavailableView` cuando no hay alertas activas

---

## Criterios de done

- [ ] Timeline muestra todos los eventos en orden cronológico
- [ ] Desestimar alerta la elimina con animación
- [ ] 5 alertas mock ordenadas por urgencia
