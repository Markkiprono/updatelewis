const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const User = require("../model/user");
const Attendance = require("../model/attendance");
const Salary = require("../model/salary");
const { asyncHandler, HttpError } = require("../middleware/errors");
const { UPLOAD_DIR } = require("../middleware/upload");

// Readable temporary password, e.g. "kq7m-x2pd"
const tempPassword = () => {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  const pick = () => chars[crypto.randomInt(chars.length)];
  return `${Array.from({ length: 4 }, pick).join("")}-${Array.from({ length: 4 }, pick).join("")}`;
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const removeAvatarFile = (avatar) => {
  if (!avatar || !avatar.startsWith("uploads/")) return;
  fs.unlink(path.join(UPLOAD_DIR, path.basename(avatar)), () => {});
};

// ---------- auth ----------

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw new HttpError(400, "Enter your email and password");

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new HttpError(401, "Wrong email or password");
  }
  res.json({ token: user.getJwtToken(), user });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 6) {
    throw new HttpError(400, "New password must be at least 6 characters");
  }
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword || ""))) {
    throw new HttpError(400, "Current password is wrong");
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated" });
});

const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, "Please choose an image");
  const old = req.user.avatar;
  req.user.avatar = `uploads/${req.file.filename}`;
  await req.user.save();
  removeAvatarFile(old);
  res.json({ user: req.user });
});

// ---------- admin: employees ----------

const listUsers = asyncHandler(async (req, res) => {
  const q = (req.query.search || "").trim();
  const filter = q
    ? { $or: [{ name: new RegExp(escapeRegex(q), "i") }, { email: new RegExp(escapeRegex(q), "i") }] }
    : {};
  const users = await User.find(filter).sort({ createdAt: -1 }).lean();

  // Attach totals and on-shift status for each user
  const [hours, open] = await Promise.all([
    Salary.aggregate([
      { $group: { _id: "$user", hours: { $sum: "$hours" }, earned: { $sum: "$amount" } } },
    ]),
    Attendance.find({ checkOut: null }).select("user checkIn").lean(),
  ]);
  const byUser = Object.fromEntries(hours.map((h) => [String(h._id), h]));
  const openByUser = Object.fromEntries(open.map((o) => [String(o.user), o.checkIn]));

  res.json(
    users.map(({ password, __v, ...u }) => ({
      ...u,
      totalHours: byUser[u._id]?.hours || 0,
      totalEarned: byUser[u._id]?.earned || 0,
      onShiftSince: openByUser[u._id] || null,
    }))
  );
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, role, hourlyRate } = req.body || {};
  if (!name || !email) throw new HttpError(400, "Name and email are required");

  const password = tempPassword();
  const user = await User.create({
    name,
    email,
    password,
    role: role === "admin" ? "admin" : "employee",
    hourlyRate: hourlyRate === undefined || hourlyRate === "" ? undefined : Number(hourlyRate),
  });
  // The temporary password is only ever shown once, here
  res.status(201).json({ user, tempPassword: password });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, "Employee not found");
  const [attendance, salaries] = await Promise.all([
    Attendance.find({ user: user._id }).sort({ checkIn: -1 }).limit(50),
    Salary.find({ user: user._id }).sort({ createdAt: -1 }).limit(50),
  ]);
  res.json({ user, attendance, salaries });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, "Employee not found");
  const { name, role, hourlyRate } = req.body || {};

  if (role && String(user._id) === String(req.user._id) && role !== "admin") {
    throw new HttpError(400, "You can't remove your own admin access");
  }
  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role === "admin" ? "admin" : "employee";
  if (hourlyRate !== undefined) user.hourlyRate = Number(hourlyRate);
  await user.save();
  res.json({ user });
});

const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, "Employee not found");
  const password = tempPassword();
  user.password = password;
  await user.save();
  res.json({ tempPassword: password });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    throw new HttpError(400, "You can't delete your own account");
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new HttpError(404, "Employee not found");
  await Promise.all([Attendance.deleteMany({ user: user._id }), Salary.deleteMany({ user: user._id })]);
  removeAvatarFile(user.avatar);
  res.json({ message: "Employee deleted" });
});

module.exports = {
  login,
  me,
  changePassword,
  updateAvatar,
  listUsers,
  createUser,
  getUser,
  updateUser,
  resetPassword,
  deleteUser,
};
