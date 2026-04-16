"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Animal } from "@/lib/types"
import { animalRepository } from "@/lib/repositories/animal"
import { TagView } from "@/components/animals/TagView"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn, formatCaravana, categoryLabel, carenciaLabel, parseRfidLineWithWeight } from "@/lib/utils"
import { useLots } from "@/hooks/useLots"
import { Upload, X } from "lucide-react"

type Tab = "individual" | "lot" | "rfid_file" | "rfid_bluetooth"

interface AnimalSelectorProps {
  estId: string
  selected: Animal[]
  onChange: (animals: Animal[]) => void
  onUnrecognized?: (caravanas: string[]) => void
  onMethodChange?: (method: "rfid_bluetooth" | "rfid_file" | "lot" | "individual") => void
  onWeightMap?: (map: Record<string, number>) => void
  onFileName?: (name: string | null) => void
  filterFn?: (animal: Animal) => boolean
  rfidOnly?: boolean
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

const TABS: { key: Tab; label: string }[] = [
  { key: "individual", label: "Individual" },
  { key: "lot", label: "Por lote" },
  { key: "rfid_file", label: "Lectura desde archivo" },
  { key: "rfid_bluetooth", label: "Lectura con Bastón" },
]

const RFID_TABS: { key: Tab; label: string }[] = [
  { key: "rfid_file", label: "Lectura desde archivo" },
  { key: "rfid_bluetooth", label: "Lectura con Bastón" },
]

// ---- Animal Detail Modal ----

function AnimalDetailModal({
  animal,
  onClose,
}: {
  animal: Animal
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Detalle del animal</h3>
          <button type="button" onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
            Cerrar
          </button>
        </div>
        <div className="flex justify-center">
          <TagView caravana={animal.caravana} size="lg" />
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">Caravana</p>
            <p className="font-medium">{formatCaravana(animal.caravana, "full")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Categoría</p>
            <p className="font-medium">{categoryLabel(animal.category)}</p>
          </div>
          {animal.breed && (
            <div>
              <p className="text-muted-foreground">Raza</p>
              <p className="font-medium">{animal.breed}</p>
            </div>
          )}
          {animal.sex && (
            <div>
              <p className="text-muted-foreground">Sexo</p>
              <p className="font-medium">{animal.sex === "male" ? "Macho" : "Hembra"}</p>
            </div>
          )}
          {animal.hasActiveCarencia && (
            <div className="col-span-2">
              <StatusBadge variant="warning">
                {carenciaLabel(animal.carenciaExpiresAt)}
              </StatusBadge>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function AnimalSelector({
  estId,
  selected,
  onChange,
  onUnrecognized,
  onMethodChange,
  onWeightMap,
  onFileName,
  filterFn,
  rfidOnly,
}: AnimalSelectorProps) {
  const [tab, setTab] = useState<Tab>(rfidOnly ? "rfid_file" : "individual")
  const [allAnimals, setAllAnimals] = useState<Animal[]>([])
  const [detailAnimal, setDetailAnimal] = useState<Animal | null>(null)
  const lots = useLots()

  function handleTabChange(newTab: Tab) {
    setTab(newTab)
    onMethodChange?.(newTab)
  }

  useEffect(() => {
    if (!estId) return
    setAllAnimals(animalRepository.getAll(estId).filter((a) => a.status === "active"))
    return animalRepository.subscribe(estId, () =>
      setAllAnimals(animalRepository.getAll(estId).filter((a) => a.status === "active"))
    )
  }, [estId])

  const available = filterFn ? allAnimals.filter(filterFn) : allAnimals

  const addAnimal = useCallback(
    (animal: Animal) => {
      if (selected.some((a) => a.id === animal.id)) return
      onChange([...selected, animal])
    },
    [selected, onChange]
  )

  const removeAnimal = useCallback(
    (animalId: string) => {
      onChange(selected.filter((a) => a.id !== animalId))
    },
    [selected, onChange]
  )

  const tabList = rfidOnly ? RFID_TABS : TABS

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="inline-flex gap-1 rounded-xl bg-muted p-1">
        {tabList.map((t) => (
          <button
            key={t.key}
            type="button"
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-foreground/60 hover:text-foreground"
            )}
            onClick={() => handleTabChange(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "individual" && (
        <IndividualTab animals={available} selected={selected} onAdd={addAnimal} />
      )}
      {tab === "lot" && (
        <LotTab lots={lots} animals={available} selected={selected} onChange={onChange} />
      )}
      {tab === "rfid_file" && (
        <RfidFileTab animals={available} selected={selected} onChange={onChange} onAdd={addAnimal} onUnrecognized={onUnrecognized} onWeightMap={onWeightMap} onFileName={onFileName} />
      )}
      {tab === "rfid_bluetooth" && (
        <BluetoothTab animals={available} selected={selected} onAdd={addAnimal} />
      )}

      {/* Selected animals grid */}
      {selected.length > 0 && (
        <div className="space-y-2">
          <Label>Seleccionados ({selected.length})</Label>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border p-2">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
              {selected.map((animal) => (
                <div
                  key={animal.id}
                  className="group relative flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1.5"
                >
                  <button
                    type="button"
                    onClick={() => setDetailAnimal(animal)}
                    className="shrink-0 cursor-pointer"
                  >
                    <TagView caravana={animal.caravana} size="sm" />
                  </button>
                  <span className="truncate text-xs font-medium">{categoryLabel(animal.category)}</span>
                  {animal.hasActiveCarencia && (
                    <StatusBadge variant="warning">!</StatusBadge>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAnimal(animal.id)}
                    className="ml-auto shrink-0 rounded-full p-0.5 text-muted-foreground/40 hover:text-muted-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detailAnimal && (
        <AnimalDetailModal animal={detailAnimal} onClose={() => setDetailAnimal(null)} />
      )}
    </div>
  )
}

// ---- Individual Tab ----

function IndividualTab({
  animals,
  selected,
  onAdd,
}: {
  animals: Animal[]
  selected: Animal[]
  onAdd: (a: Animal) => void
}) {
  const [search, setSearch] = useState("")

  const results =
    search.length >= 2
      ? animals.filter(
          (a) =>
            a.caravana.includes(search) && !selected.some((s) => s.id === a.id)
        )
      : []

  return (
    <div className="space-y-2">
      <Input
        className="max-w-xs"
        placeholder="Buscar por caravana..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {results.length > 0 && (
        <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
          {results.slice(0, 20).map((animal) => (
            <button
              key={animal.id}
              type="button"
              onClick={() => onAdd(animal)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted"
            >
              <TagView caravana={animal.caravana} size="sm" />
              <span className="text-xs">
                {formatCaravana(animal.caravana, "serie")} - {categoryLabel(animal.category)}
              </span>
            </button>
          ))}
        </div>
      )}
      {search.length >= 2 && results.length === 0 && (
        <p className="text-xs text-muted-foreground">Sin resultados para &quot;{search}&quot;</p>
      )}
    </div>
  )
}

// ---- Lot Tab ----

function LotTab({
  lots,
  animals,
  selected,
  onChange,
}: {
  lots: { id: string; name: string }[]
  animals: Animal[]
  selected: Animal[]
  onChange: (animals: Animal[]) => void
}) {
  const [lotId, setLotId] = useState("")

  function handleSelect(id: string) {
    setLotId(id)
    if (!id) return
    const lotAnimals = animals.filter((a) => a.lotId === id)
    // Merge without duplicates
    const existingIds = new Set(selected.map((a) => a.id))
    const newAnimals = lotAnimals.filter((a) => !existingIds.has(a.id))
    onChange([...selected, ...newAnimals])
  }

  return (
    <div className="space-y-2">
      <NativeSelect className="max-w-xs" value={lotId} onChange={(e) => handleSelect(e.target.value)}>
        <option value="">Seleccionar lote...</option>
        {lots.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </NativeSelect>
      {lotId && (
        <p className="text-xs text-muted-foreground">
          {animals.filter((a) => a.lotId === lotId).length} animales en este lote
        </p>
      )}
    </div>
  )
}

// ---- RFID File Tab ----

function RfidFileTab({
  animals,
  onChange,
  onUnrecognized,
  onWeightMap,
  onFileName,
}: {
  animals: Animal[]
  selected: Animal[]
  onChange: (animals: Animal[]) => void
  onAdd?: (a: Animal) => void
  onUnrecognized?: (caravanas: string[]) => void
  onWeightMap?: (map: Record<string, number>) => void
  onFileName?: (name: string | null) => void
}) {
  const [allCaravanas, setAllCaravanas] = useState<string[]>([])
  const [excluded, setExcluded] = useState<Set<string>>(new Set())
  const [caravanaToAnimal, setCaravanaToAnimal] = useState<Record<string, Animal>>({})
  const [fileName, setFileName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function applyExclusion(caravanas: string[], ex: Set<string>, map: Record<string, Animal>) {
    const included = caravanas.filter((c) => !ex.has(c))
    const newAnimals = included.filter((c) => map[c]).map((c) => map[c])
    const newUnknown = included.filter((c) => !map[c])
    onChange(newAnimals)
    onUnrecognized?.(newUnknown)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    onFileName?.(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean)

      const caravanas: string[] = []
      const map: Record<string, Animal> = {}
      const seen = new Set<string>()
      const weightMap: Record<string, number> = {}

      for (const line of lines) {
        const parsed = parseRfidLineWithWeight(line)
        if (!parsed || seen.has(parsed.caravana)) continue
        seen.add(parsed.caravana)
        caravanas.push(parsed.caravana)
        const animal = animals.find((a) => a.caravana === parsed.caravana)
        if (animal) {
          map[parsed.caravana] = animal
          if (parsed.weight != null) weightMap[animal.id] = parsed.weight
        }
      }

      setAllCaravanas(caravanas)
      setCaravanaToAnimal(map)
      setExcluded(new Set())
      if (Object.keys(weightMap).length > 0) onWeightMap?.(weightMap)
      applyExclusion(caravanas, new Set(), map)
    }
    reader.readAsText(file)
  }

  function removeCaravana(caravana: string) {
    const next = new Set(excluded)
    next.add(caravana)
    setExcluded(next)
    applyExclusion(allCaravanas, next, caravanaToAnimal)
  }

  function reset() {
    setFileName("")
    setAllCaravanas([])
    setExcluded(new Set())
    setCaravanaToAnimal({})
    onChange([])
    onUnrecognized?.([])
    onFileName?.(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const visibleCaravanas = allCaravanas.filter((c) => !excluded.has(c))
  const totalRead = allCaravanas.length
  const totalVisible = visibleCaravanas.length

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        id="rfid-file-upload"
        type="file"
        accept=".txt,.csv,.dat"
        onChange={handleFile}
        className="sr-only"
      />
      {!fileName ? (
        <label
          htmlFor="rfid-file-upload"
          className="flex w-full max-w-sm cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-8 text-center transition-colors hover:border-primary/40 hover:bg-muted/30"
        >
          <Upload className="h-8 w-8 text-muted-foreground/60" />
          <span className="text-sm font-medium text-foreground">Seleccionar archivo</span>
          <span className="text-xs text-muted-foreground">Formatos aceptados: .txt, .csv, .dat</span>
        </label>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {totalVisible} de {totalRead} caravana{totalRead !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground">{fileName}</p>
            </div>
            <button type="button" onClick={reset} className="text-xs text-primary hover:underline">
              Cambiar archivo
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto rounded-lg border border-border p-2">
            <div className="flex flex-wrap gap-2">
              {visibleCaravanas.map((caravana) => (
                <div key={caravana} className="relative">
                  <TagView caravana={caravana} size="md" />
                  <button
                    type="button"
                    onClick={() => removeCaravana(caravana)}
                    className="absolute bottom-0 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors"
                    title="Descartar"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {excluded.size > 0 && (
            <p className="text-xs text-muted-foreground">
              {excluded.size} descartada{excluded.size !== 1 ? "s" : ""} ·{" "}
              <button
                type="button"
                onClick={() => {
                  setExcluded(new Set())
                  applyExclusion(allCaravanas, new Set(), caravanaToAnimal)
                }}
                className="text-primary hover:underline"
              >
                restaurar todas
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ---- Bluetooth Tab (mock) ----

function BluetoothTab({
  animals,
  selected,
  onAdd,
}: {
  animals: Animal[]
  selected: Animal[]
  onAdd: (a: Animal) => void
}) {
  const [reading, setReading] = useState(false)
  const [count, setCount] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function start() {
    setReading(true)
    setCount(0)
    intervalRef.current = setInterval(() => {
      // Pick a random animal not already selected
      const notSelected = animals.filter(
        (a) => !selected.some((s) => s.id === a.id)
      )
      if (notSelected.length === 0) {
        stop()
        return
      }
      const random = notSelected[Math.floor(Math.random() * notSelected.length)]
      onAdd(random)
      setCount((c) => c + 1)
    }, 800)
  }

  function stop() {
    setReading(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {!reading ? (
          <Button type="button" size="sm" onClick={start}>
            Iniciar lectura
          </Button>
        ) : (
          <Button type="button" size="sm" variant="destructive" onClick={stop}>
            Detener
          </Button>
        )}
        {reading && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Leyendo...
          </span>
        )}
      </div>
      {count > 0 && (
        <p className="text-xs text-muted-foreground">{count} animales leidos en esta sesion</p>
      )}
    </div>
  )
}
