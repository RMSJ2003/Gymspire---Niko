// Generates default warm-up + working sets
// This is a pure function (no side effects)
module.exports = () => ([
    // Warm-ups
    {
        setNumber: 1,
        type: 'warmup',
        weight: 0,
        reps: 0,
        restSeconds: 60
    },
    {
        setNumber: 2,
        type: 'warmup',
        weight: 0,
        reps: 0,
        restSeconds: 60
    },
    {
        setNumber: 3,
        type: 'warmup',
        weight: 0,
        reps: 0,
        restSeconds: 180
    },

    // Working sets
    {
        setNumber: 4,
        type: 'working',
        weight: 0,
        reps: 0,
        restSeconds: 240
    },
    {
        setNumber: 5,
        type: 'working',
        weight: 0,
        reps: 0,
        restSeconds: 240
    },
    {
        setNumber: 6,
        type: 'working',
        weight: 0,
        reps: 0,
        restSeconds: 240
    }
]);
