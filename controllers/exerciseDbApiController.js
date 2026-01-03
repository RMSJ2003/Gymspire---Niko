const axios = require('axios');
const Exercise = require('../models/exerciseModel');
const catchAsync = require('../utils/catchAsync');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const muscles = ["pectorals", "upper back", "delts", "triceps", "biceps", "forearms", "abs", "quads",
    "hamstrings", "glutes", "calves"
];


exports.importApiExercises = catchAsync(async (req, res, next) => {
    const baseURL = `${process.env.EXERCISE_DB_URL}/api/v1/exercises/filter`;

    let totalImported = 0;

    for (const muscle of muscles) {
        try {
            const response = await axios.get(baseURL, {
                params: {
                    offset: 0,
                    limit: 500, // 🔥 LOWER LIMIT
                    muscles: muscle, // ✅ correct key
                    equipment: 'dumbbell'
                }
            });

            const exercises = response.data.data || [];

            for (const ex of exercises) {
                await Exercise.updateOne({
                    exerciseId: ex.exerciseId
                }, {
                    exerciseId: ex.exerciseId,
                    name: ex.name,
                    gifURL: ex.gifUrl,
                    target: ex.targetMuscles?. [0] || muscle,
                    instructions: ex.instructions,
                    equipment: ex.equipments?. [0] || 'dumbbell'
                }, {
                    upsert: true
                });

                totalImported++;
            }

            console.log(`Imported ${muscle}: ${exercises.length}`);

            // ⏱️ VERY IMPORTANT
            await sleep(60000); // 🔥 60 seconds per muscle

        } catch (err) {
            console.error(
                `Failed importing muscle ${muscle}`,
                err.response?.status,
                err.response?.data
            );

            // 🚨 Stop immediately on 429
            if (err.response?.status === 429) {
                return res.status(429).json({
                    status: 'fail',
                    message: 'Rate limited. Stop import and wait before retrying.'
                });
            }
        }
    }

    res.status(200).json({
        status: 'success',
        imported: totalImported
    });
});