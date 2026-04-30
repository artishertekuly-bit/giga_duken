export const kzt = (n: number) =>
  new Intl.NumberFormat("kk-KZ", { maximumFractionDigits: 0 }).format(n) + " ₸";

export const categoryLabel: Record<string, string> = {
  cpu: "Процессорлар",
  gpu: "Видеокарталар",
  ram: "Жедел жад",
  motherboard: "Материнскалар",
  storage: "Дискілер",
  psu: "Блок питание",
  case: "Корпустар",
  cooling: "Салқындатқыштар",
};
