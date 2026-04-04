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

export function useAllLots() {
  const estId = useAppStore((s) => s.activeEstablishment?.id);
  const [lots, setLots] = useState<Lot[]>([]);

  const load = useCallback(() => {
    if (!estId) return;
    setLots(lotRepository.getAll(estId));
  }, [estId]);

  useEffect(() => {
    load();
    if (!estId) return;
    return lotRepository.subscribe(estId, load);
  }, [estId, load]);

  return lots;
}

export function useLot(lotId: string | undefined) {
  const estId = useAppStore((s) => s.activeEstablishment?.id);
  const [lot, setLot] = useState<Lot | undefined>(undefined);

  const load = useCallback(() => {
    if (!estId || !lotId) return;
    setLot(lotRepository.getById(estId, lotId));
  }, [estId, lotId]);

  useEffect(() => {
    load();
    if (!estId) return;
    return lotRepository.subscribe(estId, load);
  }, [estId, lotId, load]);

  return lot;
}
