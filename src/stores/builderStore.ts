import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PartSlot =
  | "cpu" | "motherboard" | "ram" | "gpu"
  | "storage" | "cooling" | "psu" | "case";

export interface BuilderProduct {
  id: string;
  name_kz: string;
  slug: string;
  price: number;
  image_url: string | null;
  specs: Record<string, unknown>;
  category_slug: string;
  brand?: string | null;
}

type Selected = Partial<Record<PartSlot, BuilderProduct>>;

interface BuilderState {
  selected: Selected;
  budget: number;
  autoMode: boolean;
  setPart: (slot: PartSlot, product: BuilderProduct | null) => void;
  clear: () => void;
  setBudget: (n: number) => void;
  setAutoMode: (b: boolean) => void;
  total: () => number;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      selected: {},
      budget: 500000,
      autoMode: false,
      setPart: (slot, product) =>
        set((s) => {
          const next = { ...s.selected };
          if (product) next[slot] = product;
          else delete next[slot];
          return { selected: next };
        }),
      clear: () => set({ selected: {} }),
      setBudget: (n) => set({ budget: n }),
      setAutoMode: (b) => set({ autoMode: b }),
      total: () =>
        Object.values(get().selected).reduce((sum, p) => sum + (p?.price ?? 0), 0),
    }),
    { name: "giga-builder" }
  )
);

export const SLOT_LABELS_KZ: Record<PartSlot, string> = {
  cpu: "Процессор",
  motherboard: "Материнская плата",
  ram: "Жедел жад",
  gpu: "Видеокарта",
  storage: "Диск",
  cooling: "Салқындатқыш",
  psu: "Блок питание",
  case: "Корпус",
};

export const SLOT_ORDER: PartSlot[] = [
  "cpu", "motherboard", "ram", "gpu", "storage", "cooling", "psu", "case",
];

export const BUDGET_SPLIT: Record<PartSlot, number> = {
  cpu: 0.22, gpu: 0.30, ram: 0.09, motherboard: 0.13,
  storage: 0.08, cooling: 0.06, psu: 0.07, case: 0.05,
};
