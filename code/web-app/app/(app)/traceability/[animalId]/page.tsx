"use client"

import { use, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAnimal } from "@/hooks/useAnimals"
import { useLots } from "@/hooks/useLots"
import { useTraceability } from "@/hooks/useTraceability"
import { TimelineEvent } from "@/components/traceability/TimelineEvent"
import { TagView } from "@/components/animals/TagView"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { categoryLabel, formatDate } from "@/lib/utils"
import type { TraceabilityEventType } from "@/lib/types"

const eventTypeLabel: Record<TraceabilityEventType, string> = {
  entry: "Ingreso",
  lot_assignment: "Asignacion a lote",
  lot_change: "Cambio de lote",
  lot_removal: "Salida de lote",
  sanitary_activity: "Actividad sanitaria",
  commercial_activity: "Actividad comercial",
  field_control: "Control de campo",
  movement: "Movimiento",
  reproduction: "Reproduccion",
  general_activity: "Actividad general",
  rfid_reading: "Lectura RFID",
  exit: "Egreso",
  correction: "Correccion",
}

const allEventTypes: TraceabilityEventType[] = [
  "entry", "lot_assignment", "lot_change", "lot_removal",
  "sanitary_activity", "commercial_activity", "field_control",
  "movement", "reproduction", "general_activity", "rfid_reading",
  "exit", "correction",
]

export default function AnimalTraceabilityPage({
  params,
}: {
  params: Promise<{ animalId: string }>
}) {
  const router = useRouter()
  const { animalId } = use(params)
  const animal = useAnimal(animalId)
  const lots = useLots()
  const events = useTraceability(animalId)

  const [filterType, setFilterType] = useState<TraceabilityEventType | "all">("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const filteredEvents = useMemo(() => {
    let result = events

    if (filterType !== "all") {
      result = result.filter((e) => e.type === filterType)
    }

    if (dateFrom) {
      const fromTs = new Date(dateFrom).getTime()
      result = result.filter((e) => e.timestamp >= fromTs)
    }

    if (dateTo) {
      const toTs = new Date(dateTo).getTime() + 86400000 // end of day
      result = result.filter((e) => e.timestamp <= toTs)
    }

    return result
  }, [events, filterType, dateFrom, dateTo])

  const hasFilters = filterType !== "all" || dateFrom !== "" || dateTo !== ""

  const resetFilters = () => {
    setFilterType("all")
    setDateFrom("")
    setDateTo("")
  }

  if (!animal) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className=" space-y-4">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Animal</Button>
      </div>

      {/* Animal header */}
      <div className="flex items-center gap-4">
        <TagView caravana={animal.caravana} size="md" />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <StatusBadge variant={animal.status === "active" ? "success" : "neutral"}>
              {animal.status === "active" ? "Activo" : "Egresado"}
            </StatusBadge>
            <span className="text-sm text-muted-foreground">
              {categoryLabel(animal.category)}
            </span>
          </div>
        </div>
      </div>

      {/* Exit banner */}
      {animal.status === "exited" && animal.exitDate && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Animal egresado el {formatDate(animal.exitDate)} — {animal.exitType ?? "Sin tipo"}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Tipo de evento</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TraceabilityEventType | "all")}
            className="h-8 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
          >
            <option value="all">Todos</option>
            {allEventTypes.map((t) => (
              <option key={t} value={t}>{eventTypeLabel[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Desde</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Hasta</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title="Sin eventos"
          description={hasFilters ? "No hay eventos que coincidan con los filtros." : "No hay eventos de trazabilidad registrados."}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card p-4">
          {filteredEvents.map((event, index) => (
            <TimelineEvent
              key={event.id}
              event={event}
              isLast={index === filteredEvents.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
