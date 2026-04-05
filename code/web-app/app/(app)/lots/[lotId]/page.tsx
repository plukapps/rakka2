"use client"

import { use, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLot } from "@/hooks/useLots"
import { useAnimals } from "@/hooks/useAnimals"
import { useAllLots } from "@/hooks/useLots"
import { lotRepository } from "@/lib/repositories/lot"
import { animalRepository } from "@/lib/repositories/animal"
import { useAppStore } from "@/lib/stores/appStore"
import { TagView } from "@/components/animals/TagView"
import { StatusBadge } from "@/components/ui/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { formatDate, formatCaravana } from "@/lib/utils"

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
  const [search, setSearch] = useState("")
  const [showAddSection, setShowAddSection] = useState(false)
  const [addSearch, setAddSearch] = useState("")
  const [showDissolveConfirm, setShowDissolveConfirm] = useState(false)
  const [pendingMoveId, setPendingMoveId] = useState<string | null>(null)

  // Animals in this lot
  const lotAnimals = useMemo(() => {
    return allAnimals.filter((a) => a.lotId === lotId)
  }, [allAnimals, lotId])

  // Filtered animals in lot by caravana search
  const filteredLotAnimals = useMemo(() => {
    if (!search) return lotAnimals
    const q = search.toLowerCase()
    return lotAnimals.filter(
      (a) =>
        a.caravana.toLowerCase().includes(q) ||
        formatCaravana(a.caravana, "serie").toLowerCase().includes(q)
    )
  }, [lotAnimals, search])

  // Animals available to add (no lot or from other lots)
  const addableAnimals = useMemo(() => {
    return allAnimals.filter(
      (a) => a.status === "active" && a.lotId !== lotId
    )
  }, [allAnimals, lotId])

  const filteredAddable = useMemo(() => {
    if (!addSearch) return addableAnimals
    const q = addSearch.toLowerCase()
    return addableAnimals.filter(
      (a) =>
        a.caravana.toLowerCase().includes(q) ||
        formatCaravana(a.caravana, "serie").toLowerCase().includes(q)
    )
  }, [addableAnimals, addSearch])

  function handleAddAnimal(animalId: string) {
    if (!estId || !lot) return

    const animal = allAnimals.find((a) => a.id === animalId)
    if (!animal) return

    const previousLotId = animal.lotId

    // Update animal's lotId
    animalRepository.update(estId, animalId, { lotId: lotId })

    // Increment this lot's animalCount
    lotRepository.update(estId, lotId, { animalCount: lot.animalCount + 1 })

    // Decrement previous lot's animalCount if applicable
    if (previousLotId) {
      const prevLot = allLots.find((l) => l.id === previousLotId)
      if (prevLot) {
        lotRepository.update(estId, previousLotId, {
          animalCount: Math.max(0, prevLot.animalCount - 1),
        })
      }
    }
  }

  function handleDissolveLot() {
    if (!estId || !lot) return

    // Remove all animals from lot
    for (const animal of lotAnimals) {
      animalRepository.update(estId, animal.id, { lotId: null })
    }

    // Set lot status to dissolved
    lotRepository.update(estId, lotId, {
      status: "dissolved",
      animalCount: 0,
    })

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

      {/* Animals in lot */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Animales en el lote</CardTitle>
            {lot.status === "active" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddSection(!showAddSection)}
              >
                {showAddSection ? "Cerrar" : "+ Agregar animales"}
              </Button>
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

      {/* Add animals section */}
      {showAddSection && lot.status === "active" && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar animales al lote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Buscar por caravana..."
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
            />

            {filteredAddable.length === 0 ? (
              <EmptyState
                title="Sin animales disponibles"
                description={
                  addableAnimals.length === 0
                    ? "Todos los animales activos ya están en este lote."
                    : "No hay animales que coincidan con la búsqueda."
                }
                className="py-6"
              />
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-1">
                {filteredAddable.map((animal) => {
                  const fromOtherLot = animal.lotId !== null
                  const currentLot = fromOtherLot
                    ? allLots.find((l) => l.id === animal.lotId)
                    : undefined

                  return (
                    <div
                      key={animal.id}
                      className="rounded-lg border border-border px-3 py-2 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <TagView caravana={animal.caravana} size="md" />
                          <div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{categoryLabel(animal.category)}</span>
                              {animal.breed && (
                                <>
                                  <span>·</span>
                                  <span>{animal.breed}</span>
                                </>
                              )}
                            </div>
                            {fromOtherLot && currentLot && (
                              <p className="text-xs text-amber-600">
                                Actualmente en: {currentLot.name}
                              </p>
                            )}
                          </div>
                        </div>
                        {pendingMoveId !== animal.id && (
                          <Button
                            size="sm"
                            variant={fromOtherLot ? "outline" : "default"}
                            onClick={() =>
                              fromOtherLot
                                ? setPendingMoveId(animal.id)
                                : handleAddAnimal(animal.id)
                            }
                          >
                            {fromOtherLot ? "Mover aquí" : "Agregar"}
                          </Button>
                        )}
                      </div>
                      {pendingMoveId === animal.id && currentLot && (
                        <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 space-y-2">
                          <p className="text-xs text-amber-800">
                            Este animal está en {currentLot.name}. ¿Moverlo a este lote?
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                handleAddAnimal(animal.id)
                                setPendingMoveId(null)
                              }}
                            >
                              Sí, mover
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPendingMoveId(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dissolve lot */}
      {lot.status === "active" && (
        <Card>
          <CardContent className="pt-0">
            {!showDissolveConfirm ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDissolveConfirm(true)}
              >
                Disolver lote
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-foreground">
                  ¿Estás seguro de que querés disolver este lote? Se
                  desasignarán {lotAnimals.length} animales.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDissolveLot}
                  >
                    Sí, disolver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDissolveConfirm(false)}
                  >
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
