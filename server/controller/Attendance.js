const Attendance = require("../model/attendance");
const User = require("../model/user");
const asyncHandler = require("express-async-handler");

const createAttendance = asyncHandler(async (req, res) => {
const {id}=req.params

const user = await User.findById({_id:id});
  if (user) {
    const attendance = new Attendance({
      user: id,
      employee: [
        {
          user:user._id,
          name: user.name,
          email: user.email,
        },
      ],
      duration: 0,
      checkIn: Date.now(),
      checkOut: Date.now(),
      location: req.socket.remoteAddress,
    });
    const createdAttendance = await attendance.save();
    res.status(200).json(createdAttendance);
  } else {
    res.status(404).json("User not found");
  }
});

const updateAttendance = asyncHandler(async (req, res) => {
  const {id}=req.params

  const attendance = await Attendance.findById({_id:id});
  if (attendance) {
    attendance.duration = (Date.now() - attendance.checkIn) / (1000 * 60 * 60);
    attendance.checkOut = Date.now();
    const updatedAttendance = await attendance.save();
    res.status(200).json(updatedAttendance);
  } else {
    res.status(404).json("Attendance not found");
  }
});

const updateLocation = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);
  if (attendance) {
    attendance.location = req.socket.remoteAddress;
    const updatedAttendance = await attendance.save();
    res.status(200).json(updatedAttendance);
  } else {
    res.status(404).json("Attendance not found");
  }
});

const getAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);
  if (attendance) {
    res.status(200).json(attendance);
  } else {
    res.status(404).json("Attendance not found");
  }
});
//(admin)
const getAttendances = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({});
  if (attendance) {
    res.status(200).json(attendance);
  } else {
    res.status(404).json("Attendance not found");
  }
});

module.exports = {
  createAttendance,
  updateAttendance,
  updateLocation,
  getAttendance,
  getAttendances,
};
