import { EmptyState } from "@/components/ui/empty-state";

export default function TraceabilityPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-gray-900">Trazabilidad</h1>
      <EmptyState
        title="Ver trazabilidad por animal"
        description="Ingresá al perfil de un animal para ver su línea de vida."
      />
    </div>
  );
}
