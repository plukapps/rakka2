import type { Alert } from "@/lib/types";
import { getMockStore } from "@/lib/mock/store";
import { now } from "@/lib/utils";

export const alertRepository = {
  getAll(estId: string): Alert[] {
    return getMockStore()
      .getAlerts(estId)
      .filter((a) => a.status === "active")
      .sort((a, b) => {
        const urgencyOrder = { critical: 0, warning: 1, info: 2 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      });
  },

  dismiss(estId: string, alertId: string): Alert | undefined {
    const store = getMockStore();
    const alert = store.getAlert(estId, alertId);
    if (!alert) return undefined;
    const updated: Alert = {
      ...alert,
      status: "dismissed",
      dismissedAt: now(),
    };
    store.setAlert(updated);
    return updated;
  },

  subscribe(estId: string, fn: () => void): () => void {
    return getMockStore().subscribe(`alerts/${estId}`, fn);
  },
};
