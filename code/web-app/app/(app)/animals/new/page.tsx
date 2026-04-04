"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { animalRepository } from "@/lib/repositories/animal"
import { useAppStore } from "@/lib/stores/appStore"
import { useAuthStore } from "@/lib/stores/authStore"
import { useLots } from "@/hooks/useLots"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Animal } from "@/lib/types"

interface FormValues {
  caravana: string
  category: Animal["category"]
  sex: Animal["sex"]
  breed: string
  birthDate: string
  entryType: Animal["entryType"]
  entryWeight: string
  origin: string
  lotId: string
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

function NativeSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export default function NewAnimalPage() {
  const router = useRouter()
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const user = useAuthStore((s) => s.user)
  const lots = useLots()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { category: "vaca", sex: "female", entryType: "purchase" },
  })

  async function onSubmit(data: FormValues) {
    if (!estId || !user) return
    if (!animalRepository.isCaravanaUnique(estId, data.caravana)) {
      setError("caravana", { message: "Esta caravana ya existe en el establecimiento" })
      return
    }
    setSubmitting(true)
    try {
      const animal = animalRepository.create({
        estId,
        caravana: data.caravana,
        category: data.category,
        sex: data.sex,
        breed: data.breed,
        birthDate: data.birthDate || null,
        entryWeight: data.entryWeight ? parseFloat(data.entryWeight) : null,
        origin: data.origin,
        entryType: data.entryType,
        lotId: data.lotId || null,
        createdBy: user.uid,
      })
      router.push(`/animals/${animal.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/animals">
          <Button variant="ghost" size="sm">← Volver</Button>
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Ingresar animal</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Identificación</p>

        <FormField
          label="Caravana *"
          error={errors.caravana?.message}
          hint="Debe ser única en este establecimiento. No se puede modificar."
        >
          <Input
            placeholder="AR-0001-1234"
            {...register("caravana", {
              required: "La caravana es obligatoria",
              pattern: { value: /^[A-Z]{2}-\d{4}-\d{4}$/, message: "Formato: AR-0000-0000" },
            })}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Categoría">
            <NativeSelect {...register("category", { required: true })}>
              <option value="vaca">Vaca</option>
              <option value="toro">Toro</option>
              <option value="novillo">Novillo</option>
              <option value="vaquillona">Vaquillona</option>
              <option value="ternero">Ternero</option>
              <option value="ternera">Ternera</option>
              <option value="otro">Otro</option>
            </NativeSelect>
          </FormField>
          <FormField label="Sexo">
            <NativeSelect {...register("sex", { required: true })}>
              <option value="female">Hembra</option>
              <option value="male">Macho</option>
            </NativeSelect>
          </FormField>
        </div>

        <FormField label="Raza">
          <Input placeholder="Angus, Hereford..." {...register("breed")} />
        </FormField>

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">Ingreso</p>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Tipo de ingreso">
            <NativeSelect {...register("entryType", { required: true })}>
              <option value="purchase">Compra</option>
              <option value="birth">Nacimiento</option>
              <option value="transfer">Transferencia</option>
            </NativeSelect>
          </FormField>
          <FormField label="Peso de ingreso (kg)">
            <Input type="number" step="0.1" placeholder="280" {...register("entryWeight")} />
          </FormField>
        </div>

        <FormField label="Origen / Procedencia">
          <Input placeholder="Establecimiento Los Pinos" {...register("origin")} />
        </FormField>

        <FormField label="Fecha de nacimiento">
          <Input type="date" {...register("birthDate")} />
        </FormField>

        <FormField label="Asignar a lote">
          <NativeSelect {...register("lotId")}>
            <option value="">Sin lote</option>
            {lots.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </NativeSelect>
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Link href="/animals">
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" loading={submitting}>
            Ingresar animal
          </Button>
        </div>
      </form>
    </div>
  )
}
