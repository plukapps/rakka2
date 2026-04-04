# Android — Fase 6: Trazabilidad y Alertas

**Estado:** ⏳ pendiente  
**Depende de:** Fase 5 ✅

## Objetivo

Implementar la línea de tiempo del animal y el listado de alertas con acciones.

---

## Tareas

### Trazabilidad (`TraceabilityScreen.kt`)
- [ ] `TraceabilityViewModel.kt` — carga eventos de `TraceabilityRepository`, filtra por tipo y rango de fechas
- [ ] `TraceabilityScreen.kt` — header con datos del animal + `LazyColumn` de eventos cronológicos
- [ ] `TimelineEventItem.kt` — ítem expandible con icono por tipo, fecha, descripción, responsable
- [ ] Colores por tipo de evento (verde=ingreso, azul=lote, naranja=sanitaria, morado=comercial, rojo=egreso, gris=corrección)
- [ ] `TimelineEventFilterSheet.kt` — BottomSheet con filtros de tipo y rango de fechas
- [ ] Banner si el animal está egresado

### Alertas (`AlertsScreen.kt`)
- [ ] `AlertsViewModel.kt` — carga y agrupa alertas por urgencia
- [ ] `AlertsScreen.kt` — secciones: Críticas, Advertencias, Informativas
- [ ] `AlertItem.kt` — card con urgencia (color), descripción, fecha relevante, días restantes, link al animal/lote
- [ ] Swipe-to-dismiss o botón "Desestimar" en alertas no críticas
- [ ] Estado vacío: "Todo al día ✓"

---

## Criterios de done

- [ ] Trazabilidad de un animal muestra todos sus eventos en orden correcto
- [ ] Registrar actividad → verificar que aparece en trazabilidad
- [ ] 5 alertas mock ordenadas por urgencia
- [ ] Desestimar alerta la elimina del listado
