"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useAnimals } from "@/hooks/useAnimals"
import { useLots } from "@/hooks/useLots"
import { AnimalCard, LIST_COL_TEMPLATE, LIST_COL_GAP, type ViewMode } from "@/components/animals/AnimalCard"
import { AnimalFilters, ViewModeToggle, SortToggle, type AnimalFilterState, type AnimalSortBy } from "@/components/animals/AnimalFilters"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

const DEFAULT_FILTERS: AnimalFilterState = {
  search: "",
  lotId: "",
  category: "",
  carenciaOnly: false,
  statusFilter: "active",
  sortBy: "serie_asc",
}

const MODE_CONFIG: Record<ViewMode, { cols: number; rowHeight: number; gap: number }> = {
  relaxed:   { cols: 4, rowHeight: 114, gap: 12 },
  compacted: { cols: 6, rowHeight: 110, gap: 10 },
  list:      { cols: 1, rowHeight: 56,  gap: 6  },
}

const VIEW_MODE_KEY = "animals-view-mode"

function getSavedViewMode(): ViewMode {
  if (typeof window === "undefined") return "relaxed"
  return (localStorage.getItem(VIEW_MODE_KEY) as ViewMode) ?? "relaxed"
}

export default function AnimalsPage() {
  const params = useSearchParams()
  const [filters, setFilters] = useState<AnimalFilterState>({
    ...DEFAULT_FILTERS,
    lotId: params.get("lotId") ?? "",
  })
  const [viewMode, setViewMode] = useState<ViewMode>(getSavedViewMode)

  const animals = useAnimals()
  const lots = useLots()

  // Use the layout's <main> as the single scroll container to avoid double scroll
  const scrollRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    scrollRef.current = document.querySelector("main")
  }, [])

  const { cols, rowHeight, gap } = MODE_CONFIG[viewMode]

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
    }).sort((a, b) => {
      const sortAnimal = (x: typeof a) => ({
        serie: x.caravana.slice(6, 11),
        num: x.caravana.slice(11),
      })
      const pa = sortAnimal(a)
      const pb = sortAnimal(b)
      switch (filters.sortBy as AnimalSortBy) {
        case "serie_asc":  return pa.serie !== pb.serie ? pa.serie.localeCompare(pb.serie) : pa.num.localeCompare(pb.num)
        case "serie_desc": return pa.serie !== pb.serie ? pb.serie.localeCompare(pa.serie) : pb.num.localeCompare(pa.num)
        case "num_asc":    return pa.num !== pb.num ? pa.num.localeCompare(pb.num) : pa.serie.localeCompare(pb.serie)
        case "num_desc":   return pa.num !== pb.num ? pb.num.localeCompare(pa.num) : pb.serie.localeCompare(pa.serie)
      }
    })
  }, [animals, filters])

  const rowCount = Math.ceil(filtered.length / cols)

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight + gap,
    overscan: 3,
  })

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem(VIEW_MODE_KEY, mode)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Animales{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({filtered.length} / {animals.length})
          </span>
        </h1>
        <Link href="/animals/new">
          <Button size="sm">+ Ingresar animal</Button>
        </Link>
      </div>

      <div className="mt-2">
        <AnimalFilters
          filters={filters}
          lots={lots}
          onChange={setFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />
      </div>

      <div className="flex items-center justify-end gap-2 mt-5">
        <SortToggle value={filters.sortBy} onChange={(v) => setFilters({ ...filters, sortBy: v })} />
        <ViewModeToggle value={viewMode} onChange={handleViewModeChange} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="No hay animales que coincidan con los filtros."
        />
      ) : viewMode === "list" ? (
        <div className="rounded-lg border border-border overflow-hidden">
          {/* Table header */}
          <div
            className="grid items-center border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold text-foreground"
            style={{ gridTemplateColumns: LIST_COL_TEMPLATE, gap: LIST_COL_GAP }}
          >
            <span>Tag</span>
            <span>Caravana</span>
            <span>Estado</span>
            <span>Categoría</span>
            <span>Raza</span>
            <span>Carencia</span>
            <span className="text-right">Lote</span>
          </div>

          {/* Table rows (virtualized) */}
          <div
            className="relative w-full"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const animal = filtered[virtualRow.index]
              return (
                <div
                  key={virtualRow.key}
                  className="absolute left-0 w-full"
                  style={{ top: virtualRow.start, height: rowHeight }}
                >
                  <AnimalCard
                    animal={animal}
                    lot={animal.lotId ? lotMap[animal.lotId] : undefined}
                    viewMode="list"
                  />
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div
          className="relative w-full"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const startIdx = virtualRow.index * cols
            const rowAnimals = filtered.slice(startIdx, startIdx + cols)
            return (
              <div
                key={virtualRow.key}
                className="absolute left-0 w-full"
                style={{
                  top: virtualRow.start,
                  height: rowHeight,
                  display: "grid",
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gap,
                }}
              >
                {rowAnimals.map((animal) => (
                  <AnimalCard
                    key={animal.id}
                    animal={animal}
                    lot={animal.lotId ? lotMap[animal.lotId] : undefined}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
