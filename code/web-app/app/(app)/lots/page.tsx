"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAllLots } from "@/hooks/useLots"
import { useAnimals } from "@/hooks/useAnimals"
import { LotCard } from "@/components/lots/LotCard"
import { NewLotModal } from "@/app/(app)/lots/new/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"

export default function LotsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const allLots = useAllLots()
  const animals = useAnimals()
  const [search, setSearch] = useState("")
  const [showDissolved, setShowDissolved] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createdLot, setCreatedLot] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const id = searchParams.get("created")
    const name = searchParams.get("name")
    if (id && name) {
      setCreatedLot({ id, name })
      router.replace("/lots")
    }
  }, [searchParams, router])

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
        <Button size="sm" onClick={() => setShowCreateModal(true)}>+ Crear lote</Button>
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
                <Button size="sm" onClick={() => setShowCreateModal(true)}>Crear primer lote</Button>
              ) : undefined
            }
          />
        ) : (
          filtered.map((lot) => <LotCard key={lot.id} lot={lot} />)
        )}
      </div>

      {showCreateModal && (
        <NewLotModal onClose={() => setShowCreateModal(false)} />
      )}

      {createdLot && (
        <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-lg -translate-x-1/2">
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg">
            <span className="text-sm text-emerald-800">
              Lote &quot;{createdLot.name}&quot; creado exitosamente
            </span>
            <div className="flex items-center gap-2">
              <Link href={`/lots/${createdLot.id}`}>
                <Button size="sm" variant="outline">Ver</Button>
              </Link>
              <button onClick={() => setCreatedLot(null)} className="rounded-full p-1 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
