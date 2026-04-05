import type { Animal } from "@/lib/types";
import { getMockStore } from "@/lib/mock/store";
import { generateId, now } from "@/lib/utils";
import { lotRepository } from "@/lib/repositories/lot";
import { traceabilityRepository } from "@/lib/repositories/traceability";

export interface DarDeBajaInput {
  estId: string;
  animalId: string;
  exitDate: number;
  exitNotes: string | null;
}

export interface CreateAnimalInput {
  estId: string;
  caravana: string;
  category: Animal["category"];
  breed: string;
  sex: Animal["sex"];
  birthDate: string | null;
  entryWeight: number | null;
  origin: string;
  entryType: Animal["entryType"];
  lotId: string | null;
  createdBy: string;
}

export const animalRepository = {
  getAll(estId: string): Animal[] {
    return getMockStore().getAnimals(estId);
  },

  getById(estId: string, animalId: string): Animal | undefined {
    return getMockStore().getAnimal(estId, animalId);
  },

  getByCaravana(estId: string, caravana: string): Animal | undefined {
    return getMockStore()
      .getAnimals(estId)
      .find((a) => a.caravana === caravana);
  },

  isCaravanaUnique(estId: string, caravana: string): boolean {
    return !animalRepository.getByCaravana(estId, caravana);
  },

  create(input: CreateAnimalInput): Animal {
    const store = getMockStore();
    const id = generateId("a");
    const ts = now();
    const animal: Animal = {
      id,
      estId: input.estId,
      caravana: input.caravana,
      status: "active",
      category: input.category,
      breed: input.breed,
      sex: input.sex,
      birthDate: input.birthDate,
      entryWeight: input.entryWeight,
      origin: input.origin,
      entryType: input.entryType,
      entryDate: ts,
      lotId: input.lotId,
      exitDate: null,
      exitType: null,
      exitNotes: null,
      hasActiveCarencia: false,
      carenciaExpiresAt: null,
      lastWeight: null,
      lastWeightDate: null,
      gdpRecent: null,
      gdpAccumulated: null,
      createdAt: ts,
      updatedAt: ts,
    };
    store.setAnimal(animal);
    return animal;
  },

  update(estId: string, animalId: string, patch: Partial<Animal>): Animal | undefined {
    const store = getMockStore();
    const existing = store.getAnimal(estId, animalId);
    if (!existing) return undefined;
    const updated: Animal = { ...existing, ...patch, updatedAt: now() };
    store.setAnimal(updated);
    return updated;
  },

  darDeBaja(input: DarDeBajaInput): Animal | undefined {
    const store = getMockStore();
    const animal = store.getAnimal(input.estId, input.animalId);
    if (!animal || animal.status !== "active") return undefined;

    const previousLotId = animal.lotId;

    const updated = animalRepository.update(input.estId, input.animalId, {
      status: "exited",
      exitType: "death",
      exitDate: input.exitDate,
      exitNotes: input.exitNotes,
      lotId: null,
    });

    if (previousLotId) {
      const lot = store.getLot(input.estId, previousLotId);
      if (lot) {
        lotRepository.update(input.estId, previousLotId, {
          animalCount: Math.max(0, lot.animalCount - 1),
        });
      }
    }

    const description = input.exitNotes
      ? `Baja por muerte. Causa: ${input.exitNotes}`
      : "Baja por muerte.";

    traceabilityRepository.create({
      animalId: input.animalId,
      estId: input.estId,
      type: "exit",
      description,
      activityId: null,
      lotId: null,
      lotName: null,
      responsibleName: null,
      timestamp: input.exitDate,
    });

    return updated;
  },

  subscribe(estId: string, fn: () => void): () => void {
    return getMockStore().subscribe(`animals/${estId}`, fn);
  },
};
