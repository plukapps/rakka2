"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { lotRepository } from "@/lib/repositories/lot"
import { animalRepository } from "@/lib/repositories/animal"
import { useAppStore } from "@/lib/stores/appStore"
import { useAnimals } from "@/hooks/useAnimals"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { TagView } from "@/components/animals/TagView"
import { cn, formatCaravana, categoryLabel } from "@/lib/utils"

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
  const [submitting, setSubmitting] = useState(false)
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<Set<string>>(new Set())
  const [animalSearch, setAnimalSearch] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: "", description: "" },
  })

  const availableAnimals = useMemo(() => {
    return animals.filter(
      (a) => a.status === "active" && a.lotId === null
    )
  }, [animals])

  const filteredAnimals = useMemo(() => {
    if (!animalSearch) return availableAnimals
    const q = animalSearch.toLowerCase()
    return availableAnimals.filter((a) =>
      a.caravana.toLowerCase().includes(q) ||
      formatCaravana(a.caravana, "serie").toLowerCase().includes(q)
    )
  }, [availableAnimals, animalSearch])

  function toggleAnimal(animalId: string) {
    setSelectedAnimalIds((prev) => {
      const next = new Set(prev)
      if (next.has(animalId)) {
        next.delete(animalId)
      } else {
        next.add(animalId)
      }
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

      // Assign selected animals to the lot
      for (const animalId of selectedAnimalIds) {
        animalRepository.update(estId, animalId, { lotId: lot.id })
      }

      // Update lot animalCount
      if (selectedAnimalIds.size > 0) {
        lotRepository.update(estId, lot.id, { animalCount: selectedAnimalIds.size })
      }

      router.push(`/lots/${lot.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/lots">
          <Button variant="ghost" size="sm">← Volver</Button>
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Crear lote</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Información del lote</p>

        <FormField
          label="Nombre *"
          error={errors.name?.message}
        >
          <Input
            placeholder="Lote engorde sur"
            {...register("name", {
              required: "El nombre es obligatorio",
            })}
          />
        </FormField>

        <FormField label="Descripción">
          <Input
            placeholder="Descripción opcional del lote"
            {...register("description")}
          />
        </FormField>

        <div className="space-y-3 pt-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Animales sin lote ({availableAnimals.length} disponibles)
          </p>

          {availableAnimals.length > 0 && (
            <>
              <Input
                placeholder="Buscar por caravana..."
                value={animalSearch}
                onChange={(e) => setAnimalSearch(e.target.value)}
              />

              {selectedAnimalIds.size > 0 && (
                <p className="text-xs text-primary font-medium">
                  {selectedAnimalIds.size} {selectedAnimalIds.size === 1 ? "animal seleccionado" : "animales seleccionados"}
                </p>
              )}

              <div className="max-h-60 overflow-y-auto space-y-1 rounded-lg border border-border p-2">
                {filteredAnimals.map((animal) => (
                  <label
                    key={animal.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-muted transition-colors",
                      selectedAnimalIds.has(animal.id) && "bg-primary/5"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAnimalIds.has(animal.id)}
                      onChange={() => toggleAnimal(animal.id)}
                      className="rounded border-input"
                    />
                    <TagView caravana={animal.caravana} size="sm" />
                    <div className="text-xs text-muted-foreground">
                      <span>{categoryLabel(animal.category)}</span>
                      {animal.breed && (
                        <>
                          <span> · </span>
                          <span>{animal.breed}</span>
                        </>
                      )}
                    </div>
                  </label>
                ))}
                {filteredAnimals.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Sin resultados
                  </p>
                )}
              </div>
            </>
          )}

          {availableAnimals.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Todos los animales ya están asignados a un lote.
            </p>
          )}
        </div>

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
