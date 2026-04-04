"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/lib/stores/authStore"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  const router = useRouter()
  const { signIn, isLoading } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await signIn(email, password)
    router.push("/animals")
  }

  return (
    <div className="rounded-xl bg-card p-8 shadow-sm border border-border">
      <div className="mb-6 text-center">
        <span className="text-2xl font-bold text-foreground">Rakka</span>
        <p className="mt-1 text-sm text-muted-foreground">Crear cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juan@example.com" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        <Button type="submit" className="w-full" loading={isLoading}>
          Crear cuenta
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4 hover:opacity-70">
          Iniciá sesión
        </Link>
      </p>
    </div>
  )
}
