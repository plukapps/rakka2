"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { useAppStore } from "@/lib/stores/appStore"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface FormValues {
  name: string
  description: string
  location: string
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

export default function NewEstablishmentPage() {
  const router = useRouter()
  const createEstablishment = useAppStore((s) => s.createEstablishment)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: "", description: "", location: "" },
  })

  async function onSubmit(data: FormValues) {
    setSubmitting(true)
    try {
      createEstablishment({
        name: data.name,
        description: data.description,
        location: data.location,
      })
      router.push("/home")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className=" space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/establishments">
          <Button variant="ghost" size="sm">← Volver</Button>
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Crear establecimiento</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <FormField
          label="Nombre *"
          error={errors.name?.message}
        >
          <Input
            placeholder="Ej: La Esperanza"
            {...register("name", { required: "El nombre es obligatorio" })}
          />
        </FormField>

        <FormField label="Descripcion" hint="Breve descripcion del establecimiento.">
          <Input
            placeholder="Campo en zona norte, 500 ha"
            {...register("description")}
          />
        </FormField>

        <FormField label="Ubicacion">
          <Input
            placeholder="Gral. Pico, La Pampa"
            {...register("location")}
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Link href="/establishments">
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" loading={submitting}>
            Crear establecimiento
          </Button>
        </div>
      </form>
    </div>
  )
}
