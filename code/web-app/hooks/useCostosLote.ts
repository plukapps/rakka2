"use client";

import { useState, useEffect, useCallback } from "react";
import type { CostoLote } from "@/lib/financial-types";
import { costoLoteRepository, type CreateCostoLoteInput } from "@/lib/repositories/costoLoteRepository";
import { useAppStore } from "@/lib/stores/appStore";

export function useCostosLote(loteId: string | undefined): CostoLote[] {
  const estId = useAppStore((s) => s.activeEstablishment?.id);
  const [costos, setCostos] = useState<CostoLote[]>([]);

  const load = useCallback(() => {
    if (!estId || !loteId) return;
    setCostos(costoLoteRepository.getByLot(estId, loteId));
  }, [estId, loteId]);

  useEffect(() => {
    load();
    if (!estId) return;
    return costoLoteRepository.subscribe(estId, load);
  }, [estId, loteId, load]);

  return costos;
}

export function useAddCostoLote() {
  const estId = useAppStore((s) => s.activeEstablishment?.id);
  const [loading, setLoading] = useState(false);

  function addCosto(input: Omit<CreateCostoLoteInput, "estId">) {
    if (!estId) return;
    setLoading(true);
    try {
      costoLoteRepository.create({ ...input, estId });
    } finally {
      setLoading(false);
    }
  }

  return { addCosto, loading };
}
