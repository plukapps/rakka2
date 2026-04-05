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
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 hover:border-foreground/20 hover:shadow-sm transition-all cursor-pointer">
        <TagView caravana={animal.caravana} size="md" />
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <StatusBadge variant={animal.status === "active" ? "success" : "neutral"}>
              {animal.status === "active"
                ? "Activo"
                : animal.exitType === "death"
                ? "Inactivo"
                : "Egresado"}
            </StatusBadge>
            <CarenciaIndicator animal={animal} size="sm" />
          </div>
          <span className="text-xs text-muted-foreground truncate">
            {categoryLabel(animal.category)} · {animal.breed}
          </span>
          {lot && (
            <span className="text-xs text-muted-foreground/70 truncate">{lot.name}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
