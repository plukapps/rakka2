"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { Animal, RfidReading } from "@/lib/types"
import { rfidRepository } from "@/lib/repositories/rfid"
import { traceabilityRepository } from "@/lib/repositories/traceability"
import { useAppStore } from "@/lib/stores/appStore"
import { useAuthStore } from "@/lib/stores/authStore"
import { AnimalSelector } from "@/components/activities/AnimalSelector"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { formatDateTime, now } from "@/lib/utils"

export default function RfidPage() {
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const user = useAuthStore((s) => s.user)
  const [readings, setReadings] = useState<RfidReading[]>([])
  const [selected, setSelected] = useState<Animal[]>([])
  const [unknownCaravanas, setUnknownCaravanas] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!estId) return
    setReadings(rfidRepository.getAll(estId))
    return rfidRepository.subscribe(estId, () =>
      setReadings(rfidRepository.getAll(estId))
    )
  }, [estId])

  const totalCaravanas = selected.length + unknownCaravanas.length

  function handleSubmit() {
    if (!estId || !user || totalCaravanas === 0) return
    setSubmitting(true)
    try {
      const ts = now()

      rfidRepository.create({
        estId,
        method: "file_upload",
        fileName: null,
        animalIds: selected.map((a) => a.id),
        unknownCaravanas,
        activityId: null,
        responsible: user.name,
        notes: "",
        createdBy: user.uid,
      })

      for (const animal of selected) {
        traceabilityRepository.create({
          animalId: animal.id,
          estId,
          type: "rfid_reading",
          description: "Lectura RFID registrada",
          activityId: null,
          lotId: animal.lotId,
          lotName: null,
          responsibleName: user.name,
          timestamp: ts,
        })
      }

      setSelected([])
      setUnknownCaravanas([])
      setShowForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancel() {
    setShowForm(false)
    setSelected([])
    setUnknownCaravanas([])
  }

  if (!estId) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Lecturas</h1>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            + Nueva lectura
          </Button>
        )}
      </div>

      {showForm && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Lectura RFID
            </p>
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
          </div>

          <AnimalSelector
            estId={estId}
            selected={selected}
            onChange={setSelected}
            onUnrecognized={setUnknownCaravanas}
            rfidOnly
          />

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={totalCaravanas === 0}
            >
              Registrar lectura ({totalCaravanas} caravana{totalCaravanas !== 1 ? "s" : ""})
            </Button>
          </div>
        </div>
      )}

      {readings.length === 0 && !showForm ? (
        <EmptyState title="Sin lecturas" description="No hay lecturas registradas." />
      ) : (
        readings.length > 0 && (
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {readings.map((r) => {
              const total = r.animalIds.length + r.unknownCaravanas.length
              return (
                <Link key={r.id} href={`/rfid/${r.id}`}>
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <StatusBadge variant={r.method === "bluetooth" ? "info" : "neutral"}>
                        {r.method === "bluetooth" ? "Bluetooth" : "Archivo"}
                      </StatusBadge>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {total} caravana{total !== 1 ? "s" : ""}
                          {r.animalIds.length > 0 && (
                            <span className="ml-1 text-xs text-emerald-600">
                              ({r.animalIds.length} en stock)
                            </span>
                          )}
                          {r.unknownCaravanas.length > 0 && (
                            <span className="ml-1 text-xs text-amber-600">
                              ({r.unknownCaravanas.length} sin registro)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.responsible} · {formatDateTime(r.timestamp)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
