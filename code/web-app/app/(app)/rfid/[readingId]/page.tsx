"use client"

import { use, useState, useEffect, useMemo } from "react"
import Link from "next/link"
import type { Animal, RfidReading } from "@/lib/types"
import { rfidRepository } from "@/lib/repositories/rfid"
import { animalRepository } from "@/lib/repositories/animal"
import { useAppStore } from "@/lib/stores/appStore"
import { TagView } from "@/components/animals/TagView"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { formatDateTime, formatCaravana } from "@/lib/utils"

export default function ReadingDetailPage({
  params,
}: {
  params: Promise<{ readingId: string }>
}) {
  const { readingId } = use(params)
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const [reading, setReading] = useState<RfidReading | undefined>(undefined)
  const [filter, setFilter] = useState<"all" | "stock" | "unknown">("all")

  useEffect(() => {
    if (!estId) return
    setReading(rfidRepository.getById(estId, readingId))
    return rfidRepository.subscribe(estId, () =>
      setReading(rfidRepository.getById(estId, readingId))
    )
  }, [estId, readingId])

  const animals = useMemo(() => {
    if (!estId || !reading) return []
    return reading.animalIds
      .map((id) => animalRepository.getById(estId, id))
      .filter(Boolean) as Animal[]
  }, [estId, reading])

  if (!reading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner />
      </div>
    )
  }

  const totalCaravanas = reading.animalIds.length + reading.unknownCaravanas.length

  const filteredStock = filter === "unknown" ? [] : animals
  const filteredUnknown = filter === "stock" ? [] : reading.unknownCaravanas

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/rfid">
          <Button variant="ghost" size="sm">← Lecturas</Button>
        </Link>
      </div>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detalle de lectura</CardTitle>
            <StatusBadge variant={reading.method === "bluetooth" ? "info" : "neutral"}>
              {reading.method === "bluetooth" ? "Bluetooth" : "Archivo"}
            </StatusBadge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Total caravanas</dt>
              <dd className="font-medium text-foreground">{totalCaravanas}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">En stock</dt>
              <dd className="font-medium text-emerald-600">{reading.animalIds.length}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Sin registro</dt>
              <dd className="font-medium text-amber-600">{reading.unknownCaravanas.length}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Responsable</dt>
              <dd className="font-medium text-foreground">{reading.responsible}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Fecha</dt>
              <dd className="font-medium text-foreground">{formatDateTime(reading.timestamp)}</dd>
            </div>
            {reading.fileName && (
              <div>
                <dt className="text-xs text-muted-foreground">Archivo</dt>
                <dd className="font-medium text-foreground">{reading.fileName}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {([
          { key: "all", label: `Todas (${totalCaravanas})` },
          { key: "stock", label: `En stock (${reading.animalIds.length})` },
          { key: "unknown", label: `Sin registro (${reading.unknownCaravanas.length})` },
        ] as const).map((t) => (
          <button
            key={t.key}
            type="button"
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              filter === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setFilter(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Caravanas grid */}
      <div className="grid grid-cols-3 gap-3">
        {filteredStock.map((animal) => (
          <Link key={animal.id} href={`/animals/${animal.id}`}>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 hover:border-foreground/20 hover:shadow-sm transition-all cursor-pointer">
              <TagView caravana={animal.caravana} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-mono text-foreground truncate">
                  {formatCaravana(animal.caravana, "serie")}
                </p>
                <p className="text-xs text-emerald-600">En stock</p>
              </div>
            </div>
          </Link>
        ))}

        {filteredUnknown.map((caravana) => (
          <div
            key={caravana}
            className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"
          >
            <TagView caravana={caravana} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-mono text-foreground truncate">
                {formatCaravana(caravana, "serie")}
              </p>
              <p className="text-xs text-amber-600">Sin registro</p>
            </div>
          </div>
        ))}
      </div>

      {filteredStock.length === 0 && filteredUnknown.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          No hay caravanas en esta categoría.
        </p>
      )}
    </div>
  )
}
