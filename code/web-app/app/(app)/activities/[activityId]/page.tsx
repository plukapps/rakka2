"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { activityRepository } from "@/lib/repositories/activity"
import { animalRepository } from "@/lib/repositories/animal"
import { useAppStore } from "@/lib/stores/appStore"
import type {
  Activity,
  Animal,
  SanitaryActivity,
  CommercialActivity,
  FieldControlActivity,
  MovementActivity,
  ReproductionActivity,
  GeneralActivity,
} from "@/lib/types"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { TagView } from "@/components/animals/TagView"
import {
  activityTypeLabel,
  formatDateTime,
} from "@/lib/utils"

const typeVariant: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  sanitary: "warning",
  commercial: "danger",
  field_control: "info",
  movement: "neutral",
  reproduction: "success",
  general: "neutral",
}

const selectionMethodLabel: Record<string, string> = {
  rfid_bluetooth: "RFID Bluetooth",
  rfid_file: "Archivo RFID",
  lot: "Por lote",
  individual: "Individual",
}

function activityDescription(act: Activity): string {
  switch (act.type) {
    case "sanitary": {
      const s = act as SanitaryActivity
      const sub = s.subtype === "vaccination" ? "Vacunación" : "Tratamiento"
      return s.product ? `${sub} — ${s.product}` : sub
    }
    case "commercial": {
      const c = act as CommercialActivity
      return c.subtype === "sale" ? "Venta" : "Despacho"
    }
    case "field_control": {
      const fc = act as FieldControlActivity
      const labels: Record<string, string> = {
        weighing: "Pesaje",
        count: "Conteo",
        body_condition: "Condición corporal",
        pregnancy_check: "Revisión de preñez",
        other: "Control de campo",
      }
      return labels[fc.subtype] ?? "Control de campo"
    }
    case "movement": {
      const m = act as MovementActivity
      const labels: Record<string, string> = {
        paddock_move: "Movimiento entre potreros",
        field_transfer: "Transferencia a otro establecimiento",
        external_transfer: "Transferencia externa",
      }
      return labels[m.subtype] ?? "Movimiento"
    }
    case "reproduction": {
      const r = act as ReproductionActivity
      const labels: Record<string, string> = {
        service: "Servicio",
        pregnancy_diagnosis: "Diagnóstico de preñez",
        birth: "Parto",
        weaning: "Destete",
      }
      return labels[r.subtype] ?? "Reproducción"
    }
    case "general": {
      const g = act as GeneralActivity
      return g.title || "Actividad general"
    }
    default:
      return activityTypeLabel(act.type)
  }
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function SanitaryDetails({ act }: { act: SanitaryActivity }) {
  const routeLabel: Record<string, string> = {
    subcutaneous: "Subcutánea",
    intramuscular: "Intramuscular",
    oral: "Oral",
    topical: "Tópica",
    other: "Otra",
  }
  return (
    <div className="grid grid-cols-2 gap-4">
      <DetailField label="Tipo" value={act.subtype === "vaccination" ? "Vacunación" : "Tratamiento"} />
      <DetailField label="Producto" value={act.product} />
      <DetailField label="Dosis" value={act.dose} />
      <DetailField label="Vía de administración" value={routeLabel[act.route]} />
      <DetailField label="Días de carencia" value={act.carenciaDays > 0 ? `${act.carenciaDays} días` : "Sin carencia"} />
      {act.carenciaDays > 0 && act.carenciaExpiresAt && (
        <DetailField label="Carencia hasta" value={formatDateTime(act.carenciaExpiresAt)} />
      )}
    </div>
  )
}

function CommercialDetails({ act }: { act: CommercialActivity }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <DetailField label="Tipo" value={act.subtype === "sale" ? "Venta" : "Despacho"} />
      <DetailField label="Comprador / Destinatario" value={act.buyer} />
      <DetailField label="Destino" value={act.destination} />
      {act.pricePerHead != null && (
        <DetailField label="Precio por cabeza" value={`$${act.pricePerHead}`} />
      )}
      {act.totalPrice != null && (
        <DetailField label="Precio total" value={`$${act.totalPrice}`} />
      )}
    </div>
  )
}

function FieldControlDetails({ act }: { act: FieldControlActivity }) {
  const subtypeLabel: Record<string, string> = {
    weighing: "Pesaje",
    count: "Conteo",
    body_condition: "Condición corporal",
    pregnancy_check: "Revisión de preñez",
    other: "Otro",
  }
  return (
    <div className="grid grid-cols-2 gap-4">
      <DetailField label="Subtipo" value={subtypeLabel[act.subtype]} />
      {act.weightKg != null && <DetailField label="Peso promedio" value={`${act.weightKg} kg`} />}
      {act.scale && <DetailField label="Báscula / Fuente" value={act.scale} />}
      {act.result && <DetailField label="Resultado" value={act.result} />}
    </div>
  )
}

