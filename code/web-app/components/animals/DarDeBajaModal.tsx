"use client"

import { useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"

const today = new Date().toISOString().split("T")[0]

interface DarDeBajaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (exitDate: number, exitNotes: string | null) => Promise<void> | void
}

export function DarDeBajaModal({ open, onOpenChange, onConfirm }: DarDeBajaModalProps) {
  const [date, setDate] = useState(today)
  const [causa, setCausa] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    if (!date) return
    setLoading(true)
    const exitDate = new Date(date).getTime()
    const exitNotes = causa.trim() || null
    await onConfirm(exitDate, exitNotes)
    setLoading(false)
    setCausa("")
    setDate(today)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!loading) onOpenChange(nextOpen)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/40 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-xl space-y-4 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity">
          <Dialog.Title className="text-base font-semibold text-foreground">
            Dar de baja
          </Dialog.Title>

          <div className="space-y-1">
            <label htmlFor="exitDate" className="text-sm font-medium text-foreground">
              Fecha de fallecimiento <span className="text-destructive">*</span>
            </label>
            <input
              id="exitDate"
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="causa" className="text-sm font-medium text-foreground">
              Causa del fallecimiento
            </label>
            <textarea
              id="causa"
              value={causa}
              onChange={(e) => setCausa(e.target.value)}
              placeholder="Causa opcional..."
              rows={3}
              className="flex w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
            />
          </div>

          <p className="text-sm text-destructive">
            Esta acción no se puede deshacer.
          </p>

          <div className="flex justify-end gap-2 pt-1">
            <Dialog.Close
              render={
                <Button variant="outline" disabled={loading}>
                  Cancelar
                </Button>
              }
            />
            <Button
              variant="destructive"
              loading={loading}
              disabled={!date || loading}
              onClick={handleConfirm}
            >
              Confirmar baja
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
