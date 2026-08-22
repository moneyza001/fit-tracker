// One-off utility: copy Exercises / Programs / WorkoutPlans / WorkoutPlanExercises
// from one user to another, remapping all internal references to new _ids.
//
// Usage:
//   MONGODB_URI="<your Atlas connection string>" node scripts/copy-user-structure.js \
//     --from=<sourceUserId> --to=<targetUserId>
//
// Does NOT copy WorkoutLogs, BodyWeight, WorkoutTemplates, or PersonalRecords —
// only the reusable "structure" (exercise library, programs, plans).

const mongoose = require("mongoose");

function getArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : null;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  const fromUserId = getArg("from");
  const toUserId = getArg("to");

  if (!uri) throw new Error("Set MONGODB_URI in the environment");
  if (!fromUserId || !toUserId) {
    throw new Error("Usage: node scripts/copy-user-structure.js --from=<userId> --to=<userId>");
  }

  await mongoose.connect(uri, { bufferCommands: false });
  const db = mongoose.connection.db;

  const users = db.collection("users");
  const [fromUser, toUser] = await Promise.all([
    users.findOne({ _id: new mongoose.Types.ObjectId(fromUserId) }),
    users.findOne({ _id: new mongoose.Types.ObjectId(toUserId) }),
  ]);
  if (!fromUser) throw new Error(`Source user ${fromUserId} not found`);
  if (!toUser) throw new Error(`Target user ${toUserId} not found`);

  console.log(`Copying from ${fromUser.email} -> ${toUser.email}`);

  const exercises = db.collection("exercises");
  const programs = db.collection("programs");
  const workoutPlans = db.collection("workoutplans");
  const workoutPlanExercises = db.collection("workoutplanexercises");

  // --- Exercises ---
  const exerciseIdMap = new Map();
  const sourceExercises = await exercises.find({ userId: fromUserId }).toArray();
  for (const doc of sourceExercises) {
    const { _id, createdAt, updatedAt, __v, ...rest } = doc;
    const { insertedId } = await exercises.insertOne({ ...rest, userId: toUserId });
    exerciseIdMap.set(_id.toString(), insertedId);
  }
  console.log(`Exercises copied: ${sourceExercises.length}`);

  // --- Programs ---
  const programIdMap = new Map();
  const sourcePrograms = await programs.find({ userId: fromUserId }).toArray();
  for (const doc of sourcePrograms) {
    const { _id, createdAt, updatedAt, __v, ...rest } = doc;
    const { insertedId } = await programs.insertOne({ ...rest, userId: toUserId });
    programIdMap.set(_id.toString(), insertedId);
  }
  console.log(`Programs copied: ${sourcePrograms.length}`);

  // --- WorkoutPlans ---
  const planIdMap = new Map();
  const sourcePlans = await workoutPlans.find({ userId: fromUserId }).toArray();
  let skippedPlans = 0;
  for (const doc of sourcePlans) {
    const { _id, createdAt, updatedAt, __v, programId, ...rest } = doc;
    const newProgramId = programIdMap.get(programId?.toString());
    if (!newProgramId) {
      skippedPlans++;
      continue;
    }
    const { insertedId } = await workoutPlans.insertOne({
      ...rest,
      programId: newProgramId,
      userId: toUserId,
    });
    planIdMap.set(_id.toString(), insertedId);
  }
  console.log(`Workout plans copied: ${sourcePlans.length - skippedPlans} (skipped: ${skippedPlans})`);

  // --- WorkoutPlanExercises ---
  const sourcePlanExercises = await workoutPlanExercises.find({ userId: fromUserId }).toArray();
  let copiedPlanExercises = 0;
  let skippedPlanExercises = 0;
  for (const doc of sourcePlanExercises) {
    const { _id, createdAt, updatedAt, __v, workoutPlanId, exerciseId, ...rest } = doc;
    const newPlanId = planIdMap.get(workoutPlanId?.toString());
    const newExerciseId = exerciseIdMap.get(exerciseId?.toString());
    if (!newPlanId || !newExerciseId) {
      skippedPlanExercises++;
      continue;
    }
    await workoutPlanExercises.insertOne({
      ...rest,
      workoutPlanId: newPlanId,
      exerciseId: newExerciseId,
      userId: toUserId,
    });
    copiedPlanExercises++;
  }
  console.log(
    `Workout plan exercises copied: ${copiedPlanExercises} (skipped: ${skippedPlanExercises})`
  );

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
