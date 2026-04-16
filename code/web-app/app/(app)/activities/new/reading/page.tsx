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
    <div className="flex max-w-xs flex-col gap-1">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export default function ReadingActivityPage() {
  const router = useRouter()
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const user = useAuthStore((s) => s.user)

  const [step, setStep] = useState<1 | 2>(1)
  const [selected, setSelected] = useState<Animal[]>([])
  const [unknownCaravanas, setUnknownCaravanas] = useState<string[]>([])
  const [selectionMethod, setSelectionMethod] = useState<SelectionMethod>("rfid_file")
  const [fileName, setFileName] = useState<string | null>(null)
  const [activityDate, setActivityDate] = useState(new Date().toISOString().slice(0, 10))
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
        activityDate: new Date(activityDate).getTime(),
        responsible: responsible || user.name,
        notes,
        createdBy: user.uid,
      } as CreateActivityInput)

      for (const animal of selected) {
        traceabilityRepository.create({
          animalId: animal.id,
          estId,
          type: "reading",
          description: `Lectura — ${selectionMethod === "rfid_bluetooth" ? "Bluetooth" : "Archivo"}`,
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
      <div className="flex h-8 items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => step === 1 ? router.back() : setStep(1)}>
          &larr; Volver
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Lectura</h1>
        <span className="ml-auto text-xs text-muted-foreground">Paso {step} de 2</span>
      </div>

      <div className="flex min-h-[calc(100dvh-10rem)] flex-col rounded-xl border border-border bg-card p-6">
        {step === 1 ? (
          <>
            <p className="pb-4 mb-5 border-b border-border text-xs font-bold text-foreground uppercase tracking-wide">
              Seleccionar animales
            </p>
            <div className="flex-1">
              <AnimalSelector
                estId={estId}
                selected={selected}
                onChange={setSelected}
                onUnrecognized={setUnknownCaravanas}
                onMethodChange={setSelectionMethod}
                onFileName={setFileName}
                rfidOnly
              />
            </div>
            <div className="flex justify-end border-t border-border pt-4 mt-auto">
              <Button
                onClick={() => setStep(2)}
                disabled={totalCaravanas === 0}
              >
                Siguiente ({totalCaravanas} caravana{totalCaravanas !== 1 ? "s" : ""}) &rarr;
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="pb-4 mb-5 border-b border-border text-xs font-bold text-foreground uppercase tracking-wide">
              Datos de la lectura
            </p>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Fecha de actividad">
                  <Input type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} />
                </FormField>

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
            </div>

            <div className="flex justify-end border-t border-border pt-4 mt-auto">
              <Button
                onClick={handleSubmit}
                loading={submitting}
                disabled={totalCaravanas === 0}
              >
                Registrar lectura ({totalCaravanas} caravana
                {totalCaravanas !== 1 ? "s" : ""})
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
