"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { useAppStore } from "@/lib/stores/appStore"
import { animalRepository } from "@/lib/repositories/animal"
import { lotRepository } from "@/lib/repositories/lot"
import { getMockStore } from "@/lib/mock/store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"

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

export default function EstablishmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const estId = params.estId as string

  const establishments = useAppStore((s) => s.establishments)
  const activeEst = useAppStore((s) => s.activeEstablishment)
  const setActiveEstablishment = useAppStore((s) => s.setActiveEstablishment)

  const establishment = useMemo(
    () => establishments.find((e) => e.id === estId),
    [establishments, estId]
  )

  const [submitting, setSubmitting] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [saved, setSaved] = useState(false)

  const activeAnimals = useMemo(
    () => animalRepository.getAll(estId).filter((a) => a.status === "active").length,
    [estId]
  )

  const activeLots = useMemo(
    () => lotRepository.getAll(estId).filter((l) => l.status === "active").length,
    [estId]
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: establishment?.name ?? "",
      description: establishment?.description ?? "",
      location: establishment?.location ?? "",
    },
  })

  if (!establishment) {
    return (
      <div className="space-y-4">
        <Link href="/establishments">
          <Button variant="ghost" size="sm">← Volver</Button>
        </Link>
        <p className="text-sm text-muted-foreground">Establecimiento no encontrado.</p>
      </div>
    )
  }

  async function onSubmit(data: FormValues) {
    if (!establishment) return
    setSubmitting(true)
    setSaved(false)
    try {
      const store = getMockStore()
      const updated = { ...establishment, name: data.name, description: data.description, location: data.location }
      store.setEstablishment(updated)
      // Update zustand state
      const current = useAppStore.getState()
      const updatedList = current.establishments.map((e) => (e.id === estId ? updated : e))
      useAppStore.setState({ establishments: updatedList })
      if (activeEst?.id === estId) {
        setActiveEstablishment(updated)
      }
      setSaved(true)
    } finally {
      setSubmitting(false)
    }
  }

  function handleArchive() {
    if (!establishment || activeAnimals > 0) return
    setArchiving(true)
    try {
      const store = getMockStore()
      const updated = { ...establishment, status: "archived" as const }
      store.setEstablishment(updated)
      const current = useAppStore.getState()
      const updatedList = current.establishments.map((e) => (e.id === estId ? updated : e))
      useAppStore.setState({ establishments: updatedList })
      router.push("/establishments")
    } finally {
      setArchiving(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/establishments">
          <Button variant="ghost" size="sm">← Volver</Button>
        </Link>
        <h1 className="text-lg font-semibold text-foreground">{establishment.name}</h1>
        <StatusBadge variant={establishment.status === "active" ? "success" : "neutral"}>
          {establishment.status === "active" ? "Activo" : "Archivado"}
        </StatusBadge>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card size="sm">
          <CardContent className="text-center">
            <p className="text-2xl font-bold text-foreground">{activeAnimals}</p>
            <p className="text-xs text-muted-foreground">Animales activos</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="text-center">
            <p className="text-2xl font-bold text-foreground">{activeLots}</p>
            <p className="text-xs text-muted-foreground">Lotes activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Datos del establecimiento</p>

        <FormField label="Nombre *" error={errors.name?.message}>
          <Input {...register("name", { required: "El nombre es obligatorio" })} />
        </FormField>

        <FormField label="Descripcion">
          <Input {...register("description")} />
        </FormField>

        <FormField label="Ubicacion">
          <Input {...register("location")} />
        </FormField>

        <div className="flex items-center justify-between pt-2">
          <div>
            {saved && <p className="text-xs text-emerald-600">Cambios guardados</p>}
          </div>
          <Button type="submit" loading={submitting}>
            Guardar cambios
          </Button>
        </div>
      </form>

      {/* Archive */}
      {establishment.status === "active" && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Zona de peligro</p>
          {activeAnimals > 0 ? (
            <p className="text-sm text-muted-foreground">
              No se puede archivar un establecimiento con animales activos ({activeAnimals} activos).
            </p>
          ) : null}
          <Button
            variant="destructive"
            disabled={activeAnimals > 0}
            loading={archiving}
            onClick={handleArchive}
          >
            Archivar establecimiento
          </Button>
        </div>
      )}
    </div>
  )
}
