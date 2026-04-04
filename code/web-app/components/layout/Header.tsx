"use client";

import { EstablishmentSelector } from "@/components/layout/EstablishmentSelector";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { user, signOut } = useAuthStore();

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shrink-0">
      {title && <h1 className="text-sm font-semibold text-gray-900">{title}</h1>}
      {!title && <span />}

      <div className="flex items-center gap-3">
        <EstablishmentSelector />
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              Salir
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
