"use client"

import { useAlerts } from "@/hooks/useAlerts"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { formatDate } from "@/lib/utils"
import type { AlertUrgency } from "@/lib/types"

const urgencyVariant: Record<AlertUrgency, "danger" | "warning" | "info"> = {
  critical: "danger",
  warning: "warning",
  info: "info",
}

const urgencyLabel: Record<AlertUrgency, string> = {
  critical: "Crítica",
  warning: "Advertencia",
  info: "Info",
}

export default function AlertsPage() {
  const { alerts, dismiss } = useAlerts()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Alertas</h1>
        {alerts.length > 0 && (
          <Badge variant="destructive">
            {alerts.length} activa{alerts.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          title="Sin alertas activas"
          description="Todo en orden. No hay alertas pendientes."
        />
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <StatusBadge variant={urgencyVariant[alert.urgency]}>
                  {urgencyLabel[alert.urgency]}
                </StatusBadge>
                <div>
                  <p className="text-sm font-medium text-foreground">{alert.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.animalCaravana && `Animal: ${alert.animalCaravana}`}
                    {alert.lotName && `Lote: ${alert.lotName}`}
                    {" · "}{formatDate(alert.relevantDate)}
                  </p>
                </div>
              </div>
              {alert.urgency !== "critical" && (
                <Button variant="ghost" size="sm" onClick={() => dismiss(alert.id)}>
                  Desestimar
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
