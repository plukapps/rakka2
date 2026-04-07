"use client"

import { use, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLot, useLots, useAllLots } from "@/hooks/useLots"
import { useAnimals } from "@/hooks/useAnimals"
import { lotRepository } from "@/lib/repositories/lot"
import { animalRepository } from "@/lib/repositories/animal"
import { traceabilityRepository } from "@/lib/repositories/traceability"
import { useAppStore } from "@/lib/stores/appStore"
import { TagView } from "@/components/animals/TagView"
import { StatusBadge } from "@/components/ui/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { activityRepository } from "@/lib/repositories/activity"
import { formatDate, formatCaravana, categoryLabel } from "@/lib/utils"
import { LotWeightStatsCard } from "@/components/lots/LotWeightStatsCard"
import { LotPnLCard } from "@/components/financial/LotPnLCard"
import { AddCostoLoteForm } from "@/components/financial/AddCostoLoteForm"
import { CostosTable } from "@/components/financial/CostosTable"
import { useCostosLote } from "@/hooks/useCostosLote"
import { useLotPnL } from "@/hooks/useLotPnL"
import { cn } from "@/lib/utils"

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
  const allLots = useAllLots()
  const activeLots = useLots()

  const [search, setSearch] = useState("")
  const [showAddSection, setShowAddSection] = useState(false)
  const [addSearch, setAddSearch] = useState("")
  const [showFromLotSection, setShowFromLotSection] = useState(false)
  const [fromLotId, setFromLotId] = useState<string>("")
  const [fromLotSearch, setFromLotSearch] = useState("")
  const [selectedFromLotIds, setSelectedFromLotIds] = useState<Set<string>>(new Set())
  const [showMoveConfirm, setShowMoveConfirm] = useState(false)
  const [showDissolveConfirm, setShowDissolveConfirm] = useState(false)
  const [showCostoForm, setShowCostoForm] = useState(false)

  const costos = useCostosLote(lotId)
  const pnl = useLotPnL(lotId, allAnimals)

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

  // Animals without any lot (for the "sin lote" add section)
  const sinLoteAnimals = useMemo(
    () => allAnimals.filter((a) => a.status === "active" && a.lotId === null),
    [allAnimals]
  )

  const filteredSinLote = useMemo(() => {
    if (!addSearch) return sinLoteAnimals
    const q = addSearch.toLowerCase()
    return sinLoteAnimals.filter(
      (a) =>
        a.caravana.toLowerCase().includes(q) ||
        formatCaravana(a.caravana, "serie").toLowerCase().includes(q)
    )
  }, [sinLoteAnimals, addSearch])

  // Available source lots (not this lot)
  const sourceLots = useMemo(
    () => activeLots.filter((l) => l.id !== lotId),
    [activeLots, lotId]
  )

  // Animals in selected source lot
  const fromLotAnimals = useMemo(
    () => (fromLotId ? allAnimals.filter((a) => a.status === "active" && a.lotId === fromLotId) : []),
    [allAnimals, fromLotId]
  )

  const filteredFromLot = useMemo(() => {
    if (!fromLotSearch) return fromLotAnimals
    const q = fromLotSearch.toLowerCase()
    return fromLotAnimals.filter(
      (a) =>
        a.caravana.toLowerCase().includes(q) ||
        formatCaravana(a.caravana, "serie").toLowerCase().includes(q)
    )
  }, [fromLotAnimals, fromLotSearch])

  function handleAddSinLote(animalId: string) {
    if (!estId || !lot) return
    animalRepository.update(estId, animalId, { lotId: lotId })
    lotRepository.update(estId, lotId, { animalCount: lot.animalCount + 1 })
  }

  function toggleFromLotAnimal(animalId: string) {
    setSelectedFromLotIds((prev) => {
      const next = new Set(prev)
      if (next.has(animalId)) next.delete(animalId)
      else next.add(animalId)
      return next
    })
  }

  function handleConfirmMove() {
    if (!estId || !lot || !fromLotId) return
    const sourceLot = allLots.find((l) => l.id === fromLotId)
    const ts = Date.now()

    for (const animalId of selectedFromLotIds) {
      animalRepository.update(estId, animalId, { lotId: lotId })
      traceabilityRepository.create({
        animalId,
        estId,
        type: "lot_change",
        description: `Movido desde ${sourceLot?.name ?? "otro lote"} al lote ${lot.name}`,
        activityId: null,
        lotId: lotId,
        lotName: lot.name,
        responsibleName: null,
        timestamp: ts,
      })
    }

    if (sourceLot) {
      lotRepository.update(estId, fromLotId, {
        animalCount: Math.max(0, sourceLot.animalCount - selectedFromLotIds.size),
      })
    }
    lotRepository.update(estId, lotId, {
      animalCount: lot.animalCount + selectedFromLotIds.size,
    })

    setSelectedFromLotIds(new Set())
    setShowMoveConfirm(false)
    setFromLotId("")
    setShowFromLotSection(false)
  }

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

  const selectedSourceLot = allLots.find((l) => l.id === fromLotId)

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
            <Badge variant="secondary">
              {lot.animalCount} {lot.animalCount === 1 ? "animal" : "animales"}
            </Badge>
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
              <dt className="text-xs text-muted-foreground">Estado</dt>
              <dd className="font-medium text-foreground">
                {lot.status === "active" ? "Activo" : "Disuelto"}
              </dd>
            </div>
          </dl>
          {lot.status === "active" && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border mt-2">
              <Link href={`/activities/new/sanitary?lotId=${lotId}`}>
                <Button size="sm" variant="outline">Registrar actividad sanitaria</Button>
              </Link>
              <Link href={`/activities/new?lotId=${lotId}`}>
                <Button size="sm" variant="outline">Registrar actividad</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <LotWeightStatsCard animals={lotAnimals} activities={lotActivities} />

      {/* Financiero */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Financiero</CardTitle>
            {lot.status === "active" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCostoForm(!showCostoForm)}
              >
                {showCostoForm ? "Cancelar" : "+ Agregar costo"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {pnl ? (
            <LotPnLCard pnl={pnl} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Sin datos financieros. Registrá el precio de compra al ingresar animales y agregá costos al lote.
            </p>
          )}
          {showCostoForm && lot.status === "active" && (
            <AddCostoLoteForm
              loteId={lotId}
              onClose={() => setShowCostoForm(false)}
            />
          )}
          {costos.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Historial de costos
              </p>
              <CostosTable costos={costos} showCabezas />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Animals in lot */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Animales en el lote</CardTitle>
            {lot.status === "active" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setShowFromLotSection(!showFromLotSection); setShowAddSection(false) }}
                >
                  {showFromLotSection ? "Cerrar" : "Mover desde otro lote"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setShowAddSection(!showAddSection); setShowFromLotSection(false) }}
                >
                  {showAddSection ? "Cerrar" : "+ Agregar sin lote"}
                </Button>
              </div>
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

      {/* Agregar sin lote */}
      {showAddSection && lot.status === "active" && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar animales sin lote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Buscar por caravana..."
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
            />
            {filteredSinLote.length === 0 ? (
              <EmptyState
                title="Sin animales disponibles"
                description={
                  sinLoteAnimals.length === 0
                    ? "Todos los animales activos ya están en un lote."
                    : "No hay animales que coincidan con la búsqueda."
                }
                className="py-6"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredSinLote.map((animal) => (
                  <button
                    key={animal.id}
                    type="button"
                    onClick={() => handleAddSinLote(animal.id)}
                    className="rounded-xl opacity-60 hover:opacity-100 transition-all"
                    title={`${categoryLabel(animal.category)}${animal.breed ? ` · ${animal.breed}` : ""}`}
                  >
                    <TagView caravana={animal.caravana} size="md" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Desde otro lote */}
      {showFromLotSection && lot.status === "active" && (
        <Card>
          <CardHeader>
            <CardTitle>Mover desde otro lote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sourceLots.length === 0 ? (
              <EmptyState
                title="Sin lotes disponibles"
                description="No hay otros lotes activos en este establecimiento."
                className="py-6"
              />
            ) : (
              <>
                <Select
                  value={fromLotId}
                  onValueChange={(v) => {
                    setFromLotId(v as string)
                    setFromLotSearch("")
                    setSelectedFromLotIds(new Set())
                    setShowMoveConfirm(false)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar lote origen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceLots.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name} · {l.animalCount} {l.animalCount === 1 ? "animal" : "animales"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {fromLotId && (
                  <>
                    <Input
                      placeholder="Buscar por caravana..."
                      value={fromLotSearch}
                      onChange={(e) => setFromLotSearch(e.target.value)}
                    />
                    {filteredFromLot.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        {fromLotAnimals.length === 0
                          ? "Este lote no tiene animales."
                          : "Sin resultados para esa búsqueda."}
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {filteredFromLot.map((animal) => (
                          <button
                            key={animal.id}
                            type="button"
                            onClick={() => { toggleFromLotAnimal(animal.id); setShowMoveConfirm(false) }}
                            className={cn(
                              "rounded-xl transition-all",
                              selectedFromLotIds.has(animal.id)
                                ? "ring-2 ring-primary ring-offset-2"
                                : "opacity-60 hover:opacity-100"
                            )}
                          >
                            <TagView caravana={animal.caravana} size="md" />
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedFromLotIds.size > 0 && !showMoveConfirm && (
                      <Button size="sm" onClick={() => setShowMoveConfirm(true)}>
                        Mover {selectedFromLotIds.size} {selectedFromLotIds.size === 1 ? "animal" : "animales"}
                      </Button>
                    )}

                    {showMoveConfirm && (
                      <div className="rounded-md bg-muted border border-border px-3 py-2 space-y-2">
                        <p className="text-sm text-foreground">
                          ¿Mover {selectedFromLotIds.size} {selectedFromLotIds.size === 1 ? "animal" : "animales"} desde{" "}
                          <span className="font-medium">{selectedSourceLot?.name}</span> a este lote?
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleConfirmMove}>Confirmar</Button>
                          <Button size="sm" variant="outline" onClick={() => setShowMoveConfirm(false)}>Cancelar</Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dissolve lot */}
      {lot.status === "active" && (
        <Card>
          <CardContent className="pt-0">
            {!showDissolveConfirm ? (
              <Button variant="destructive" size="sm" onClick={() => setShowDissolveConfirm(true)}>
                Disolver lote
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-foreground">
                  ¿Estás seguro de que querés disolver este lote? Se desasignarán {lotAnimals.length} animales.
                </p>
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm" onClick={handleDissolveLot}>
                    Sí, disolver
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowDissolveConfirm(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
