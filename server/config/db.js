const mongoose = require("mongoose");

// Connects to MONGO_URI. With no MONGO_URI set (or DEMO=true), starts a throwaway
// in-memory database (demo mode) so the app runs with zero setup. Demo data is lost on restart.
const connectDB = async () => {
  let uri = process.env.DEMO === "true" ? "" : process.env.MONGO_URI;
  let demo = false;

  if (!uri) {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mem = await MongoMemoryServer.create();
    uri = mem.getUri();
    demo = true;
  }

  await mongoose.connect(uri);
  console.log(demo ? "MongoDB: in-memory demo database" : "MongoDB connected");
  return { demo };
};

module.exports = connectDB;
