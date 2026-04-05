"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import type {
  Animal,
  ReproductionSubtype,
  ServiceType,
  PregnancyResult,
  BirthResult,
  SelectionMethod,
} from "@/lib/types"
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

export default function ReproductionActivityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const user = useAuthStore((s) => s.user)

  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<Animal[]>([])
  const [selectionMethod, setSelectionMethod] = useState<SelectionMethod>("individual")
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [subtype, setSubtype] = useState<ReproductionSubtype>("service")
  const [serviceType, setServiceType] = useState<ServiceType>("natural")
  const [pregnancyResult, setPregnancyResult] = useState<PregnancyResult>("positive")
  const [birthResult, setBirthResult] = useState<BirthResult>("live")
  const [offspringCaravana, setOffspringCaravana] = useState("")
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
      const subtypeLabels: Record<ReproductionSubtype, string> = {
        service: "Servicio",
        pregnancy_diagnosis: "Diagnostico de gestacion",
        birth: "Parto",
        weaning: "Destete",
      }

      const activity = activityRepository.create({
        estId,
        type: "reproduction",
        animalIds: selected.map((a) => a.id),
        selectionMethod,
        rfidReadingId: null,
        activityDate: ts,
        responsible: user.name,
        notes,
        createdBy: user.uid,
        subtype,
        serviceType: subtype === "service" ? serviceType : null,
        pregnancyResult: subtype === "pregnancy_diagnosis" ? pregnancyResult : null,
        birthResult: subtype === "birth" ? birthResult : null,
        offspringCaravana:
          subtype === "birth" && birthResult === "live" && offspringCaravana
            ? offspringCaravana
            : null,
      } as CreateActivityInput)

      for (const animal of selected) {
        let description = subtypeLabels[subtype]
        if (subtype === "service") {
          const stLabels: Record<ServiceType, string> = {
            natural: "monta natural",
            artificial_insemination: "inseminacion artificial",
            embryo_transfer: "transferencia embrionaria",
          }
          description += `: ${stLabels[serviceType]}`
        } else if (subtype === "pregnancy_diagnosis") {
          const prLabels: Record<PregnancyResult, string> = {
            positive: "positivo",
            negative: "negativo",
            uncertain: "incierto",
          }
          description += `: ${prLabels[pregnancyResult]}`
        } else if (subtype === "birth") {
          const brLabels: Record<BirthResult, string> = {
            live: "nacimiento vivo",
            stillborn: "mortinato",
            abortion: "aborto",
          }
          description += `: ${brLabels[birthResult]}`
        }

        traceabilityRepository.create({
          animalId: animal.id,
          estId,
          type: "reproduction",
          description,
          activityId: activity.id,
          lotId: animal.lotId,
          lotName: null,
          responsibleName: user.name,
          timestamp: ts,
        })
      }

      // Auto-create offspring if birth + live + caravana provided
      if (
        subtype === "birth" &&
        birthResult === "live" &&
        offspringCaravana &&
        offspringCaravana.length === 15
      ) {
        const mother = selected[0]
        animalRepository.create({
          estId,
          caravana: offspringCaravana,
          category: "ternero",
          sex: "male",
          breed: mother?.breed ?? "",
          birthDate: new Date().toISOString().slice(0, 10),
          entryWeight: null,
          origin: "Nacimiento en establecimiento",
          entryType: "birth",
          lotId: mother?.lotId ?? null,
          createdBy: user.uid,
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
        <h1 className="text-lg font-semibold text-foreground">Reproduccion</h1>
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

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Paso 2: Datos reproductivos
          </p>

          <FormField label="Tipo">
            <NativeSelect value={subtype} onChange={(e) => setSubtype(e.target.value as ReproductionSubtype)}>
              <option value="service">Servicio</option>
              <option value="pregnancy_diagnosis">Diagnostico de gestacion</option>
              <option value="birth">Parto</option>
              <option value="weaning">Destete</option>
            </NativeSelect>
          </FormField>

          {subtype === "service" && (
            <FormField label="Tipo de servicio">
              <NativeSelect value={serviceType} onChange={(e) => setServiceType(e.target.value as ServiceType)}>
                <option value="natural">Monta natural</option>
                <option value="artificial_insemination">Inseminacion artificial</option>
                <option value="embryo_transfer">Transferencia embrionaria</option>
              </NativeSelect>
            </FormField>
          )}

          {subtype === "pregnancy_diagnosis" && (
            <FormField label="Resultado">
              <NativeSelect value={pregnancyResult} onChange={(e) => setPregnancyResult(e.target.value as PregnancyResult)}>
                <option value="positive">Positivo</option>
                <option value="negative">Negativo</option>
                <option value="uncertain">Incierto</option>
              </NativeSelect>
            </FormField>
          )}

          {subtype === "birth" && (
            <>
              <FormField label="Resultado del parto">
                <NativeSelect value={birthResult} onChange={(e) => setBirthResult(e.target.value as BirthResult)}>
                  <option value="live">Nacimiento vivo</option>
                  <option value="stillborn">Mortinato</option>
                  <option value="abortion">Aborto</option>
                </NativeSelect>
              </FormField>
              {birthResult === "live" && (
                <FormField label="Caravana de la cria">
                  <Input
                    value={offspringCaravana}
                    onChange={(e) => setOffspringCaravana(e.target.value)}
                    placeholder="858000123456789"
                    maxLength={15}
                  />
                  <p className="text-xs text-muted-foreground">
                    Si se ingresa, se crea automaticamente el animal en el sistema
                  </p>
                </FormField>
              )}
            </>
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
