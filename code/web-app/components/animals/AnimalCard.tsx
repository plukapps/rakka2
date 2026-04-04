import Link from "next/link";
import type { Animal, Lot } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { CarenciaIndicator } from "@/components/animals/CarenciaIndicator";
import { categoryLabel } from "@/lib/utils";

interface AnimalCardProps {
  animal: Animal;
  lot?: Lot;
}

export function AnimalCard({ animal, lot }: AnimalCardProps) {
  return (
    <Link href={`/animals/${animal.id}`}>
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 font-mono">
                {animal.caravana}
              </span>
              <Badge variant={animal.status === "active" ? "success" : "default"}>
                {animal.status === "active" ? "Activo" : "Egresado"}
              </Badge>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
              <span>{categoryLabel(animal.category)}</span>
              <span>·</span>
              <span>{animal.breed}</span>
              {lot && (
                <>
                  <span>·</span>
                  <span>{lot.name}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <CarenciaIndicator animal={animal} size="sm" />
      </div>
    </Link>
  );
}
