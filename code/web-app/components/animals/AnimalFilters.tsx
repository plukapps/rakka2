"use client"

import type { Lot, AnimalCategory } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface AnimalFilterState {
  search: string
  lotId: string
  category: string
  carenciaOnly: boolean
  statusFilter: "active" | "all"
}

interface AnimalFiltersProps {
  filters: AnimalFilterState
  lots: Lot[]
  onChange: (f: AnimalFilterState) => void
  onReset: () => void
}

function NativeSelect({
  value,
  onChange,
  children,
  className,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:opacity-50",
        className
      )}
    >
      {children}
    </select>
  )
}

export function AnimalFilters({ filters, lots, onChange, onReset }: AnimalFiltersProps) {
  const hasActiveFilters =
    filters.search || filters.lotId || filters.category ||
    filters.carenciaOnly || filters.statusFilter !== "active"

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Input
        placeholder="Buscar caravana..."
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="w-48"
      />

      <NativeSelect
        value={filters.lotId}
        onChange={(v) => onChange({ ...filters, lotId: v })}
        className="w-44"
      >
        <option value="">Todos los lotes</option>
        <option value="none">Sin lote</option>
        {lots.map((l) => (
          <option key={l.id} value={l.id}>{l.name}</option>
        ))}
      </NativeSelect>

      <NativeSelect
        value={filters.category}
        onChange={(v) => onChange({ ...filters, category: v as AnimalCategory | "" })}
        className="w-44"
      >
        <option value="">Todas las categorías</option>
        <option value="vaca">Vaca</option>
        <option value="toro">Toro</option>
        <option value="novillo">Novillo</option>
        <option value="vaquillona">Vaquillona</option>
        <option value="ternero">Ternero</option>
        <option value="ternera">Ternera</option>
        <option value="otro">Otro</option>
      </NativeSelect>

      <NativeSelect
        value={filters.statusFilter}
        onChange={(v) => onChange({ ...filters, statusFilter: v as "active" | "all" })}
        className="w-36"
      >
        <option value="active">Solo activos</option>
        <option value="all">Todos</option>
      </NativeSelect>

      <label className="flex items-center gap-1.5 text-sm text-foreground cursor-pointer">
        <input
          type="checkbox"
          checked={filters.carenciaOnly}
          onChange={(e) => onChange({ ...filters, carenciaOnly: e.target.checked })}
          className="h-4 w-4 rounded border-input accent-primary"
        />
        Con carencia activa
      </label>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          Limpiar
        </Button>
      )}
    </div>
  )
}
