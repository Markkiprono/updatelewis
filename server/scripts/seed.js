// Creates the first admin account in the database set by MONGO_URI.
// Usage: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const ensureAdmin = require("./ensureAdmin");

(async () => {
  await connectDB();
  const result = await ensureAdmin();
  if (!result) console.log("An admin already exists. Nothing to do.");
  else if (result.created) console.log(`Admin created: ${result.email} / ${result.password}`);
  else console.log(`${result.email} is now an admin.`);
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
