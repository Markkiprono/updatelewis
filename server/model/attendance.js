const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    lat: Number,
    lng: Number,
    accuracy: Number,
    ip: String,
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    checkIn: { type: Date, required: true, default: Date.now },
    checkOut: { type: Date, default: null },
    // Hours worked, set at check-out
    hours: { type: Number, default: 0 },
    checkInLocation: locationSchema,
    checkOutLocation: locationSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
