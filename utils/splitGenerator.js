// All muscle groups in GymSpire
const ALL_MUSCLES = [
  "Chest", "Upper Back", "Lats", "Deltoids", "Rear Deltoids",
  "Biceps", "Triceps", "Wrist Flexors",
  "Quads", "Hamstrings", "Glutes", "Calves",
  "Abs"
];

// SPLIT TEMPLATES (2–7 days)
const SPLIT_TEMPLATES = {
  2: [
    { day: 1, muscles: ALL_MUSCLES },
    { day: 2, muscles: ALL_MUSCLES }
  ],

  3: [
    { day: 1, muscles: ALL_MUSCLES },
    { day: 2, muscles: ALL_MUSCLES },
    { day: 3, muscles: ALL_MUSCLES }
  ],

  4: [
    { day: 1, muscles: ["Chest", "Upper Back", "Lats", "Deltoids", "Rear Deltoids", "Biceps", "Triceps", "Wrist Flexors", "Abs"] },
    { day: 2, muscles: ["Quads", "Hamstrings", "Glutes", "Calves", "Abs"] },
    { day: 3, muscles: ["Chest", "Upper Back", "Lats", "Deltoids", "Rear Deltoids", "Biceps", "Triceps", "Wrist Flexors", "Abs"] },
    { day: 4, muscles: ["Quads", "Hamstrings", "Glutes", "Calves", "Abs"] },
  ],

  5: [
    { day: 1, muscles: ["Chest", "Upper Back", "Lats", "Deltoids", "Rear Deltoids", "Biceps", "Triceps", "Wrist Flexors", "Abs"] },
    { day: 2, muscles: ["Quads", "Hamstrings", "Glutes", "Calves", "Abs"] },
    { day: 3, muscles: ["Chest", "Deltoids", "Triceps", "Abs"] },
    { day: 4, muscles: ["Upper Back", "Lats", "Rear Deltoids", "Biceps", "Wrist Flexors", "Abs"] },
    { day: 5, muscles: ["Quads", "Hamstrings", "Glutes", "Calves"] },
  ],

  6: [
    { day: 1, muscles: ["Chest", "Deltoids", "Triceps", "Abs"] },
    { day: 2, muscles: ["Upper Back", "Lats", "Rear Deltoids", "Biceps", "Wrist Flexors", "Abs"] },
    { day: 3, muscles: ["Quads", "Hamstrings", "Glutes", "Calves", "Abs"] },
    { day: 4, muscles: ["Chest", "Deltoids", "Triceps", "Abs"] },
    { day: 5, muscles: ["Upper Back", "Lats", "Rear Deltoids", "Biceps", "Wrist Flexors", "Abs"] },
    { day: 6, muscles: ["Quads", "Hamstrings", "Glutes", "Calves", "Abs"] },
  ],

  7: [
    { day: 1, muscles: ALL_MUSCLES },
    { day: 2, muscles: ALL_MUSCLES },
    { day: 3, muscles: ALL_MUSCLES },
    { day: 4, muscles: ALL_MUSCLES },
    { day: 5, muscles: ALL_MUSCLES },
    { day: 6, muscles: ALL_MUSCLES },
    { day: 7, muscles: ALL_MUSCLES },
  ]
};

module.exports = SPLIT_TEMPLATES;
