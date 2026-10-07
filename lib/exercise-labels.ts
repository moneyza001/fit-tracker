import type { Equipment, ExerciseType, MuscleGroup } from "@/types";

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: "หน้าอก",
  back: "หลัง",
  shoulders: "ไหล่",
  biceps: "ไบเซ็ป",
  triceps: "ไตรเซ็ป",
  legs: "ขา",
  glutes: "สะโพก",
  core: "แกนกลางลำตัว",
  full_body: "ทั้งตัว",
  cardio: "คาร์ดิโอ",
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: "บาร์เบล",
  dumbbell: "ดัมเบล",
  machine: "เครื่อง",
  cable: "เคเบิล",
  bodyweight: "น้ำหนักตัว",
  kettlebell: "เคตเทิลเบล",
  band: "ยางยืด",
  other: "อื่นๆ",
};

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  compound: "คอมพาวด์",
  isolation: "ไอโซเลชัน",
};
