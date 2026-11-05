const User = require("../model/user");
const Attendance = require("../model/attendance");
const Salary = require("../model/salary");

// Sample employees and two weeks of shifts, used only in demo mode
const PEOPLE = [
  ["Amina Wanjiru", "amina@groupwork.local", 150],
  ["Brian Otieno", "brian@groupwork.local", 120],
  ["Cynthia Chebet", "cynthia@groupwork.local", 180],
  ["David Mwangi", "david@groupwork.local", 100],
  ["Esther Njeri", "esther@groupwork.local", 130],
];

// Nairobi CBD area
const BASE = { lat: -1.2864, lng: 36.8172 };

const loadDemoData = async () => {
  if ((await User.countDocuments({ role: "employee" })) > 0) return;

  for (const [i, [name, email, rate]] of PEOPLE.entries()) {
    const user = await User.create({ name, email, password: "password", hourlyRate: rate });
    for (let d = 13; d >= 1; d--) {
      const day = new Date();
      day.setDate(day.getDate() - d);
      if (day.getDay() === 0) continue; // Sundays off
      if ((d + i) % 6 === 0) continue; // some days off
      const checkIn = new Date(day);
      checkIn.setHours(7 + (i % 3), (i * 13 + d * 7) % 60, 0, 0);
      const hours = Math.round((6 + ((i + d) % 5) * 0.75) * 100) / 100;
      const checkOut = new Date(checkIn.getTime() + hours * 36e5);
      const loc = {
        lat: BASE.lat + ((i * 7 + d) % 10) * 0.002,
        lng: BASE.lng + ((i * 3 + d) % 10) * 0.002,
        accuracy: 20,
        ip: "::1",
      };
      const a = await Attendance.create({
        user: user._id, checkIn, checkOut, hours, checkInLocation: loc, checkOutLocation: loc,
      });
      const paid = d > 6;
      await Salary.create({
        user: user._id, attendance: a._id, hours, rate, amount: Math.round(hours * rate * 100) / 100,
        status: paid ? "paid" : "pending", paidAt: paid ? checkOut : null,
      });
    }
    // Two people are on shift right now
    if (i < 2) {
      await Attendance.create({
        user: user._id,
        checkIn: new Date(Date.now() - (i + 1) * 75 * 60 * 1000),
        checkInLocation: { ...BASE, accuracy: 15, ip: "::1" },
      });
    }
  }
};

module.exports = loadDemoData;
