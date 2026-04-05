"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { lotRepository } from "@/lib/repositories/lot"
import { animalRepository } from "@/lib/repositories/animal"
import { traceabilityRepository } from "@/lib/repositories/traceability"
import { useAppStore } from "@/lib/stores/appStore"
import { useAnimals } from "@/hooks/useAnimals"
import { useLots } from "@/hooks/useLots"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { TagView } from "@/components/animals/TagView"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn, formatCaravana } from "@/lib/utils"

interface FormValues {
  name: string
  description: string
}

function FormField({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export default function NewLotPage() {
  const router = useRouter()
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const animals = useAnimals()
  const lots = useLots()
  const [submitting, setSubmitting] = useState(false)
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<Set<string>>(new Set())
  const [sinLoteSearch, setSinLoteSearch] = useState("")
  const [fromLotId, setFromLotId] = useState<string>("")
  const [fromLotSearch, setFromLotSearch] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: "", description: "" },
  })

  const sinLoteAnimals = useMemo(
    () => animals.filter((a) => a.status === "active" && a.lotId === null),
    [animals]
  )

  const filteredSinLote = useMemo(() => {
    if (!sinLoteSearch) return sinLoteAnimals
    const q = sinLoteSearch.toLowerCase()
    return sinLoteAnimals.filter(
      (a) =>
        a.caravana.toLowerCase().includes(q) ||
        formatCaravana(a.caravana, "serie").toLowerCase().includes(q)
    )
  }, [sinLoteAnimals, sinLoteSearch])

  const fromLotAnimals = useMemo(
    () => (fromLotId ? animals.filter((a) => a.status === "active" && a.lotId === fromLotId) : []),
    [animals, fromLotId]
  )

  const filteredFromLot = useMemo(() => {
    if (!fromLotSearch) return fromLotAnimals
    const q = fromLotSearch.toLowerCase()
    return fromLotAnimals.filter(
      (a) =>
        a.caravana.toLowerCase().includes(q) ||
        formatCaravana(a.caravana, "serie").toLowerCase().includes(q)
    )
  }, [fromLotAnimals, fromLotSearch])

  function toggleAnimal(animalId: string) {
    setSelectedAnimalIds((prev) => {
      const next = new Set(prev)
      if (next.has(animalId)) next.delete(animalId)
      else next.add(animalId)
      return next
    })
  }

  async function onSubmit(data: FormValues) {
    if (!estId) return
    setSubmitting(true)
    try {
      const lot = lotRepository.create({
        estId,
        name: data.name,
        description: data.description,
      })

      const ts = Date.now()

      for (const animalId of selectedAnimalIds) {
        const animal = animals.find((a) => a.id === animalId)
        if (!animal) continue

        const previousLotId = animal.lotId

        animalRepository.update(estId, animalId, { lotId: lot.id })

        if (previousLotId) {
          const prevLot = lots.find((l) => l.id === previousLotId)
          if (prevLot) {
            lotRepository.update(estId, previousLotId, {
              animalCount: Math.max(0, prevLot.animalCount - 1),
            })
          }
          traceabilityRepository.create({
            animalId,
            estId,
            type: "lot_change",
            description: `Movido desde ${prevLot?.name ?? "otro lote"} al lote ${lot.name}`,
            activityId: null,
            lotId: lot.id,
            lotName: lot.name,
            responsibleName: null,
            timestamp: ts,
          })
        }
      }

      if (selectedAnimalIds.size > 0) {
        lotRepository.update(estId, lot.id, { animalCount: selectedAnimalIds.size })
      }

      router.push(`/lots/${lot.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Volver</Button>
        <h1 className="text-lg font-semibold text-foreground">Crear lote</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl border border-border bg-card p-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Información del lote</p>

        <FormField label="Nombre *" error={errors.name?.message}>
          <Input
            placeholder="Lote engorde sur"
            {...register("name", { required: "El nombre es obligatorio" })}
          />
        </FormField>

        <FormField label="Descripción">
          <Input
            placeholder="Descripción opcional del lote"
            {...register("description")}
          />
        </FormField>

        {/* Sección: Animales sin lote */}
        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Animales sin lote ({sinLoteAnimals.length} disponibles)
          </p>

          {sinLoteAnimals.length > 0 ? (
            <>
              <Input
                placeholder="Buscar por caravana..."
                value={sinLoteSearch}
                onChange={(e) => setSinLoteSearch(e.target.value)}
              />
              {filteredSinLote.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {filteredSinLote.map((animal) => (
                    <button
                      key={animal.id}
                      type="button"
                      onClick={() => toggleAnimal(animal.id)}
                      className={cn(
                        "rounded-xl transition-all",
                        selectedAnimalIds.has(animal.id)
                          ? "ring-2 ring-primary ring-offset-2"
                          : "opacity-60 hover:opacity-100"
                      )}
                    >
                      <TagView caravana={animal.caravana} size="md" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Sin resultados para esa búsqueda.</p>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Todos los animales ya están asignados a un lote.</p>
          )}
        </div>

        {/* Sección: Desde otro lote */}
        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Desde otro lote
          </p>

          {lots.length > 0 ? (
            <>
              <Select value={fromLotId} onValueChange={(v) => { setFromLotId(v as string); setFromLotSearch("") }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar lote..." />
                </SelectTrigger>
                <SelectContent>
                  {lots.map((lot) => (
                    <SelectItem key={lot.id} value={lot.id}>
                      {lot.name} · {lot.animalCount} {lot.animalCount === 1 ? "animal" : "animales"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {fromLotId && (
                <>
                  <Input
                    placeholder="Buscar por caravana..."
                    value={fromLotSearch}
                    onChange={(e) => setFromLotSearch(e.target.value)}
                  />
                  {filteredFromLot.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {filteredFromLot.map((animal) => (
                        <button
                          key={animal.id}
                          type="button"
                          onClick={() => toggleAnimal(animal.id)}
                          className={cn(
                            "rounded-xl transition-all",
                            selectedAnimalIds.has(animal.id)
                              ? "ring-2 ring-primary ring-offset-2"
                              : "opacity-60 hover:opacity-100"
                          )}
                        >
                          <TagView caravana={animal.caravana} size="md" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {fromLotAnimals.length === 0
                        ? "Este lote no tiene animales."
                        : "Sin resultados para esa búsqueda."}
                    </p>
                  )}
                </>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No hay lotes activos para seleccionar.</p>
          )}
        </div>

        {selectedAnimalIds.size > 0 && (
          <p className="text-xs text-primary font-medium">
            {selectedAnimalIds.size} {selectedAnimalIds.size === 1 ? "animal seleccionado" : "animales seleccionados"}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Link href="/lots">
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" loading={submitting}>
            Crear lote
          </Button>
        </div>
      </form>
    </div>
  )
}
