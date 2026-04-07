"use client";

import { useState } from "react";
import { useCostosEstablecimiento } from "@/hooks/useCostosEstablecimiento";
import { useAppStore } from "@/lib/stores/appStore";
import { AddCostoEstForm } from "@/components/financial/AddCostoEstForm";
import { CostosTable } from "@/components/financial/CostosTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function FinancieroPage() {
  const estName = useAppStore((s) => s.activeEstablishment?.name);
  const costos = useCostosEstablecimiento();
  const [showForm, setShowForm] = useState(false);

  // Totales
  const now = Date.now();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const totalMes = costos
    .filter((c) => c.fecha >= startOfMonth.getTime())
    .reduce((sum, c) => sum + c.montoUsd, 0);

  const totalAcumulado = costos.reduce((sum, c) => sum + c.montoUsd, 0);

  function usd(value: number) {
    return value.toLocaleString("es-AR", { minimumFractionDigits: 2 });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-foreground">
        Finanzas{estName ? ` — ${estName}` : ""}
      </h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Costos generales del establecimiento</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancelar" : "+ Agregar"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {totalAcumulado > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Este mes</p>
                <p className="text-lg font-semibold tabular-nums text-foreground">
                  ${usd(totalMes)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Acumulado</p>
                <p className="text-lg font-semibold tabular-nums text-foreground">
                  ${usd(totalAcumulado)}
                </p>
              </div>
            </div>
          )}

          {showForm && (
            <AddCostoEstForm onClose={() => setShowForm(false)} />
          )}

          {costos.length === 0 && !showForm ? (
            <EmptyState
              title="Sin costos registrados"
              description="Registrá gastos generales como mano de obra o mantenimiento."
              className="py-6"
            />
          ) : costos.length > 0 ? (
            <CostosTable costos={costos} />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
