"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useAnimals } from "@/hooks/useAnimals"
import { TagView } from "@/components/animals/TagView"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { formatCaravana, categoryLabel } from "@/lib/utils"

export default function TraceabilityPage() {
  const animals = useAnimals()
  const [search, setSearch] = useState("")

  const matches = useMemo(() => {
    if (!search.trim()) return []
    const q = search.trim().toLowerCase()
    return animals.filter((a) =>
      a.caravana.toLowerCase().includes(q) ||
      formatCaravana(a.caravana, "serie").toLowerCase().includes(q)
    ).slice(0, 20)
  }, [animals, search])

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-foreground">Trazabilidad</h1>

      <div>
        <input
          type="text"
          placeholder="Buscar por caravana..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {!search.trim() && (
        <EmptyState
          title="Selecciona un animal para ver su trazabilidad"
          description="Busca por numero de caravana para acceder a la linea de vida del animal."
        />
      )}

      {search.trim() && matches.length === 0 && (
        <EmptyState
          title="Sin resultados"
          description="No se encontraron animales con esa caravana."
        />
      )}

      {matches.length > 0 && (
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {matches.map((animal) => (
            <Link
              key={animal.id}
              href={`/traceability/${animal.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <TagView caravana={animal.caravana} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {formatCaravana(animal.caravana)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {categoryLabel(animal.category)}
                </p>
              </div>
              <StatusBadge variant={animal.status === "active" ? "success" : "neutral"}>
                {animal.status === "active" ? "Activo" : "Egresado"}
              </StatusBadge>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
