"use client";

import { useState, useEffect, useCallback } from "react";
import type { CostoEstablecimiento } from "@/lib/financial-types";
import { costoEstablecimientoRepository, type CreateCostoEstInput } from "@/lib/repositories/costoEstablecimientoRepository";
import { useAppStore } from "@/lib/stores/appStore";

export function useCostosEstablecimiento(): CostoEstablecimiento[] {
  const estId = useAppStore((s) => s.activeEstablishment?.id);
  const [costos, setCostos] = useState<CostoEstablecimiento[]>([]);

  const load = useCallback(() => {
    if (!estId) return;
    setCostos(costoEstablecimientoRepository.getAll(estId));
  }, [estId]);

  useEffect(() => {
    load();
    if (!estId) return;
    return costoEstablecimientoRepository.subscribe(estId, load);
  }, [estId, load]);

  return costos;
}

export function useAddCostoEstablecimiento() {
  const estId = useAppStore((s) => s.activeEstablishment?.id);
  const [loading, setLoading] = useState(false);

  function addCosto(input: Omit<CreateCostoEstInput, "estId">) {
    if (!estId) return;
    setLoading(true);
    try {
      costoEstablecimientoRepository.create({ ...input, estId });
    } finally {
      setLoading(false);
    }
  }

  return { addCosto, loading };
}
