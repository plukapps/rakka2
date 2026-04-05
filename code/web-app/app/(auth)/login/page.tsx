"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores/authStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn(email, password);
    router.push("/animals");
  }

  return (
    <div className="rounded-xl bg-card p-8 shadow-sm border border-border">
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Image src="/logo_rakka.png" alt="Rakka" width={32} height={32} />
          <span className="text-2xl font-bold text-primary">Rakka</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Gestión ganadera</p>
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
          Ingresar
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Registrate
        </Link>
      </p>

      <p className="mt-3 text-center text-xs text-muted-foreground/60">
        Demo: cualquier email y contraseña funciona
      </p>
    </div>
  );
}
