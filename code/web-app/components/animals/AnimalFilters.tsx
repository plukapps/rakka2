"use client";

import type { Lot, AnimalCategory } from "@/lib/types";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface AnimalFilterState {
  search: string;
  lotId: string;
  category: string;
  carenciaOnly: boolean;
  statusFilter: "active" | "all";
}

interface AnimalFiltersProps {
  filters: AnimalFilterState;
  lots: Lot[];
  onChange: (f: AnimalFilterState) => void;
  onReset: () => void;
}

const categoryOptions = [
  { value: "", label: "Todas las categorías" },
  { value: "vaca", label: "Vaca" },
  { value: "toro", label: "Toro" },
  { value: "novillo", label: "Novillo" },
  { value: "vaquillona", label: "Vaquillona" },
  { value: "ternero", label: "Ternero" },
  { value: "ternera", label: "Ternera" },
  { value: "otro", label: "Otro" },
];

const statusOptions = [
  { value: "active", label: "Solo activos" },
  { value: "all", label: "Todos" },
];

export function AnimalFilters({ filters, lots, onChange, onReset }: AnimalFiltersProps) {
  const lotOptions = [
    { value: "", label: "Todos los lotes" },
    { value: "none", label: "Sin lote" },
    ...lots.map((l) => ({ value: l.id, label: l.name })),
  ];

  const hasActiveFilters =
    filters.search ||
    filters.lotId ||
    filters.category ||
    filters.carenciaOnly ||
    filters.statusFilter !== "active";

  return (
    <div className="flex flex-wrap gap-2 items-end">
      <div className="w-52">
        <Input
          placeholder="Buscar caravana..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      <div className="w-44">
        <Select
          options={lotOptions}
          value={filters.lotId}
          onChange={(e) => onChange({ ...filters, lotId: e.target.value })}
        />
      </div>

      <div className="w-44">
        <Select
          options={categoryOptions}
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value as AnimalCategory | "" })}
        />
      </div>

      <div className="w-36">
        <Select
          options={statusOptions}
          value={filters.statusFilter}
          onChange={(e) =>
            onChange({ ...filters, statusFilter: e.target.value as "active" | "all" })
          }
        />
      </div>

      <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer h-9">
        <input
          type="checkbox"
          checked={filters.carenciaOnly}
          onChange={(e) => onChange({ ...filters, carenciaOnly: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
        Con carencia activa
      </label>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          Limpiar
        </Button>
      )}
    </div>
  );
}
