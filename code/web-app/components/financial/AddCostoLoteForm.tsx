"use client";

import { useState } from "react";
import type { CostoCategoriaLote } from "@/lib/financial-types";
import { useAddCostoLote } from "@/hooks/useCostosLote";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, now } from "@/lib/utils";

function NativeSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

interface Props {
  loteId: string;
  onClose: () => void;
}

export function AddCostoLoteForm({ loteId, onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const { addCosto, loading } = useAddCostoLote();

  const [categoria, setCategoria] = useState<CostoCategoriaLote>("alimentacion");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const montoNum = parseFloat(monto);
    if (!monto || isNaN(montoNum) || montoNum <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }
    if (!user) return;

    addCosto({
      loteId,
      categoria,
      montoUsd: montoNum,
      fecha: new Date(fecha).getTime(),
      descripcion: descripcion.trim(),
      createdBy: user.uid,
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-border">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Agregar costo directo
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label>Categoría</Label>
          <NativeSelect
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CostoCategoriaLote)}
          >
            <option value="alimentacion">Alimentación</option>
            <option value="sanidad">Sanidad</option>
            <option value="otro">Otro</option>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Monto (USD)</Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={monto}
            onChange={(e) => { setMonto(e.target.value); setError(""); }}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label>Fecha</Label>
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Descripción (opcional)</Label>
          <Input
            placeholder="Ej: Fardos de alfalfa..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={loading}>
          Guardar costo
        </Button>
      </div>
    </form>
  );
}
