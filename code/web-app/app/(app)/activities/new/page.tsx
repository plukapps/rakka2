"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ActivityTypeSelector } from "@/components/activities/ActivityTypeSelector"

export default function NewActivityPage() {
  const router = useRouter()
  return (
    <div className=" space-y-6">
      <div className="flex h-8 items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Volver</Button>
        <h1 className="text-lg font-semibold text-foreground">Registrar actividad</h1>
      </div>

      <p className="text-sm text-muted-foreground">Selecciona el tipo de actividad a registrar:</p>

      <ActivityTypeSelector />
    </div>
  )
}
