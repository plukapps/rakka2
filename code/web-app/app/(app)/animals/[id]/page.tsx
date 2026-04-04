"use client";

import { use } from "react";
import Link from "next/link";
import { useAnimal } from "@/hooks/useAnimals";
import { useLots } from "@/hooks/useLots";
import { useTraceability } from "@/hooks/useTraceability";
import { CarenciaIndicator } from "@/components/animals/CarenciaIndicator";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { categoryLabel, formatDate, formatDateTime } from "@/lib/utils";
import type { TraceabilityEventType } from "@/lib/types";

const eventTypeLabel: Record<TraceabilityEventType, string> = {
  entry: "Ingreso",
  lot_assignment: "Asignación a lote",
  lot_change: "Cambio de lote",
  lot_removal: "Salida de lote",
  sanitary_activity: "Actividad sanitaria",
  commercial_activity: "Actividad comercial",
  field_control: "Control de campo",
  movement: "Movimiento",
  reproduction: "Reproducción",
  general_activity: "Actividad general",
  rfid_reading: "Lectura RFID",
  exit: "Egreso",
  correction: "Corrección",
};

export default function AnimalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const animal = useAnimal(id);
  const lots = useLots();
  const events = useTraceability(id);

  if (!animal) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner />
      </div>
    );
  }

  const lot = animal.lotId ? lots.find((l) => l.id === animal.lotId) : undefined;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/animals">
          <Button variant="ghost" size="sm">← Animales</Button>
        </Link>
      </div>

      {/* Profile card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold font-mono text-gray-900">
              {animal.caravana}
            </span>
            <Badge variant={animal.status === "active" ? "success" : "default"}>
              {animal.status === "active" ? "Activo" : "Egresado"}
            </Badge>
            <CarenciaIndicator animal={animal} />
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-gray-500">Categoría</dt>
              <dd className="font-medium text-gray-900">{categoryLabel(animal.category)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Raza</dt>
              <dd className="font-medium text-gray-900">{animal.breed || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Sexo</dt>
              <dd className="font-medium text-gray-900">
                {animal.sex === "female" ? "Hembra" : "Macho"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Fecha de nacimiento</dt>
              <dd className="font-medium text-gray-900">{animal.birthDate ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Lote actual</dt>
              <dd className="font-medium text-gray-900">{lot?.name ?? "Sin lote"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Tipo de ingreso</dt>
              <dd className="font-medium text-gray-900">
                {animal.entryType === "purchase"
                  ? "Compra"
                  : animal.entryType === "birth"
                  ? "Nacimiento"
                  : "Transferencia"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Peso de ingreso</dt>
              <dd className="font-medium text-gray-900">
                {animal.entryWeight ? `${animal.entryWeight} kg` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Origen</dt>
              <dd className="font-medium text-gray-900">{animal.origin || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Fecha de ingreso</dt>
              <dd className="font-medium text-gray-900">{formatDate(animal.entryDate)}</dd>
            </div>
            {animal.status === "exited" && (
              <>
                <div>
                  <dt className="text-xs text-gray-500">Fecha de egreso</dt>
                  <dd className="font-medium text-gray-900">
                    {animal.exitDate ? formatDate(animal.exitDate) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Tipo de egreso</dt>
                  <dd className="font-medium text-gray-900">{animal.exitType ?? "—"}</dd>
                </div>
              </>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Carencia detail */}
      {animal.hasActiveCarencia && animal.carenciaExpiresAt && (
        <Card>
          <CardHeader>
            <CardTitle>Carencia activa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              Vence el{" "}
              <span className="font-semibold">
                {formatDate(animal.carenciaExpiresAt)}
              </span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Este animal no puede ser vendido hasta que la carencia expire.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Traceability */}
      <Card>
        <CardHeader>
          <CardTitle>Trazabilidad</CardTitle>
        </CardHeader>
        {events.length === 0 ? (
          <CardContent>
            <EmptyState
              title="Sin eventos"
              description="No hay eventos de trazabilidad registrados."
              className="py-6"
            />
          </CardContent>
        ) : (
          <div className="divide-y divide-gray-100">
            {events.map((event) => (
              <div key={event.id} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {eventTypeLabel[event.type]}
                  </p>
                  <p className="text-xs text-gray-600">{event.description}</p>
                  {event.responsibleName && (
                    <p className="text-xs text-gray-400">{event.responsibleName}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {formatDateTime(event.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
