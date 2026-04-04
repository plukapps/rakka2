"use client";

import { useState, useEffect, useCallback } from "react";
import type { TraceabilityEvent } from "@/lib/types";
import { traceabilityRepository } from "@/lib/repositories/traceability";
import { useAppStore } from "@/lib/stores/appStore";

export function useTraceability(animalId: string | undefined) {
  const estId = useAppStore((s) => s.activeEstablishment?.id);
  const [events, setEvents] = useState<TraceabilityEvent[]>([]);

  const load = useCallback(() => {
    if (!estId || !animalId) return;
    setEvents(traceabilityRepository.getForAnimal(estId, animalId));
  }, [estId, animalId]);

  useEffect(() => {
    load();
    if (!estId || !animalId) return;
    return traceabilityRepository.subscribe(estId, animalId, load);
  }, [estId, animalId, load]);

  return events;
}
