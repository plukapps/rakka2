"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { activityRepository } from "@/lib/repositories/activity"
import { useAppStore } from "@/lib/stores/appStore"
import type { Activity } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { formatDate, activityTypeLabel } from "@/lib/utils"

const urgencyMap: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  sanitary: "warning",
  commercial: "danger",
  field_control: "info",
  movement: "neutral",
  reproduction: "success",
  general: "neutral",
}

export default function ActivitiesPage() {
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    if (!estId) return
    setActivities(activityRepository.getAll(estId))
    return activityRepository.subscribe(estId, () =>
      setActivities(activityRepository.getAll(estId))
    )
  }, [estId])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Actividades</h1>
        <Link href="/activities/new">
          <Button size="sm">+ Registrar</Button>
        </Link>
      </div>

      {activities.length === 0 ? (
        <EmptyState title="Sin actividades" description="No hay actividades registradas." />
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {activities.map((act) => (
            <div key={act.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <StatusBadge variant={urgencyMap[act.type] ?? "neutral"}>
                  {activityTypeLabel(act.type)}
                </StatusBadge>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {act.animalIds.length} animal{act.animalIds.length !== 1 ? "es" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">{act.responsible}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(act.activityDate)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
