"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAnimals } from "@/hooks/useAnimals"
import { useAppStore } from "@/lib/stores/appStore"
import { activityRepository } from "@/lib/repositories/activity"
import { TagView } from "@/components/animals/TagView"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { LotWeightStatsCard } from "@/components/lots/LotWeightStatsCard"
import { formatCaravana } from "@/lib/utils"

export default function SinLotePage() {
  const router = useRouter()
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const animals = useAnimals()
  const [search, setSearch] = useState("")

  const sinLoteAnimals = useMemo(
    () => animals.filter((a) => a.status === "active" && a.lotId === null),
    [animals]
  )

  const filteredAnimals = useMemo(() => {
    if (!search) return sinLoteAnimals
    const q = search.toLowerCase()
    return sinLoteAnimals.filter(
      (a) =>
        a.caravana.toLowerCase().includes(q) ||
        formatCaravana(a.caravana, "serie").toLowerCase().includes(q)
    )
  }, [sinLoteAnimals, search])

  const activities = useMemo(() => {
    if (!estId) return []
    return activityRepository.getAll(estId)
  }, [estId])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Lotes</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Sin lote asignado</CardTitle>
              <span className="text-xs text-muted-foreground border border-dashed border-border rounded px-1.5 py-0.5">
                virtual
              </span>
            </div>
            <Badge variant="secondary">
              {sinLoteAnimals.length} {sinLoteAnimals.length === 1 ? "animal" : "animales"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Animales activos del establecimiento que no pertenecen a ningún lote.
          </p>
          <div className="pt-2 border-t border-border mt-2">
            <Link href="/lots/new">
              <Button size="sm" variant="outline">+ Crear lote con estos animales</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <LotWeightStatsCard animals={sinLoteAnimals} activities={activities} />

      <Card>
        <CardHeader>
          <CardTitle>Animales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sinLoteAnimals.length > 0 && (
            <Input
              placeholder="Buscar por caravana..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}

          {filteredAnimals.length === 0 ? (
            <EmptyState
              title={sinLoteAnimals.length === 0 ? "Sin animales" : "Sin resultados"}
              description={
                sinLoteAnimals.length === 0
                  ? "Todos los animales activos tienen un lote asignado."
                  : "No hay animales que coincidan con la búsqueda."
              }
              className="py-6"
            />
          ) : (
            <div className="grid grid-cols-6 gap-3">
              {filteredAnimals.map((animal) => (
                <Link key={animal.id} href={`/animals/${animal.id}`} className="flex justify-center">
                  <TagView caravana={animal.caravana} size="md" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
