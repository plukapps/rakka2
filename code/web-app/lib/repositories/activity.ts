import type { Activity } from "@/lib/types";
import { getMockStore } from "@/lib/mock/store";
import { generateId, now } from "@/lib/utils";

export type CreateActivityInput = Omit<Activity, "id" | "createdAt">;

export const activityRepository = {
  getAll(estId: string): Activity[] {
    return getMockStore()
      .getActivities(estId)
      .sort((a, b) => b.activityDate - a.activityDate);
  },

  getByAnimal(estId: string, animalId: string): Activity[] {
    return getMockStore()
      .getActivities(estId)
      .filter((a) => a.animalIds.includes(animalId))
      .sort((a, b) => b.activityDate - a.activityDate);
  },

  getById(estId: string, activityId: string): Activity | undefined {
    return getMockStore().getActivity(estId, activityId);
  },

  create(input: CreateActivityInput): Activity {
    const store = getMockStore();
    const id = generateId("act");
    const activity = {
      ...input,
      id,
      createdAt: now(),
    } as Activity;
    store.setActivity(activity);
    return activity;
  },

  archive(estId: string, activityId: string, archived: boolean): void {
    const store = getMockStore();
    const act = store.getActivity(estId, activityId);
    if (!act) return;
    store.setActivity({ ...act, archived });
  },

  delete(estId: string, activityId: string): void {
    getMockStore().deleteActivity(estId, activityId);
  },

  subscribe(estId: string, fn: () => void): () => void {
    return getMockStore().subscribe(`activities/${estId}`, fn);
  },
};
