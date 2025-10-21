const mongoose = require('mongoose');

// These 2 lines of code should be in the top cuz app can only access dotenv if it is already configured.
const dotenv = require('dotenv');
dotenv.config({
    path: './config.env'
});

// This only happen once, other files can access the env variables cuz we are in the same process.
dotenv.config({
    path: './config.env'
});

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    .then(() => console.log('DB connection successful!'));

const app = require('./app');


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});