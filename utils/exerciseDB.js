const axios = require('axios');

exports.getExercisesByMuscle = async (muscle) => {
    // Note that exerciseDB with rapidapi uses different endpoints. Example:
    // https://exercisedb.p.rapidapi.com/exercises/target/pectorals

    const url = `${process.env.EXERCISE_DB_URL}/exercises/target/${muscle}`;

    const res = await axios.get(url, {
        headers: {
            'x-rapidapi-key': process.env.EXERCISE_DB_KEY,
            'x-rapidapi-host': process.env.EXERCISE_DB_HOST
        }
    });

    return res.data; // Array of exercises
};