function MovementDetails({ act }: { act: MovementActivity }) {
  const subtypeLabel: Record<string, string> = {
    paddock_move: "Entre potreros",
    field_transfer: "Transferencia a otro establecimiento",
    external_transfer: "Transferencia externa",
  }
  return (
    <div className="grid grid-cols-2 gap-4">
      <DetailField label="Subtipo" value={subtypeLabel[act.subtype]} />
      <DetailField label="Origen" value={act.origin} />
      <DetailField label="Destino" value={act.destination} />
    </div>
  )
}

function ReproductionDetails({ act }: { act: ReproductionActivity }) {
  const subtypeLabel: Record<string, string> = {
    service: "Servicio",
    pregnancy_diagnosis: "Diagnóstico de preñez",
    birth: "Parto",
    weaning: "Destete",
  }
  const serviceTypeLabel: Record<string, string> = {
    natural: "Natural",
    artificial_insemination: "Inseminación artificial",
    embryo_transfer: "Transferencia embrionaria",
  }
  const pregnancyResultLabel: Record<string, string> = {
    positive: "Positivo",
    negative: "Negativo",
    uncertain: "Incierto",
  }
  const birthResultLabel: Record<string, string> = {
    live: "Vivo",
    stillborn: "Mortinato",
    abortion: "Aborto",
  }
  return (
    <div className="grid grid-cols-2 gap-4">
      <DetailField label="Subtipo" value={subtypeLabel[act.subtype]} />
      {act.serviceType && <DetailField label="Tipo de servicio" value={serviceTypeLabel[act.serviceType]} />}
      {act.pregnancyResult && <DetailField label="Resultado preñez" value={pregnancyResultLabel[act.pregnancyResult]} />}
      {act.birthResult && <DetailField label="Resultado parto" value={birthResultLabel[act.birthResult]} />}
      {act.offspringCaravana && <DetailField label="Caravana de la cría" value={act.offspringCaravana} />}
    </div>
  )
}

function GeneralDetails({ act }: { act: GeneralActivity }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <DetailField label="Título" value={act.title} />
    </div>
  )
}

function ActivityTypeDetails({ act }: { act: Activity }) {
  switch (act.type) {
    case "sanitary": return <SanitaryDetails act={act as SanitaryActivity} />
    case "commercial": return <CommercialDetails act={act as CommercialActivity} />
    case "field_control": return <FieldControlDetails act={act as FieldControlActivity} />
    case "movement": return <MovementDetails act={act as MovementActivity} />
    case "reproduction": return <ReproductionDetails act={act as ReproductionActivity} />
    case "general": return <GeneralDetails act={act as GeneralActivity} />
  }
}

export default function ActivityDetailPage() {
  const router = useRouter()
  const { activityId } = useParams<{ activityId: string }>()
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const [activity, setActivity] = useState<Activity | null | undefined>(undefined)
  const [animals, setAnimals] = useState<Animal[]>([])

  useEffect(() => {
    if (!estId) return
    const act = activityRepository.getById(estId, activityId)
    setActivity(act ?? null)
    if (act) {
      const all = animalRepository.getAll(estId)
      setAnimals(all.filter((a) => act.animalIds.includes(a.id)))
    }
  }, [estId, activityId])

  if (activity === undefined) return null

  if (activity === null) {
    return (
      <EmptyState
        title="Actividad no encontrada"
        description="La actividad no existe o fue eliminada."
        action={<button onClick={() => router.back()} className="text-sm text-primary underline">← Volver a Actividades</button>}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Actividades
        </button>
        <div className="flex items-center gap-3">
          <StatusBadge variant={typeVariant[activity.type] ?? "neutral"}>
            {activityTypeLabel(activity.type)}
          </StatusBadge>
          <h1 className="text-lg font-semibold text-foreground">{activityDescription(activity)}</h1>
          <span className="ml-auto text-sm text-muted-foreground">{formatDateTime(activity.activityDate)}</span>
        </div>
      </div>

      {/* Datos generales */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Datos generales</h2>
        <div className="grid grid-cols-2 gap-4">
          <DetailField label="Responsable" value={activity.responsible || "—"} />
          <DetailField label="Método de selección" value={selectionMethodLabel[activity.selectionMethod]} />
          {activity.notes && (
            <div className="col-span-2">
              <DetailField label="Notas" value={activity.notes} />
            </div>
          )}
        </div>
      </section>

      {/* Detalles del tipo */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Detalles</h2>
        <ActivityTypeDetails act={activity} />
      </section>

      {/* Animales */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Animales{" "}
          <span className="font-normal text-muted-foreground">({animals.length})</span>
        </h2>
        {animals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin animales registrados.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {animals.map((animal) => (
              <Link key={animal.id} href={`/animals/${animal.id}`} className="hover:opacity-80 transition-opacity">
                <TagView caravana={animal.caravana} size="md" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
