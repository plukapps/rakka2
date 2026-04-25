"use client"

import { useState, useMemo, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAllLots, useLots } from "@/hooks/useLots"
import { useAnimals } from "@/hooks/useAnimals"
import { useAppStore } from "@/lib/stores/appStore"
import { lotRepository } from "@/lib/repositories/lot"
import { animalRepository } from "@/lib/repositories/animal"
import { traceabilityRepository } from "@/lib/repositories/traceability"
import { TagView } from "@/components/animals/TagView"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn, formatCaravana } from "@/lib/utils"

const SIN_LOTE_VALUE = "__sin_lote__"

function MoveAnimalsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const allAnimals = useAnimals()
  const allLots = useAllLots()
  const activeLots = useLots()

  const initialFrom = searchParams.get("from") ?? SIN_LOTE_VALUE
  const initialTo = searchParams.get("to") ?? ""

  const [fromId, setFromId] = useState<string>(initialFrom)
  const [toId, setToId] = useState<string>(initialTo)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showConfirm, setShowConfirm] = useState(false)

  const fromLot = useMemo(() => allLots.find((l) => l.id === fromId), [allLots, fromId])
  const toLot = useMemo(() => activeLots.find((l) => l.id === toId), [activeLots, toId])

  const originAnimals = useMemo(() => {
    if (fromId === SIN_LOTE_VALUE) {
      return allAnimals.filter((a) => a.status === "active" && a.lotId === null)
    }
    return allAnimals.filter((a) => a.status === "active" && a.lotId === fromId)
  }, [allAnimals, fromId])

  const filteredAnimals = useMemo(() => {
    if (!search) return originAnimals
    const q = search.toLowerCase()
    return originAnimals.filter(
      (a) =>
        a.caravana.toLowerCase().includes(q) ||
        formatCaravana(a.caravana, "serie").toLowerCase().includes(q)
    )
  }, [originAnimals, search])

  // Destination lots: all active, excluding origin if it's a lot
  const destLots = useMemo(
    () => activeLots.filter((l) => l.id !== fromId),
    [activeLots, fromId]
  )

  function handleFromChange(value: string | null) {
    if (!value) return
    setFromId(value)
    setSelected(new Set())
    setShowConfirm(false)
    if (value === toId) setToId("")
  }

  function handleToChange(value: string | null) {
    if (!value) return
    setToId(value)
    setShowConfirm(false)
  }

  function toggleAnimal(id: string) {
    if (!toId) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setShowConfirm(false)
  }

  function handleSelectAll() {
    if (!toId) return
    setSelected(new Set(filteredAnimals.map((a) => a.id)))
    setShowConfirm(false)
  }

  function handleDeselectAll() {
    setSelected(new Set())
    setShowConfirm(false)
  }

  function handleConfirmMove() {
    if (!estId || !toId || !toLot || selected.size === 0) return
    const ts = Date.now()

    for (const animalId of selected) {
      animalRepository.update(estId, animalId, { lotId: toId })
      traceabilityRepository.create({
        animalId,
        estId,
        type: "lot_change",
        description:
          fromId === SIN_LOTE_VALUE
            ? `Asignado al lote ${toLot.name}`
            : `Movido desde ${fromLot?.name ?? "otro lote"} al lote ${toLot.name}`,
        activityId: null,
        lotId: toId,
        lotName: toLot.name,
        responsibleName: null,
        timestamp: ts,
      })
    }

    if (fromId !== SIN_LOTE_VALUE && fromLot) {
      lotRepository.update(estId, fromId, {
        animalCount: Math.max(0, fromLot.animalCount - selected.size),
      })
    }
    lotRepository.update(estId, toId, {
      animalCount: toLot.animalCount + selected.size,
    })

    setSelected(new Set())
    setShowConfirm(false)
    router.back()
  }

  const fromLabel =
    fromId === SIN_LOTE_VALUE ? "Sin lote" : (fromLot?.name ?? "Lote desconocido")
  const toLabel = toLot?.name ?? ""

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          ← Lotes
        </Button>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-foreground">Mover animales</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Seleccioná el origen, el destino y los animales a mover.
        </p>
      </div>

      {/* Origin / Destination selectors */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Origen
              </label>
              <Select value={fromId} onValueChange={handleFromChange}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) => {
                      if (!value) return "Seleccionar origen..."
                      if (value === SIN_LOTE_VALUE) return "Sin lote"
                      return activeLots.find((l) => l.id === value)?.name ?? "Seleccionar origen..."
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SIN_LOTE_VALUE}>
                    Sin lote · {allAnimals.filter((a) => a.status === "active" && a.lotId === null).length} animales
                  </SelectItem>
                  {activeLots.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name} · {l.animalCount} {l.animalCount === 1 ? "animal" : "animales"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Destino
              </label>
              <Select value={toId} onValueChange={handleToChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar lote destino...">
                    {(value: string | null) => {
                      if (!value) return "Seleccionar lote destino..."
                      return destLots.find((l) => l.id === value)?.name ?? "Seleccionar lote destino..."
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {destLots.length === 0 ? (
                    <SelectItem value="__empty__" disabled>
                      Sin lotes disponibles
                    </SelectItem>
                  ) : (
                    destLots.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name} · {l.animalCount} {l.animalCount === 1 ? "animal" : "animales"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animals grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>
              {originAnimals.length} {originAnimals.length === 1 ? "animal disponible" : "animales disponibles"}
              {" "}
              <span className="font-normal text-muted-foreground text-sm">en {fromLabel}</span>
            </CardTitle>
            {originAnimals.length > 0 && toId && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs h-7 px-2"
                >
                  Seleccionar todos
                </Button>
                {selected.size > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="text-xs h-7 px-2"
                  >
                    Deseleccionar todos
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {!toId ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Seleccioná un destino para poder mover animales.
            </p>
          ) : originAnimals.length === 0 ? (
            <EmptyState
              title="Sin animales en este origen"
              description={
                fromId === SIN_LOTE_VALUE
                  ? "Todos los animales activos ya están asignados a un lote."
                  : "Este lote no tiene animales."
              }
              className="py-6"
            />
          ) : (
            <>
              <Input
                className="max-w-xs"
                placeholder="Buscar por caravana..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setShowConfirm(false)
                }}
              />
              {filteredAnimals.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Sin resultados para esa búsqueda.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredAnimals.map((animal) => (
                    <button
                      key={animal.id}
                      type="button"
                      onClick={() => toggleAnimal(animal.id)}
                      className={cn(
                        "rounded-xl transition-all",
                        !toId && "cursor-not-allowed opacity-30",
                        toId && (
                          selected.has(animal.id)
                            ? "ring-2 ring-primary ring-offset-2"
                            : "opacity-60 hover:opacity-100"
                        )
                      )}
                      disabled={!toId}
                    >
                      <TagView caravana={animal.caravana} size="md" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Move action */}
      {selected.size > 0 && toId && (
        <div className="flex justify-end">
          <Button onClick={() => setShowConfirm(true)}>
            Mover {selected.size} {selected.size === 1 ? "animal" : "animales"}
          </Button>
        </div>
      )}

      {showConfirm && (
        <ConfirmModal
          title="Mover animales"
          description={`¿Mover ${selected.size} ${selected.size === 1 ? "animal" : "animales"} desde ${fromLabel} a ${toLabel}?`}
          confirmLabel="Mover"
          onConfirm={handleConfirmMove}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* No active lots warning */}
      {activeLots.length === 0 && (
        <EmptyState
          title="Sin lotes activos"
          description="Creá un lote primero para poder mover animales."
          action={<Link href="/lots/new"><Button size="sm">Crear lote</Button></Link>}
        />
      )}
    </div>
  )
}

export default function MoveAnimalsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><LoadingSpinner /></div>}>
      <MoveAnimalsContent />
    </Suspense>
  )
}
