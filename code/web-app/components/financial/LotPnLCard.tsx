import type { LotPnL } from "@/lib/financial-types";
import { cn } from "@/lib/utils";

function usd(value: number) {
  return value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Row({ label, value, variant = "default", sub = false }: {
  label: string;
  value: string;
  variant?: "default" | "positive" | "negative" | "muted";
  sub?: boolean;
}) {
  return (
    <div className={cn("flex items-baseline justify-between", sub && "pl-4")}>
      <span className={cn("text-sm", sub ? "text-xs text-muted-foreground" : variant === "muted" ? "text-muted-foreground" : "text-foreground")}>
        {label}
      </span>
      <span className={cn(
        "tabular-nums font-medium",
        sub ? "text-xs text-muted-foreground" : "text-sm",
        variant === "positive" && "text-green-600",
        variant === "negative" && "text-destructive",
        variant === "muted" && "text-muted-foreground",
      )}>
        {value}
      </span>
    </div>
  );
}

interface Props {
  pnl: LotPnL;
}

export function LotPnLCard({ pnl }: Props) {
  const resultadoVariant = pnl.resultadoNeto > 0 ? "positive" : pnl.resultadoNeto < 0 ? "negative" : "default";
  const hasData = pnl.inversionCompra > 0 || pnl.costosDirectos > 0 || pnl.ingresos > 0;

  if (!hasData) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        Sin datos financieros. Registrá el precio de compra al ingresar animales y agregá costos al lote.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {pnl.animalesSinPrecio > 0 && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          {pnl.animalesSinPrecio} {pnl.animalesSinPrecio === 1 ? "animal sin" : "animales sin"} precio de compra — resultado estimado
        </p>
      )}

      <div className="space-y-1.5">
        <Row label="Ingresos (ventas)" value={`$${usd(pnl.ingresos)}`} />
        <Row label="Inversión en compra" value={`−$${usd(pnl.inversionCompra)}`} />

        <Row label="Costos directos" value={`−$${usd(pnl.costosDirectos)}`} />
        {pnl.desgloseCostos.alimentacion > 0 && (
          <Row label="· Alimentación" value={`$${usd(pnl.desgloseCostos.alimentacion)}`} sub />
        )}
        {pnl.desgloseCostos.sanidad > 0 && (
          <Row label="· Sanidad" value={`$${usd(pnl.desgloseCostos.sanidad)}`} sub />
        )}
        {pnl.desgloseCostos.otro > 0 && (
          <Row label="· Otros" value={`$${usd(pnl.desgloseCostos.otro)}`} sub />
        )}

        <div className="border-t border-border pt-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-foreground">Resultado neto</span>
            <span className={cn(
              "text-base font-bold tabular-nums",
              resultadoVariant === "positive" && "text-green-600",
              resultadoVariant === "negative" && "text-destructive",
            )}>
              {pnl.resultadoNeto >= 0 ? "" : "−"}${usd(Math.abs(pnl.resultadoNeto))}
            </span>
          </div>
        </div>

        {(pnl.stockActivoValor > 0 || pnl.cabezasActivas > 0) && (
          <div className="border-t border-border pt-1.5 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Referencia</p>
            <Row
              label={`Stock activo (${pnl.cabezasActivas} cab.)`}
              value={`$${usd(pnl.stockActivoValor)}`}
              variant="muted"
            />
          </div>
        )}
      </div>
    </div>
  );
}
