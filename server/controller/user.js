const asyncHandler = require("express-async-handler");
const User = require("../model/user");
const Attendance = require("../model/attendance");
const randomstring = require("randomstring");
const sendToken = require("../middleware/jwtToken");
const { default: mongoose } = require("mongoose");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!email || !name) {
    res.status(402).json("Please fill all the fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json("Seems Like this email is already registered");
  }

  const user = await User.create({
    email,
    name,
    password: randomstring.generate({
      length: 6,
      charset: "alphanumeric",
    }),
  });

  if (user) {
    res.status(200).json(user)
  } else {
    res.status(500).json("Something went wrong please try again");
  }
});

const updateProfile = asyncHandler(async (req, res) => {
  //we add cloudinary letter then we are giving a condition that if the user has uploaded a new image then we will update the image avatar
const {id}=req.params
  const avatar=req.body.avatar
  const user = await User.findByIdAndUpdate({_id:id});
 
 user.avatar=avatar
 const updated=await user.save()

  
  if(updated){
  res.status(200).json({
    success: true,
    updated
  });
}
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401).json("No such user exists");
  }

  if ((await user.password) === password) {
    sendToken(user, 200, res);
  } else {
    res.status(403).json("Invalid email or password");
  }
});
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});
const queryUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          {
            name: {
              $regex: req.query.search,
              $options: "i",
            },
          },
          {
            email: {
              $regex: req.query.search,
              $options: "i",
            },
          },
        ],
      }
    : {};

  const users = User.find(keyword).find({ _id: { $ne: req.user._id } });

  res.status(200).json(users);
});

const allUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});
const getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json("User not found");
  }
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const user = await User.findByIdAndDelete(id);
  res.status(200).json(user);
});

const viewEmployeeLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await Attendance.find({ employeeId: id });
  res.status(200).json(user);
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

module.exports = {
  registerUser,
  loginUser,
  queryUsers,
  allUsers,
  deleteEmployee,
  viewEmployeeLocation,
  getUserProfile,
  logoutUser,
  getUserDetails,
  updateProfile,
};
