export function calculateVolume(weight: number, reps: number): number {
  return weight * reps;
}

export function calculateEstimated1RM(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}
