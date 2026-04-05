"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useAllLots } from "@/hooks/useLots"
import { useAnimals } from "@/hooks/useAnimals"
import { LotCard } from "@/components/lots/LotCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"

export default function LotsPage() {
  const allLots = useAllLots()
  const animals = useAnimals()
  const [search, setSearch] = useState("")
  const [showDissolved, setShowDissolved] = useState(false)

  const sinLoteCount = useMemo(
    () => animals.filter((a) => a.status === "active" && a.lotId === null).length,
    [animals]
  )

  const filtered = useMemo(() => {
    return allLots.filter((l) => {
      if (!showDissolved && l.status !== "active") return false
      if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [allLots, search, showDissolved])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Lotes{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({filtered.length})
          </span>
        </h1>
        <Link href="/lots/new">
          <Button size="sm">+ Crear lote</Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showDissolved}
            onChange={(e) => setShowDissolved(e.target.checked)}
            className="rounded border-input"
          />
          Mostrar disueltos
        </label>
      </div>

      <div className="flex flex-col gap-3">
        {/* Virtual "Sin lote" card — always visible */}
        <Link href="/lots/sin-lote">
          <div className="flex items-center justify-between rounded-xl border border-dashed border-border bg-card px-4 py-4 hover:border-foreground/30 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Sin lote asignado</span>
                <span className="text-xs text-muted-foreground">(virtual)</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">Animales activos sin lote</p>
            </div>
            <Badge variant="secondary" className="ml-3 shrink-0">
              {sinLoteCount} {sinLoteCount === 1 ? "animal" : "animales"}
            </Badge>
          </div>
        </Link>

        {filtered.length === 0 ? (
          <EmptyState
            title="Sin resultados"
            description={
              allLots.length === 0
                ? "No hay lotes en este establecimiento."
                : "No hay lotes que coincidan con los filtros."
            }
            action={
              allLots.length === 0 ? (
                <Link href="/lots/new">
                  <Button size="sm">Crear primer lote</Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          filtered.map((lot) => <LotCard key={lot.id} lot={lot} />)
        )}
      </div>
    </div>
  )
}
