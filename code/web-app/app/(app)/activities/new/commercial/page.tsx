"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import type { Animal, CommercialSubtype, SelectionMethod } from "@/lib/types"
import { animalRepository } from "@/lib/repositories/animal"
import { activityRepository, type CreateActivityInput } from "@/lib/repositories/activity"
import { traceabilityRepository } from "@/lib/repositories/traceability"
import { lotRepository } from "@/lib/repositories/lot"
import { useAppStore } from "@/lib/stores/appStore"
import { useAuthStore } from "@/lib/stores/authStore"
import { AnimalSelector } from "@/components/activities/AnimalSelector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/ui/status-badge"
import { cn, now, formatCaravana, carenciaLabel, daysUntil } from "@/lib/utils"

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

export default function CommercialActivityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const user = useAuthStore((s) => s.user)

  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<Animal[]>([])
  const [selectionMethod, setSelectionMethod] = useState<SelectionMethod>("individual")
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [subtype, setSubtype] = useState<CommercialSubtype>("sale")
  const [buyer, setBuyer] = useState("")
  const [destination, setDestination] = useState("")
  const [pricePerHead, setPricePerHead] = useState("")
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

  // Carencia validation
  const animalsWithCarencia = useMemo(
    () => selected.filter((a) => a.hasActiveCarencia),
    [selected]
  )

  const totalPrice = pricePerHead
    ? parseFloat(pricePerHead) * selected.length
    : null

  function handleSubmit() {
    if (!estId || !user || selected.length === 0 || animalsWithCarencia.length > 0) return
    setSubmitting(true)
    try {
      const ts = now()
      const price = pricePerHead ? parseFloat(pricePerHead) : null
      const activity = activityRepository.create({
        estId,
        type: "commercial",
        animalIds: selected.map((a) => a.id),
        selectionMethod,
        unknownCaravanas: [],
        activityDate: ts,
        responsible: user.name,
        notes,
        createdBy: user.uid,
        subtype,
        buyer,
        destination,
        pricePerHead: price,
        totalPrice: price ? price * selected.length : null,
        status: "confirmed",
      } as CreateActivityInput)

      // Exit each animal + traceability
      for (const animal of selected) {
        traceabilityRepository.create({
          animalId: animal.id,
          estId,
          type: "commercial_activity",
          description: `${subtype === "sale" ? "Venta" : "Despacho"}${buyer ? ` a ${buyer}` : ""}`,
          activityId: activity.id,
          lotId: animal.lotId,
          lotName: null,
          responsibleName: user.name,
          timestamp: ts,
        })

        // Exit animal — capture exitLotId before clearing lotId
        animalRepository.update(estId, animal.id, {
          status: "exited",
          exitDate: ts,
          exitType: subtype,
          exitLotId: animal.lotId,
          lotId: null,
        })

        // Update lot animal count if animal was in a lot
        if (animal.lotId) {
          const lot = lotRepository.getById(estId, animal.lotId)
          if (lot && lot.animalCount > 0) {
            lotRepository.update(estId, animal.lotId, {
              animalCount: lot.animalCount - 1,
            })
          }
        }

        // Traceability: exit
        traceabilityRepository.create({
          animalId: animal.id,
          estId,
          type: "exit",
          description: `Egreso por ${subtype === "sale" ? "venta" : "despacho"}`,
          activityId: activity.id,
          lotId: null,
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
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Volver</Button>
        <h1 className="text-lg font-semibold text-foreground">Actividad comercial</h1>
      </div>

      {step === 1 && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Paso 1: Seleccionar animales
          </p>
          <AnimalSelector estId={estId} selected={selected} onChange={setSelected} onMethodChange={setSelectionMethod} />
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

          {/* Carencia warning */}
          {animalsWithCarencia.length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 space-y-2">
              <p className="text-xs font-medium text-red-800">
                {animalsWithCarencia.length} animal{animalsWithCarencia.length !== 1 ? "es" : ""} con carencia activa. Deben ser removidos para continuar.
              </p>
              {animalsWithCarencia.map((a) => (
                <div key={a.id} className="flex items-center gap-2 text-xs text-red-700">
                  <span>{formatCaravana(a.caravana, "serie")}</span>
                  <StatusBadge variant="warning">
                    {a.carenciaExpiresAt ? `${daysUntil(a.carenciaExpiresAt)} dias restantes` : "Carencia activa"}
                  </StatusBadge>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Paso 2: Datos comerciales
          </p>

          <FormField label="Tipo">
            <NativeSelect value={subtype} onChange={(e) => setSubtype(e.target.value as CommercialSubtype)}>
              <option value="sale">Venta</option>
              <option value="dispatch">Despacho</option>
            </NativeSelect>
          </FormField>

          <FormField label="Comprador">
            <Input value={buyer} onChange={(e) => setBuyer(e.target.value)} placeholder="Nombre del comprador" />
          </FormField>

          <FormField label="Destino">
            <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destino" />
          </FormField>

          <FormField label="Precio por cabeza">
            <Input
              type="number"
              step="0.01"
              value={pricePerHead}
              onChange={(e) => setPricePerHead(e.target.value)}
              placeholder="0.00"
            />
            {totalPrice !== null && (
              <p className="text-xs text-muted-foreground">
                Total: ${totalPrice.toLocaleString("es-AR", { minimumFractionDigits: 2 })} ({selected.length} cabezas)
              </p>
            )}
          </FormField>

          <FormField label="Notas">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones..." />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setStep(1)}>
              Atras
            </Button>
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={animalsWithCarencia.length > 0}
            >
              Registrar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
