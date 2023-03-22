const express = require("express");
const router = express.Router();

const {
  createSalary,
  updateSalary,
  getSalary,
  getSalaries,
} = require("../controller/salary");

router
  .route("/:id")
  .post( createSalary);
router.route("/:id").put( updateSalary);
router.route("/:id").get( getSalary);
router
  .route("/")
  .get( getSalaries);

module.exports = router;
