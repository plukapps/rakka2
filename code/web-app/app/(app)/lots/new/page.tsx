"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { lotRepository } from "@/lib/repositories/lot"
import { animalRepository, type CreateAnimalInput } from "@/lib/repositories/animal"
import { traceabilityRepository } from "@/lib/repositories/traceability"
import { useAppStore } from "@/lib/stores/appStore"
import { useAuthStore } from "@/lib/stores/authStore"
import { useAnimals } from "@/hooks/useAnimals"
import { useLots } from "@/hooks/useLots"
import { useReadings } from "@/hooks/useReadings"
import type {
  Animal,
  AnimalCategory,
  AnimalEntryType,
  Lot,
  ReadingActivity,
} from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { TagView } from "@/components/animals/TagView"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn, formatCaravana, generateId } from "@/lib/utils"

// ─── Domain types ────────────────────────────────────────────────────────────

type WizardStep = "info" | "method" | "animals" | "confirm"

type AnimalMethod =
  | "manual"
  | "reading_live"
  | "reading_file"
  | "filter"
  | "lot_transfer"

type NewAnimalData = {
  kind: "new"
  tempId: string
  caravana: string
  category: AnimalCategory
  sex: Animal["sex"]
  entryType: AnimalEntryType
  breed: string
}

type ExistingAnimalData = {
  kind: "existing"
  animal: Animal
}

type SelectedItem = ExistingAnimalData | NewAnimalData

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readingLabel(r: ReadingActivity): string {
  const date = new Date(r.activityDate).toLocaleDateString("es-UY")
  return r.fileName ? `${r.fileName} — ${date}` : `Bluetooth — ${date}`
}

function itemId(item: SelectedItem): string {
  return item.kind === "existing" ? item.animal.id : item.tempId
}

// ─── StepIndicator ───────────────────────────────────────────────────────────

const STEP_ORDER: WizardStep[] = ["info", "method", "animals", "confirm"]
const STEP_LABELS: Record<WizardStep, string> = {
  info: "Información",
  method: "Método",
  animals: "Animales",
  confirm: "Revisar",
}
const STEP_TITLES: Record<WizardStep, string> = {
  info: "Definí el lote",
  method: "¿Cómo querés agregar animales?",
  animals: "Seleccioná los animales",
  confirm: "Revisá el lote",
}

