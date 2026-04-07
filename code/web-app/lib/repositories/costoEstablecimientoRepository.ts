import type { CostoEstablecimiento, CostoCategoriaEst } from "@/lib/financial-types";
import { getMockStore } from "@/lib/mock/store";
import { generateId, now } from "@/lib/utils";

export interface CreateCostoEstInput {
  estId: string;
  categoria: CostoCategoriaEst;
  montoUsd: number;
  fecha: number;
  descripcion: string;
  createdBy: string;
}

export const costoEstablecimientoRepository = {
  getAll(estId: string): CostoEstablecimiento[] {
    return getMockStore()
      .getCostsEst(estId)
      .sort((a, b) => b.fecha - a.fecha);
  },

  create(input: CreateCostoEstInput): CostoEstablecimiento {
    const store = getMockStore();

    const costo: CostoEstablecimiento = {
      id: generateId("ce"),
      establecimientoId: input.estId,
      categoria: input.categoria,
      montoUsd: input.montoUsd,
      fecha: input.fecha,
      descripcion: input.descripcion,
      createdAt: now(),
      createdBy: input.createdBy,
    };

    store.setCostoEst(costo);
    return costo;
  },

  subscribe(estId: string, fn: () => void): () => void {
    return getMockStore().subscribe(`costs_est/${estId}`, fn);
  },
};
