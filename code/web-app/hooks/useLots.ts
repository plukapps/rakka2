"use client";

import { useState, useEffect, useCallback } from "react";
import type { Lot } from "@/lib/types";
import { lotRepository } from "@/lib/repositories/lot";
import { useAppStore } from "@/lib/stores/appStore";

export function useLots() {
  const estId = useAppStore((s) => s.activeEstablishment?.id);
  const [lots, setLots] = useState<Lot[]>([]);

  const load = useCallback(() => {
    if (!estId) return;
    setLots(lotRepository.getActive(estId));
  }, [estId]);

  useEffect(() => {
    load();
    if (!estId) return;
    return lotRepository.subscribe(estId, load);
  }, [estId, load]);

  return lots;
}
