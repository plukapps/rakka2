// ============================================================
// Financial Types — mirrors Firebase RTDB financial nodes
// See: specs/functional/15-modulo-financiero.md
// ============================================================

export type CostoCategoriaLote = "alimentacion" | "sanidad" | "otro";
export type CostoCategoriaEst = "mano_de_obra" | "mantenimiento" | "otro";

export interface CostoLote {
  id: string;
  establecimientoId: string;
  loteId: string;
  categoria: CostoCategoriaLote;
  montoUsd: number;
  cabezasAlMomento: number;
  fecha: number; // timestamp ms
  descripcion: string;
  createdAt: number;
  createdBy: string;
}

export interface CostoEstablecimiento {
  id: string;
  establecimientoId: string;
  categoria: CostoCategoriaEst;
  montoUsd: number;
  fecha: number; // timestamp ms
  descripcion: string;
  createdAt: number;
  createdBy: string;
}

export interface LotPnL {
  // Ingresos
  ingresos: number;
  animalesVendidos: number;

  // Inversión en compra
  inversionCompra: number;
  animalesConPrecio: number;
  animalesSinPrecio: number;

  // Costos directos del lote
  costosDirectos: number;
  desgloseCostos: Record<CostoCategoriaLote, number>;

  // Resultado neto = ingresos - inversionCompra - costosDirectos
  resultadoNeto: number;

  // Referencia (no incluida en el neto)
  stockActivoValor: number; // suma de purchasePriceUsd de animales activos en el lote
  cabezasActivas: number;
  cabezasEgresadas: number;
}
