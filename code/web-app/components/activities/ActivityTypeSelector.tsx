"use client"

import Link from "next/link"
import type { ActivityType } from "@/lib/types"

interface ActivityOption {
  type: ActivityType
  label: string
  icon: string
  href: string
}

const ACTIVITY_OPTIONS: ActivityOption[] = [
  { type: "reading", label: "Lectura RFID", icon: "📡", href: "/activities/new/reading" },
  { type: "sanitary", label: "Sanitaria", icon: "💉", href: "/activities/new/sanitary" },
  { type: "commercial", label: "Comercial", icon: "💰", href: "/activities/new/commercial" },
  { type: "field_control", label: "Control de campo", icon: "📋", href: "/activities/new/field-control" },
  { type: "movement", label: "Movimiento", icon: "🚚", href: "/activities/new/movement" },
  { type: "reproduction", label: "Reproduccion", icon: "🐄", href: "/activities/new/reproduction" },
  { type: "general", label: "General", icon: "📝", href: "/activities/new/general" },
]

export function ActivityTypeSelector() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {ACTIVITY_OPTIONS.map((opt) => (
        <Link
          key={opt.type}
          href={opt.href}
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/30 hover:bg-muted"
        >
          <span className="text-3xl">{opt.icon}</span>
          <span className="text-sm font-medium text-foreground">{opt.label}</span>
        </Link>
      ))}
    </div>
  )
}
