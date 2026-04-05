"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Animal, SelectionMethod } from "@/lib/types"
import { activityRepository, type CreateActivityInput } from "@/lib/repositories/activity"
import { traceabilityRepository } from "@/lib/repositories/traceability"
import { useAppStore } from "@/lib/stores/appStore"
import { useAuthStore } from "@/lib/stores/authStore"
import { AnimalSelector } from "@/components/activities/AnimalSelector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { now } from "@/lib/utils"

function FormField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export default function ReadingActivityPage() {
  const router = useRouter()
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const user = useAuthStore((s) => s.user)

  const [selected, setSelected] = useState<Animal[]>([])
  const [unknownCaravanas, setUnknownCaravanas] = useState<string[]>([])
  const [selectionMethod, setSelectionMethod] = useState<SelectionMethod>("rfid_file")
  const [fileName, setFileName] = useState<string | null>(null)
  const [responsible, setResponsible] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const totalCaravanas = selected.length + unknownCaravanas.length

  function handleSubmit() {
    if (!estId || !user || totalCaravanas === 0) return
    setSubmitting(true)
    try {
      const ts = now()
      const activity = activityRepository.create({
        estId,
        type: "reading",
        animalIds: selected.map((a) => a.id),
        selectionMethod,
        unknownCaravanas,
        fileName: fileName || undefined,
        activityDate: ts,
        responsible: responsible || user.name,
        notes,
        createdBy: user.uid,
      } as CreateActivityInput)

      for (const animal of selected) {
        traceabilityRepository.create({
          animalId: animal.id,
          estId,
          type: "reading",
          description: `Lectura RFID — ${selectionMethod === "rfid_bluetooth" ? "Bluetooth" : "Archivo"}`,
          activityId: activity.id,
          lotId: animal.lotId,
          lotName: null,
          responsibleName: responsible || user.name,
          timestamp: ts,
        })
      }

      router.push("/activities")
    } finally {
      setSubmitting(false)
    }
  }

  if (!estId) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          &larr; Volver
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Lectura RFID</h1>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <AnimalSelector
          estId={estId}
          selected={selected}
          onChange={setSelected}
          onUnrecognized={setUnknownCaravanas}
          onMethodChange={setSelectionMethod}
          onFileName={setFileName}
          rfidOnly
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Responsable">
            <Input
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              placeholder={user?.name ?? "Nombre del responsable"}
            />
          </FormField>

          <FormField label="Notas">
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones..."
            />
          </FormField>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSubmit}
            loading={submitting}
            disabled={totalCaravanas === 0}
          >
            Registrar lectura ({totalCaravanas} caravana
            {totalCaravanas !== 1 ? "s" : ""})
          </Button>
        </div>
      </div>
    </div>
  )
}
