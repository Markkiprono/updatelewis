const User = require("../model/user");

// Makes sure at least one admin exists so someone can log in on a fresh database.
// Credentials come from ADMIN_EMAIL / ADMIN_PASSWORD (defaults shown in the README).
const ensureAdmin = async () => {
  if (await User.exists({ role: "admin" })) return null;
  const email = (process.env.ADMIN_EMAIL || "admin@groupwork.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    await existing.save();
    return { email, created: false };
  }
  await User.create({ name: "Administrator", email, password, role: "admin" });
  return { email, password, created: true };
};

module.exports = ensureAdmin;
