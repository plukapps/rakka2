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

function activityTitle(act: Activity): string {
  switch (act.type) {
    case "reading":
      return act.fileName ?? `${(act.animalIds.length + (act.unknownCaravanas?.length ?? 0))} caravanas`
    case "sanitary":
      return act.product || "Actividad sanitaria"
    case "commercial":
      return act.subtype === "sale"
        ? act.buyer ? `Venta — ${act.buyer}` : "Venta"
        : act.buyer ? `Despacho — ${act.buyer}` : "Despacho"
    case "field_control": {
      const subtypeLabels: Record<string, string> = {
        weighing: "Pesaje",
        count: "Conteo",
        body_condition: "Condición corporal",
        pregnancy_check: "Revisión de preñez",
        other: "Control de campo",
      }
      const label = subtypeLabels[act.subtype] ?? "Control de campo"
      if (act.subtype === "weighing" && act.weightKg) return `${label} · ${act.weightKg} kg`
      return label
    }
    case "movement":
      return `${act.origin} → ${act.destination}`
    case "reproduction": {
      const subtypeLabels: Record<string, string> = {
        service: "Servicio",
        pregnancy_diagnosis: "Diagnóstico de preñez",
        birth: "Parto",
        weaning: "Destete",
      }
      return subtypeLabels[act.subtype] ?? "Reproducción"
    }
    case "general":
      return act.title || "Actividad general"
    default:
      return "Actividad"
  }
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
            <Link
              key={act.id}
              href={`/activities/${act.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-5">
                <StatusBadge variant="neutral" className="w-[115px] h-[18px] justify-center shrink-0 text-xs">
                  {activityTypeLabel(act.type)}
                </StatusBadge>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {activityTitle(act)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {act.responsible}
                    {" · "}
                    {act.type === "reading"
                      ? `${act.animalIds.length + (act.unknownCaravanas?.length ?? 0)} caravana${(act.animalIds.length + (act.unknownCaravanas?.length ?? 0)) !== 1 ? "s" : ""}`
                      : `${act.animalIds.length} animal${act.animalIds.length !== 1 ? "es" : ""}`}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(act.activityDate)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
