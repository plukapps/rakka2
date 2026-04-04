"use client"

import { useState, useEffect } from "react"
import { rfidRepository } from "@/lib/repositories/rfid"
import { useAppStore } from "@/lib/stores/appStore"
import type { RfidReading } from "@/lib/types"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { formatDateTime } from "@/lib/utils"

export default function RfidPage() {
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const [readings, setReadings] = useState<RfidReading[]>([])

  useEffect(() => {
    if (!estId) return
    setReadings(rfidRepository.getAll(estId))
    return rfidRepository.subscribe(estId, () =>
      setReadings(rfidRepository.getAll(estId))
    )
  }, [estId])

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-foreground">Lecturas RFID</h1>

      {readings.length === 0 ? (
        <EmptyState title="Sin lecturas RFID" description="No hay lecturas registradas." />
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {readings.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <StatusBadge variant={r.method === "bluetooth" ? "info" : "neutral"}>
                  {r.method === "bluetooth" ? "Bluetooth" : "Archivo"}
                </StatusBadge>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {r.animalIds.length} animales
                    {r.unknownCaravanas.length > 0 && (
                      <span className="ml-2 text-amber-600 text-xs">
                        +{r.unknownCaravanas.length} desconocida{r.unknownCaravanas.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.fileName ?? r.responsible}
                    {r.activityId && " · Vinculada a actividad"}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{formatDateTime(r.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
