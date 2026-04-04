"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const { signIn, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Mock: register is the same as login
    await signIn(email, password);
    router.push("/animals");
  }

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-200">
      <div className="mb-6 text-center">
        <span className="text-2xl font-bold text-emerald-600">Rakka</span>
        <p className="mt-1 text-sm text-gray-500">Crear cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="juan@example.com"
          required
        />
        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <Button type="submit" className="w-full" loading={isLoading}>
          Crear cuenta
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-500">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-emerald-600 hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
