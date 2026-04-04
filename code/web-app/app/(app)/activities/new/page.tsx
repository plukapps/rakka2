"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ActivityTypeSelector } from "@/components/activities/ActivityTypeSelector"

export default function NewActivityPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/activities">
          <Button variant="ghost" size="sm">← Volver</Button>
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Registrar actividad</h1>
      </div>

      <p className="text-sm text-muted-foreground">Selecciona el tipo de actividad a registrar:</p>

      <ActivityTypeSelector />
    </div>
  )
}
