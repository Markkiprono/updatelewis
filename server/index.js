const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const UserRoutes = require("./routes/user");
const AttendanceRoutes = require("./routes/attendance");
const SalaryRoutes = require("./routes/salary");
const { errorHandler } = require("./middleware/Errohandler");
const cookieParser = require("cookie-parser");
dotenv.config();
connectDB();
//middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.use(errorHandler);
//error handler
//routes
app.get("/", (req, res) => {
  res.status(201).json("Hello World");
});
app.use("/api/users", UserRoutes);
app.use("/api/attendance", AttendanceRoutes);
app.use("/api/salary", SalaryRoutes);
//server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
