"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
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

export default function AnimalsPage() {
  const params = useSearchParams()
  const [filters, setFilters] = useState<AnimalFilterState>({
    ...DEFAULT_FILTERS,
    lotId: params.get("lotId") ?? "",
  })

  const animals = useAnimals()
  const lots = useLots()

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
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

      <AnimalFilters
        filters={filters}
        lots={lots}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="No hay animales que coincidan con los filtros."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              lot={animal.lotId ? lotMap[animal.lotId] : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
