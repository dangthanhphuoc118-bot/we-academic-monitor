export function vietnamToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= "1900-01-01" && value <= "9998-12-31";
}

export function addDays(value: string, days: number) {
  if (!validDate(value)) throw new Error("Ngày không hợp lệ.");
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function mondayOf(value: string) {
  if (!validDate(value)) throw new Error("Ngày không hợp lệ.");
  const weekday = new Date(`${value}T00:00:00Z`).getUTCDay();
  return addDays(value, -((weekday + 6) % 7));
}

export function build48Weeks<T extends { id: number; checkedAt: string; createdAt?: string }>(start: string, records: T[], today = vietnamToday()) {
  const first = mondayOf(start);
  return Array.from({ length: 48 }, (_, index) => {
    const startDate = addDays(first, index * 7);
    const endDate = addDays(startDate, 6);
    const items = records.filter((record) => record.checkedAt >= startDate && record.checkedAt <= endDate)
      .sort((a, b) => b.checkedAt.localeCompare(a.checkedAt) || (b.createdAt || "").replace(" ", "T").localeCompare((a.createdAt || "").replace(" ", "T")) || b.id - a.id);
    return { number: index + 1, startDate, endDate, records: items, state: items.length ? "checked" : startDate > today ? "future" : endDate < today ? "missed" : "current" };
  });
}
