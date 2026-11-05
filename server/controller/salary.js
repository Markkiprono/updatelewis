const Salary = require("../model/salary");
const { asyncHandler, HttpError } = require("../middleware/errors");

const mine = asyncHandler(async (req, res) => {
  const records = await Salary.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json(records);
});

// Admin: every pay entry, newest first
const list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.user) filter.user = req.query.user;
  const records = await Salary.find(filter)
    .sort({ createdAt: -1 })
    .limit(500)
    .populate("user", "name email avatar");
  res.json(records.filter((r) => r.user));
});

// Admin: totals per employee
const summary = asyncHandler(async (_req, res) => {
  const rows = await Salary.aggregate([
    {
      $group: {
        _id: "$user",
        hours: { $sum: "$hours" },
        total: { $sum: "$amount" },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0] } },
        paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0] } },
        shifts: { $sum: 1 },
      },
    },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    {
      $project: {
        hours: 1, total: 1, pending: 1, paid: 1, shifts: 1,
        "user._id": 1, "user.name": 1, "user.email": 1, "user.avatar": 1, "user.hourlyRate": 1,
      },
    },
    { $sort: { pending: -1, total: -1 } },
  ]);
  res.json(rows);
});

const markPaid = asyncHandler(async (req, res) => {
  const record = await Salary.findById(req.params.id);
  if (!record) throw new HttpError(404, "Pay entry not found");
  record.status = "paid";
  record.paidAt = new Date();
  await record.save();
  res.json(record);
});

// Admin: pay everything pending for one employee
const payUser = asyncHandler(async (req, res) => {
  const result = await Salary.updateMany(
    { user: req.params.userId, status: "pending" },
    { status: "paid", paidAt: new Date() }
  );
  res.json({ updated: result.modifiedCount });
});

module.exports = { mine, list, summary, markPaid, payUser };
