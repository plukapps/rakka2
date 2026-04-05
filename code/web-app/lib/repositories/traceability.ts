import type { TraceabilityEvent } from "@/lib/types";
import { getMockStore } from "@/lib/mock/store";
import { generateId, now } from "@/lib/utils";

export type CreateTraceabilityInput = Omit<TraceabilityEvent, "id" | "createdAt">;

export const traceabilityRepository = {
  getForAnimal(estId: string, animalId: string): TraceabilityEvent[] {
    return getMockStore().getTraceabilityForAnimal(estId, animalId);
  },

  create(input: CreateTraceabilityInput): TraceabilityEvent {
    const store = getMockStore();
    const id = generateId("trace");
    const event: TraceabilityEvent = { ...input, id, createdAt: now() };
    store.setTraceabilityEvent(event);
    return event;
  },

  subscribe(estId: string, animalId: string, fn: () => void): () => void {
    return getMockStore().subscribe(`traceability/${estId}/${animalId}`, fn);
  },
};
