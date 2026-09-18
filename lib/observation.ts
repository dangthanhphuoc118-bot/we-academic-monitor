export const observationGroups = [
  { label: "Academic", criteria: [
    { key: "englishUse", label: "English Use" },
    { key: "classroomControl", label: "Classroom Control" },
    { key: "studentEngagement", label: "Student Engagement" },
    { key: "learningInProgress", label: "Learning in Progress" },
  ] },
  { label: "Attitude", criteria: [
    { key: "phoneUse", label: "Phone Use" },
    { key: "leavingClass", label: "Leaving Class" },
    { key: "professionalBehaviour", label: "Professional Behaviour" },
  ] },
] as const;

export type ObservationKey = (typeof observationGroups)[number]["criteria"][number]["key"];
export type ObservationItems = Record<ObservationKey, { checked: boolean; note: string }>;
export type TeacherObservation = {
  id: number; teacherId: number | null; teacherName: string; teacherRole: string;
  classId: number | null; className: string; observerName: string;
  observedAt: string; observedTime: string; itemsJson: string;
  createdAt: string; updatedAt: string;
};

export function emptyObservation(): ObservationItems {
  return Object.fromEntries(observationGroups.flatMap((group) => group.criteria.map(({ key }) => [key, { checked: false, note: "" }]))) as ObservationItems;
}

export function validateObservationItems(value: unknown): ObservationItems {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Thiếu nội dung Observation.");
  const items = emptyObservation();
  for (const key of Object.keys(items) as ObservationKey[]) {
    const item = (value as Record<string, unknown>)[key];
    if (!item || typeof item !== "object") throw new Error("Thiếu tiêu chí Observation.");
    const { checked, note } = item as Record<string, unknown>;
    if (typeof checked !== "boolean" || typeof note !== "string" || note.length > 4000) throw new Error("Mỗi tiêu chí cần ô chọn và ghi chú tối đa 4.000 ký tự.");
    items[key] = { checked, note: note.trim() };
  }
  if (!Object.values(items).some((item) => item.checked || item.note)) throw new Error("Vui lòng chọn hoặc ghi chú ít nhất một tiêu chí.");
  return items;
}

export function readObservation(value: string): ObservationItems {
  try { return validateObservationItems(JSON.parse(value)); } catch { return emptyObservation(); }
}
