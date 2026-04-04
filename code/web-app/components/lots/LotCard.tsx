import Link from "next/link"
import type { Lot } from "@/lib/types"
import { StatusBadge } from "@/components/ui/status-badge"
import { Badge } from "@/components/ui/badge"

interface LotCardProps {
  lot: Lot
}

export function LotCard({ lot }: LotCardProps) {
  return (
    <Link href={`/lots/${lot.id}`}>
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:border-foreground/20 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">
              {lot.name}
            </span>
            <StatusBadge variant={lot.status === "active" ? "success" : "neutral"}>
              {lot.status === "active" ? "Activo" : "Disuelto"}
            </StatusBadge>
          </div>
          {lot.description && (
            <p className="mt-0.5 text-xs text-muted-foreground truncate">
              {lot.description}
            </p>
          )}
        </div>
        <Badge variant="secondary" className="ml-3 shrink-0">
          {lot.animalCount} {lot.animalCount === 1 ? "animal" : "animales"}
        </Badge>
      </div>
    </Link>
  )
}
