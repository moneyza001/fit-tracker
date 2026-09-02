import type { Equipment, ExerciseType, MuscleGroup } from "@/types";
import { Exercise } from "@/models";

interface SeedExercise {
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  type: ExerciseType;
}

// Starter library given to every new account so they can build a program
// immediately instead of typing out an exercise library from scratch.
export const DEFAULT_EXERCISES: SeedExercise[] = [
  // Chest
  { name: "Barbell Bench Press", muscleGroup: "chest", equipment: "barbell", type: "compound" },
  { name: "Incline Barbell Bench Press", muscleGroup: "chest", equipment: "barbell", type: "compound" },
  { name: "Dumbbell Bench Press", muscleGroup: "chest", equipment: "dumbbell", type: "compound" },
  { name: "Incline Dumbbell Press", muscleGroup: "chest", equipment: "dumbbell", type: "compound" },
  { name: "Push-Up", muscleGroup: "chest", equipment: "bodyweight", type: "compound" },
  { name: "Cable Fly", muscleGroup: "chest", equipment: "cable", type: "isolation" },
  { name: "Pec Deck", muscleGroup: "chest", equipment: "machine", type: "isolation" },

  // Back
  { name: "Deadlift", muscleGroup: "back", equipment: "barbell", type: "compound" },
  { name: "Pull-Up", muscleGroup: "back", equipment: "bodyweight", type: "compound" },
  { name: "Lat Pulldown", muscleGroup: "back", equipment: "cable", type: "compound" },
  { name: "Barbell Row", muscleGroup: "back", equipment: "barbell", type: "compound" },
  { name: "Dumbbell Row", muscleGroup: "back", equipment: "dumbbell", type: "compound" },
  { name: "Seated Cable Row", muscleGroup: "back", equipment: "cable", type: "compound" },
  { name: "T-Bar Row", muscleGroup: "back", equipment: "machine", type: "compound" },

  // Shoulders
  { name: "Overhead Press", muscleGroup: "shoulders", equipment: "barbell", type: "compound" },
  { name: "Dumbbell Shoulder Press", muscleGroup: "shoulders", equipment: "dumbbell", type: "compound" },
  { name: "Lateral Raise", muscleGroup: "shoulders", equipment: "dumbbell", type: "isolation" },
  { name: "Front Raise", muscleGroup: "shoulders", equipment: "dumbbell", type: "isolation" },
  { name: "Face Pull", muscleGroup: "shoulders", equipment: "cable", type: "isolation" },
  { name: "Rear Delt Fly", muscleGroup: "shoulders", equipment: "dumbbell", type: "isolation" },

  // Biceps
  { name: "Barbell Curl", muscleGroup: "biceps", equipment: "barbell", type: "isolation" },
  { name: "Dumbbell Curl", muscleGroup: "biceps", equipment: "dumbbell", type: "isolation" },
  { name: "Hammer Curl", muscleGroup: "biceps", equipment: "dumbbell", type: "isolation" },
  { name: "Cable Curl", muscleGroup: "biceps", equipment: "cable", type: "isolation" },
  { name: "Preacher Curl", muscleGroup: "biceps", equipment: "machine", type: "isolation" },

  // Triceps
  { name: "Tricep Pushdown", muscleGroup: "triceps", equipment: "cable", type: "isolation" },
  { name: "Skull Crusher", muscleGroup: "triceps", equipment: "barbell", type: "isolation" },
  { name: "Overhead Tricep Extension", muscleGroup: "triceps", equipment: "dumbbell", type: "isolation" },
  { name: "Close-Grip Bench Press", muscleGroup: "triceps", equipment: "barbell", type: "compound" },
  { name: "Dips", muscleGroup: "triceps", equipment: "bodyweight", type: "compound" },

  // Legs
  { name: "Barbell Squat", muscleGroup: "legs", equipment: "barbell", type: "compound" },
  { name: "Front Squat", muscleGroup: "legs", equipment: "barbell", type: "compound" },
  { name: "Leg Press", muscleGroup: "legs", equipment: "machine", type: "compound" },
  { name: "Romanian Deadlift", muscleGroup: "legs", equipment: "barbell", type: "compound" },
  { name: "Leg Curl", muscleGroup: "legs", equipment: "machine", type: "isolation" },
  { name: "Leg Extension", muscleGroup: "legs", equipment: "machine", type: "isolation" },
  { name: "Walking Lunge", muscleGroup: "legs", equipment: "dumbbell", type: "compound" },
  { name: "Bulgarian Split Squat", muscleGroup: "legs", equipment: "dumbbell", type: "compound" },
  { name: "Calf Raise", muscleGroup: "legs", equipment: "machine", type: "isolation" },

  // Glutes
  { name: "Hip Thrust", muscleGroup: "glutes", equipment: "barbell", type: "compound" },
  { name: "Glute Bridge", muscleGroup: "glutes", equipment: "bodyweight", type: "compound" },
  { name: "Cable Kickback", muscleGroup: "glutes", equipment: "cable", type: "isolation" },

  // Core
  { name: "Plank", muscleGroup: "core", equipment: "bodyweight", type: "isolation" },
  { name: "Hanging Leg Raise", muscleGroup: "core", equipment: "bodyweight", type: "isolation" },
  { name: "Cable Crunch", muscleGroup: "core", equipment: "cable", type: "isolation" },
  { name: "Russian Twist", muscleGroup: "core", equipment: "bodyweight", type: "isolation" },
  { name: "Ab Wheel Rollout", muscleGroup: "core", equipment: "other", type: "isolation" },

  // Full body
  { name: "Kettlebell Swing", muscleGroup: "full_body", equipment: "kettlebell", type: "compound" },
  { name: "Clean and Jerk", muscleGroup: "full_body", equipment: "barbell", type: "compound" },
  { name: "Burpee", muscleGroup: "full_body", equipment: "bodyweight", type: "compound" },

  // Cardio
  { name: "Rowing Machine", muscleGroup: "cardio", equipment: "machine", type: "compound" },
  { name: "Jump Rope", muscleGroup: "cardio", equipment: "other", type: "compound" },
];

export async function seedDefaultExercises(userId: string): Promise<void> {
  await Exercise.insertMany(
    DEFAULT_EXERCISES.map((exercise) => ({ ...exercise, userId }))
  );
}
