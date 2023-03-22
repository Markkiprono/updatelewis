const jwt = require("jsonwebtoken");
const User = require("../model/user");
const expressAsyncHandler = require("express-async-handler");

//Check if user is authenticated or not
const isAuthenticatedUser = expressAsyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    res.status(401).json("Not authorized, Login first to access this resource");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
});
//Handling Admin roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res
        .status(403)
        .json(`Role (${req.user.role}) is not allowed to access this resource`);
    }
    next();
  };
};
module.exports = { isAuthenticatedUser, authorizeRoles };
