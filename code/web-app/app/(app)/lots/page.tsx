"use client";

import { useLots } from "@/hooks/useLots";
import { useAppStore } from "@/lib/stores/appStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export default function LotsPage() {
  const lots = useLots();
  const est = useAppStore((s) => s.activeEstablishment);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Lotes</h1>
        <Badge variant="outline">{est?.name}</Badge>
      </div>

      {lots.length === 0 ? (
        <EmptyState
          title="Sin lotes"
          description="No hay lotes activos en este establecimiento."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lots.map((lot) => (
            <Link key={lot.id} href={`/animals?lotId=${lot.id}`}>
              <Card className="hover:border-emerald-300 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle>{lot.name}</CardTitle>
                  <Badge variant="success">{lot.animalCount} animales</Badge>
                </CardHeader>
                {lot.description && (
                  <CardContent>
                    <p className="text-xs text-gray-500">{lot.description}</p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
