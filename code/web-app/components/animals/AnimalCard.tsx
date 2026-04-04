import Link from "next/link"
import type { Animal, Lot } from "@/lib/types"
import { StatusBadge } from "@/components/ui/status-badge"
import { CarenciaIndicator } from "@/components/animals/CarenciaIndicator"
import { TagView } from "@/components/animals/TagView"
import { categoryLabel } from "@/lib/utils"

interface AnimalCardProps {
  animal: Animal
  lot?: Lot
}

export function AnimalCard({ animal, lot }: AnimalCardProps) {
  return (
    <Link href={`/animals/${animal.id}`}>
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:border-foreground/20 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-center gap-3">
          <TagView caravana={animal.caravana} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge variant={animal.status === "active" ? "success" : "neutral"}>
                {animal.status === "active" ? "Activo" : "Egresado"}
              </StatusBadge>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{categoryLabel(animal.category)}</span>
              <span>·</span>
              <span>{animal.breed}</span>
              {lot && (
                <>
                  <span>·</span>
                  <span>{lot.name}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <CarenciaIndicator animal={animal} size="sm" />
      </div>
    </Link>
  )
}
