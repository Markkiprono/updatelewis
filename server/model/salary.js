const mongoose = require("mongoose");

// One pay entry per completed shift
const salarySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    attendance: { type: mongoose.Schema.Types.ObjectId, ref: "Attendance", required: true },
    hours: { type: Number, required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salary", salarySchema);
