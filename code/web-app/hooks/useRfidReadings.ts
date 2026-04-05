"use client";

import { useState, useEffect, useCallback } from "react";
import type { RfidReading } from "@/lib/types";
import { rfidRepository } from "@/lib/repositories/rfid";
import { useAppStore } from "@/lib/stores/appStore";

export function useRfidReadings() {
  const estId = useAppStore((s) => s.activeEstablishment?.id);
  const [readings, setReadings] = useState<RfidReading[]>([]);

  const load = useCallback(() => {
    if (!estId) return;
    setReadings(rfidRepository.getAll(estId));
  }, [estId]);

  useEffect(() => {
    load();
    if (!estId) return;
    return rfidRepository.subscribe(estId, load);
  }, [estId, load]);

  return readings;
}
