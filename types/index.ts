export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "legs",
  "glutes",
  "core",
  "full_body",
  "cardio",
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const EQUIPMENT_TYPES = [
  "barbell",
  "dumbbell",
  "machine",
  "cable",
  "bodyweight",
  "kettlebell",
  "band",
  "other",
] as const;
export type Equipment = (typeof EQUIPMENT_TYPES)[number];

export const EXERCISE_TYPES = ["compound", "isolation"] as const;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];

export const PROGRAM_STATUSES = ["active", "archived"] as const;
export type ProgramStatus = (typeof PROGRAM_STATUSES)[number];

export const WORKOUT_LOG_STATUSES = ["in_progress", "completed"] as const;
export type WorkoutLogStatus = (typeof WORKOUT_LOG_STATUSES)[number];

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Client-side read shapes: mirror the Mongoose models as they come back over
// JSON (ObjectId -> string, Date -> ISO string).
export interface ProgramRow {
  _id: string;
  name: string;
  description?: string;
  status: ProgramStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlanRow {
  _id: string;
  programId: string;
  name: string;
  day: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseRow {
  _id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  type: ExerciseType;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlanExerciseRow {
  _id: string;
  workoutPlanId: string;
  exerciseId: ExerciseRow;
  order: number;
  targetSets: number;
  targetReps: number;
  targetWeight: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSetRow {
  set: number;
  reps: number;
  weight: number;
  duration?: number;
  rpe?: number;
  rir?: number;
}

export interface WorkoutLogExerciseRow {
  exerciseId: string;
  sets: WorkoutSetRow[];
  note?: string;
}

export interface WorkoutLogRow {
  _id: string;
  userId: string;
  workoutPlanId?: string;
  workoutTemplateId?: string;
  date: string;
  exercises: WorkoutLogExerciseRow[];
  status: WorkoutLogStatus;
  overallNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutTemplateExerciseRow {
  exerciseId: ExerciseRow;
  targetSets: number;
  targetReps: number;
  targetWeight: number;
}

export interface WorkoutTemplateRow {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  exercises: WorkoutTemplateExerciseRow[];
  createdAt: string;
  updatedAt: string;
}

export interface BodyWeightRow {
  _id: string;
  userId: string;
  date: string;
  weight: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalRecordRow {
  _id: string;
  userId: string;
  exerciseId: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  achievedAt: string;
  workoutLogId: string;
  createdAt: string;
  updatedAt: string;
}
