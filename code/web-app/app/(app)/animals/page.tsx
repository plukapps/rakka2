"use client"

import { useState, useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useAnimals } from "@/hooks/useAnimals"
import { useLots } from "@/hooks/useLots"
import { AnimalCard } from "@/components/animals/AnimalCard"
import { AnimalFilters, type AnimalFilterState } from "@/components/animals/AnimalFilters"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

const DEFAULT_FILTERS: AnimalFilterState = {
  search: "",
  lotId: "",
  category: "",
  carenciaOnly: false,
  statusFilter: "active",
}

const COLS = 3
const ROW_HEIGHT = 102
const GAP = 12

export default function AnimalsPage() {
  const params = useSearchParams()
  const [filters, setFilters] = useState<AnimalFilterState>({
    ...DEFAULT_FILTERS,
    lotId: params.get("lotId") ?? "",
  })

  const animals = useAnimals()
  const lots = useLots()
  const parentRef = useRef<HTMLDivElement>(null)

  const lotMap = useMemo(
    () => Object.fromEntries(lots.map((l) => [l.id, l])),
    [lots]
  )

  const filtered = useMemo(() => {
    return animals.filter((a) => {
      if (filters.statusFilter === "active" && a.status !== "active") return false
      if (filters.carenciaOnly && !a.hasActiveCarencia) return false
      if (filters.lotId === "none" && a.lotId !== null) return false
      if (filters.lotId && filters.lotId !== "none" && a.lotId !== filters.lotId) return false
      if (filters.category && a.category !== filters.category) return false
      if (filters.search && !a.caravana.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
  }, [animals, filters])

  const rowCount = Math.ceil(filtered.length / COLS)

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT + GAP,
    overscan: 3,
  })

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-lg font-semibold text-foreground">
          Animales{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({filtered.length})
          </span>
        </h1>
        <Link href="/animals/new">
          <Button size="sm">+ Ingresar animal</Button>
        </Link>
      </div>

      <div className="shrink-0">
        <AnimalFilters
          filters={filters}
          lots={lots}
          onChange={setFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="No hay animales que coincidan con los filtros."
        />
      ) : (
        <div ref={parentRef} className="flex-1 overflow-auto">
          <div
            className="relative w-full"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const startIdx = virtualRow.index * COLS
              const rowAnimals = filtered.slice(startIdx, startIdx + COLS)
              return (
                <div
                  key={virtualRow.key}
                  className="absolute left-0 w-full"
                  style={{
                    top: virtualRow.start,
                    height: ROW_HEIGHT,
                    display: "grid",
                    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                    gap: GAP,
                  }}
                >
                  {rowAnimals.map((animal) => (
                    <AnimalCard
                      key={animal.id}
                      animal={animal}
                      lot={animal.lotId ? lotMap[animal.lotId] : undefined}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
