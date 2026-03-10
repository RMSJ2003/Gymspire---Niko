exports.enforceMuscleRest = ({ lastWorkoutLog, targets, minHours = 24 }) => {
  // 1️⃣ If the user has never worked out before,
  // there is nothing to enforce — allow the action.
  if (!lastWorkoutLog) return;

  // 2️⃣ If the last workout is still ongoing, skip the rest rule.
  // The user is currently in a session — don't block a new one
  // based on an unfinished log (e.g. stale/abandoned workout).
  if (lastWorkoutLog.status === "ongoing") return;

  // 3️⃣ Calculate how many hours have passed
  // since the user's most recent COMPLETED workout.
  const hoursSince = (Date.now() - lastWorkoutLog.date.getTime()) / 36e5;

  // 4️⃣ If the required rest time has already passed
  // (default: 24 hours), allow the action.
  if (hoursSince >= minHours) return;

  // 5️⃣ Extract the muscle groups that were trained
  // in the most recent workout.
  const trained = lastWorkoutLog.exercises.map((ex) => ex.target);

  // 6️⃣ Compare the muscles the user wants to train now
  // with the muscles trained in the last workout.
  // Any overlap means insufficient recovery.
  const conflicts = targets.filter((t) => trained.includes(t));

  // 7️⃣ If there are overlapping muscle groups,
  // block the action by throwing an error.
  // The controller or middleware will catch this.
  if (conflicts.length) {
    throw new Error(
      `You trained these muscles ${Math.floor(
        hoursSince,
      )} hours ago: ${conflicts.join(", ")}`,
    );
  }
};
