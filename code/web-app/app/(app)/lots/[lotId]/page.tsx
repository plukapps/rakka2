"use client"

import { use, useState, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MoreVertical } from "lucide-react"
import { useLot } from "@/hooks/useLots"
import { useAnimals } from "@/hooks/useAnimals"
import { lotRepository } from "@/lib/repositories/lot"
import { animalRepository } from "@/lib/repositories/animal"
import { useAppStore } from "@/lib/stores/appStore"
import { TagView } from "@/components/animals/TagView"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { activityRepository } from "@/lib/repositories/activity"
import { formatDate, formatCaravana } from "@/lib/utils"
import { LotWeightStatsCard } from "@/components/lots/LotWeightStatsCard"

export default function LotDetailPage({
  params,
}: {
  params: Promise<{ lotId: string }>
}) {
  const { lotId } = use(params)
  const router = useRouter()
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const lot = useLot(lotId)
  const allAnimals = useAnimals()

  const [search, setSearch] = useState("")
  const [showDissolveConfirm, setShowDissolveConfirm] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showMenu])

  const lotAnimals = useMemo(
    () => allAnimals.filter((a) => a.lotId === lotId),
    [allAnimals, lotId]
  )

  const lotActivities = useMemo(() => {
    if (!estId) return []
    return activityRepository.getAll(estId)
  }, [estId])

  const filteredLotAnimals = useMemo(() => {
    if (!search) return lotAnimals
    const q = search.toLowerCase()
    return lotAnimals.filter(
      (a) =>
        a.caravana.toLowerCase().includes(q) ||
        formatCaravana(a.caravana, "serie").toLowerCase().includes(q)
    )
  }, [lotAnimals, search])

  function handleDissolveLot() {
    if (!estId || !lot) return
    for (const animal of lotAnimals) {
      animalRepository.update(estId, animal.id, { lotId: null })
    }
    lotRepository.update(estId, lotId, { status: "dissolved", animalCount: 0 })
    router.push("/lots")
  }

  if (!lot) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Lotes</Button>
      </div>

      {/* Lot header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>{lot.name}</CardTitle>
              <StatusBadge variant={lot.status === "active" ? "success" : "neutral"}>
                {lot.status === "active" ? "Activo" : "Disuelto"}
              </StatusBadge>
            </div>
            {lot.status === "active" && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 z-10 min-w-[160px] rounded-md border border-border bg-card shadow-md py-1">
                    <button
                      type="button"
                      onClick={() => { setShowMenu(false); setShowDissolveConfirm(true) }}
                      className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                    >
                      Disolver lote
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {lot.description && (
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground">Descripción</dt>
                <dd className="font-medium text-foreground">{lot.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted-foreground">Fecha de creación</dt>
              <dd className="font-medium text-foreground">{formatDate(lot.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Animales</dt>
              <dd className="font-medium text-foreground">
                {lot.animalCount} {lot.animalCount === 1 ? "animal" : "animales"}
              </dd>
            </div>
          </dl>
          {lot.status === "active" && (
            <div className="flex justify-end pt-2 border-t border-border mt-3">
              <Link href={`/activities/new?lotId=${lotId}`}>
                <Button size="sm" variant="outline">Registrar actividad</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <LotWeightStatsCard animals={lotAnimals} activities={lotActivities} />

      {/* Animals in lot */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Animales en el lote</CardTitle>
            {lot.status === "active" && (
              <Link href={`/lots/move?to=${lotId}`}>
                <Button size="sm" variant="outline">Mover animales</Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {lotAnimals.length > 0 && (
            <Input
              placeholder="Buscar por caravana..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}

          {filteredLotAnimals.length === 0 ? (
            <EmptyState
              title="Sin animales"
              description={
                lotAnimals.length === 0
                  ? "Este lote no tiene animales asignados."
                  : "No hay animales que coincidan con la búsqueda."
              }
              className="py-6"
            />
          ) : (
            <div className="grid grid-cols-6 gap-3">
              {filteredLotAnimals.map((animal) => (
                <Link key={animal.id} href={`/animals/${animal.id}`} className="flex justify-center">
                  <TagView caravana={animal.caravana} size="md" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showDissolveConfirm && (
        <ConfirmModal
          title="Disolver lote"
          description={`¿Estás seguro de que querés disolver ${lot.name}? Se desasignarán ${lotAnimals.length} ${lotAnimals.length === 1 ? "animal" : "animales"}. Esta acción no se puede deshacer.`}
          confirmLabel="Disolver"
          confirmVariant="destructive"
          onConfirm={handleDissolveLot}
          onCancel={() => setShowDissolveConfirm(false)}
        />
      )}
    </div>
  )
}
