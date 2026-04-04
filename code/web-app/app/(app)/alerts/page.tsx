"use client";

import { useAlerts } from "@/hooks/useAlerts";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import type { AlertUrgency } from "@/lib/types";

const urgencyVariant: Record<AlertUrgency, "destructive" | "warning" | "info"> = {
  critical: "destructive",
  warning: "warning",
  info: "info",
};

const urgencyLabel: Record<AlertUrgency, string> = {
  critical: "Crítica",
  warning: "Advertencia",
  info: "Info",
};

export default function AlertsPage() {
  const { alerts, dismiss } = useAlerts();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Alertas</h1>
        {alerts.length > 0 && (
          <Badge variant="destructive">{alerts.length} activa{alerts.length !== 1 ? "s" : ""}</Badge>
        )}
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          title="Sin alertas activas"
          description="Todo en orden. No hay alertas pendientes."
        />
      ) : (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Badge variant={urgencyVariant[alert.urgency]}>
                  {urgencyLabel[alert.urgency]}
                </Badge>
                <div>
                  <p className="text-sm font-medium text-gray-900">{alert.description}</p>
                  <p className="text-xs text-gray-500">
                    {alert.animalCaravana && `Animal: ${alert.animalCaravana}`}
                    {alert.lotName && `Lote: ${alert.lotName}`}
                    {" · "}{formatDate(alert.relevantDate)}
                  </p>
                </div>
              </div>
              {alert.urgency !== "critical" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismiss(alert.id)}
                >
                  Desestimar
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
