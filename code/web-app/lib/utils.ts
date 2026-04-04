import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Tailwind class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ID generation (mock — in production Firebase pushes generate IDs)
export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

// Timestamp helpers
export function now(): number {
  return Date.now()
}

export function toTimestamp(date: Date): number {
  return date.getTime()
}

export function fromTimestamp(ts: number): Date {
  return new Date(ts)
}

// Date formatting
export function formatDate(ts: number): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(ts))
}

export function formatDateTime(ts: number): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts))
}

export function formatRelativeDate(ts: number): string {
  const diff = Date.now() - ts
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Hoy"
  if (days === 1) return "Ayer"
  if (days < 7) return `Hace ${days} días`
  return formatDate(ts)
}

// Carencia helpers
export function daysUntil(ts: number): number {
  const diff = ts - Date.now()
  return Math.ceil(diff / 86400000)
}

export function isCarenciaExpiringSoon(carenciaExpiresAt: number | null): boolean {
  if (!carenciaExpiresAt) return false
  return daysUntil(carenciaExpiresAt) <= 7
}

export function carenciaLabel(carenciaExpiresAt: number | null): string {
  if (!carenciaExpiresAt) return "Sin carencia"
  const days = daysUntil(carenciaExpiresAt)
  if (days < 0) return "Carencia vencida"
  if (days === 0) return "Vence hoy"
  if (days === 1) return "Vence mañana"
  return `Vence en ${days} días`
}

// Caravana formatting
// Storage: 15 raw digits — CCC(country) FFF(fixed zeros) SSSSS(serie) NNNN(num)
// Display modes: full | short | serie

export type CaravanaMode = "full" | "short" | "serie"

export function formatCaravana(caravana: string, mode: CaravanaMode = "serie"): string {
  if (caravana.length !== 15) return caravana
  switch (mode) {
    case "full":
      return caravana
    case "short":
      return caravana.slice(6)
    case "serie":
      return `${caravana.slice(6, 11)} ${caravana.slice(11)}`
  }
}

export function caravanaParts(caravana: string) {
  return {
    country: caravana.slice(0, 3),
    fixed: caravana.slice(3, 6),
    serie: caravana.slice(6, 11),
    num: caravana.slice(11),
  }
}

// Label helpers
export function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    vaca: "Vaca",
    toro: "Toro",
    ternero: "Ternero",
    ternera: "Ternera",
    vaquillona: "Vaquillona",
    novillo: "Novillo",
    otro: "Otro",
  }
  return labels[cat] ?? cat
}

export function activityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    sanitary: "Sanitaria",
    commercial: "Comercial",
    field_control: "Control de campo",
    movement: "Movimiento",
    reproduction: "Reproducción",
    general: "General",
  }
  return labels[type] ?? type
}

export function urgencyLabel(urgency: string): string {
  const labels: Record<string, string> = {
    info: "Info",
    warning: "Advertencia",
    critical: "Crítica",
  }
  return labels[urgency] ?? urgency
}
