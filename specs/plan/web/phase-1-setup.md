# Web — Fase 1: Setup y fundamentos

**Estado:** ⏳ pendiente

## Objetivo

Inicializar el proyecto Next.js y construir toda la capa de datos (tipos, mock data, mock store, repositories, stores de Zustand, hooks). Al final de esta fase no hay ninguna UI visible, pero toda la lógica de datos está lista y funcional.

---

## Tareas

### Proyecto
- [ ] Inicializar Next.js en `code/web-app/`: `npx create-next-app@latest . --typescript --tailwind --app --src-dir=no --import-alias="@/*"`
- [ ] Instalar dependencias: `npm install zustand lucide-react react-hook-form clsx tailwind-merge`
- [ ] Limpiar archivos de ejemplo generados por create-next-app (page.tsx default, globals.css defaults)

### Tipos TypeScript (`lib/types/`)
- [ ] `animal.ts` — `Animal`, `AnimalStatus`, `AnimalCategory`, `AnimalSex`, `EntryType`, `ExitType`
- [ ] `lot.ts` — `Lot`, `LotStatus`
- [ ] `activity.ts` — `Activity` (tipo base unificado), `ActivityType`, `SelectionMethod`, `SanitarySubtype`, `CommercialSubtype`, `FieldControlSubtype`, `MovementSubtype`, `ReproductionSubtype`, `AdministrationRoute`
- [ ] `traceability.ts` — `TraceabilityEvent`, `TraceabilityEventType` (incluyendo todos los tipos: `reading`, `field_control`, `movement`, `reproduction`, `general_activity`)
- [ ] `alert.ts` — `Alert`, `AlertType`, `AlertUrgency`, `AlertStatus`

### Utilidades (`lib/utils/`)
- [ ] `cn.ts` — helper `clsx + tailwind-merge`
- [ ] `dates.ts` — `formatDate(ts)`, `formatRelative(ts)`, `daysFromNow(ts)`
- [ ] `carencia.ts` — `isCarenciaActive(animal)`, `daysUntilCarenciaExpiry(animal)`, `getActiveCarencia(activities)`

### Mock data (`lib/mock/data.ts`)
- [ ] 1 usuario: `{ id: "user_1", name: "Juan Pérez", email: "juan@demo.com" }`
- [ ] 2 establecimientos: "La Esperanza" (id: `est_1`), "El Ombú" (id: `est_2`)
- [ ] 40 animales en `est_1`: mix de categorías, 3 con carencia activa, 2 egresados
- [ ] 4 lotes en `est_1`: "Lote Norte", "Lote Sur", "Recría 2024", "Toros"
- [ ] Actividades variadas (últimos 60 días): 10 sanitarias, 3 comerciales, 4 pesajes, 2 movimientos entre potreros, 2 reproductivas, 2 generales
- [ ] 3 lecturas RFID (2 por archivo, 1 Bluetooth) — una independiente y dos asociadas a actividades
- [ ] Eventos de trazabilidad por animal (incluyendo todos los tipos de evento)
- [ ] 5 alertas: 3 carencia próxima, 2 lote inactivo

### Mock store (`lib/mock/store.ts`)
- [ ] Estado mutable en memoria con `getState()`, `setState()`, `subscribe()`
- [ ] Inicializado con los datos de `data.ts`

### Repositories (`lib/repositories/`)
- [ ] `animalRepository.ts` — `getAnimals(estId)`, `getAnimal(estId, id)`, `createAnimal()`, `updateAnimal()`, `subscribeToAnimals(estId, cb)`
- [ ] `lotRepository.ts` — `getLots(estId)`, `getLot()`, `createLot()`, `updateLot()`, `dissolveLot()`
- [ ] `activityRepository.ts` — `getActivities(estId)`, `createActivity(activity)` (genérico para todos los tipos incluido `reading`), `subscribeToActivities(estId, cb)`
- [ ] `traceabilityRepository.ts` — `getTraceability(estId, animalId)`, `addEvent()`
- [ ] `alertRepository.ts` — `getAlerts(estId)`, `dismissAlert()`

### Stores Zustand (`lib/stores/`)
- [ ] `authStore.ts` — usuario mockeado, `login()` (acepta cualquier email/pass), `logout()`
- [ ] `appStore.ts` — `activeEstablishmentId`, `setActiveEstablishment()`

### Custom hooks (`hooks/`)
- [ ] `useAnimals.ts` — subscribe a animales del est. activo con filtros
- [ ] `useLots.ts` — subscribe a lotes del est. activo
- [ ] `useActivities.ts` — subscribe a actividades del est. activo (todos los tipos)
- [ ] `useTraceability.ts` — subscribe a trazabilidad de un animal
- [ ] `useAlerts.ts` — subscribe a alertas del est. activo

---

## Archivos a crear

```
code/web-app/
├── lib/
│   ├── types/animal.ts
│   ├── types/lot.ts
│   ├── types/activity.ts
│   ├── types/traceability.ts
│   ├── types/alert.ts
│   ├── mock/data.ts
│   ├── mock/store.ts
│   ├── repositories/animalRepository.ts
│   ├── repositories/lotRepository.ts
│   ├── repositories/activityRepository.ts
│   ├── repositories/traceabilityRepository.ts
│   ├── repositories/alertRepository.ts
│   ├── stores/authStore.ts
│   ├── stores/appStore.ts
│   └── utils/cn.ts, dates.ts, carencia.ts
└── hooks/
    ├── useAnimals.ts
    ├── useLots.ts
    ├── useActivities.ts
    ├── useTraceability.ts
    └── useAlerts.ts
```

---

## Criterios de done

- [ ] `npm run dev` inicia sin errores
- [ ] `npm run build` compila sin errores de TypeScript
- [ ] Importar un repository desde la consola del navegador y recibir datos mock correctos
