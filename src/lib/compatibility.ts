import type { BuilderProduct, PartSlot } from "@/stores/builderStore";

export interface CompatIssue {
  severity: "error" | "warning" | "ok";
  message: string;
}

type Selected = Partial<Record<PartSlot, BuilderProduct>>;

const toStringSpec = (value: unknown) =>
  value === undefined || value === null ? undefined : String(value).trim();

const spec = (p: BuilderProduct | undefined, k: string) =>
  toStringSpec(p ? ((p.specs as Record<string, unknown>)[k]) : undefined);

const getSpec = (p: BuilderProduct | undefined, keys: string[]) =>
  keys.reduce<string | undefined>((found, key) => found ?? spec(p, key), undefined);

// DDR type compat: handle "DDR4/DDR5" combos
const ddrMatches = (a?: string, b?: string) => {
  if (!a || !b) return false;
  const A = a.split("/").map((s) => s.trim());
  const B = b.split("/").map((s) => s.trim());
  return A.some((x) => B.includes(x));
};

const socketMatches = (a?: string, b?: string) => {
  if (!a || !b) return false;
  const A = a.split("/").map((s) => s.trim());
  const B = b.split("/").map((s) => s.trim());
  return A.some((x) => B.includes(x));
};

const formMatches = (caseForm?: string, mbForm?: string) => {
  if (!caseForm || !mbForm) return false;
  const supported = caseForm.split("/").map((s) => s.trim());
  // ATX case supports ATX, mATX, mini-ITX
  // mATX case supports mATX, mini-ITX (not ATX)
  const hierarchy: Record<string, string[]> = {
    ATX: ["ATX", "mATX", "mini-ITX"],
    mATX: ["mATX", "mini-ITX"],
    "mini-ITX": ["mini-ITX"],
  };
  return supported.some((f) => hierarchy[f]?.includes(mbForm));
};

export function checkCompatibility(sel: Selected): CompatIssue[] {
  const issues: CompatIssue[] = [];
  const { cpu, motherboard, ram, gpu, cooling, psu, case: pcCase } = sel;

  if (cpu && motherboard) {
    const cpuSocket = spec(cpu, "socket") as string | undefined;
    const mbSocket = spec(motherboard, "socket") as string | undefined;
    const ok = socketMatches(cpuSocket, mbSocket);
    issues.push({
      severity: ok ? "ok" : cpuSocket && mbSocket ? "error" : "warning",
      message: ok
        ? `CPU ↔ Материнская плата сокет: сәйкес (${cpuSocket})`
        : cpuSocket && mbSocket
        ? `CPU ↔ Материнская плата сокеті сәйкес емес: ${cpuSocket} vs ${mbSocket}`
        : `CPU немесе материнская сокеті белгісіз: CPU=${cpuSocket ?? "белгісіз"}, материнская=${mbSocket ?? "белгісіз"}`,
    });
  }

  if (ram && motherboard) {
    const ramDdr = getSpec(ram, ["ddr", "type"]);
    const mbDdr = getSpec(motherboard, ["ddr", "type"]);
    const ok = ddrMatches(ramDdr, mbDdr);
    issues.push({
      severity: ok ? "ok" : ramDdr && mbDdr ? "error" : "warning",
      message: ok
        ? `RAM ↔ Материнская плата DDR типі: сәйкес`
        : ramDdr && mbDdr
        ? `RAM DDR типі сәйкес емес: ${ramDdr} vs материнская ${mbDdr}`
        : `RAM немесе материнская DDR типі белгісіз: RAM=${ramDdr ?? "белгісіз"}, материнская=${mbDdr ?? "белгісіз"}`,
    });
  }

  if (psu) {
    const psuW = Number(spec(psu, "wattage") ?? 0);
    const gpuW = Number(spec(gpu, "power") ?? 0);
    const cpuW = Number(spec(cpu, "tdp") ?? 0);
    const needed = gpuW + cpuW + 150; // headroom
    if (psuW > 0 && needed > 0) {
      const ok = psuW >= needed;
      issues.push({
        severity: ok ? "ok" : "error",
        message: ok
          ? `Блок питание қуаты жеткілікті (${psuW}W ≥ ${needed}W қажет)`
          : `Блок питание қуаты жеткіліксіз: ${psuW}W, керек ~${needed}W`,
      });
    }
  }

  if (cooling && cpu) {
    const coolingSocket = spec(cooling, "socket") as string | undefined;
    const cpuSocket = spec(cpu, "socket") as string | undefined;
    const ok = socketMatches(coolingSocket, cpuSocket);
    issues.push({
      severity: ok ? "ok" : coolingSocket && cpuSocket ? "error" : "warning",
      message: ok
        ? `Салқындатқыш CPU сокетімен сәйкес`
        : coolingSocket && cpuSocket
        ? `Салқындатқыш CPU сокетін қолдамайды: ${coolingSocket} vs ${cpuSocket}`
        : `Салқындатқыш немесе CPU сокеті белгісіз: cooling=${coolingSocket ?? "белгісіз"}, CPU=${cpuSocket ?? "белгісіз"}`,
    });
  }

  if (pcCase && motherboard) {
    const caseForm = spec(pcCase, "form") as string | undefined;
    const mbForm = spec(motherboard, "form") as string | undefined;
    const ok = formMatches(caseForm, mbForm);
    issues.push({
      severity: ok ? "ok" : caseForm && mbForm ? "error" : "warning",
      message: ok
        ? `Корпус форм-факторы сәйкес (${caseForm} ⊇ ${mbForm})`
        : caseForm && mbForm
        ? `Корпусқа материнская плата сыймайды: ${caseForm} vs ${mbForm}`
        : `Корпус немесе материнская формасы белгісіз: case=${caseForm ?? "белгісіз"}, материнская=${mbForm ?? "белгісіз"}`,
    });
  }

  return issues;
}

export function overallOk(issues: CompatIssue[]) {
  return issues.length > 0 && issues.every((i) => i.severity === "ok");
}
