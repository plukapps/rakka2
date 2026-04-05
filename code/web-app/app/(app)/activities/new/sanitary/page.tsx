"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import type { Animal, SanitarySubtype, AdministrationRoute, SelectionMethod } from "@/lib/types"
import { animalRepository } from "@/lib/repositories/animal"
import { activityRepository, type CreateActivityInput } from "@/lib/repositories/activity"
import { traceabilityRepository } from "@/lib/repositories/traceability"
import { useAppStore } from "@/lib/stores/appStore"
import { useAuthStore } from "@/lib/stores/authStore"
import { AnimalSelector } from "@/components/activities/AnimalSelector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn, now, formatDate } from "@/lib/utils"

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

export default function SanitaryActivityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const user = useAuthStore((s) => s.user)

  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<Animal[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [subtype, setSubtype] = useState<SanitarySubtype>("vaccination")
  const [product, setProduct] = useState("")
  const [dose, setDose] = useState("")
  const [route, setRoute] = useState<AdministrationRoute>("subcutaneous")
  const [carenciaDays, setCarenciaDays] = useState("")
  const [activityDate, setActivityDate] = useState(new Date().toISOString().slice(0, 10))
  const [responsible, setResponsible] = useState("")
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

  const carenciaExpiry = carenciaDays
    ? formatDate(now() + parseInt(carenciaDays) * 86400000)
    : null

  function handleSubmit() {
    if (!estId || !user || selected.length === 0) return
    setSubmitting(true)
    try {
      const ts = now()
      const carDays = parseInt(carenciaDays) || 0
      const expiresAt = carDays > 0 ? ts + carDays * 86400000 : null

      const selectionMethod: SelectionMethod = "individual"

      const activity = activityRepository.create({
        estId,
        type: "sanitary",
        animalIds: selected.map((a) => a.id),
        selectionMethod,
        rfidReadingId: null,
        activityDate: new Date(activityDate).getTime(),
        responsible,
        notes,
        createdBy: user.uid,
        subtype,
        product,
        dose,
        route,
        carenciaDays: carDays,
        carenciaExpiresAt: expiresAt ?? 0,
      } as CreateActivityInput)

      // Create traceability + update carencia for each animal
      for (const animal of selected) {
        traceabilityRepository.create({
          animalId: animal.id,
          estId,
          type: "sanitary_activity",
          description: `${subtype === "vaccination" ? "Vacunacion" : "Tratamiento"}: ${product}`,
          activityId: activity.id,
          lotId: animal.lotId,
          lotName: null,
          responsibleName: responsible,
          timestamp: ts,
        })

        if (expiresAt) {
          animalRepository.update(estId, animal.id, {
            hasActiveCarencia: true,
            carenciaExpiresAt: expiresAt,
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
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/activities/new">
          <Button variant="ghost" size="sm">← Volver</Button>
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Actividad sanitaria</h1>
      </div>

      {step === 1 && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Paso 1: Seleccionar animales
          </p>
          <AnimalSelector estId={estId} selected={selected} onChange={setSelected} />
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
            Paso 2: Datos sanitarios
          </p>

          <FormField label="Tipo">
            <NativeSelect value={subtype} onChange={(e) => setSubtype(e.target.value as SanitarySubtype)}>
              <option value="vaccination">Vacunacion</option>
              <option value="treatment">Tratamiento</option>
            </NativeSelect>
          </FormField>

          <FormField label="Producto *">
            <Input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Nombre del producto" />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Dosis">
              <Input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="5ml" />
            </FormField>
            <FormField label="Via de administracion">
              <NativeSelect value={route} onChange={(e) => setRoute(e.target.value as AdministrationRoute)}>
                <option value="subcutaneous">Subcutanea</option>
                <option value="intramuscular">Intramuscular</option>
                <option value="oral">Oral</option>
                <option value="topical">Topica</option>
                <option value="other">Otra</option>
              </NativeSelect>
            </FormField>
          </div>

          <FormField label="Dias de carencia">
            <Input
              type="number"
              min="0"
              value={carenciaDays}
              onChange={(e) => setCarenciaDays(e.target.value)}
              placeholder="0"
            />
            {carenciaExpiry && (
              <p className="text-xs text-amber-600">Carencia vence: {carenciaExpiry}</p>
            )}
          </FormField>

          <FormField label="Fecha de actividad">
            <Input type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} />
          </FormField>

          <FormField label="Responsable">
            <Input value={responsible} onChange={(e) => setResponsible(e.target.value)} placeholder="Nombre del responsable" />
          </FormField>

          <FormField label="Notas">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones..." />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setStep(1)}>
              Atras
            </Button>
            <Button onClick={handleSubmit} loading={submitting} disabled={!product}>
              Registrar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
