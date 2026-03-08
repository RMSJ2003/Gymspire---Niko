// Generates default working sets for a new workout log.
// Starts with 1 set — user adds more via "+ Add Set" as needed.
module.exports = () => [
  {
    setNumber: 1,
    type: "working",
    weight: 0,
    reps: 8,
    restSeconds: 180,
  },
];
