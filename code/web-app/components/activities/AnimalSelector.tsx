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
  { key: "rfid_file", label: "Archivo RFID" },
  { key: "rfid_bluetooth", label: "Bluetooth RFID" },
]

const RFID_TABS: { key: Tab; label: string }[] = [
  { key: "rfid_file", label: "Archivo RFID" },
  { key: "rfid_bluetooth", label: "Bluetooth RFID" },
]

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
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {tabList.map((t) => (
          <button
            key={t.key}
            type="button"
            className={cn(
              "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              tab === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
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

      {/* Selected animals list */}
      {selected.length > 0 && (
        <div className="space-y-2">
          <Label>Seleccionados ({selected.length})</Label>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
            {selected.map((animal) => (
              <div
                key={animal.id}
                className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5"
              >
                <div className="flex items-center gap-2">
                  <TagView caravana={animal.caravana} size="sm" />
                  <div className="text-xs">
                    <span className="font-medium">{categoryLabel(animal.category)}</span>
                    {animal.breed && (
                      <span className="text-muted-foreground"> - {animal.breed}</span>
                    )}
                  </div>
                  {animal.hasActiveCarencia && (
                    <StatusBadge variant="warning">
                      {carenciaLabel(animal.carenciaExpiresAt)}
                    </StatusBadge>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeAnimal(animal.id)}
                  className="ml-2 text-xs text-muted-foreground hover:text-destructive"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
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
      <NativeSelect value={lotId} onChange={(e) => handleSelect(e.target.value)}>
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
  selected,
  onChange,
  onAdd,
  onUnrecognized,
  onWeightMap,
  onFileName,
}: {
  animals: Animal[]
  selected: Animal[]
  onChange: (animals: Animal[]) => void
  onAdd: (a: Animal) => void
  onUnrecognized?: (caravanas: string[]) => void
  onWeightMap?: (map: Record<string, number>) => void
  onFileName?: (name: string | null) => void
}) {
  const [inStock, setInStock] = useState<Animal[]>([])
  const [notInStock, setNotInStock] = useState<string[]>([])
  const [totalRead, setTotalRead] = useState(0)
  const [fileName, setFileName] = useState("")

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    onFileName?.(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text
        .split(/[\r\n]+/)
        .map((l) => l.trim())
        .filter(Boolean)

      const found: Animal[] = []
      const unknown: string[] = []
      const seen = new Set<string>()
      const weightMap: Record<string, number> = {}

      for (const line of lines) {
        const parsed = parseRfidLineWithWeight(line)
        if (!parsed || seen.has(parsed.caravana)) continue
        seen.add(parsed.caravana)
        const animal = animals.find((a) => a.caravana === parsed.caravana)
        if (animal) {
          found.push(animal)
          if (parsed.weight != null) weightMap[animal.id] = parsed.weight
        } else {
          unknown.push(parsed.caravana)
        }
      }

      setTotalRead(seen.size)
      setInStock(found)
      setNotInStock(unknown)
      onUnrecognized?.(unknown)
      if (Object.keys(weightMap).length > 0) onWeightMap?.(weightMap)

      // Add found animals to selection (without duplicates)
      const existingIds = new Set(selected.map((a) => a.id))
      const newAnimals = found.filter((a) => !existingIds.has(a.id))
      onChange([...selected, ...newAnimals])
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-3">
      <Input type="file" accept=".txt,.csv" onChange={handleFile} />

      {totalRead > 0 && (
        <div className="space-y-2">
          <div className="rounded-lg border border-border p-3 space-y-1">
            <p className="text-sm font-medium text-foreground">
              Lectura exitosa — {totalRead} caravana{totalRead !== 1 ? "s" : ""} leída{totalRead !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">{fileName}</p>
          </div>

          {inStock.length > 0 && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2">
              <p className="text-xs font-medium text-emerald-800">
                {inStock.length} en stock del establecimiento
              </p>
            </div>
          )}

          {notInStock.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-2 space-y-1">
              <p className="text-xs font-medium text-amber-800">
                {notInStock.length} sin registro en este establecimiento
              </p>
              <div className="max-h-32 overflow-y-auto">
                <p className="text-xs text-amber-700 font-mono">
                  {notInStock.map((c) => formatCaravana(c, "serie")).join(", ")}
                </p>
              </div>
            </div>
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
