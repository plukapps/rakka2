"use client";

import { useState, useEffect, useCallback } from "react";
import type { Alert } from "@/lib/types";
import { alertRepository } from "@/lib/repositories/alert";
import { useAppStore } from "@/lib/stores/appStore";

export function useAlerts() {
  const estId = useAppStore((s) => s.activeEstablishment?.id);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const load = useCallback(() => {
    if (!estId) return;
    setAlerts(alertRepository.getAll(estId));
  }, [estId]);

  useEffect(() => {
    load();
    if (!estId) return;
    return alertRepository.subscribe(estId, load);
  }, [estId, load]);

  const dismiss = useCallback(
    (alertId: string) => {
      if (!estId) return;
      alertRepository.dismiss(estId, alertId);
    },
    [estId]
  );

  return { alerts, dismiss };
}
