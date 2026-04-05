"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import type { Animal, MovementSubtype, SelectionMethod } from "@/lib/types"
import { animalRepository } from "@/lib/repositories/animal"
import { activityRepository, type CreateActivityInput } from "@/lib/repositories/activity"
import { traceabilityRepository } from "@/lib/repositories/traceability"
import { useAppStore } from "@/lib/stores/appStore"
import { useAuthStore } from "@/lib/stores/authStore"
import { AnimalSelector } from "@/components/activities/AnimalSelector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn, now } from "@/lib/utils"

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

export default function MovementActivityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const establishments = useAppStore((s) => s.establishments)
  const user = useAuthStore((s) => s.user)

  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<Animal[]>([])
  const [selectionMethod, setSelectionMethod] = useState<SelectionMethod>("individual")
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [subtype, setSubtype] = useState<MovementSubtype>("paddock_move")
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [destinationEstId, setDestinationEstId] = useState("")
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
    if (!estId || !user || selected.length === 0) return
    setSubmitting(true)
    try {
      const ts = now()

      const subtypeLabels: Record<MovementSubtype, string> = {
        paddock_move: "Cambio de potrero",
        field_transfer: "Traslado entre campos",
        external_transfer: "Traslado externo",
      }

      const destEstName =
        subtype === "field_transfer" && destinationEstId
          ? establishments.find((e) => e.id === destinationEstId)?.name ?? destinationEstId
          : null

      const activity = activityRepository.create({
        estId,
        type: "movement",
        animalIds: selected.map((a) => a.id),
        selectionMethod,
        rfidReadingId: null,
        activityDate: ts,
        responsible: user.name,
        notes,
        createdBy: user.uid,
        subtype,
        origin,
        destination: subtype === "field_transfer" ? (destEstName ?? destination) : destination,
        destinationEstablishmentId: subtype === "field_transfer" ? destinationEstId || null : null,
      } as CreateActivityInput)

      for (const animal of selected) {
        traceabilityRepository.create({
          animalId: animal.id,
          estId,
          type: "movement",
          description: `${subtypeLabels[subtype]}: ${origin} → ${subtype === "field_transfer" ? (destEstName ?? destination) : destination}`,
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

  // Other establishments (excluding active)
  const otherEstablishments = establishments.filter((e) => e.id !== estId)

  if (!estId) return null

  return (
    <div className=" space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Volver</Button>
        <h1 className="text-lg font-semibold text-foreground">Movimiento</h1>
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
            Paso 2: Datos del movimiento
          </p>

          <FormField label="Tipo de movimiento">
            <NativeSelect value={subtype} onChange={(e) => setSubtype(e.target.value as MovementSubtype)}>
              <option value="paddock_move">Cambio de potrero</option>
              <option value="field_transfer">Traslado entre campos propios</option>
              <option value="external_transfer">Traslado externo</option>
            </NativeSelect>
          </FormField>

          <FormField label="Origen">
            <Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Potrero / campo de origen" />
          </FormField>

          {subtype === "field_transfer" ? (
            <FormField label="Establecimiento destino">
              {otherEstablishments.length > 0 ? (
                <NativeSelect
                  value={destinationEstId}
                  onChange={(e) => setDestinationEstId(e.target.value)}
                >
                  <option value="">Seleccionar establecimiento...</option>
                  {otherEstablishments.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </NativeSelect>
              ) : (
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Nombre del campo destino"
                />
              )}
            </FormField>
          ) : (
            <FormField label="Destino">
              <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Potrero / campo de destino" />
            </FormField>
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
