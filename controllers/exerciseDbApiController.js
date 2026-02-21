const axios = require("axios");
const Exercise = require("../models/exerciseModel");
// const apiExercisesTemplate = require('../dev-data/data/apiExercisesTemplate');
const catchAsync = require("../utils/catchAsync");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function isGifWorking(url) {
  if (!url) return false;

  try {
    const res = await axios.head(url, { timeout: 5000 });

    return (
      res.status === 200 && res.headers["content-type"]?.startsWith("image")
    );
  } catch {
    return false;
  }
}

exports.importApiExercises = catchAsync(async (req, res, next) => {
  const baseURL = `${process.env.EXERCISE_DB_URL}/api/v1/exercises/filter`;

  let totalImported = 0;

  for (const muscle of process.env.ALLOWED_MUSCLES.split(",")) {
    // muscles before
    try {
      const response = await axios.get(baseURL, {
        params: {
          offset: 0,
          limit: 25, // 🔥 LOWER LIMIT
          muscles: muscle, // ✅ correct key
          equipment: "dumbbell",
        },
      });

      const exercises = response.data.data || [];

      for (const ex of exercises) {
        const gifWorking = await isGifWorking(ex.gifUrl);

        await Exercise.updateOne(
          {
            exerciseId: ex.exerciseId,
          },
          {
            exerciseId: ex.exerciseId,
            name: ex.name,
            gifURL: ex.gifUrl,
            target: ex.targetMuscles?.[0] || muscle,
            instructions: ex.instructions,
            equipment: ex.equipments?.[0] || "dumbbell",
            gifWorking: gifWorking, // ✅ SAVE RESULT HERE
          },
          {
            upsert: true,
          },
        );

        totalImported++;

        await sleep(500); // 🔥 small delay per exercise
      }

      console.log(`Imported ${muscle}: ${exercises.length}`);

      // ⏱️ VERY IMPORTANT
      await sleep(60000); // 🔥 60 seconds per muscle
    } catch (err) {
      console.error(
        `Failed importing muscle ${muscle}`,
        err.response?.status,
        err.response?.data,
      );

      // 🚨 Stop immediately on 429
      if (err.response?.status === 429) {
        return res.status(429).json({
          status: "fail",
          message: "Rate limited. Stop import and wait before retrying.",
        });
      }
    }
  }

  res.status(200).json({
    status: "success",
    imported: totalImported,
  });
});

// exports.importTemplateExercises = catchAsync(async (req, res, next) => {
//     const exercises = Exercises.create({

//     });

//     res.status(200).json({
//         status: 'success',
//         imported: ,
//         data: exercises
//     })
// });
