"use client"

import { useState, useMemo } from "react"
import { useAlerts } from "@/hooks/useAlerts"
import { AlertItem } from "@/components/alerts/AlertItem"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import type { AlertType, AlertUrgency } from "@/lib/types"

export default function AlertsPage() {
  const { alerts, dismiss } = useAlerts()
  const [filterType, setFilterType] = useState<AlertType | "all">("all")
  const [filterUrgency, setFilterUrgency] = useState<AlertUrgency | "all">("all")

  const filtered = useMemo(() => {
    let result = alerts
    if (filterType !== "all") {
      result = result.filter((a) => a.type === filterType)
    }
    if (filterUrgency !== "all") {
      result = result.filter((a) => a.urgency === filterUrgency)
    }
    return result
  }, [alerts, filterType, filterUrgency])

  const critical = filtered.filter((a) => a.urgency === "critical")
  const warnings = filtered.filter((a) => a.urgency === "warning")
  const info = filtered.filter((a) => a.urgency === "info")

  const hasFilters = filterType !== "all" || filterUrgency !== "all"

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

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Tipo</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as AlertType | "all")}
            className="h-8 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
          >
            <option value="all">Todos</option>
            <option value="carencia_expiring">Carencia por vencer</option>
            <option value="lot_inactive">Lote inactivo</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Urgencia</label>
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value as AlertUrgency | "all")}
            className="h-8 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
          >
            <option value="all">Todas</option>
            <option value="critical">Critica</option>
            <option value="warning">Advertencia</option>
            <option value="info">Info</option>
          </select>
        </div>
        {hasFilters && (
          <button
            onClick={() => { setFilterType("all"); setFilterUrgency("all") }}
            className="h-8 px-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Sin alertas activas"
          description="Todo en orden. No hay alertas pendientes."
        />
      ) : (
        <div className="space-y-4">
          {/* Critical */}
          {critical.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-red-700 mb-2">Criticas</h2>
              <div className="divide-y divide-border rounded-xl border border-red-200 bg-card">
                {critical.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} onDismiss={dismiss} />
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-amber-700 mb-2">Advertencias</h2>
              <div className="divide-y divide-border rounded-xl border border-amber-200 bg-card">
                {warnings.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} onDismiss={dismiss} />
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          {info.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-blue-700 mb-2">Informativas</h2>
              <div className="divide-y divide-border rounded-xl border border-blue-200 bg-card">
                {info.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} onDismiss={dismiss} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
