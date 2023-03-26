const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  queryUsers,
  allUsers,
  deleteEmployee,
  viewEmployeeLocation,
  getUserProfile,
  logoutUser,
  updateProfile,
  getUserDetails,
} = require("../controller/user");

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })


router
  .route("/new")
  .post( registerUser);
router.route("/login").post(loginUser);
router.route("/").get( queryUsers);
router
  .route("/all")
  .get( allUsers);
router
  .route("/:id")
  .get( getUserDetails)
  .delete( deleteEmployee);
router
  .route("/location/:id")
  .get( viewEmployeeLocation);
router
  .route("/employee/:id")
  .get( getUserProfile)
  .put(upload.single('image'), updateProfile);
router.route("/logout").get( logoutUser);

module.exports = router;
