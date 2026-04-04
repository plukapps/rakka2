import type { Lot } from "@/lib/types";
import { getMockStore } from "@/lib/mock/store";
import { generateId, now } from "@/lib/utils";

export interface CreateLotInput {
  estId: string;
  name: string;
  description: string;
}

export const lotRepository = {
  getAll(estId: string): Lot[] {
    return getMockStore().getLots(estId);
  },

  getActive(estId: string): Lot[] {
    return getMockStore()
      .getLots(estId)
      .filter((l) => l.status === "active");
  },

  getById(estId: string, lotId: string): Lot | undefined {
    return getMockStore().getLot(estId, lotId);
  },

  create(input: CreateLotInput): Lot {
    const store = getMockStore();
    const id = generateId("lot");
    const ts = now();
    const lot: Lot = {
      id,
      estId: input.estId,
      name: input.name,
      description: input.description,
      status: "active",
      animalCount: 0,
      createdAt: ts,
    };
    store.setLot(lot);
    return lot;
  },

  update(estId: string, lotId: string, patch: Partial<Lot>): Lot | undefined {
    const store = getMockStore();
    const existing = store.getLot(estId, lotId);
    if (!existing) return undefined;
    const updated: Lot = { ...existing, ...patch };
    store.setLot(updated);
    return updated;
  },

  subscribe(estId: string, fn: () => void): () => void {
    return getMockStore().subscribe(`lots/${estId}`, fn);
  },
};
