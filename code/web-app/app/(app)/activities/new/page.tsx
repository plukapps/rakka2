import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewActivityPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/activities">
          <Button variant="ghost" size="sm">← Volver</Button>
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Registrar actividad</h1>
      </div>
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Formulario de actividad — próximamente</p>
        <p className="mt-1 text-xs text-gray-400">Fase 5: selector de animales + 6 tipos de actividad</p>
      </div>
    </div>
  );
}
