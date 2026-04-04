"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/utils"
import type { TraceabilityEvent, TraceabilityEventType } from "@/lib/types"

interface TimelineEventProps {
  event: TraceabilityEvent
  isLast?: boolean
}

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

const eventTypeColor: Record<TraceabilityEventType, string> = {
  entry: "#22c55e",
  lot_assignment: "#3b82f6",
  lot_change: "#3b82f6",
  lot_removal: "#3b82f6",
  sanitary_activity: "#f97316",
  commercial_activity: "#a855f7",
  field_control: "#0ea5e9",
  movement: "#14b8a6",
  reproduction: "#ec4899",
  general_activity: "#6b7280",
  rfid_reading: "#6366f1",
  exit: "#ef4444",
  correction: "#9ca3af",
}

export function TimelineEvent({ event, isLast = false }: TimelineEventProps) {
  const [expanded, setExpanded] = useState(false)
  const color = eventTypeColor[event.type]

  return (
    <div className="flex gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
      {/* Timeline column */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="mt-1.5 h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        {!isLast && (
          <div className="w-0.5 flex-1 min-h-4 bg-border" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {eventTypeLabel[event.type]}
            </p>
            <p className="text-xs text-muted-foreground">{event.description}</p>
            {event.responsibleName && (
              <p className="text-xs text-muted-foreground/60">{event.responsibleName}</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatDateTime(event.timestamp)}
          </span>
        </div>

        {expanded && (
          <div className="mt-2 rounded-lg bg-muted/50 p-3 text-xs space-y-1">
            {event.lotName && (
              <p><span className="text-muted-foreground">Lote:</span> <span className="text-foreground">{event.lotName}</span></p>
            )}
            {event.activityId && (
              <p><span className="text-muted-foreground">Actividad:</span> <span className="text-foreground font-mono">{event.activityId}</span></p>
            )}
            <p><span className="text-muted-foreground">Evento ID:</span> <span className="text-foreground font-mono">{event.id}</span></p>
            <p><span className="text-muted-foreground">Creado:</span> <span className="text-foreground">{formatDateTime(event.createdAt)}</span></p>
          </div>
        )}
      </div>
    </div>
  )
}
