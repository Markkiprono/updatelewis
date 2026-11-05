const express = require("express");
const { protect, adminOnly } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const users = require("../controller/user");
const attendance = require("../controller/attendance");
const salary = require("../controller/salary");

const router = express.Router();

// Auth & own account
router.post("/auth/login", users.login);
router.get("/auth/me", protect, users.me);
router.put("/auth/password", protect, users.changePassword);
router.put("/auth/avatar", protect, upload.single("image"), users.updateAvatar);

// Attendance
router.post("/attendance/check-in", protect, attendance.checkIn);
router.post("/attendance/check-out", protect, attendance.checkOut);
router.get("/attendance/me", protect, attendance.mine);
router.get("/attendance/overview", protect, adminOnly, attendance.overview);
router.get("/attendance", protect, adminOnly, attendance.list);

// Salary
router.get("/salary/me", protect, salary.mine);
router.get("/salary/summary", protect, adminOnly, salary.summary);
router.get("/salary", protect, adminOnly, salary.list);
router.put("/salary/:id/pay", protect, adminOnly, salary.markPaid);
router.post("/salary/pay-user/:userId", protect, adminOnly, salary.payUser);

// Employees (admin)
router.get("/users", protect, adminOnly, users.listUsers);
router.post("/users", protect, adminOnly, users.createUser);
router.get("/users/:id", protect, adminOnly, users.getUser);
router.put("/users/:id", protect, adminOnly, users.updateUser);
router.post("/users/:id/reset-password", protect, adminOnly, users.resetPassword);
router.delete("/users/:id", protect, adminOnly, users.deleteUser);

module.exports = router;
