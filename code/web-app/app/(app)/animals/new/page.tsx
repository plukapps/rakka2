"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { animalRepository } from "@/lib/repositories/animal"
import { useAppStore } from "@/lib/stores/appStore"
import { useAuthStore } from "@/lib/stores/authStore"
import { useLots } from "@/hooks/useLots"
import { useAnimals } from "@/hooks/useAnimals"
import { activityRepository } from "@/lib/repositories/activity"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn, formatDate, formatCaravana, categoryLabel } from "@/lib/utils"
import type { Animal, AnimalCategory, AnimalSex, AnimalEntryType, Activity } from "@/lib/types"

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function FormField({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">
      {children}
    </p>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "select-method" | "individual" | "rfid-pick" | "rfid-review"

interface IndividualFormValues {
  caravana: string
  category: AnimalCategory
  sex: AnimalSex
  breed: string
  birthDate: string
  entryType: AnimalEntryType
  entryWeight: string
  purchasePriceUsd: string
  origin: string
  lotId: string
}

interface CommonData {
  entryType: AnimalEntryType
  category: AnimalCategory
  sex: AnimalSex
  breed: string
  origin: string
  lotId: string
  purchasePriceUsd: string
}

interface AnimalRowOverride {
  category?: AnimalCategory
  sex?: AnimalSex
  breed?: string
  origin?: string
}

interface AnimalRow {
  included: boolean
  expanded: boolean
  alreadyExists: boolean
  overrides: AnimalRowOverride
}

// ─── Method selector ─────────────────────────────────────────────────────────

function MethodSelector({ onSelect }: { onSelect: (method: "individual" | "rfid-pick") => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Ingresar animales</h1>
        <p className="text-sm text-muted-foreground mt-1">¿Cómo querés registrarlos?</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect("individual")}
          className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 text-left hover:border-ring hover:shadow-sm transition-all"
        >
          <span className="text-2xl">🐄</span>
          <span className="font-semibold text-foreground">Individual</span>
          <span className="text-sm text-muted-foreground">Ingresá un animal cargando sus datos manualmente.</span>
        </button>
        <button
          onClick={() => onSelect("rfid-pick")}
          className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 text-left hover:border-ring hover:shadow-sm transition-all"
        >
          <span className="text-2xl">📡</span>
          <span className="font-semibold text-foreground">Desde lectura RFID</span>
          <span className="text-sm text-muted-foreground">Importá caravanas de una lectura ya registrada.</span>
        </button>
      </div>
    </div>
  )
}

// ─── Individual form ──────────────────────────────────────────────────────────

function IndividualForm({
  estId,
  userId,
  lots,
  onBack,
}: {
  estId: string
  userId: string
  lots: { id: string; name: string }[]
  onBack: () => void
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<IndividualFormValues>({
    defaultValues: { category: "vaca", sex: "female", entryType: "purchase" },
  })

  const watchedEntryType = watch("entryType")

  async function onSubmit(data: IndividualFormValues) {
    if (!animalRepository.isCaravanaUnique(estId, data.caravana)) {
      setError("caravana", { message: "Esta caravana ya existe en el establecimiento" })
      return
    }
    setSubmitting(true)
    try {
      const animal = animalRepository.create({
        estId,
        caravana: data.caravana,
        category: data.category,
        sex: data.sex,
        breed: data.breed,
        birthDate: data.birthDate || null,
        entryWeight: data.entryWeight ? parseFloat(data.entryWeight) : null,
        origin: data.origin,
        entryType: data.entryType,
        lotId: data.lotId || null,
        purchasePriceUsd: data.entryType === "purchase" && data.purchasePriceUsd
          ? parseFloat(data.purchasePriceUsd)
          : null,
        createdBy: userId,
      })
      router.push(`/animals/${animal.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className=" space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>← Volver</Button>
        <h1 className="text-lg font-semibold text-foreground">Ingreso individual</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <SectionLabel>Identificación</SectionLabel>

        <FormField
          label="Caravana *"
          error={errors.caravana?.message}
          hint="15 dígitos: código país (3) + ceros (3) + serie (5) + número (4). No se puede modificar."
        >
          <Input
            placeholder="858000123456789"
            maxLength={15}
            {...register("caravana", {
              required: "La caravana es obligatoria",
              pattern: { value: /^\d{15}$/, message: "Deben ser exactamente 15 dígitos numéricos" },
            })}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Categoría">
            <NativeSelect {...register("category", { required: true })}>
              <option value="vaca">Vaca</option>
              <option value="toro">Toro</option>
              <option value="novillo">Novillo</option>
              <option value="vaquillona">Vaquillona</option>
              <option value="ternero">Ternero</option>
              <option value="ternera">Ternera</option>
              <option value="otro">Otro</option>
            </NativeSelect>
          </FormField>
          <FormField label="Sexo">
            <NativeSelect {...register("sex", { required: true })}>
              <option value="female">Hembra</option>
              <option value="male">Macho</option>
            </NativeSelect>
          </FormField>
        </div>

        <FormField label="Raza">
          <Input placeholder="Angus, Hereford..." {...register("breed")} />
        </FormField>

        <SectionLabel>Ingreso</SectionLabel>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Tipo de ingreso">
            <NativeSelect {...register("entryType", { required: true })}>
              <option value="purchase">Compra</option>
              <option value="birth">Nacimiento</option>
              <option value="transfer">Transferencia</option>
            </NativeSelect>
          </FormField>
          <FormField label="Peso de ingreso (kg)">
            <Input type="number" step="0.1" placeholder="280" {...register("entryWeight")} />
          </FormField>
        </div>

        {watchedEntryType === "purchase" && (
          <FormField
            label="Precio de compra (USD/cabeza)"
            hint="Precio pagado por cabeza en USD"
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("purchasePriceUsd")}
            />
          </FormField>
        )}

        <FormField label="Origen / Procedencia">
          <Input placeholder="Establecimiento Los Pinos" {...register("origin")} />
        </FormField>

        <FormField label="Fecha de nacimiento">
          <Input type="date" {...register("birthDate")} />
        </FormField>

        <FormField label="Asignar a lote">
          <NativeSelect {...register("lotId")}>
            <option value="">Sin lote</option>
            {lots.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </NativeSelect>
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onBack}>Cancelar</Button>
          <Button type="submit" loading={submitting}>Ingresar animal</Button>
        </div>
      </form>
    </div>
  )
}

// ─── RFID: pick reading ───────────────────────────────────────────────────────

function RfidPickReading({
  readings,
  existingCaravanas,
  onSelect,
  onBack,
}: {
  readings: Activity[]
  existingCaravanas: Set<string>
  onSelect: (reading: Activity) => void
  onBack: () => void
}) {
  const readingsWithCount = readings.map((r) => ({
    reading: r,
    registerable: (r.unknownCaravanas ?? []).filter((c) => !existingCaravanas.has(c)),
  }))

  return (
    <div className=" space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>← Volver</Button>
        <h1 className="text-lg font-semibold text-foreground">Seleccioná una lectura RFID</h1>
      </div>

      {readingsWithCount.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No hay lecturas RFID registradas.</p>
          <Link href="/activities/new/reading" className="mt-2 inline-block text-sm text-primary hover:underline">
            Registrar lectura RFID →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {readingsWithCount.map(({ reading, registerable }) => {
            const disabled = registerable.length === 0
            const name = reading.selectionMethod === "rfid_file" && reading.fileName
              ? reading.fileName
              : "Lectura Bluetooth"
            return (
              <button
                key={reading.id}
                disabled={disabled}
                onClick={() => onSelect(reading)}
                className={cn(
                  "w-full rounded-xl border bg-card p-4 text-left transition-all",
                  disabled
                    ? "border-border opacity-50 cursor-not-allowed"
                    : "border-border hover:border-ring hover:shadow-sm"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(reading.activityDate)}</p>
                    {reading.responsible && (
                      <p className="text-xs text-muted-foreground">{reading.responsible}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {disabled ? (
                      <span className="text-xs text-muted-foreground">Ya registradas</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {registerable.length} sin registrar
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── RFID: review and complete ────────────────────────────────────────────────

function RfidReview({
  reading,
  existingCaravanas,
  estId,
  userId,
  lots,
  onBack,
}: {
  reading: Activity
  existingCaravanas: Set<string>
  estId: string
  userId: string
  lots: { id: string; name: string }[]
  onBack: () => void
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const [common, setCommon] = useState<CommonData>({
    entryType: "purchase",
    category: "vaca",
    sex: "female",
    breed: "",
    origin: "",
    lotId: "",
    purchasePriceUsd: "",
  })

  const unknownCaravanas = reading.unknownCaravanas ?? []

  const registerable = useMemo(
    () => unknownCaravanas.filter((c) => !existingCaravanas.has(c)),
    [unknownCaravanas, existingCaravanas]
  )

  const [rows, setRows] = useState<Record<string, AnimalRow>>(() =>
    Object.fromEntries(
      unknownCaravanas.map((c) => [
        c,
        {
          included: !existingCaravanas.has(c),
          expanded: false,
          alreadyExists: existingCaravanas.has(c),
          overrides: {},
        },
      ])
    )
  )

  function toggleIncluded(caravana: string) {
    setRows((prev) => ({
      ...prev,
      [caravana]: { ...prev[caravana], included: !prev[caravana].included },
    }))
  }

  function toggleExpanded(caravana: string) {
    setRows((prev) => ({
      ...prev,
      [caravana]: { ...prev[caravana], expanded: !prev[caravana].expanded },
    }))
  }

  function setOverride(caravana: string, patch: AnimalRowOverride) {
    setRows((prev) => ({
      ...prev,
      [caravana]: { ...prev[caravana], overrides: { ...prev[caravana].overrides, ...patch } },
    }))
  }

  const selectedCount = Object.values(rows).filter((r) => r.included && !r.alreadyExists).length

  async function onSubmit() {
    if (selectedCount === 0) return
    setSubmitting(true)
    try {
      for (const [caravana, row] of Object.entries(rows)) {
        if (!row.included || row.alreadyExists) continue
        animalRepository.create({
          estId,
          caravana,
          category: row.overrides.category ?? common.category,
          sex: row.overrides.sex ?? common.sex,
          breed: row.overrides.breed ?? common.breed,
          origin: row.overrides.origin ?? common.origin,
          entryType: common.entryType,
          birthDate: null,
          entryWeight: null,
          lotId: common.lotId || null,
          purchasePriceUsd: common.entryType === "purchase" && common.purchasePriceUsd
            ? parseFloat(common.purchasePriceUsd)
            : null,
          createdBy: userId,
        })
      }
      router.push(`/animals?ingreso=${selectedCount}`)
    } finally {
      setSubmitting(false)
    }
  }

  const readingName =
    reading.selectionMethod === "rfid_file" && reading.fileName
      ? reading.fileName
      : "Lectura Bluetooth"

  return (
    <div className=" space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>← Cambiar lectura</Button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">{readingName}</h1>
          <p className="text-xs text-muted-foreground">{formatDate(reading.activityDate)}</p>
        </div>
      </div>

      {/* Common data */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <SectionLabel>Datos comunes (se aplican a todos)</SectionLabel>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Tipo de ingreso">
            <NativeSelect
              value={common.entryType}
              onChange={(e) => setCommon((p) => ({ ...p, entryType: e.target.value as AnimalEntryType }))}
            >
              <option value="purchase">Compra</option>
              <option value="transfer">Transferencia</option>
            </NativeSelect>
          </FormField>
          {common.entryType === "purchase" ? (
            <FormField label="Precio compra (USD/cab.)">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={common.purchasePriceUsd}
                onChange={(e) => setCommon((p) => ({ ...p, purchasePriceUsd: e.target.value }))}
              />
            </FormField>
          ) : (
            <div />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Categoría">
            <NativeSelect
              value={common.category}
              onChange={(e) => setCommon((p) => ({ ...p, category: e.target.value as AnimalCategory }))}
            >
              <option value="vaca">Vaca</option>
              <option value="toro">Toro</option>
              <option value="novillo">Novillo</option>
              <option value="vaquillona">Vaquillona</option>
              <option value="ternero">Ternero</option>
              <option value="ternera">Ternera</option>
              <option value="otro">Otro</option>
            </NativeSelect>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Sexo">
            <NativeSelect
              value={common.sex}
              onChange={(e) => setCommon((p) => ({ ...p, sex: e.target.value as AnimalSex }))}
            >
              <option value="female">Hembra</option>
              <option value="male">Macho</option>
            </NativeSelect>
          </FormField>
          <FormField label="Raza">
            <Input
              placeholder="Angus, Hereford..."
              value={common.breed}
              onChange={(e) => setCommon((p) => ({ ...p, breed: e.target.value }))}
            />
          </FormField>
        </div>

        <FormField label="Origen / Procedencia">
          <Input
            placeholder="Establecimiento Los Pinos"
            value={common.origin}
            onChange={(e) => setCommon((p) => ({ ...p, origin: e.target.value }))}
          />
        </FormField>

        <FormField label="Asignar a lote">
          <NativeSelect
            value={common.lotId}
            onChange={(e) => setCommon((p) => ({ ...p, lotId: e.target.value }))}
          >
            <option value="">Sin lote</option>
            {lots.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </NativeSelect>
        </FormField>
      </div>

      {/* Animal list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <SectionLabel>Animales a ingresar</SectionLabel>
          <span className="text-xs text-muted-foreground">
            {selectedCount} de {registerable.length} seleccionados
          </span>
        </div>

        {unknownCaravanas.map((caravana) => {
          const row = rows[caravana]
          if (!row) return null
          const hasOverride = Object.keys(row.overrides).length > 0

          return (
            <div
              key={caravana}
              className={cn(
                "rounded-xl border bg-card transition-all",
                row.alreadyExists ? "border-border opacity-60" : "border-border"
              )}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={row.included}
                  disabled={row.alreadyExists}
                  onChange={() => toggleIncluded(caravana)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="flex-1 font-mono text-sm text-foreground">
                  {formatCaravana(caravana, "full")}
                </span>
                {row.alreadyExists ? (
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                    Ya existe
                  </span>
                ) : hasOverride ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                    Personalizado
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Datos comunes</span>
                )}
                {!row.alreadyExists && (
                  <button
                    onClick={() => toggleExpanded(caravana)}
                    className="text-xs text-primary hover:underline"
                  >
                    {row.expanded ? "Cerrar" : "Personalizar"}
                  </button>
                )}
              </div>

              {row.expanded && !row.alreadyExists && (
                <div className="border-t border-border px-4 py-3 grid grid-cols-2 gap-3">
                  <FormField label="Categoría">
                    <NativeSelect
                      value={row.overrides.category ?? common.category}
                      onChange={(e) => setOverride(caravana, { category: e.target.value as AnimalCategory })}
                    >
                      <option value="vaca">Vaca</option>
                      <option value="toro">Toro</option>
                      <option value="novillo">Novillo</option>
                      <option value="vaquillona">Vaquillona</option>
                      <option value="ternero">Ternero</option>
                      <option value="ternera">Ternera</option>
                      <option value="otro">Otro</option>
                    </NativeSelect>
                  </FormField>
                  <FormField label="Sexo">
                    <NativeSelect
                      value={row.overrides.sex ?? common.sex}
                      onChange={(e) => setOverride(caravana, { sex: e.target.value as AnimalSex })}
                    >
                      <option value="female">Hembra</option>
                      <option value="male">Macho</option>
                    </NativeSelect>
                  </FormField>
                  <FormField label="Raza">
                    <Input
                      placeholder={common.breed || "Angus, Hereford..."}
                      value={row.overrides.breed ?? ""}
                      onChange={(e) => setOverride(caravana, { breed: e.target.value })}
                    />
                  </FormField>
                  <FormField label="Origen">
                    <Input
                      placeholder={common.origin || "Procedencia..."}
                      value={row.overrides.origin ?? ""}
                      onChange={(e) => setOverride(caravana, { origin: e.target.value })}
                    />
                  </FormField>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pb-8">
        <Button variant="outline" onClick={onBack}>Cancelar</Button>
        <Button onClick={onSubmit} disabled={selectedCount === 0} loading={submitting}>
          Ingresar {selectedCount > 0 ? `${selectedCount} animales` : "animales"}
        </Button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewAnimalPage() {
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const user = useAuthStore((s) => s.user)
  const lots = useLots()
  const animals = useAnimals()

  const [step, setStep] = useState<Step>("select-method")
  const [selectedReading, setSelectedReading] = useState<Activity | null>(null)

  const readings = useMemo(() => {
    if (!estId) return []
    return activityRepository.getAll(estId).filter((a) => a.type === "reading")
  }, [estId])

  const existingCaravanas = useMemo(
    () => new Set(animals.map((a) => a.caravana)),
    [animals]
  )

  if (!estId || !user) return null

  if (step === "select-method") {
    return (
      <div className=" space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/animals">
            <Button variant="ghost" size="sm">← Volver</Button>
          </Link>
        </div>
        <MethodSelector
          onSelect={(method) => setStep(method === "individual" ? "individual" : "rfid-pick")}
        />
      </div>
    )
  }

  if (step === "individual") {
    return (
      <IndividualForm
        estId={estId}
        userId={user.uid}
        lots={lots}
        onBack={() => setStep("select-method")}
      />
    )
  }

  if (step === "rfid-pick") {
    return (
      <RfidPickReading
        readings={readings}
        existingCaravanas={existingCaravanas}
        onSelect={(r) => { setSelectedReading(r); setStep("rfid-review") }}
        onBack={() => setStep("select-method")}
      />
    )
  }

  if (step === "rfid-review" && selectedReading) {
    return (
      <RfidReview
        reading={selectedReading}
        existingCaravanas={existingCaravanas}
        estId={estId}
        userId={user.uid}
        lots={lots}
        onBack={() => setStep("rfid-pick")}
      />
    )
  }

  return null
}
