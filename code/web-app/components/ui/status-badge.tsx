/**
 * StatusBadge — colores semánticos de dominio sobre el Badge de shadcn.
 * Úsalo para estados de animales, urgencias, tipos de actividad, etc.
 */
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const colorMap = {
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
  neutral: "bg-muted text-muted-foreground border-border",
  danger: "bg-red-100 text-red-800 border-red-200",
} as const

type StatusVariant = keyof typeof colorMap

interface StatusBadgeProps {
  variant?: StatusVariant
  className?: string
  children: React.ReactNode
}

export function StatusBadge({ variant = "neutral", className, children }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(colorMap[variant], "rounded-[4px]", className)}
    >
      {children}
    </Badge>
  )
}
