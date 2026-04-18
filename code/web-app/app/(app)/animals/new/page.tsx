"use client"

import { useState, useMemo, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { animalRepository } from "@/lib/repositories/animal"
import { useAppStore } from "@/lib/stores/appStore"
import { useAuthStore } from "@/lib/stores/authStore"
import { useLots } from "@/hooks/useLots"
import { useAnimals } from "@/hooks/useAnimals"
import { activityRepository } from "@/lib/repositories/activity"
import { traceabilityRepository } from "@/lib/repositories/traceability"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import { cn, formatDate, formatCaravana, categoryLabel, parseRfidLineWithWeight } from "@/lib/utils"
import { TagView } from "@/components/animals/TagView"
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
  hint?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  )
}

function getCaravanaHint(value: string): React.ReactNode {
  const len = value.length
  const parts = [
    { label: "País", start: 0, end: 3 },
    { label: "Ceros", start: 3, end: 6 },
    { label: "Serie", start: 6, end: 11 },
    { label: "Número", start: 11, end: 15 },
  ]

  if (len === 15) {
    return <span className="text-emerald-600 font-medium">Caravana completa — {value.slice(0, 3)} | {value.slice(3, 6)} | {value.slice(6, 11)} | {value.slice(11, 15)}</span>
  }

  return (
    <span className="flex flex-wrap gap-x-1">
      {parts.map((p, i) => {
        const isActive = len >= p.start && len < p.end
        const isFilled = len >= p.end
        const filledValue = isFilled ? value.slice(p.start, p.end) : (len > p.start ? value.slice(p.start, len) : "")
        return (
          <span key={p.label}>
            <span className={isActive ? "text-foreground font-semibold" : isFilled ? "text-foreground" : ""}>
              {p.label}
              {filledValue ? ` (${filledValue})` : ` (${p.end - p.start})`}
            </span>
            {i < parts.length - 1 && " + "}
          </span>
        )
      })}
      <span className="ml-1">{len}/15</span>
    </span>
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

type Step = "select-method" | "individual" | "rfid-pick" | "rfid-review" | "rfid-file-direct"

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

function MethodSelector({ onSelect }: { onSelect: (method: "individual" | "rfid-file-direct" | "rfid-pick") => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Ingresar animales</h1>
        <p className="text-sm text-muted-foreground mt-1">¿Cómo querés registrarlos?</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button
          onClick={() => onSelect("individual")}
          className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 text-left hover:border-ring hover:shadow-sm transition-all"
        >
          <span className="text-2xl">🐄</span>
          <span className="font-semibold text-foreground">Individual</span>
          <span className="text-sm text-muted-foreground">Ingresá un animal cargando sus datos manualmente.</span>
        </button>
        <button
          onClick={() => onSelect("rfid-file-direct")}
          className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 text-left hover:border-ring hover:shadow-sm transition-all"
        >
          <span className="text-2xl">📂</span>
          <span className="font-semibold text-foreground">Desde archivo RFID</span>
          <span className="text-sm text-muted-foreground">Cargá un archivo del lector y registrá los animales directamente.</span>
        </button>
        <button
          onClick={() => onSelect("rfid-pick")}
          className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 text-left hover:border-ring hover:shadow-sm transition-all"
        >
          <span className="text-2xl">📡</span>
          <span className="font-semibold text-foreground">Desde lectura guardada</span>
          <span className="text-sm text-muted-foreground">Importá caravanas de una lectura ya registrada.</span>
        </button>
      </div>
    </div>
  )
}

// ─── RFID: direct file upload ─────────────────────────────────────────────────

function RfidDirectUpload({
  existingCaravanas,
  onReady,
  onBack,
}: {
  existingCaravanas: Set<string>
  onReady: (caravanas: string[], fileName: string) => void
  onBack: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState("")
  const [caravanas, setCaravanas] = useState<string[]>([])
  const [excluded, setExcluded] = useState<Set<string>>(new Set())

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setExcluded(new Set())
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean)
      const seen = new Set<string>()
      const result: string[] = []
      for (const line of lines) {
        const parsed = parseRfidLineWithWeight(line)
        if (!parsed || seen.has(parsed.caravana)) continue
        seen.add(parsed.caravana)
        result.push(parsed.caravana)
      }
      setCaravanas(result)
    }
    reader.readAsText(file)
  }

  function discard(caravana: string) {
    setExcluded((prev) => new Set([...prev, caravana]))
  }

  function reset() {
    setFileName("")
    setCaravanas([])
    setExcluded(new Set())
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const newCaravanas = caravanas.filter((c) => !existingCaravanas.has(c) && !excluded.has(c))
  const knownCaravanas = caravanas.filter((c) => existingCaravanas.has(c))
  const discardedCount = excluded.size

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>← Volver</Button>
        <h1 className="text-lg font-semibold text-foreground">Agregar stock desde archivo RFID</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <input
          ref={fileInputRef}
          id="rfid-direct-upload"
          type="file"
          accept=".txt,.csv,.dat"
          onChange={handleFile}
          className="sr-only"
        />

        {!fileName ? (
          <label
            htmlFor="rfid-direct-upload"
            className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border px-4 py-12 text-center transition-colors hover:border-primary/40 hover:bg-muted/30"
          >
            <Upload className="h-10 w-10 text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium text-foreground">Seleccionar archivo del lector RFID</p>
              <p className="text-xs text-muted-foreground mt-1">Formatos aceptados: .txt, .csv, .dat</p>
            </div>
          </label>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {newCaravanas.length} a registrar
                  {knownCaravanas.length > 0 && ` · ${knownCaravanas.length} ya en sistema`}
                  {discardedCount > 0 && ` · ${discardedCount} descartada${discardedCount !== 1 ? "s" : ""}`}
                </p>
              </div>
              <button type="button" onClick={reset} className="text-xs text-primary hover:underline">
                Cambiar archivo
              </button>
            </div>

            {/* A registrar */}
            {newCaravanas.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  A registrar ({newCaravanas.length})
                </p>
                <div className="max-h-64 overflow-y-auto rounded-xl border border-border p-3">
                  <div className="flex flex-wrap gap-2">
                    {newCaravanas.map((c) => (
                      <div key={c} className="relative">
                        <TagView caravana={c} size="md" />
                        <button
                          type="button"
                          onClick={() => discard(c)}
                          className="absolute -right-1.5 bottom-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors"
                          title="Descartar"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {discardedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setExcluded(new Set())}
                    className="text-xs text-primary hover:underline"
                  >
                    Restaurar {discardedCount} descartada{discardedCount !== 1 ? "s" : ""}
                  </button>
                )}
              </div>
            )}

            {/* Ya en sistema */}
            {knownCaravanas.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Ya en el sistema ({knownCaravanas.length})
                </p>
                <div className="max-h-32 overflow-y-auto rounded-xl border border-border p-3 opacity-50">
                  <div className="flex flex-wrap gap-2">
                    {knownCaravanas.map((c) => (
                      <TagView key={c} caravana={c} size="md" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {caravanas.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={() => onReady(newCaravanas, fileName)} disabled={newCaravanas.length === 0}>
            Continuar ({newCaravanas.length} a registrar) →
          </Button>
        </div>
      )}
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
  const watchedCaravana = watch("caravana") ?? ""

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
          hint={getCaravanaHint(watchedCaravana)}
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
        <div className="ml-auto">
          <Link href="/activities/new/reading">
            <Button variant="outline" size="sm">+ Nueva lectura</Button>
          </Link>
        </div>
      </div>

      {readingsWithCount.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No hay lecturas RFID registradas.</p>
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
  caravanas: allCaravanas,
  existingCaravanas,
  title,
  subtitle,
  backLabel,
  isStockEntry,
  fileName,
  estId,
  userId,
  lots,
  onBack,
}: {
  caravanas: string[]
  existingCaravanas: Set<string>
  title: string
  subtitle?: string
  backLabel: string
  isStockEntry?: boolean
  fileName?: string
  estId: string
  userId: string
  lots: { id: string; name: string }[]
  onBack: () => void
}) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [submitting, setSubmitting] = useState(false)
  const [activityDate, setActivityDate] = useState(new Date().toISOString().slice(0, 10))
  const [responsible, setResponsible] = useState("")
  const [notes, setNotes] = useState("")

  const [common, setCommon] = useState<CommonData>({
    entryType: "purchase",
    category: "vaca",
    sex: "female",
    breed: "",
    origin: "",
    lotId: "",
    purchasePriceUsd: "",
  })

  const unknownCaravanas = allCaravanas

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
      const createdAnimals: { id: string; lotId: string | null }[] = []

      for (const [caravana, row] of Object.entries(rows)) {
        if (!row.included || row.alreadyExists) continue
        const animal = animalRepository.create({
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
        createdAnimals.push({ id: animal.id, lotId: animal.lotId })
      }

      if (isStockEntry && createdAnimals.length > 0) {
        const responsibleName = responsible || user?.name || ""
        const dateTs = new Date(activityDate).getTime()

        const activity = activityRepository.create({
          estId,
          type: "stock_entry",
          animalIds: createdAnimals.map((a) => a.id),
          selectionMethod: "rfid_file",
          fileName: fileName || null,
          activityDate: dateTs,
          responsible: responsibleName,
          notes,
          createdBy: userId,
          entryType: common.entryType,
        } as any)

        for (const { id: animalId, lotId } of createdAnimals) {
          traceabilityRepository.create({
            animalId,
            estId,
            type: "entry",
            description: `Ingreso de stock${fileName ? ` · ${fileName}` : ""}`,
            activityId: activity.id,
            lotId,
            lotName: null,
            responsibleName,
            timestamp: dateTs,
          })
        }
      }

      router.push(`/animals?ingreso=${selectedCount}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className=" space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>← {backLabel}</Button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      {/* Activity metadata — solo para stock_entry */}
      {isStockEntry && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <SectionLabel>Datos del ingreso</SectionLabel>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Fecha">
              <Input type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} />
            </FormField>
            <FormField label="Responsable">
              <Input
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder={user?.name ?? "Nombre"}
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
      )}

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

      {/* Animal grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionLabel>Animales a ingresar</SectionLabel>
          <span className="text-xs text-muted-foreground">
            {selectedCount} de {registerable.length} seleccionados
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {unknownCaravanas.map((caravana) => {
            const row = rows[caravana]
            if (!row) return null
            const hasOverride = Object.keys(row.overrides).length > 0

            return (
              <div
                key={caravana}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-xl border bg-card p-3 transition-all",
                  row.alreadyExists
                    ? "border-border opacity-50 cursor-not-allowed"
                    : row.included
                    ? "border-primary/40 ring-1 ring-primary/20"
                    : "border-border opacity-60"
                )}
              >
                {/* Checkbox top-left */}
                {!row.alreadyExists && (
                  <input
                    type="checkbox"
                    checked={row.included}
                    onChange={() => toggleIncluded(caravana)}
                    className="absolute left-2 top-2 h-3.5 w-3.5 accent-primary"
                  />
                )}

                {/* Tag */}
                <button
                  type="button"
                  disabled={row.alreadyExists}
                  onClick={() => !row.alreadyExists && toggleIncluded(caravana)}
                  className="mt-2"
                >
                  <TagView caravana={caravana} size="md" />
                </button>

                {/* Footer */}
                {row.alreadyExists ? (
                  <span className="text-[10px] text-destructive">Ya existe</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(caravana)}
                    className={cn(
                      "text-[10px] hover:underline",
                      hasOverride ? "text-amber-600 font-medium" : "text-muted-foreground"
                    )}
                  >
                    {hasOverride ? "Personalizado" : "Personalizar"}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Personalizar modal */}
      {unknownCaravanas.map((caravana) => {
        const row = rows[caravana]
        if (!row?.expanded || row.alreadyExists) return null
        return (
          <div
            key={`modal-${caravana}`}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => toggleExpanded(caravana)}
          >
            <div
              className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-lg space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TagView caravana={caravana} size="md" />
                  <span className="text-sm font-semibold text-foreground">Personalizar</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleExpanded(caravana)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cerrar
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
              <div className="flex justify-end">
                <Button size="sm" onClick={() => toggleExpanded(caravana)}>Listo</Button>
              </div>
            </div>
          </div>
        )
      })}

      {/* Actions */}
      <div className="flex justify-end gap-2 pb-8">
        <Button variant="outline" onClick={onBack}>Cancelar</Button>
        <Button onClick={onSubmit} disabled={selectedCount === 0} loading={submitting}>
          {isStockEntry ? "Registrar ingreso" : "Ingresar"}{selectedCount > 0 ? ` · ${selectedCount} animales` : ""}
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
  const searchParams = useSearchParams()

  const initialMethod = searchParams.get("method") as Step | null
  const [step, setStep] = useState<Step>(initialMethod === "rfid-file-direct" ? "rfid-file-direct" : "select-method")
  const [selectedReading, setSelectedReading] = useState<Activity | null>(null)
  const [directCaravanas, setDirectCaravanas] = useState<string[]>([])
  const [directFileName, setDirectFileName] = useState<string>("")

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
          onSelect={(method) => {
            if (method === "individual") setStep("individual")
            else if (method === "rfid-file-direct") setStep("rfid-file-direct")
            else setStep("rfid-pick")
          }}
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

  if (step === "rfid-file-direct") {
    return (
      <RfidDirectUpload
        existingCaravanas={existingCaravanas}
        onReady={(caravanas, fileName) => { setDirectCaravanas(caravanas); setDirectFileName(fileName); setStep("rfid-review") }}
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

  if (step === "rfid-review") {
    const caravanas = selectedReading
      ? (selectedReading.unknownCaravanas ?? [])
      : directCaravanas

    const title = selectedReading
      ? (selectedReading.selectionMethod === "rfid_file" && selectedReading.fileName
        ? selectedReading.fileName
        : "Lectura Bluetooth")
      : "Agregar stock"

    const subtitle = selectedReading ? formatDate(selectedReading.activityDate) : undefined
    const backLabel = selectedReading ? "Cambiar lectura" : "Volver"
    const onBack = selectedReading
      ? () => setStep("rfid-pick")
      : () => setStep("rfid-file-direct")

    return (
      <RfidReview
        caravanas={caravanas}
        existingCaravanas={existingCaravanas}
        title={title}
        subtitle={subtitle}
        backLabel={backLabel}
        isStockEntry={!selectedReading}
        fileName={!selectedReading ? directFileName : undefined}
        estId={estId}
        userId={user.uid}
        lots={lots}
        onBack={onBack}
      />
    )
  }

  return null
}
