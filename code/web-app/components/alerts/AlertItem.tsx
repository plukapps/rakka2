"use client"

import Link from "next/link"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatCaravana } from "@/lib/utils"
import type { Alert, AlertUrgency } from "@/lib/types"

interface AlertItemProps {
  alert: Alert
  onDismiss?: (alertId: string) => void
}

const urgencyVariant: Record<AlertUrgency, "danger" | "warning" | "info"> = {
  critical: "danger",
  warning: "warning",
  info: "info",
}

const urgencyLabel: Record<AlertUrgency, string> = {
  critical: "Critica",
  warning: "Advertencia",
  info: "Info",
}

export function AlertItem({ alert, onDismiss }: AlertItemProps) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3">
      <div className="flex items-start gap-3 min-w-0">
        <div className="shrink-0 mt-0.5">
          <StatusBadge variant={urgencyVariant[alert.urgency]}>
            {urgencyLabel[alert.urgency]}
          </StatusBadge>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{alert.description}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
            {alert.animalId && alert.animalCaravana && (
              <Link
                href={`/animals/${alert.animalId}`}
                className="text-xs text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Animal: {formatCaravana(alert.animalCaravana)}
              </Link>
            )}
            {alert.lotId && alert.lotName && (
              <Link
                href={`/lots/${alert.lotId}`}
                className="text-xs text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Lote: {alert.lotName}
              </Link>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDate(alert.relevantDate)}
            </span>
            {alert.daysUntilExpiry !== null && (
              <span className="text-xs text-muted-foreground">
                ({alert.daysUntilExpiry > 0 ? `${alert.daysUntilExpiry} dias restantes` : "Vencido"})
              </span>
            )}
          </div>
        </div>
      </div>
      {alert.urgency !== "critical" && onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={() => onDismiss(alert.id)}
        >
          Desestimar
        </Button>
      )}
    </div>
  )
}
