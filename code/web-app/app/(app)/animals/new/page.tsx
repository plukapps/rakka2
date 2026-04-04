"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { animalRepository } from "@/lib/repositories/animal";
import { useAppStore } from "@/lib/stores/appStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { useLots } from "@/hooks/useLots";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Animal } from "@/lib/types";

interface FormValues {
  caravana: string;
  category: Animal["category"];
  sex: Animal["sex"];
  breed: string;
  birthDate: string;
  entryType: Animal["entryType"];
  entryWeight: string;
  origin: string;
  lotId: string;
}

const categoryOptions = [
  { value: "vaca", label: "Vaca" },
  { value: "toro", label: "Toro" },
  { value: "novillo", label: "Novillo" },
  { value: "vaquillona", label: "Vaquillona" },
  { value: "ternero", label: "Ternero" },
  { value: "ternera", label: "Ternera" },
  { value: "otro", label: "Otro" },
];

const sexOptions = [
  { value: "female", label: "Hembra" },
  { value: "male", label: "Macho" },
];

const entryTypeOptions = [
  { value: "purchase", label: "Compra" },
  { value: "birth", label: "Nacimiento" },
  { value: "transfer", label: "Transferencia" },
];

export default function NewAnimalPage() {
  const router = useRouter();
  const estId = useAppStore((s) => s.activeEstablishment?.id);
  const user = useAuthStore((s) => s.user);
  const lots = useLots();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      category: "vaca",
      sex: "female",
      entryType: "purchase",
    },
  });

  const lotOptions = [
    { value: "", label: "Sin lote" },
    ...lots.map((l) => ({ value: l.id, label: l.name })),
  ];

  async function onSubmit(data: FormValues) {
    if (!estId || !user) return;

    // Validate caravana uniqueness
    if (!animalRepository.isCaravanaUnique(estId, data.caravana)) {
      setError("caravana", {
        message: "Esta caravana ya existe en el establecimiento",
      });
      return;
    }

    setSubmitting(true);
    try {
      const animal = animalRepository.create({
        estId,
        caravana: data.caravana,
        category: data.category,
        sex: data.sex,
        breed: data.breed,
        birthDate: data.birthDate || null,
        entryWeight: data.entryWeight ? parseFloat(data.entryWeight) : null,
        origin: data.origin,
        entryType: data.entryType,
        lotId: data.lotId || null,
        createdBy: user.uid,
      });
      router.push(`/animals/${animal.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/animals">
          <Button variant="ghost" size="sm">← Volver</Button>
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Ingresar animal</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        {/* Identification */}
        <h2 className="text-sm font-semibold text-gray-700">Identificación</h2>

        <Input
          label="Caravana *"
          placeholder="AR-0001-1234"
          error={errors.caravana?.message}
          hint="Debe ser única en este establecimiento. No se puede modificar."
          {...register("caravana", {
            required: "La caravana es obligatoria",
            pattern: {
              value: /^[A-Z]{2}-\d{4}-\d{4}$/,
              message: "Formato: AR-0000-0000",
            },
          })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Categoría"
            options={categoryOptions}
            {...register("category", { required: true })}
          />
          <Select
            label="Sexo"
            options={sexOptions}
            {...register("sex", { required: true })}
          />
        </div>

        <Input
          label="Raza"
          placeholder="Angus, Hereford..."
          {...register("breed")}
        />

        {/* Entry */}
        <h2 className="mt-2 text-sm font-semibold text-gray-700">Ingreso</h2>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Tipo de ingreso"
            options={entryTypeOptions}
            {...register("entryType", { required: true })}
          />
          <Input
            label="Peso de ingreso (kg)"
            type="number"
            step="0.1"
            placeholder="280"
            {...register("entryWeight")}
          />
        </div>

        <Input
          label="Origen / Procedencia"
          placeholder="Establecimiento Los Pinos"
          {...register("origin")}
        />

        <Input
          label="Fecha de nacimiento"
          type="date"
          {...register("birthDate")}
        />

        <Select
          label="Asignar a lote"
          options={lotOptions}
          {...register("lotId")}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Link href="/animals">
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" loading={submitting}>
            Ingresar animal
          </Button>
        </div>
      </form>
    </div>
  );
}
