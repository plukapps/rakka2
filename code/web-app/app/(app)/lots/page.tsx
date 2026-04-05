"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useAllLots } from "@/hooks/useLots"
import { LotCard } from "@/components/lots/LotCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"

export default function LotsPage() {
  const allLots = useAllLots()
  const [search, setSearch] = useState("")
  const [showDissolved, setShowDissolved] = useState(false)

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
        <div className="flex flex-col gap-3">
          {filtered.map((lot) => (
            <LotCard key={lot.id} lot={lot} />
          ))}
        </div>
      )}
    </div>
  )
}
