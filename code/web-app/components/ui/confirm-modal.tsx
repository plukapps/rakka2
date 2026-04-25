"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ConfirmModalProps {
  title: string
  description: string
  confirmLabel?: string
  confirmVariant?: "default" | "destructive"
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  title,
  description,
  confirmLabel = "Confirmar",
  confirmVariant = "default",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-lg border border-border bg-card shadow-lg p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant={confirmVariant} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
