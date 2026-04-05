# Functions — Fase 2: Functions de actividades

**Estado:** ⏳ pendiente  
**Depende de:** Functions Fase 1 ✅

## Objetivo

Implementar todas las Cloud Functions que reaccionan a escrituras de actividades y cambios en animales/lotes.

Spec técnica: `specs/technical/04-cloud-functions.md`

---

## Tareas

- [ ] `sanitaryActivity.ts` — `onSanitaryActivityCreated`: itera `animalIds`, actualiza carencia de cada animal, crea evento de trazabilidad por animal
- [ ] `commercialActivity.ts` — `onCommercialActivityConfirmed`: valida carencia, egresa animales, crea eventos de trazabilidad
- [ ] `activity.ts` — `onActivityCreated` para `field_control`, `movement`, `reproduction`, `general`:
  - Genera evento de trazabilidad por cada animal
  - Caso especial `field_transfer`: egreso en origen + ingreso en destino
  - Caso especial parto con cría: crear nuevo animal
- [ ] Dentro de `onActivityCreated`: cuando `type === "reading"`, genera evento `reading` en trazabilidad de cada animal reconocido
- [ ] `lot.ts` — `onLotDissolved` + `onAnimalLotChanged`: mantiene índice `lot_animals` y contadores

### Idempotencia
- [ ] Todas las funciones usan `{activityId}_{animalId}` como clave del evento de trazabilidad
- [ ] `onAnimalLotChanged` verifica que el `lotId` realmente cambió antes de procesar

---

## Criterios de done

- [ ] Escribir actividad sanitaria en el emulador → carencia del animal se actualiza
- [ ] Confirmar actividad comercial → animales pasan a `exited`
- [ ] Registrar lectura RFID → eventos de trazabilidad creados para cada animal
- [ ] Disolver lote → animales quedan con `lotId: null`
