"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/stores/appStore"
import { animalRepository } from "@/lib/repositories/animal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { cn } from "@/lib/utils"

export default function EstablishmentsPage() {
  const router = useRouter()
  const establishments = useAppStore((s) => s.establishments)
  const activeEst = useAppStore((s) => s.activeEstablishment)
  const setActiveEstablishment = useAppStore((s) => s.setActiveEstablishment)

  const animalCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const est of establishments) {
      counts[est.id] = animalRepository
        .getAll(est.id)
        .filter((a) => a.status === "active").length
    }
    return counts
  }, [establishments])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Establecimientos</h1>
        <Link href="/establishments/new">
          <Button size="sm">+ Crear establecimiento</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {establishments.map((est) => {
          const isActive = activeEst?.id === est.id
          return (
            <Card
              key={est.id}
              className={cn(isActive && "ring-2 ring-primary/50")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {est.name}
                  <StatusBadge variant={est.status === "active" ? "success" : "neutral"}>
                    {est.status === "active" ? "Activo" : "Archivado"}
                  </StatusBadge>
                  {isActive && (
                    <StatusBadge variant="info">Actual</StatusBadge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{est.location}</p>
                  <p className="text-sm text-foreground">
                    {animalCounts[est.id] ?? 0} animales activos
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/establishments/${est.id}`}>
                    <Button variant="outline" size="sm">Detalle</Button>
                  </Link>
                  {!isActive && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveEstablishment(est)
                        router.push("/home")
                      }}
                    >
                      Seleccionar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
