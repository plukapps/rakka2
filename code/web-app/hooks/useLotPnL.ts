"use client";

import { useMemo } from "react";
import type { Animal, CommercialActivity } from "@/lib/types";
import type { LotPnL, CostoCategoriaLote } from "@/lib/financial-types";
import { useCostosLote } from "@/hooks/useCostosLote";
import { useAppStore } from "@/lib/stores/appStore";
import { activityRepository } from "@/lib/repositories/activity";

export function useLotPnL(lotId: string | undefined, allAnimals: Animal[]): LotPnL | null {
  const estId = useAppStore((s) => s.activeEstablishment?.id);
  const costos = useCostosLote(lotId);

  return useMemo(() => {
    if (!lotId || !estId) return null;

    // 1. Animales del lote: activos + egresados desde este lote
    const active = allAnimals.filter((a) => a.lotId === lotId && a.status === "active");
    const exited = allAnimals.filter((a) => a.exitLotId === lotId && a.status === "exited");
    const allLotAnimals = [...active, ...exited];

    if (allLotAnimals.length === 0 && costos.length === 0) return null;

    // 2. Inversión en compra
    const animalesConPrecio = allLotAnimals.filter(
      (a) => a.entryType === "purchase" && a.purchasePriceUsd != null
    );
    const animalesSinPrecio = allLotAnimals.filter(
      (a) => a.entryType === "purchase" && a.purchasePriceUsd == null
    );
    const inversionCompra = animalesConPrecio.reduce(
      (sum, a) => sum + (a.purchasePriceUsd ?? 0),
      0
    );

    // 3. Ingresos por venta (leen desde actividades comerciales tipo "sale")
    const exitedIds = new Set(exited.map((a) => a.id));
    const activities = activityRepository.getAll(estId);
    const saleActivities = activities.filter(
      (act): act is CommercialActivity =>
        act.type === "commercial" &&
        (act as CommercialActivity).subtype === "sale" &&
        (act as CommercialActivity).status === "confirmed"
    );

    let ingresos = 0;
    let animalesVendidos = 0;
    for (const act of saleActivities) {
      const soldFromThisLot = act.animalIds.filter((id) => exitedIds.has(id));
      if (soldFromThisLot.length > 0 && act.pricePerHead != null) {
        ingresos += act.pricePerHead * soldFromThisLot.length;
        animalesVendidos += soldFromThisLot.length;
      }
    }

    // 4. Costos directos del lote
    const costosDirectos = costos.reduce((sum, c) => sum + c.montoUsd, 0);
    const desgloseCostos: Record<CostoCategoriaLote, number> = {
      alimentacion: 0,
      sanidad: 0,
      otro: 0,
    };
    for (const c of costos) {
      desgloseCostos[c.categoria] += c.montoUsd;
    }

    // 5. Resultado neto
    const resultadoNeto = ingresos - inversionCompra - costosDirectos;

    // 6. Stock activo (referencia)
    const stockActivoValor = active
      .filter((a) => a.purchasePriceUsd != null)
      .reduce((sum, a) => sum + (a.purchasePriceUsd ?? 0), 0);

    return {
      ingresos,
      animalesVendidos,
      inversionCompra,
      animalesConPrecio: animalesConPrecio.length,
      animalesSinPrecio: animalesSinPrecio.length,
      costosDirectos,
      desgloseCostos,
      resultadoNeto,
      stockActivoValor,
      cabezasActivas: active.length,
      cabezasEgresadas: exited.length,
    };
  }, [lotId, estId, allAnimals, costos]);
}
