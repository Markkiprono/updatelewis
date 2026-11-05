const Attendance = require("../model/attendance");
const Salary = require("../model/salary");
const User = require("../model/user");
const { asyncHandler, HttpError } = require("../middleware/errors");

const round2 = (n) => Math.round(n * 100) / 100;

const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// Monday 00:00 of the current week
const startOfWeek = () => {
  const d = startOfDay();
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d;
};

const readLocation = (req) => {
  const { lat, lng, accuracy } = req.body || {};
  const loc = { ip: req.ip };
  if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && lat !== null && lng !== null) {
    loc.lat = Number(lat);
    loc.lng = Number(lng);
    if (Number.isFinite(Number(accuracy))) loc.accuracy = Math.round(Number(accuracy));
  }
  return loc;
};

// ---------- employee ----------

const checkIn = asyncHandler(async (req, res) => {
  const open = await Attendance.findOne({ user: req.user._id, checkOut: null });
  if (open) throw new HttpError(409, "You're already checked in");

  const record = await Attendance.create({
    user: req.user._id,
    checkIn: new Date(),
    checkInLocation: readLocation(req),
  });
  res.status(201).json(record);
});

const checkOut = asyncHandler(async (req, res) => {
  const record = await Attendance.findOne({ user: req.user._id, checkOut: null });
  if (!record) throw new HttpError(409, "You're not checked in");

  record.checkOut = new Date();
  record.hours = round2((record.checkOut - record.checkIn) / 36e5);
  record.checkOutLocation = readLocation(req);
  await record.save();

  const rate = req.user.hourlyRate;
  const salary = await Salary.create({
    user: req.user._id,
    attendance: record._id,
    hours: record.hours,
    rate,
    amount: round2(record.hours * rate),
  });
  res.json({ attendance: record, salary });
});

const mine = asyncHandler(async (req, res) => {
  const uid = req.user._id;
  const [open, records, week, today, pay] = await Promise.all([
    Attendance.findOne({ user: uid, checkOut: null }),
    Attendance.find({ user: uid }).sort({ checkIn: -1 }).limit(30),
    Attendance.aggregate([
      { $match: { user: uid, checkIn: { $gte: startOfWeek() } } },
      { $group: { _id: null, hours: { $sum: "$hours" } } },
    ]),
    Attendance.aggregate([
      { $match: { user: uid, checkIn: { $gte: startOfDay() } } },
      { $group: { _id: null, hours: { $sum: "$hours" } } },
    ]),
    Salary.aggregate([
      { $match: { user: uid } },
      { $group: { _id: "$status", amount: { $sum: "$amount" } } },
    ]),
  ]);
  const payBy = Object.fromEntries(pay.map((p) => [p._id, p.amount]));
  res.json({
    open,
    records,
    stats: {
      hoursToday: round2(today[0]?.hours || 0),
      hoursThisWeek: round2(week[0]?.hours || 0),
      pending: round2(payBy.pending || 0),
      paid: round2(payBy.paid || 0),
      hourlyRate: req.user.hourlyRate,
    },
  });
});

// ---------- admin ----------

const list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.user) filter.user = req.query.user;
  if (req.query.status === "open") filter.checkOut = null;
  if (req.query.status === "closed") filter.checkOut = { $ne: null };
  const records = await Attendance.find(filter)
    .sort({ checkIn: -1 })
    .limit(500)
    .populate("user", "name email avatar");
  res.json(records.filter((r) => r.user));
});

const overview = asyncHandler(async (_req, res) => {
  const weekStart = startOfWeek();
  const days = 7;
  const chartStart = startOfDay();
  chartStart.setDate(chartStart.getDate() - (days - 1));

  const [employees, onShift, weekHours, pending, recent, daily] = await Promise.all([
    User.countDocuments(),
    Attendance.find({ checkOut: null }).populate("user", "name email avatar").sort({ checkIn: 1 }),
    Attendance.aggregate([
      { $match: { checkIn: { $gte: weekStart } } },
      { $group: { _id: null, hours: { $sum: "$hours" } } },
    ]),
    Salary.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: null, amount: { $sum: "$amount" } } },
    ]),
    Attendance.find({}).sort({ updatedAt: -1 }).limit(8).populate("user", "name email avatar"),
    Attendance.find({ checkIn: { $gte: chartStart } }).select("checkIn hours").lean(),
  ]);

  const perDay = Array.from({ length: days }, (_, i) => {
    const d = new Date(chartStart);
    d.setDate(d.getDate() + i);
    return { date: d.toISOString(), hours: 0 };
  });
  for (const r of daily) {
    const idx = Math.floor((startOfDay(r.checkIn) - chartStart) / 864e5);
    if (perDay[idx]) perDay[idx].hours = round2(perDay[idx].hours + r.hours);
  }

  res.json({
    employees,
    onShift: onShift.filter((r) => r.user),
    hoursThisWeek: round2(weekHours[0]?.hours || 0),
    pendingPayroll: round2(pending[0]?.amount || 0),
    recent: recent.filter((r) => r.user),
    perDay,
  });
});

module.exports = { checkIn, checkOut, mine, list, overview };
