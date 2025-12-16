const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../../models/userModel');
const WorkoutPlan = require('../../models/workoutPlanModel');
const WorkoutLog = require('../../models/workoutLogModel');

dotenv.config({
    path: './config.env'
});

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

main().catch(err => console.log(err));

// Connect to database
async function main() {
    await mongoose.connect(DB, {
        // Don't worry about these as these are just to solve the deprecation warnings.
        useUnifiedTopology: true,
        useNewUrlParser: true,
    });
    console.log('DB connection successful!');
}

// READ JSON FILE 
// __dirname contains the absolute path of the directory where the current JavaScript file is located
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const workoutLogs = JSON.parse(fs.readFileSync(`${__dirname}/workoutLogs.json`, 'utf-8'));
const workoutPlans = JSON.parse(fs.readFileSync(`${__dirname}/workoutPlan.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
    try {
        await User.create(users, {
            validateBeforeSave: false
        });
        await WorkoutLog.create(workoutLogs, {
            validateBeforeSave: false
        });
        await WorkoutPlan.create(workoutPlans, {
            validateBeforeSave: false
        });
        console.log('Data successfully loaded!');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
    try {
        await User.deleteMany();
        await WorkoutLog.deleteMany();
        await WorkoutPlan.deleteMany();
        console.log('Data successfully deleted!');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

// process.argv is the command you inputted
if (process.argv[2] === '--import') importData();
if (process.argv[2] === '--delete') deleteData();