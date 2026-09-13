export type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function stringValue(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  return normalized.length <= maxLength ? normalized : "";
}

export function emailValue(value: unknown): string {
  const email = stringValue(value, 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export function nullableNumber(value: unknown, maxValue = Number.MAX_SAFE_INTEGER): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > maxValue) {
    return null;
  }
  return value;
}

export function nullableInteger(value: unknown, maxValue = Number.MAX_SAFE_INTEGER): number | null {
  const number = nullableNumber(value, maxValue);
  return number !== null && Number.isInteger(number) ? number : null;
}
