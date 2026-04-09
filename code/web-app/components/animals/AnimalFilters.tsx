"use client"

import type { Lot, AnimalCategory } from "@/lib/types"
import type { ViewMode } from "@/components/animals/AnimalCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type AnimalSortBy = "serie_asc" | "serie_desc" | "num_asc" | "num_desc"

export interface AnimalFilterState {
  search: string
  lotId: string
  category: string
  carenciaOnly: boolean
  statusFilter: "active" | "all"
  sortBy: AnimalSortBy
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

const SortAscIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M19 17H22L18 21L14 17H17V3H19V17M9 13H7C5.9 13 5 13.9 5 15V16C5 17.11 5.9 18 7 18H9V19H5V21H9C10.11 21 11 20.11 11 19V15C11 13.9 10.11 13 9 13M9 16H7V15H9V16M9 3H7C5.9 3 5 3.9 5 5V9C5 10.11 5.9 11 7 11H9C10.11 11 11 10.11 11 9V5C11 3.9 10.11 3 9 3M9 9H7V5H9V9Z" />
  </svg>
)

const SortDescIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M19 7H22L18 3L14 7H17V21H19M9 21H5V19H9V18H7C5.9 18 5 17.11 5 16V15C5 13.9 5.9 13 7 13H9C10.11 13 11 13.9 11 15V19C11 20.11 10.11 21 9 21M9 15H7V16H9M7 3H9C10.11 3 11 3.9 11 5V9C11 10.11 10.11 11 9 11H7C5.9 11 5 10.11 5 9V5C5 3.9 5.9 3 7 3M7 9H9V5H7Z" />
  </svg>
)

function SortIconButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "flex h-full w-8 items-center justify-center border-l border-input transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  )
}

export function SortToggle({
  value,
  onChange,
}: {
  value: AnimalSortBy
  onChange: (v: AnimalSortBy) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 items-center rounded-lg border border-input overflow-hidden">
        <span className="px-2.5 text-xs text-muted-foreground font-medium select-none">Serie</span>
        <SortIconButton active={value === "serie_asc"} onClick={() => onChange("serie_asc")} title="Serie ascendente">
          <SortAscIcon />
        </SortIconButton>
        <SortIconButton active={value === "serie_desc"} onClick={() => onChange("serie_desc")} title="Serie descendente">
          <SortDescIcon />
        </SortIconButton>
      </div>
      <div className="flex h-8 items-center rounded-lg border border-input overflow-hidden">
        <span className="px-2.5 text-xs text-muted-foreground font-medium select-none">Número</span>
        <SortIconButton active={value === "num_asc"} onClick={() => onChange("num_asc")} title="Número ascendente">
          <SortAscIcon />
        </SortIconButton>
        <SortIconButton active={value === "num_desc"} onClick={() => onChange("num_desc")} title="Número descendente">
          <SortDescIcon />
        </SortIconButton>
      </div>
    </div>
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
    filters.carenciaOnly || filters.statusFilter !== "active" ||
    filters.sortBy !== "serie_asc"

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
