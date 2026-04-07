"use client"

import type { Lot, AnimalCategory } from "@/lib/types"
import type { ViewMode } from "@/components/animals/AnimalCard"
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

function ViewModeButton({
  mode,
  active,
  onClick,
  title,
  border,
  children,
}: {
  mode: ViewMode
  active: boolean
  onClick: (m: ViewMode) => void
  title: string
  border?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={() => onClick(mode)}
      className={cn(
        "flex h-full w-8 items-center justify-center transition-colors",
        border && "border-l border-input",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  )
}

export function ViewModeToggle({
  value,
  onChange,
}: {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}) {
  return (
    <div className="flex h-8 items-center rounded-lg border border-input overflow-hidden">
      <ViewModeButton mode="relaxed" active={value === "relaxed"} onClick={onChange} title="Relajado">
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      </ViewModeButton>
      <ViewModeButton mode="compacted" active={value === "compacted"} onClick={onChange} title="Compacto" border>
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
          <rect x="1"    y="1"    width="3.5" height="3.5" rx="0.5" />
          <rect x="6.25" y="1"    width="3.5" height="3.5" rx="0.5" />
          <rect x="11.5" y="1"    width="3.5" height="3.5" rx="0.5" />
          <rect x="1"    y="6.25" width="3.5" height="3.5" rx="0.5" />
          <rect x="6.25" y="6.25" width="3.5" height="3.5" rx="0.5" />
          <rect x="11.5" y="6.25" width="3.5" height="3.5" rx="0.5" />
          <rect x="1"    y="11.5" width="3.5" height="3.5" rx="0.5" />
          <rect x="6.25" y="11.5" width="3.5" height="3.5" rx="0.5" />
          <rect x="11.5" y="11.5" width="3.5" height="3.5" rx="0.5" />
        </svg>
      </ViewModeButton>
      <ViewModeButton mode="list" active={value === "list"} onClick={onChange} title="Lista" border>
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
          <rect x="1" y="2"    width="14" height="2.5" rx="1" />
          <rect x="1" y="6.75" width="14" height="2.5" rx="1" />
          <rect x="1" y="11.5" width="14" height="2.5" rx="1" />
        </svg>
      </ViewModeButton>
    </div>
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
        className="w-64"
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
        <Button variant="secondary" size="sm" onClick={onReset}>
          Limpiar
        </Button>
      )}
    </div>
  )
}
