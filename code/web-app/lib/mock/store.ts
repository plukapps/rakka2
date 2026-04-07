/**
 * Mock Store — simulates Firebase RTDB with in-memory state + pub/sub.
 *
 * Same interface as the real Firebase repositories will expose.
 * Swap this for Firebase SDK when ready.
 */

import type {
  Establishment,
  Animal,
  Lot,
  Activity,
  TraceabilityEvent,
  Alert,
} from "@/lib/types";
import type { CostoLote, CostoEstablecimiento } from "@/lib/financial-types";
import {
  MOCK_ESTABLISHMENTS,
  MOCK_ANIMALS,
  MOCK_LOTS,
  MOCK_ACTIVITIES,
  MOCK_READING_ACTIVITIES,
  MOCK_TRACEABILITY,
  MOCK_ALERTS,
  MOCK_COSTS_LOT,
  MOCK_COSTS_EST,
} from "@/lib/mock/data";

// Deep clone to avoid mutation of seed data
function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// ---- State ----

type Listener<T> = (data: T) => void;

class MockStore {
  private establishments: Map<string, Establishment> = new Map();
  private animals: Map<string, Animal> = new Map(); // key: `${estId}/${animalId}`
  private lots: Map<string, Lot> = new Map(); // key: `${estId}/${lotId}`
  private activities: Map<string, Activity> = new Map(); // key: `${estId}/${activityId}`
  private traceability: Map<string, TraceabilityEvent> = new Map(); // key: `${estId}/${animalId}/${eventId}`
  private alerts: Map<string, Alert> = new Map(); // key: `${estId}/${alertId}`
  private costsLot: Map<string, CostoLote> = new Map(); // key: `${estId}/${costId}`
  private costsEst: Map<string, CostoEstablecimiento> = new Map(); // key: `${estId}/${costId}`

  private listeners: Map<string, Set<Listener<unknown>>> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    for (const e of MOCK_ESTABLISHMENTS) {
      this.establishments.set(e.id, clone(e));
    }
    for (const a of MOCK_ANIMALS) {
      this.animals.set(`${a.estId}/${a.id}`, clone(a));
    }
    for (const l of MOCK_LOTS) {
      this.lots.set(`${l.estId}/${l.id}`, clone(l));
    }
    for (const act of [...MOCK_ACTIVITIES, ...MOCK_READING_ACTIVITIES]) {
      this.activities.set(`${act.estId}/${act.id}`, clone(act));
    }
    for (const t of MOCK_TRACEABILITY) {
      this.traceability.set(`${t.estId}/${t.animalId}/${t.id}`, clone(t));
    }
    for (const al of MOCK_ALERTS) {
      this.alerts.set(`${al.estId}/${al.id}`, clone(al));
    }
    for (const c of MOCK_COSTS_LOT) {
      this.costsLot.set(`${c.establecimientoId}/${c.id}`, clone(c));
    }
    for (const c of MOCK_COSTS_EST) {
      this.costsEst.set(`${c.establecimientoId}/${c.id}`, clone(c));
    }
  }

  // ---- Pub/Sub ----

  private emit(channel: string) {
    const subs = this.listeners.get(channel);
    if (!subs) return;
    for (const fn of subs) {
      fn(undefined);
    }
  }

  subscribe(channel: string, fn: Listener<unknown>): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(fn);
    return () => this.listeners.get(channel)?.delete(fn);
  }

  // ---- Establishments ----

  getEstablishments(): Establishment[] {
    return Array.from(this.establishments.values());
  }

  getEstablishment(id: string): Establishment | undefined {
    return this.establishments.get(id);
  }

  setEstablishment(est: Establishment) {
    this.establishments.set(est.id, clone(est));
    this.emit("establishments");
  }

  // ---- Animals ----

  getAnimals(estId: string): Animal[] {
    return Array.from(this.animals.values()).filter((a) => a.estId === estId);
  }

  getAnimal(estId: string, animalId: string): Animal | undefined {
    return this.animals.get(`${estId}/${animalId}`);
  }

  setAnimal(animal: Animal) {
    this.animals.set(`${animal.estId}/${animal.id}`, clone(animal));
    this.emit(`animals/${animal.estId}`);
  }

  // ---- Lots ----

  getLots(estId: string): Lot[] {
    return Array.from(this.lots.values()).filter((l) => l.estId === estId);
  }

  getLot(estId: string, lotId: string): Lot | undefined {
    return this.lots.get(`${estId}/${lotId}`);
  }

  setLot(lot: Lot) {
    this.lots.set(`${lot.estId}/${lot.id}`, clone(lot));
    this.emit(`lots/${lot.estId}`);
  }

  // ---- Activities ----

  getActivities(estId: string): Activity[] {
    return Array.from(this.activities.values()).filter(
      (a) => a.estId === estId
    );
  }

  getActivity(estId: string, activityId: string): Activity | undefined {
    return this.activities.get(`${estId}/${activityId}`);
  }

  setActivity(activity: Activity) {
    this.activities.set(`${activity.estId}/${activity.id}`, clone(activity));
    this.emit(`activities/${activity.estId}`);
  }

  // ---- Traceability ----

  getTraceabilityForAnimal(estId: string, animalId: string): TraceabilityEvent[] {
    return Array.from(this.traceability.values())
      .filter((t) => t.estId === estId && t.animalId === animalId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  setTraceabilityEvent(event: TraceabilityEvent) {
    this.traceability.set(
      `${event.estId}/${event.animalId}/${event.id}`,
      clone(event)
    );
    this.emit(`traceability/${event.estId}/${event.animalId}`);
  }

  // ---- Alerts ----

  getAlerts(estId: string): Alert[] {
    return Array.from(this.alerts.values()).filter((a) => a.estId === estId);
  }

  getAlert(estId: string, alertId: string): Alert | undefined {
    return this.alerts.get(`${estId}/${alertId}`);
  }

  setAlert(alert: Alert) {
    this.alerts.set(`${alert.estId}/${alert.id}`, clone(alert));
    this.emit(`alerts/${alert.estId}`);
  }

  // ---- Costs Lot ----

  getCostsLot(estId: string): CostoLote[] {
    return Array.from(this.costsLot.values()).filter(
      (c) => c.establecimientoId === estId
    );
  }

  setCostoLote(costo: CostoLote) {
    this.costsLot.set(`${costo.establecimientoId}/${costo.id}`, clone(costo));
    this.emit(`costs_lot/${costo.establecimientoId}`);
  }

  // ---- Costs Establishment ----

  getCostsEst(estId: string): CostoEstablecimiento[] {
    return Array.from(this.costsEst.values()).filter(
      (c) => c.establecimientoId === estId
    );
  }

  setCostoEst(costo: CostoEstablecimiento) {
    this.costsEst.set(`${costo.establecimientoId}/${costo.id}`, clone(costo));
    this.emit(`costs_est/${costo.establecimientoId}`);
  }
}

// Singleton — one store per browser session
let _store: MockStore | null = null;

export function getMockStore(): MockStore {
  if (!_store) _store = new MockStore();
  return _store;
}
