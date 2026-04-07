import type { CostoLote, CostoCategoriaLote } from "@/lib/financial-types";
import { getMockStore } from "@/lib/mock/store";
import { generateId, now } from "@/lib/utils";
import { lotRepository } from "@/lib/repositories/lot";

export interface CreateCostoLoteInput {
  estId: string;
  loteId: string;
  categoria: CostoCategoriaLote;
  montoUsd: number;
  fecha: number;
  descripcion: string;
  createdBy: string;
}

export const costoLoteRepository = {
  getAll(estId: string): CostoLote[] {
    return getMockStore().getCostsLot(estId);
  },

  getByLot(estId: string, loteId: string): CostoLote[] {
    return getMockStore()
      .getCostsLot(estId)
      .filter((c) => c.loteId === loteId)
      .sort((a, b) => b.fecha - a.fecha);
  },

  create(input: CreateCostoLoteInput): CostoLote {
    const store = getMockStore();
    const lot = lotRepository.getById(input.estId, input.loteId);
    const cabezasAlMomento = lot?.animalCount ?? 0;

    const costo: CostoLote = {
      id: generateId("cl"),
      establecimientoId: input.estId,
      loteId: input.loteId,
      categoria: input.categoria,
      montoUsd: input.montoUsd,
      cabezasAlMomento,
      fecha: input.fecha,
      descripcion: input.descripcion,
      createdAt: now(),
      createdBy: input.createdBy,
    };

    store.setCostoLote(costo);
    return costo;
  },

  subscribe(estId: string, fn: () => void): () => void {
    return getMockStore().subscribe(`costs_lot/${estId}`, fn);
  },
};
