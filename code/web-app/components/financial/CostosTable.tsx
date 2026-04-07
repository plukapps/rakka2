import type { CostoLote, CostoEstablecimiento, CostoCategoriaLote, CostoCategoriaEst } from "@/lib/financial-types";
import { formatDate } from "@/lib/utils";

const categoriaLoteLabel: Record<CostoCategoriaLote, string> = {
  alimentacion: "Alimentación",
  sanidad: "Sanidad",
  otro: "Otro",
};

const categoriaEstLabel: Record<CostoCategoriaEst, string> = {
  mano_de_obra: "Mano de obra",
  mantenimiento: "Mantenimiento",
  otro: "Otro",
};

interface Props {
  costos: CostoLote[] | CostoEstablecimiento[];
  showCabezas?: boolean;
}

function isLotCosto(c: CostoLote | CostoEstablecimiento): c is CostoLote {
  return "loteId" in c;
}

export function CostosTable({ costos, showCabezas = false }: Props) {
  if (costos.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="pb-2 text-left font-medium">Fecha</th>
            <th className="pb-2 text-left font-medium">Categoría</th>
            <th className="pb-2 text-left font-medium">Descripción</th>
            {showCabezas && <th className="pb-2 text-right font-medium">Cabezas</th>}
            <th className="pb-2 text-right font-medium">USD</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {costos.map((c) => {
            const isLot = isLotCosto(c);
            const categoriaLabel = isLot
              ? categoriaLoteLabel[(c as CostoLote).categoria]
              : categoriaEstLabel[(c as CostoEstablecimiento).categoria];

            return (
              <tr key={c.id} className="text-foreground">
                <td className="py-2 pr-4 tabular-nums text-muted-foreground">
                  {formatDate(c.fecha)}
                </td>
                <td className="py-2 pr-4">{categoriaLabel}</td>
                <td className="py-2 pr-4 text-muted-foreground">
                  {c.descripcion || "—"}
                </td>
                {showCabezas && (
                  <td className="py-2 pr-4 text-right tabular-nums text-muted-foreground">
                    {isLot ? (c as CostoLote).cabezasAlMomento : "—"}
                  </td>
                )}
                <td className="py-2 text-right tabular-nums font-medium">
                  ${c.montoUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
