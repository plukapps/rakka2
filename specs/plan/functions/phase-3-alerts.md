# Functions — Fase 3: Alertas programadas

**Estado:** ⏳ pendiente  
**Depende de:** Functions Fase 2 ✅

## Objetivo

Implementar la función programada que evalúa condiciones de negocio y genera/resuelve alertas automáticamente.

Spec técnica: `specs/technical/04-cloud-functions.md` — función `generateAlerts`

---

## Tareas

- [ ] `alerts.ts` — `generateAlerts` con `scheduler.onSchedule("every 24 hours")`:
  - Iterar establecimientos activos
  - Carencia próxima: animales con `hasActiveCarencia` y vencimiento ≤ 7 días → crear/actualizar alerta `carencia_expiring`
  - Resolver carencias vencidas: si `carenciaExpiresAt < now` → `status: "resolved"`, actualizar `hasActiveCarencia: false` en animal
  - Lote inactivo: lotes sin actividad sanitaria en 30 días → crear alerta `lot_inactive`
  - Resolver alertas de lote: si hay actividad sanitaria reciente → `status: "resolved"`

### Testing manual en emulador
- [ ] Crear animal con carencia que vence en 5 días → ejecutar función manualmente → verificar alerta creada
- [ ] Simular paso del tiempo modificando `carenciaExpiresAt` a timestamp pasado → ejecutar función → verificar alerta resuelta y animal actualizado

---

## Criterios de done

- [ ] Función se ejecuta sin errores en emulador
- [ ] Animales con carencia próxima generan alertas con urgencia correcta
- [ ] Alertas de carencia vencida se resuelven automáticamente
- [ ] Lotes sin actividad sanitaria generan alertas `lot_inactive`
