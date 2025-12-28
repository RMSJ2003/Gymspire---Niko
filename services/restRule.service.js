exports.enforceMuscleRest = ({ lastWorkoutLog, targets, minHours = 24 }) => {

  // 1️⃣ If the user has never worked out before,
  // there is nothing to enforce — allow the action.
  if (!lastWorkoutLog) return;

  // 2️⃣ Calculate how many hours have passed
  // since the user's most recent workout.
  // 36e5 = number of milliseconds in one hour.
  const hoursSince =
    (Date.now() - lastWorkoutLog.date.getTime()) / 36e5;

  // 3️⃣ If the required rest time has already passed
  // (default: 24 hours), allow the action.
  if (hoursSince >= minHours) return;

  // 4️⃣ Extract the muscle groups that were trained
  // in the most recent workout.
  const trained = lastWorkoutLog.exercises.map(
    ex => ex.target
  );

  // 5️⃣ Compare the muscles the user wants to train now
  // with the muscles trained in the last workout.
  // Any overlap means insufficient recovery.
  const conflicts = targets.filter(
    t => trained.includes(t)
  );

  // 6️⃣ If there are overlapping muscle groups,
  // block the action by throwing an error.
  // The controller or middleware will catch this.
  if (conflicts.length) {
    throw new Error(
      `You trained these muscles ${Math.floor(
        hoursSince
      )} hours ago: ${conflicts.join(', ')}`
    );
  }
};
