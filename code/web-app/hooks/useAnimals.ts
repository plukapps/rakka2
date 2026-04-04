"use client";

import { useState, useEffect, useCallback } from "react";
import type { Animal } from "@/lib/types";
import { animalRepository } from "@/lib/repositories/animal";
import { useAppStore } from "@/lib/stores/appStore";

export function useAnimals() {
  const estId = useAppStore((s) => s.activeEstablishment?.id);
  const [animals, setAnimals] = useState<Animal[]>([]);

  const load = useCallback(() => {
    if (!estId) return;
    setAnimals(animalRepository.getAll(estId));
  }, [estId]);

  useEffect(() => {
    load();
    if (!estId) return;
    return animalRepository.subscribe(estId, load);
  }, [estId, load]);

  return animals;
}

export function useAnimal(animalId: string | undefined) {
  const estId = useAppStore((s) => s.activeEstablishment?.id);
  const [animal, setAnimal] = useState<Animal | undefined>(undefined);

  const load = useCallback(() => {
    if (!estId || !animalId) return;
    setAnimal(animalRepository.getById(estId, animalId));
  }, [estId, animalId]);

  useEffect(() => {
    load();
    if (!estId) return;
    return animalRepository.subscribe(estId, load);
  }, [estId, animalId, load]);

  return animal;
}
