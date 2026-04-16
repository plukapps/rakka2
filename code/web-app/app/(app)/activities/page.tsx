"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { activityRepository } from "@/lib/repositories/activity"
import { useAppStore } from "@/lib/stores/appStore"
import type { Activity } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { formatDate, activityTypeLabel, cn } from "@/lib/utils"

function activityTitle(act: Activity): string {
  switch (act.type) {
    case "reading": {
      const count = act.animalIds.length + (act.unknownCaravanas?.length ?? 0)
      const base = `Lectura ${count} caravana${count !== 1 ? "s" : ""}`
      return act.fileName ? `${base} · ${act.fileName}` : base
    }
    case "sanitary": {
      const subtypeLabel = act.subtype === "vaccination" ? "Vacunación" : "Tratamiento"
      return act.product ? `${subtypeLabel} ${act.product}` : subtypeLabel
    }
    case "commercial":
      return act.subtype === "sale"
        ? act.buyer ? `Venta ${act.buyer}` : "Venta"
        : act.buyer ? `Despacho ${act.buyer}` : "Despacho"
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
      if (act.result && act.subtype !== "other") return `${label} · ${act.result}`
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

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]

function groupByMonth(activities: Activity[]): { label: string; key: string; items: Activity[] }[] {
  const map = new Map<string, { label: string; key: string; items: Activity[] }>()
  for (const act of activities) {
    const d = new Date(act.activityDate)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`
    if (!map.has(key)) {
      map.set(key, { key, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, items: [] })
    }
    map.get(key)!.items.push(act)
  }
  return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key))
}

type Tab = "active" | "archived"

export default function ActivitiesPage() {
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const [activities, setActivities] = useState<Activity[]>([])
  const [tab, setTab] = useState<Tab>("active")

  useEffect(() => {
    if (!estId) return
    setActivities(activityRepository.getAll(estId))
    return activityRepository.subscribe(estId, () =>
      setActivities(activityRepository.getAll(estId))
    )
  }, [estId])

  const visible = activities.filter((a) =>
    tab === "archived" ? a.archived === true : !a.archived
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Actividades</h1>
        <Link href="/activities/new">
          <Button size="sm">+ Registrar</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="inline-flex gap-1 rounded-xl bg-muted p-1">
        {([
          { key: "active", label: "Activas" },
          { key: "archived", label: "Archivadas" },
        ] as const).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-xs font-medium transition-colors",
              tab === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-foreground/60 hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={tab === "archived" ? "Sin actividades archivadas" : "Sin actividades"}
          description={tab === "archived" ? "No hay actividades archivadas." : "No hay actividades registradas."}
        />
      ) : (
        <div className="space-y-10 pt-4">
          {groupByMonth(visible).map(({ label, items }) => (
            <section key={label} className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</h2>
              <div className="divide-y divide-border rounded-xl border border-border bg-card">
                {items.map((act) => (
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
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
