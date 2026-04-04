import type { RfidReading } from "@/lib/types";
import { getMockStore } from "@/lib/mock/store";
import { generateId, now } from "@/lib/utils";

export type CreateRfidReadingInput = Omit<RfidReading, "id" | "timestamp">;

export const rfidRepository = {
  getAll(estId: string): RfidReading[] {
    return getMockStore()
      .getRfidReadings(estId)
      .sort((a, b) => b.timestamp - a.timestamp);
  },

  create(input: CreateRfidReadingInput): RfidReading {
    const store = getMockStore();
    const id = generateId("rfid");
    const reading: RfidReading = {
      ...input,
      id,
      timestamp: now(),
    };
    store.setRfidReading(reading);
    return reading;
  },

  subscribe(estId: string, fn: () => void): () => void {
    return getMockStore().subscribe(`rfid/${estId}`, fn);
  },
};