function StepIndicator({ current }: { current: WizardStep }) {
  const currentIndex = STEP_ORDER.indexOf(current)
  return (
    <div className="flex items-center">
      {STEP_ORDER.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                i === currentIndex
                  ? "bg-foreground text-background"
                  : i < currentIndex
                  ? "bg-foreground/25 text-foreground"
                  : "border border-border text-muted-foreground"
              )}
            >
              {i + 1}
            </div>
            <span
              className={cn(
                "text-sm whitespace-nowrap",
                i === currentIndex
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {STEP_LABELS[s]}
            </span>
          </div>
          {i < STEP_ORDER.length - 1 && (
            <div
              className={cn(
                "w-8 h-px mx-3 shrink-0",
                i < currentIndex ? "bg-foreground/30" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── FormField ────────────────────────────────────────────────────────────────

function FormField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ─── NativeSelect ─────────────────────────────────────────────────────────────

function NativeSelect({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
    >
      {children}
    </select>
  )
}

// ─── EditAnimalModal ──────────────────────────────────────────────────────────

function EditAnimalModal({
  item,
  onSave,
  onClose,
}: {
  item: NewAnimalData
  onSave: (updated: NewAnimalData) => void
  onClose: () => void
}) {
  const [category, setCategory] = useState<AnimalCategory>(item.category)
  const [sex, setSex] = useState<Animal["sex"]>(item.sex)
  const [entryType, setEntryType] = useState<AnimalEntryType>(item.entryType)
  const [breed, setBreed] = useState(item.breed)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Editar animal
          </p>
          <p className="text-sm font-mono font-medium mt-1">
            {formatCaravana(item.caravana, "serie")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Categoría *">
            <NativeSelect
              value={category}
              onChange={(v) => setCategory(v as AnimalCategory)}
            >
              <option value="vaca">Vaca</option>
              <option value="toro">Toro</option>
              <option value="ternero">Ternero</option>
              <option value="ternera">Ternera</option>
              <option value="vaquillona">Vaquillona</option>
              <option value="novillo">Novillo</option>
              <option value="otro">Otro</option>
            </NativeSelect>
          </FormField>

          <FormField label="Sexo *">
            <NativeSelect value={sex} onChange={(v) => setSex(v as Animal["sex"])}>
              <option value="male">Macho</option>
              <option value="female">Hembra</option>
            </NativeSelect>
          </FormField>
        </div>

        <FormField label="Tipo de ingreso *">
          <NativeSelect
            value={entryType}
            onChange={(v) => setEntryType(v as AnimalEntryType)}
          >
            <option value="transfer">Traslado</option>
            <option value="purchase">Compra</option>
            <option value="birth">Nacimiento</option>
          </NativeSelect>
        </FormField>

        <FormField label="Raza">
          <Input
            placeholder="Angus, Hereford..."
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => onSave({ ...item, category, sex, entryType, breed })}
          >
            Guardar
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── InfoStep ─────────────────────────────────────────────────────────────────

interface InfoFormValues {
  name: string
  description: string
  notes: string
}

function InfoStep({
  onCreated,
  estId,
}: {
  onCreated: (lot: Lot) => void
  estId: string
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InfoFormValues>({
    defaultValues: { name: "", description: "", notes: "" },
  })

  function onSubmit(data: InfoFormValues) {
    const lot = lotRepository.create({
      estId,
      name: data.name,
      description: data.description,
      notes: data.notes || undefined,
    })
    onCreated(lot)
  }

  return (
    <div className="flex flex-col items-center">
    <form
      id="lot-wizard-info"
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-lg space-y-5"
    >
      <FormField label="Nombre *" error={errors.name?.message}>
        <Input
          placeholder="Ej. Recría Norte 2026"
          autoFocus
          {...register("name", { required: "El nombre es obligatorio" })}
        />
      </FormField>

      <FormField label="Descripción (opcional)">
        <Input
          placeholder="Plan sanitario, categoría, etc."
          {...register("description")}
        />
      </FormField>

      <FormField label="Notas (opcional)">
        <textarea
          placeholder="Observaciones, contexto del lote..."
          rows={3}
          {...register("notes")}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
        />
      </FormField>
    </form>
    </div>
  )
}

// ─── MethodStep ───────────────────────────────────────────────────────────────

const METHOD_OPTIONS: { value: AnimalMethod; label: string; description: string }[] = [
  {
    value: "manual",
    label: "Selección manual",
    description: "Buscá y elegí animales del listado uno por uno.",
  },
  {
    value: "reading_live",
    label: "Lectura RFID en vivo",
    description: "Usá una lectura RFID guardada para agregar animales en bloque.",
  },
  {
    value: "reading_file",
    label: "Importar archivo de lectura",
    description: "Cargá un archivo CSV o TXT con caravanas leídas.",
  },
  {
    value: "filter",
    label: "Por filtro automático",
    description: "Aplicá criterios (categoría, raza, peso, edad) para seleccionar animales.",
  },
  {
    value: "lot_transfer",
    label: "Mover desde otro lote",
    description: "Trasladá todos o parte de los animales de un lote existente.",
  },
]

function MethodStep({
  method,
  onMethodChange,
}: {
  method: AnimalMethod
  onMethodChange: (m: AnimalMethod) => void
}) {
  return (
    <div className="flex flex-col items-center">
    <div className="w-full max-w-lg space-y-3">
      {METHOD_OPTIONS.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors",
            method === opt.value
              ? "border-foreground bg-card"
              : "border-border bg-card hover:border-foreground/40"
          )}
        >
          <input
            type="radio"
            name="animal-method"
            value={opt.value}
            checked={method === opt.value}
            onChange={() => onMethodChange(opt.value)}
            className="mt-0.5 shrink-0 accent-foreground"
          />
          <div>
            <p className="text-sm font-medium">{opt.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
          </div>
        </label>
      ))}
    </div>
    </div>
  )
}

// ─── MethodPlaceholderStep ────────────────────────────────────────────────────

const METHOD_LABELS: Record<AnimalMethod, string> = {
  manual: "Selección manual",
  reading_live: "Lectura RFID en vivo",
  reading_file: "Importar archivo de lectura",
  filter: "Por filtro automático",
  lot_transfer: "Mover desde otro lote",
}

function MethodPlaceholderStep({ method }: { method: AnimalMethod }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
        🚧
      </div>
      <p className="font-medium">{METHOD_LABELS[method]}</p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Este método estará disponible próximamente. Podés continuar y el lote se creará sin animales.
      </p>
    </div>
  )
}

// ─── ReadingAnimalsStep ───────────────────────────────────────────────────────

function ReadingAnimalsStep({
  readings,
  lots,
  readingId,
  discarded,
  onReadingChange,
  onToggleDiscard,
  onSelectAll,
  onDiscardAll,
}: {
  readings: ReadingActivity[]
  lots: Lot[]
  readingId: string
  discarded: Set<string>
  onReadingChange: (id: string) => void
  onToggleDiscard: (key: string) => void
  onSelectAll: () => void
  onDiscardAll: () => void
}) {
  const estId = useAppStore((s) => s.activeEstablishment?.id ?? "")
  const [search, setSearch] = useState("")

  const selectedReading = useMemo(
    () => readings.find((r) => r.id === readingId) ?? null,
    [readingId, readings]
  )

  const readingAnimals: Animal[] = useMemo(() => {
    if (!selectedReading || !estId) return []
    return selectedReading.animalIds
      .map((id) => animalRepository.getById(estId, id))
      .filter((a): a is Animal => a !== undefined && a.status === "active")
  }, [selectedReading, estId])

  const unknownCaravanas: string[] = useMemo(
    () => selectedReading?.unknownCaravanas ?? [],
    [selectedReading]
  )

  const totalTags = readingAnimals.length + unknownCaravanas.length
  const discardedCount = discarded.size

  const filteredAnimals = useMemo(() => {
    if (!search) return readingAnimals
    const q = search.toLowerCase()
    return readingAnimals.filter(
      (a) =>
        a.caravana.toLowerCase().includes(q) ||
        formatCaravana(a.caravana, "serie").toLowerCase().includes(q)
    )
  }, [readingAnimals, search])

  const filteredUnknown = useMemo(() => {
    if (!search) return unknownCaravanas
    const q = search.toLowerCase()
    return unknownCaravanas.filter((c) => c.toLowerCase().includes(q))
  }, [unknownCaravanas, search])

  if (readings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">No hay lecturas RFID registradas.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Select
        value={readingId}
        onValueChange={(v) => { onReadingChange(v as string) }}
      >
        <SelectTrigger className="w-full max-w-lg">
          <SelectValue placeholder="Seleccionar lectura...">
            {selectedReading
              ? `${readingLabel(selectedReading)} · ${totalTags} ${totalTags === 1 ? "animal" : "animales"}`
              : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {readings.map((r) => {
            const total = r.animalIds.length + (r.unknownCaravanas?.length ?? 0)
            return (
              <SelectItem key={r.id} value={r.id}>
                {readingLabel(r)} · {total} {total === 1 ? "animal" : "animales"}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {readingId && totalTags === 0 && (
        <p className="text-xs text-muted-foreground">Esta lectura no tiene animales.</p>
      )}

      {readingId && totalTags > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {totalTags - discardedCount} de {totalTags} seleccionados
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSelectAll}
                className="text-xs text-foreground/70 hover:text-foreground underline underline-offset-2"
              >
                Seleccionar todos
              </button>
              <span className="text-xs text-muted-foreground">·</span>
              <button
                type="button"
                onClick={onDiscardAll}
                className="text-xs text-foreground/70 hover:text-foreground underline underline-offset-2"
              >
                Descartar todos
              </button>
            </div>
          </div>

          <Input
            placeholder="Buscar por caravana..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />

          <div className="flex flex-wrap gap-3">
            {filteredAnimals.map((animal) => {
              const isDiscarded = discarded.has(animal.id)
              const lotName = animal.lotId
                ? lots.find((l) => l.id === animal.lotId)?.name ?? null
                : null
              return (
                <button
                  key={animal.id}
                  type="button"
                  onClick={() => onToggleDiscard(animal.id)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-xl transition-all relative",
                    isDiscarded ? "opacity-35" : "opacity-100"
                  )}
                  title={isDiscarded ? "Click para incluir" : "Click para descartar"}
                >
                  <TagView caravana={animal.caravana} size="md" />
                  {lotName && !isDiscarded && (
                    <span className="text-[10px] text-amber-500 truncate max-w-[60px]">
                      {lotName}
                    </span>
                  )}
                  {isDiscarded && (
                    <span className="text-[10px] text-muted-foreground">Descartado</span>
                  )}
                </button>
              )
            })}

            {filteredUnknown.map((caravana) => {
              const isDiscarded = discarded.has(caravana)
              return (
                <button
                  key={caravana}
                  type="button"
                  onClick={() => onToggleDiscard(caravana)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-xl transition-all",
                    isDiscarded ? "opacity-35" : "opacity-100"
                  )}
                  title={isDiscarded ? "Click para incluir" : "Click para descartar"}
                >
                  <TagView caravana={caravana} size="md" />
                  {!isDiscarded && (
                    <span className="text-[10px] text-blue-500">Nuevo</span>
                  )}
                  {isDiscarded && (
                    <span className="text-[10px] text-muted-foreground">Descartado</span>
                  )}
                </button>
              )
            })}

            {filteredAnimals.length === 0 && filteredUnknown.length === 0 && (
              <p className="text-xs text-muted-foreground">Sin resultados.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── LotTransferAnimalsStep ───────────────────────────────────────────────────

function LotTransferAnimalsStep({
  lots,
  animals,
  lotTransferId,
  discarded,
  onLotChange,
  onToggleDiscard,
  onSelectAll,
  onDiscardAll,
}: {
  lots: Lot[]
  animals: Animal[]
  lotTransferId: string
  discarded: Set<string>
  onLotChange: (id: string) => void
  onToggleDiscard: (key: string) => void
  onSelectAll: () => void
  onDiscardAll: () => void
}) {
  const [search, setSearch] = useState("")

  const activeLots = useMemo(() => lots.filter((l) => l.status === "active"), [lots])

  const selectedLot = useMemo(
    () => activeLots.find((l) => l.id === lotTransferId) ?? null,
    [activeLots, lotTransferId]
  )

  const lotAnimals = useMemo(
    () =>
      lotTransferId
        ? animals.filter((a) => a.status === "active" && a.lotId === lotTransferId)
        : [],
    [animals, lotTransferId]
  )

  const filtered = useMemo(() => {
    if (!search) return lotAnimals
    const q = search.toLowerCase()
    return lotAnimals.filter(
      (a) =>
        a.caravana.toLowerCase().includes(q) ||
        formatCaravana(a.caravana, "serie").toLowerCase().includes(q)
    )
  }, [lotAnimals, search])

  const totalTags = lotAnimals.length
  const discardedCount = discarded.size

  if (activeLots.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-4">No hay lotes activos disponibles.</p>
    )
  }

  return (
    <div className="space-y-4">
      <Select
        value={lotTransferId}
        onValueChange={(v) => { onLotChange(v as string) }}
      >
        <SelectTrigger className="w-full max-w-lg">
          <SelectValue placeholder="Seleccionar lote origen...">
            {selectedLot
              ? `${selectedLot.name} · ${totalTags} ${totalTags === 1 ? "animal" : "animales"}`
              : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {activeLots.map((l) => (
            <SelectItem key={l.id} value={l.id}>
              {l.name} · {l.animalCount} {l.animalCount === 1 ? "animal" : "animales"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {lotTransferId && totalTags === 0 && (
        <p className="text-xs text-muted-foreground">Este lote no tiene animales.</p>
      )}

      {lotTransferId && totalTags > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {totalTags - discardedCount} de {totalTags} seleccionados
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSelectAll}
                className="text-xs text-foreground/70 hover:text-foreground underline underline-offset-2"
              >
                Seleccionar todos
              </button>
              <span className="text-xs text-muted-foreground">·</span>
              <button
                type="button"
                onClick={onDiscardAll}
                className="text-xs text-foreground/70 hover:text-foreground underline underline-offset-2"
              >
                Descartar todos
              </button>
            </div>
          </div>

          <Input
            placeholder="Buscar por caravana..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />

          <div className="flex flex-wrap gap-3">
            {filtered.map((animal) => {
              const isDiscarded = discarded.has(animal.id)
              return (
                <button
                  key={animal.id}
                  type="button"
                  onClick={() => onToggleDiscard(animal.id)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-xl transition-all",
                    isDiscarded ? "opacity-35" : "opacity-100"
                  )}
                  title={isDiscarded ? "Click para incluir" : "Click para descartar"}
                >
                  <TagView caravana={animal.caravana} size="md" />
                  {isDiscarded && (
                    <span className="text-[10px] text-muted-foreground">Descartado</span>
                  )}
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground">Sin resultados.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ConfirmStep ──────────────────────────────────────────────────────────────

const METHOD_ORIGIN_LABEL: Record<AnimalMethod, string> = {
  manual: "Selección manual",
  reading_live: "Lectura RFID en vivo",
  reading_file: "Importación de archivo de lectura",
  filter: "Por filtro automático",
  lot_transfer: "Mover desde otro lote",
}

function ConfirmStep({
  lot,
  selection,
  method,
  sourceName,
}: {
  lot: Lot
  selection: SelectedItem[]
  method: AnimalMethod
  sourceName: string
}) {
  const animalCount = selection.length
  const hasAnimals = animalCount > 0
  const hasMoves = selection.some(
    (i) => i.kind === "existing" && (i as ExistingAnimalData).animal.lotId !== null
  )
  const hasNew = selection.some((i) => i.kind === "new")

  return (
    <div className="flex flex-col items-center">
    <div className="space-y-4 w-full max-w-2xl">
      {/* Lot name card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Nuevo lote
        </p>
        <p className="text-3xl font-bold tracking-tight">{lot.name}</p>
        {(lot.description || lot.notes) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {lot.description && (
              <span className="rounded-full border border-border bg-muted px-3 py-0.5 text-xs font-medium text-foreground/80">
                {lot.description}
              </span>
            )}
            {lot.notes && (
              <span className="rounded-full border border-border bg-muted px-3 py-0.5 text-xs text-muted-foreground">
                {lot.notes}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className={cn("grid gap-3", sourceName ? "grid-cols-3" : "grid-cols-2")}>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Animales
          </p>
          <p className="text-3xl font-bold">{animalCount}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Origen
          </p>
          <p className="text-sm font-medium leading-snug">
            {METHOD_ORIGIN_LABEL[method]}
          </p>
        </div>

        {sourceName && (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              {method === "lot_transfer" ? "Lote origen" : "Lectura"}
            </p>
            <p className="text-sm font-medium leading-snug">{sourceName}</p>
          </div>
        )}
      </div>

      {/* Summary message */}
      <div className="rounded-xl border border-border bg-muted/30 px-5 py-4 flex gap-3">
        <span className="text-foreground mt-0.5 shrink-0">✓</span>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {!hasAnimals ? (
            <>El lote se creará <strong>vacío</strong>. Podés agregar animales en cualquier momento desde el detalle del lote.</>
          ) : (
            <>
              Al crear el lote, los <strong>{animalCount} {animalCount === 1 ? "animal" : "animales"}</strong> se asignarán automáticamente.
              {hasMoves && <> Si vienen de otros lotes, se generará un evento de <strong>movimiento</strong> en su trazabilidad.</>}
              {hasNew && <> Las caravanas nuevas se ingresarán al stock con el tipo de ingreso seleccionado.</>}
              {" "}Las carencias activas se respetan.
            </>
          )}
        </p>
      </div>
    </div>
    </div>
  )
}

// ─── NewLotModal ──────────────────────────────────────────────────────────────

export function NewLotModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const userId = useAuthStore((s) => s.user?.uid ?? "")
  const animals = useAnimals()
  const lots = useLots()
  const readings = useReadings()

  const [step, setStep] = useState<WizardStep>("info")
  const [createdLot, setCreatedLot] = useState<Lot | null>(null)
  const [method, setMethod] = useState<AnimalMethod>("manual")
  const [readingId, setReadingId] = useState("")
  const [lotTransferId, setLotTransferId] = useState("")
  const [discarded, setDiscarded] = useState<Set<string>>(new Set())
  const [selection, setSelection] = useState<SelectedItem[]>([])
  const [submitting, setSubmitting] = useState(false)

  function toggleDiscard(key: string) {
    setDiscarded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function getReadingKeys(): string[] {
    const r = readings.find((r) => r.id === readingId)
    if (!r) return []
    return [...r.animalIds, ...(r.unknownCaravanas ?? [])]
  }

  function getLotTransferKeys(): string[] {
    return animals
      .filter((a) => a.status === "active" && a.lotId === lotTransferId)
      .map((a) => a.id)
  }

  function selectAll() {
    setDiscarded(new Set())
  }

  function discardAll() {
    const keys =
      method === "reading_live" || method === "reading_file"
        ? getReadingKeys()
        : method === "lot_transfer"
        ? getLotTransferKeys()
        : []
    setDiscarded(new Set(keys))
  }

  function handleMethodChange(m: AnimalMethod) {
    setMethod(m)
    setReadingId("")
    setLotTransferId("")
    setDiscarded(new Set())
  }

  function handleReadingChange(id: string) {
    setReadingId(id)
    setDiscarded(new Set())
  }

  function handleLotTransferChange(id: string) {
    setLotTransferId(id)
    setDiscarded(new Set())
  }

  function buildSelectionFromCurrentStep(): SelectedItem[] {
    if (!estId) return []

    if (method === "reading_live" || method === "reading_file") {
      const r = readings.find((r) => r.id === readingId)
      if (!r) return []
      const existing: SelectedItem[] = r.animalIds
        .filter((id) => !discarded.has(id))
        .map((id) => animalRepository.getById(estId, id))
        .filter((a): a is Animal => a !== undefined && a.status === "active")
        .map((animal) => ({ kind: "existing" as const, animal }))
      const newOnes: SelectedItem[] = (r.unknownCaravanas ?? [])
        .filter((c) => !discarded.has(c))
        .map((c) => ({
          kind: "new" as const,
          tempId: generateId("tmp"),
          caravana: c,
          category: "otro" as AnimalCategory,
          sex: "male" as Animal["sex"],
          entryType: "transfer" as AnimalEntryType,
          breed: "",
        }))
      return [...existing, ...newOnes]
    }

    if (method === "lot_transfer") {
      return animals
        .filter(
          (a) =>
            a.status === "active" &&
            a.lotId === lotTransferId &&
            !discarded.has(a.id)
        )
        .map((animal) => ({ kind: "existing" as const, animal }))
    }

    return []
  }

  function handleAdvanceToConfirm() {
    const built = buildSelectionFromCurrentStep()
    setSelection(built)
    setStep("confirm")
  }

  async function handleConfirm() {
    if (!createdLot || !estId) return
    setSubmitting(true)
    try {
      const ts = Date.now()

      for (const item of selection) {
        if (item.kind === "new") {
          const input: CreateAnimalInput = {
            estId,
            caravana: item.caravana,
            category: item.category,
            breed: item.breed,
            sex: item.sex,
            birthDate: null,
            entryWeight: null,
            origin: "",
            entryType: item.entryType,
            lotId: createdLot.id,
            purchasePriceUsd: null,
            createdBy: userId,
          }
          const animal = animalRepository.create(input)
          traceabilityRepository.create({
            animalId: animal.id,
            estId,
            type: "entry",
            description: "Ingreso al stock durante creación de lote",
            activityId: null,
            lotId: createdLot.id,
            lotName: createdLot.name,
            responsibleName: null,
            timestamp: ts,
          })
          traceabilityRepository.create({
            animalId: animal.id,
            estId,
            type: "lot_assignment",
            description: `Asignado al lote ${createdLot.name}`,
            activityId: null,
            lotId: createdLot.id,
            lotName: createdLot.name,
            responsibleName: null,
            timestamp: ts,
          })
        } else {
          const { animal } = item
          const previousLotId = animal.lotId

          animalRepository.update(estId, animal.id, { lotId: createdLot.id })

          if (previousLotId) {
            const prevLot = lots.find((l) => l.id === previousLotId)
            if (prevLot) {
              lotRepository.update(estId, previousLotId, {
                animalCount: Math.max(0, prevLot.animalCount - 1),
              })
            }
            traceabilityRepository.create({
              animalId: animal.id,
              estId,
              type: "lot_change",
              description: `Movido desde ${prevLot?.name ?? "otro lote"} al lote ${createdLot.name}`,
              activityId: null,
              lotId: createdLot.id,
              lotName: createdLot.name,
              responsibleName: null,
              timestamp: ts,
            })
          } else {
            traceabilityRepository.create({
              animalId: animal.id,
              estId,
              type: "lot_assignment",
              description: `Asignado al lote ${createdLot.name}`,
              activityId: null,
              lotId: createdLot.id,
              lotName: createdLot.name,
              responsibleName: null,
              timestamp: ts,
            })
          }
        }
      }

      lotRepository.update(estId, createdLot.id, { animalCount: selection.length })
      router.push(`/lots/${createdLot.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  function handleBack() {
    if (step === "info") onClose()
    else if (step === "method") setStep("info")
    else if (step === "animals") setStep("method")
    else setStep("animals")
  }

  if (!estId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl h-[85vh] rounded-2xl bg-background flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-6 px-6 py-4 border-b bg-background shrink-0">
          <div className="shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Nuevo lote
            </p>
            <p className="text-lg font-semibold mt-0.5">{STEP_TITLES[step]}</p>
          </div>
          <div className="flex-1 flex justify-center">
            <StepIndicator current={step} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/10 min-h-0">
          {step === "info" && (
            <InfoStep
              estId={estId}
              onCreated={(lot) => {
                setCreatedLot(lot)
                setStep("method")
              }}
            />
          )}

          {step === "method" && (
            <MethodStep method={method} onMethodChange={handleMethodChange} />
          )}

          {step === "animals" && method === "reading_live" && (
            <ReadingAnimalsStep
              readings={readings}
              lots={lots}
              readingId={readingId}
              discarded={discarded}
              onReadingChange={handleReadingChange}
              onToggleDiscard={toggleDiscard}
              onSelectAll={selectAll}
              onDiscardAll={discardAll}
            />
          )}

          {step === "animals" && method === "lot_transfer" && (
            <LotTransferAnimalsStep
              lots={lots}
              animals={animals}
              lotTransferId={lotTransferId}
              discarded={discarded}
              onLotChange={handleLotTransferChange}
              onToggleDiscard={toggleDiscard}
              onSelectAll={selectAll}
              onDiscardAll={discardAll}
            />
          )}

          {step === "animals" &&
            method !== "reading_live" &&
            method !== "lot_transfer" && (
              <MethodPlaceholderStep method={method} />
            )}

          {step === "confirm" && createdLot && (
            <ConfirmStep
              lot={createdLot}
              selection={selection}
              method={method}
              sourceName={
                method === "reading_live" || method === "reading_file"
                  ? readings.find((r) => r.id === readingId)
                    ? readingLabel(readings.find((r) => r.id === readingId)!)
                    : ""
                  : method === "lot_transfer"
                  ? lots.find((l) => l.id === lotTransferId)?.name ?? ""
                  : ""
              }
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-background flex items-center justify-between shrink-0">
          <p className="text-xs text-muted-foreground">
            {step === "confirm"
              ? "¿Todo bien? Una vez creado, podés agregar o quitar animales en cualquier momento."
              : "Los datos se pueden modificar luego."}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" type="button" onClick={handleBack}>
              {step === "info" ? "Cancelar" : "← Atrás"}
            </Button>

            {step === "info" && (
              <Button form="lot-wizard-info" type="submit">
                Continuar →
              </Button>
            )}

            {step === "method" && (
              <Button type="button" onClick={() => setStep("animals")}>
                Continuar →
              </Button>
            )}

            {step === "animals" && (
              <Button type="button" onClick={handleAdvanceToConfirm}>
                Continuar →
              </Button>
            )}

            {step === "confirm" && (
              <Button type="button" onClick={handleConfirm} loading={submitting}>
                ✓ Crear lote
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewLotPage() {
  const router = useRouter()
  return <NewLotModal onClose={() => router.push("/lots")} />
}
