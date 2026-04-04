import type { TraceabilityEvent } from "@/lib/types";
import { getMockStore } from "@/lib/mock/store";

export const traceabilityRepository = {
  getForAnimal(estId: string, animalId: string): TraceabilityEvent[] {
    return getMockStore().getTraceabilityForAnimal(estId, animalId);
  },

  subscribe(estId: string, animalId: string, fn: () => void): () => void {
    return getMockStore().subscribe(`traceability/${estId}/${animalId}`, fn);
  },
};
