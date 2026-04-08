"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import type { Animal, SelectionMethod } from "@/lib/types"
import { animalRepository } from "@/lib/repositories/animal"
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

export default function GeneralActivityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const user = useAuthStore((s) => s.user)

  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<Animal[]>([])
  const [selectionMethod, setSelectionMethod] = useState<SelectionMethod>("individual")
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [activityDate, setActivityDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState("")

  // Pre-fill from query params
  useEffect(() => {
    if (!estId) return
    const animalId = searchParams.get("animalId")
    const lotId = searchParams.get("lotId")
    if (animalId) {
      const animal = animalRepository.getById(estId, animalId)
      if (animal && animal.status === "active") setSelected([animal])
    } else if (lotId) {
      const lotAnimals = animalRepository
        .getAll(estId)
        .filter((a) => a.lotId === lotId && a.status === "active")
      setSelected(lotAnimals)
    }
  }, [estId, searchParams])

  function handleSubmit() {
    if (!estId || !user || selected.length === 0 || !title) return
    setSubmitting(true)
    try {
      const ts = now()
      const activity = activityRepository.create({
        estId,
        type: "general",
        animalIds: selected.map((a) => a.id),
        selectionMethod,
        unknownCaravanas: [],
        activityDate: new Date(activityDate).getTime(),
        responsible: user.name,
        notes,
        createdBy: user.uid,
        title,
      } as CreateActivityInput)

      for (const animal of selected) {
        traceabilityRepository.create({
          animalId: animal.id,
          estId,
          type: "general_activity",
          description: title,
          activityId: activity.id,
          lotId: animal.lotId,
          lotName: null,
          responsibleName: user.name,
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
    <div className=" space-y-6">
      <div className="flex h-8 items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Volver</Button>
        <h1 className="text-lg font-semibold text-foreground">Actividad general</h1>
      </div>

      {step === 1 && (
        <div className="flex min-h-[calc(100dvh-10rem)] flex-col rounded-xl border border-border bg-card p-6">
          <p className="pb-4 mb-5 border-b border-border text-xs font-bold text-foreground uppercase tracking-wide">
            Paso 1: Seleccionar animales
          </p>
          <div className="flex-1 py-4">
          <AnimalSelector estId={estId} selected={selected} onChange={setSelected} onMethodChange={setSelectionMethod} />
          </div>
          <div className="flex justify-end border-t border-border pt-4 mt-auto">
            <Button onClick={() => setStep(2)} disabled={selected.length === 0}>
              Continuar ({selected.length})
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex min-h-[500px] flex-col rounded-xl border border-border bg-card p-6">
          <p className="pb-4 mb-5 border-b border-border text-xs font-bold text-foreground uppercase tracking-wide">
            Paso 2: Datos de la actividad
          </p>
          <div className="flex-1 grid grid-cols-2 gap-8 py-4">
            <div className="space-y-4">
              <p className="h-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Detalle de la actividad
              </p>
              <FormField label="Titulo *">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titulo de la actividad"
                />
              </FormField>
            </div>

            <div className="space-y-4">
              <p className="h-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Datos generales
              </p>
              <FormField label="Fecha de actividad">
                <Input type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} />
              </FormField>
              <FormField label="Notas">
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones..." />
              </FormField>
            </div>
          </div>

          <div className="flex justify-between border-t border-border pt-4 mt-auto">
            <Button variant="outline" type="button" onClick={() => setStep(1)}>
              Atras
            </Button>
            <Button onClick={handleSubmit} loading={submitting} disabled={!title}>
              Registrar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
