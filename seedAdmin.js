const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/userModel");

// 👇 explicitly load config.env
dotenv.config({ path: "./config.env" });

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

(async () => {
  await User.create({
    email: "admin@iacademy.ph",
    username: "gymspire_admin",
    password: "Admin1234",
    passwordConfirm: "Admin1234",
    userType: "admin",
    pfpUrl: "admin picture",
  });

  console.log("✅ Admin created");
  process.exit();
})();
