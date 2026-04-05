"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import type { Animal, FieldControlSubtype, SelectionMethod } from "@/lib/types"
import { animalRepository } from "@/lib/repositories/animal"
import { activityRepository, type CreateActivityInput } from "@/lib/repositories/activity"
import { traceabilityRepository } from "@/lib/repositories/traceability"
import { calculateGdp } from "@/lib/gdp"
import { useAppStore } from "@/lib/stores/appStore"
import { useAuthStore } from "@/lib/stores/authStore"
import { AnimalSelector } from "@/components/activities/AnimalSelector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn, now, formatCaravana } from "@/lib/utils"

function NativeSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

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

const SUBTYPE_LABELS: Record<FieldControlSubtype, string> = {
  weighing: "Pesaje",
  count: "Conteo",
  body_condition: "Condicion corporal",
  pregnancy_check: "Tacto (revision prenez)",
  other: "Otro",
}

export default function FieldControlActivityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const user = useAuthStore((s) => s.user)

  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<Animal[]>([])
  const [selectionMethod, setSelectionMethod] = useState<SelectionMethod>("individual")
  const [weightMap, setWeightMap] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [subtype, setSubtype] = useState<FieldControlSubtype>("weighing")
  const [weightsPerAnimal, setWeightsPerAnimal] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState("")

  // Total active animals in establishment (for count comparison)
  const totalActive = useMemo(() => {
    if (!estId) return 0
    return animalRepository.getAll(estId).filter((a) => a.status === "active").length
  }, [estId])

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

  // When RFID file provides weights, pre-populate per-animal weights
  useEffect(() => {
    if (Object.keys(weightMap).length === 0) return
    setWeightsPerAnimal((prev) => {
      const next = { ...prev }
      for (const [id, weight] of Object.entries(weightMap)) {
        if (!next[id]) next[id] = String(weight)
      }
      return next
    })
  }, [weightMap])

  // Initialize per-animal weights when selected animals change (for weighing)
  useEffect(() => {
    if (subtype !== "weighing") return
    setWeightsPerAnimal((prev) => {
      const next: Record<string, string> = {}
      for (const animal of selected) {
        next[animal.id] = prev[animal.id] ?? weightMap[animal.id]?.toString() ?? ""
      }
      return next
    })
  }, [selected, subtype]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit() {
    if (!estId || !user || selected.length === 0) return
    setSubmitting(true)
    try {
      const ts = now()

      // Build per-animal weights map (only for weighing)
      const weightsByAnimal: Record<string, number> | null =
        subtype === "weighing" && Object.keys(weightsPerAnimal).length > 0
          ? Object.fromEntries(
              Object.entries(weightsPerAnimal)
                .filter(([, v]) => v !== "")
                .map(([k, v]) => [k, parseFloat(v)])
                .filter(([, v]) => !isNaN(v as number))
            )
          : null

      // Single average weight for backward compat
      const weights = weightsByAnimal ? Object.values(weightsByAnimal) : []
      const avgWeight =
        weights.length > 0
          ? Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10
          : null

      const activity = activityRepository.create({
        estId,
        type: "field_control",
        animalIds: selected.map((a) => a.id),
        selectionMethod,
        unknownCaravanas: [],
        activityDate: ts,
        responsible: user.name,
        notes,
        createdBy: user.uid,
        subtype,
        weightKg: avgWeight,
        weightsByAnimal,
        scale: null,
        result: null,
      } as CreateActivityInput)

      for (const animal of selected) {
        const animalWeight = weightsByAnimal?.[animal.id]
        traceabilityRepository.create({
          animalId: animal.id,
          estId,
          type: "field_control",
          description: `Control de campo: ${SUBTYPE_LABELS[subtype]}${animalWeight ? ` - ${animalWeight}kg` : avgWeight ? ` - ${avgWeight}kg` : ""}`,
          activityId: activity.id,
          lotId: animal.lotId,
          lotName: null,
          responsibleName: user.name,
          timestamp: ts,
        })
      }

      // Mock denormalization: update weight/GDP fields on each animal (simulates Cloud Function)
      if (subtype === "weighing" && weightsByAnimal) {
        for (const [animalId, weight] of Object.entries(weightsByAnimal)) {
          const animal = animalRepository.getById(estId, animalId)
          if (!animal) continue
          const prevWeight = animal.lastWeight ?? animal.entryWeight
          const prevDate = animal.lastWeightDate ?? animal.entryDate
          const gdpRecent = prevWeight != null ? calculateGdp(prevWeight, weight, prevDate, ts) : null
          const gdpAccumulated =
            animal.entryWeight != null ? calculateGdp(animal.entryWeight, weight, animal.entryDate, ts) : null
          animalRepository.update(estId, animalId, {
            lastWeight: weight,
            lastWeightDate: ts,
            gdpRecent: gdpRecent != null ? Math.round(gdpRecent * 100) / 100 : null,
            gdpAccumulated: gdpAccumulated != null ? Math.round(gdpAccumulated * 100) / 100 : null,
          })
        }
      }

      router.push("/activities")
    } finally {
      setSubmitting(false)
    }
  }

  if (!estId) return null

  return (
    <div className=" space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Volver</Button>
        <h1 className="text-lg font-semibold text-foreground">Control de campo</h1>
      </div>

      {step === 1 && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Paso 1: Seleccionar animales
          </p>
          <AnimalSelector
            estId={estId}
            selected={selected}
            onChange={setSelected}
            onMethodChange={setSelectionMethod}
            onWeightMap={setWeightMap}
          />
          <div className="flex justify-end pt-2">
            <Button onClick={() => setStep(2)} disabled={selected.length === 0}>
              Continuar ({selected.length})
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-xs text-primary hover:underline"
          >
            ← Cambiar seleccion ({selected.length} animales)
          </button>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Paso 2: Datos del control
          </p>

          <FormField label="Tipo de control">
            <NativeSelect value={subtype} onChange={(e) => setSubtype(e.target.value as FieldControlSubtype)}>
              {Object.entries(SUBTYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </NativeSelect>
          </FormField>

          {subtype === "weighing" && (
            <div className="space-y-2">
              <Label>Peso por animal (kg)</Label>
              {Object.keys(weightMap).length > 0 && (
                <p className="text-xs text-emerald-700">
                  Pesos pre-cargados desde archivo RFID
                </p>
              )}
              <div className="max-h-64 overflow-y-auto space-y-1 rounded-lg border border-border p-2">
                {selected.map((animal) => (
                  <div key={animal.id} className="flex items-center gap-3 px-1 py-1">
                    <span className="text-xs font-mono text-muted-foreground w-28 shrink-0">
                      {formatCaravana(animal.caravana, "serie")}
                    </span>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      className="h-7 text-sm"
                      placeholder="kg"
                      value={weightsPerAnimal[animal.id] ?? ""}
                      onChange={(e) =>
                        setWeightsPerAnimal((prev) => ({
                          ...prev,
                          [animal.id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {subtype === "count" && (
            <div className="rounded-md border border-border p-3 space-y-1">
              <p className="text-sm font-medium text-foreground">
                {selected.length} animales seleccionados
              </p>
              <p className="text-xs text-muted-foreground">
                Total activos en el establecimiento: {totalActive}
              </p>
              {totalActive - selected.length > 0 && (
                <p className="text-xs text-amber-600">
                  Diferencia: {totalActive - selected.length} animales no contabilizados
                </p>
              )}
            </div>
          )}

          <FormField label="Notas">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones..." />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setStep(1)}>
              Atras
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              Registrar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
