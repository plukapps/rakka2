"use client"

import Link from "next/link"
import { useLots } from "@/hooks/useLots"
import { useAppStore } from "@/lib/stores/appStore"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"

export default function LotsPage() {
  const lots = useLots()
  const est = useAppStore((s) => s.activeEstablishment)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Lotes</h1>
        <Badge variant="outline">{est?.name}</Badge>
      </div>

      {lots.length === 0 ? (
        <EmptyState
          title="Sin lotes"
          description="No hay lotes activos en este establecimiento."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lots.map((lot) => (
            <Link key={lot.id} href={`/animals?lotId=${lot.id}`}>
              <Card className="hover:ring-foreground/20 transition-all cursor-pointer">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>{lot.name}</CardTitle>
                  <StatusBadge variant="success">{lot.animalCount} animales</StatusBadge>
                </CardHeader>
                {lot.description && (
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{lot.description}</p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
