const jwt = require("jsonwebtoken");
const User = require("../model/user");
const { asyncHandler, HttpError } = require("./errors");

// Requires "Authorization: Bearer <token>" and loads req.user
const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new HttpError(401, "Please log in to continue");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, "Your session has expired. Please log in again");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new HttpError(401, "Account no longer exists");
  req.user = user;
  next();
});

const adminOnly = (req, _res, next) => {
  if (req.user?.role !== "admin") return next(new HttpError(403, "Admins only"));
  next();
};

module.exports = { protect, adminOnly };
