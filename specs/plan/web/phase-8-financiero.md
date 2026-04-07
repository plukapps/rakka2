# Fase 8 — Módulo Financiero (Web)

**Estado:** ✅ Completo

**Spec:** `specs/functional/15-modulo-financiero.md`
**Diseño:** `specs/design/10-financiero.md`

---

## Checklist

### Specs
- [x] Spec funcional (`15-modulo-financiero.md`)
- [x] Spec técnica — modelo de datos actualizado
- [x] Spec de diseño (`10-financiero.md`)

### F1 — Tipos y mock
- [x] `lib/types.ts` — `purchasePriceUsd` y `exitLotId` en Animal
- [x] `lib/financial-types.ts` — tipos nuevos
- [x] `lib/mock/store.ts` — colecciones `costsLot` y `costsEstablishment`
- [x] `lib/mock/data.ts` — seed data financiera + actualizar animales

### F2 — Repositorios
- [x] `lib/repositories/costoLoteRepository.ts`
- [x] `lib/repositories/costoEstablecimientoRepository.ts`
- [x] `lib/repositories/animal.ts` — `purchasePriceUsd` en create, `exitLotId` en darDeBaja

### F3 — Hooks
- [x] `hooks/useCostosLote.ts`
- [x] `hooks/useCostosEstablecimiento.ts`
- [x] `hooks/useLotPnL.ts`

### F4 — Componentes
- [x] `components/financial/CostosTable.tsx`
- [x] `components/financial/AddCostoLoteForm.tsx`
- [x] `components/financial/AddCostoEstForm.tsx`
- [x] `components/financial/LotPnLCard.tsx`

### F5 — Integración flujos existentes
- [x] `app/(app)/animals/new/page.tsx` — campo `purchasePriceUsd` condicional
- [x] `app/(app)/activities/new/commercial/page.tsx` — capturar `exitLotId`

### F6 — Sección financiera del lote
- [x] `app/(app)/lots/[lotId]/page.tsx` — sección "Financiero"

### F7 — Página y navegación
- [x] `app/(app)/financiero/page.tsx`
- [x] `components/layout/Sidebar.tsx` — ítem "Finanzas"
