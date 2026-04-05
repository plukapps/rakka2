"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { Menu } from "@base-ui/react/menu"
import { MoreVertical } from "lucide-react"
import { useAnimal } from "@/hooks/useAnimals"
import { useLots } from "@/hooks/useLots"
import { useTraceability } from "@/hooks/useTraceability"
import { useAnimalActivities } from "@/hooks/useAnimalActivities"
import { useAppStore } from "@/lib/stores/appStore"
import { animalRepository } from "@/lib/repositories/animal"
import { CarenciaIndicator } from "@/components/animals/CarenciaIndicator"
import { WeightHistoryCard } from "@/components/animals/WeightHistoryCard"
import { DarDeBajaModal } from "@/components/animals/DarDeBajaModal"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { TagView } from "@/components/animals/TagView"
import { categoryLabel, formatDate, formatDateTime, formatCaravana } from "@/lib/utils"
import type { TraceabilityEventType } from "@/lib/types"

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
  reading: "Lectura RFID",
  exit: "Egreso",
  correction: "Corrección",
}

export default function AnimalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  const animal = useAnimal(id)
  const lots = useLots()
  const events = useTraceability(id)
  const activities = useAnimalActivities(id)
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const [showBajaModal, setShowBajaModal] = useState(false)

  if (!animal) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner />
      </div>
    )
  }

  const lot = animal.lotId ? lots.find((l) => l.id === animal.lotId) : undefined

  const statusLabel =
    animal.status === "active"
      ? "Activo"
      : animal.exitType === "death"
      ? "Inactivo"
      : "Egresado"

  return (
    <div className=" space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Animales</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="relative flex items-center gap-5 px-6 pt-6 pb-2">
          {animal.status === "active" && (
            <div className="absolute top-3 right-3">
              <Menu.Root>
                <Menu.Trigger
                  render={
                    <Button variant="ghost" size="icon-sm" aria-label="Acciones">
                      <MoreVertical className="size-4" />
                    </Button>
                  }
                />
                <Menu.Portal>
                  <Menu.Positioner side="bottom" align="end" sideOffset={4}>
                    <Menu.Popup className="z-50 min-w-36 rounded-lg border border-border bg-popover py-1 shadow-md text-sm text-foreground origin-(--transform-origin) data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95 data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95">
                      <Menu.Item
                        className="flex w-full cursor-default items-center px-3 py-1.5 text-destructive outline-none data-[highlighted]:bg-accent"
                        onClick={() => setShowBajaModal(true)}
                      >
                        Dar de baja
                      </Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
            </div>
          )}
          <TagView caravana={animal.caravana} size="xl" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2">
              <StatusBadge variant={animal.status === "active" ? "success" : "neutral"}>
                {statusLabel}
              </StatusBadge>
              <CarenciaIndicator animal={animal} />
            </div>
            <span className="text-xs font-mono text-muted-foreground/50">
              {formatCaravana(animal.caravana, "full")}
            </span>
          </div>
        </div>
        <CardContent className="pt-5">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Categoría</dt>
              <dd className="font-medium text-foreground">{categoryLabel(animal.category)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Raza</dt>
              <dd className="font-medium text-foreground">{animal.breed || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Sexo</dt>
              <dd className="font-medium text-foreground">
                {animal.sex === "female" ? "Hembra" : "Macho"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Fecha de nacimiento</dt>
              <dd className="font-medium text-foreground">{animal.birthDate ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Lote actual</dt>
              <dd className="font-medium text-foreground">{lot?.name ?? "Sin lote"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Tipo de ingreso</dt>
              <dd className="font-medium text-foreground">
                {animal.entryType === "purchase" ? "Compra"
                  : animal.entryType === "birth" ? "Nacimiento"
                  : "Transferencia"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Peso de ingreso</dt>
              <dd className="font-medium text-foreground">
                {animal.entryWeight ? `${animal.entryWeight} kg` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Origen</dt>
              <dd className="font-medium text-foreground">{animal.origin || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Fecha de ingreso</dt>
              <dd className="font-medium text-foreground">{formatDate(animal.entryDate)}</dd>
            </div>
            {animal.status === "exited" && animal.exitType === "death" && (
              <>
                <div>
                  <dt className="text-xs text-muted-foreground">Fecha de baja</dt>
                  <dd className="font-medium text-foreground">
                    {animal.exitDate ? formatDate(animal.exitDate) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Causa</dt>
                  <dd className="font-medium text-foreground">{animal.exitNotes ?? "—"}</dd>
                </div>
              </>
            )}
            {animal.status === "exited" && animal.exitType !== "death" && (
              <>
                <div>
                  <dt className="text-xs text-muted-foreground">Fecha de egreso</dt>
                  <dd className="font-medium text-foreground">
                    {animal.exitDate ? formatDate(animal.exitDate) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Tipo de egreso</dt>
                  <dd className="font-medium text-foreground">
                    {animal.exitType === "sale" ? "Venta"
                      : animal.exitType === "dispatch" ? "Despacho"
                      : animal.exitType === "transfer" ? "Transferencia"
                      : "—"}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </CardContent>
      </Card>

      <WeightHistoryCard animal={animal} activities={activities} />

      {animal.hasActiveCarencia && animal.carenciaExpiresAt && (
        <Card>
          <CardHeader>
            <CardTitle>Carencia activa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground">
              Vence el{" "}
              <span className="font-semibold">{formatDate(animal.carenciaExpiresAt)}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Este animal no puede ser vendido hasta que la carencia expire.
            </p>
          </CardContent>
        </Card>
      )}

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
          <div className="divide-y divide-border">
            {events.map((event) => (
              <div key={event.id} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-primary/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {eventTypeLabel[event.type]}
                  </p>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                  {event.responsibleName && (
                    <p className="text-xs text-muted-foreground/60">{event.responsibleName}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDateTime(event.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {estId && (
        <DarDeBajaModal
          open={showBajaModal}
          onOpenChange={setShowBajaModal}
          onConfirm={(exitDate, exitNotes) => {
            animalRepository.darDeBaja({ estId, animalId: id, exitDate, exitNotes })
            setShowBajaModal(false)
          }}
        />
      )}
    </div>
  )
}
