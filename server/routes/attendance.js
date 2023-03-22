const express = require("express");
const router = express.Router();
const {
  createAttendance,
  updateAttendance,
  updateLocation,
  getAttendance,
  getAttendances,
} = require("../controller/Attendance");

router.route("/:id").post( createAttendance);
router.route("/:id").put( updateAttendance);
router.route("/location/:id").put( updateLocation);
router
  .route("/:id")
  .get( getAttendance);
router
  .route("/")
  .get( getAttendances);

module.exports = router;
