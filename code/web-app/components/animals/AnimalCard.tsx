import Link from "next/link"
import type { Animal, Lot } from "@/lib/types"
import { StatusBadge } from "@/components/ui/status-badge"
import { CarenciaIndicator } from "@/components/animals/CarenciaIndicator"
import { TagView } from "@/components/animals/TagView"
import { formatCaravana, formatWeight, formatGdp, sexLabel, categoryLabel } from "@/lib/utils"

export type ViewMode = "relaxed" | "compacted" | "list"

// Shared between list header (page.tsx) and list rows (here)
export const LIST_COL_TEMPLATE = "84px 140px 1fr 1fr 80px 1fr 90px 90px auto"
export const LIST_COL_GAP = 24

interface AnimalCardProps {
  animal: Animal
  lot?: Lot
  viewMode?: ViewMode
}

function statusDotClass(animal: Animal): string {
  if (animal.status !== "active") return "bg-muted-foreground/50"
  if (animal.hasActiveCarencia) return "bg-amber-400"
  return "bg-emerald-500"
}

function statusDotTitle(animal: Animal, lot?: Lot): string {
  const estado =
    animal.status === "active"
      ? animal.hasActiveCarencia ? "Con carencia" : "Activo"
      : animal.exitType === "death" ? "Inactivo" : "Egresado"
  const loteStr = lot ? ` · ${lot.name}` : ""
  return `${animal.caravana} — ${estado}${loteStr}`
}

function StatusContent({ animal }: { animal: Animal }) {
  return (
    <StatusBadge variant={animal.status === "active" ? "success" : "neutral"}>
      {animal.status === "active"
        ? "Activo"
        : animal.exitType === "death"
        ? "Inactivo"
        : "Egresado"}
    </StatusBadge>
  )
}

export function AnimalCard({ animal, lot, viewMode = "relaxed" }: AnimalCardProps) {
  if (viewMode === "compacted") {
    return (
      <Link href={`/animals/${animal.id}`} title={statusDotTitle(animal, lot)}>
        <div className="relative flex items-center justify-center rounded-xl border border-border bg-card px-2 py-2 hover:border-foreground/20 hover:shadow-sm transition-all cursor-pointer h-full">
          <TagView caravana={animal.caravana} size="md" />
          <span
            className={`absolute bottom-2 right-2 w-3 h-3 rounded-full ring-2 ring-card ${statusDotClass(animal)}`}
          />
        </div>
      </Link>
    )
  }

  if (viewMode === "list") {
    return (
      <Link href={`/animals/${animal.id}`} className="block h-full">
        <div
          className="grid items-center h-full px-4 border-b border-border/60 hover:bg-muted/40 transition-colors cursor-pointer"
          style={{ gridTemplateColumns: LIST_COL_TEMPLATE, gap: LIST_COL_GAP }}
        >
          <div className="shrink-0">
            <TagView caravana={animal.caravana} size="sm" />
          </div>
          <span className="font-mono text-sm text-foreground truncate">
            {formatCaravana(animal.caravana, "serie")}
          </span>
          <span className="text-muted-foreground truncate" style={{ fontSize: "0.830rem" }}>
            {categoryLabel(animal.category)}
          </span>
          <span className="text-muted-foreground truncate" style={{ fontSize: "0.830rem" }}>
            {animal.breed || "—"}
          </span>
          <span className="text-muted-foreground truncate" style={{ fontSize: "0.830rem" }}>
            {sexLabel(animal.sex)}
          </span>
          <span className="text-muted-foreground/70 truncate" style={{ fontSize: "0.830rem" }}>
            {lot?.name ?? <span className="text-muted-foreground/40">Sin lote</span>}
          </span>
          <span className="text-muted-foreground tabular-nums" style={{ fontSize: "0.830rem" }}>
            {formatWeight(animal.lastWeight)}
          </span>
          <span className="text-muted-foreground tabular-nums" style={{ fontSize: "0.830rem" }}>
            {formatGdp(animal.gdpRecent)}
          </span>
          <span style={{ fontSize: "0.830rem" }}>
            {animal.hasActiveCarencia
              ? <CarenciaIndicator animal={animal} size="sm" />
              : <StatusContent animal={animal} />}
          </span>
        </div>
      </Link>
    )
  }

  // relaxed
  return (
    <Link href={`/animals/${animal.id}`}>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 hover:border-foreground/20 hover:shadow-sm transition-all cursor-pointer">
        <TagView caravana={animal.caravana} size="md" />
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <StatusContent animal={animal} />
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
