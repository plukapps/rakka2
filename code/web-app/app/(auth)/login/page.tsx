"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
    <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-200">
      <div className="mb-6 text-center">
        <span className="text-2xl font-bold text-emerald-600">Rakka</span>
        <p className="mt-1 text-sm text-gray-500">Gestión ganadera</p>
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
          Ingresar
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-500">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="text-emerald-600 hover:underline">
          Registrate
        </Link>
      </p>

      <p className="mt-3 text-center text-xs text-gray-400">
        Demo: cualquier email y contraseña funciona
      </p>
    </div>
  );
}
