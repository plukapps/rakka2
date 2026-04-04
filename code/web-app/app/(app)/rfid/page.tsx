"use client";

import { useState, useEffect } from "react";
import { rfidRepository } from "@/lib/repositories/rfid";
import { useAppStore } from "@/lib/stores/appStore";
import type { RfidReading } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";

export default function RfidPage() {
  const estId = useAppStore((s) => s.activeEstablishment?.id);
  const [readings, setReadings] = useState<RfidReading[]>([]);

  useEffect(() => {
    if (!estId) return;
    setReadings(rfidRepository.getAll(estId));
    return rfidRepository.subscribe(estId, () =>
      setReadings(rfidRepository.getAll(estId))
    );
  }, [estId]);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-gray-900">Lecturas RFID</h1>

      {readings.length === 0 ? (
        <EmptyState title="Sin lecturas RFID" description="No hay lecturas registradas." />
      ) : (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {readings.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Badge variant={r.method === "bluetooth" ? "info" : "default"}>
                  {r.method === "bluetooth" ? "Bluetooth" : "Archivo"}
                </Badge>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {r.animalIds.length} animales
                    {r.unknownCaravanas.length > 0 && (
                      <span className="ml-2 text-amber-600 text-xs">
                        +{r.unknownCaravanas.length} desconocida{r.unknownCaravanas.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {r.fileName ?? r.responsible}
                    {r.activityId && " · Vinculada a actividad"}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{formatDateTime(r.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
