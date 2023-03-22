const Salary = require("../model/salary");
const Attendance = require("../model/attendance");
const User = require("../model/user");
const asyncHandler = require("express-async-handler");

const createSalary = asyncHandler(async (req, res) => {
const {id}=req.params

  const user =await User.findById({_id:id})
  const salary = new Salary({
    user: user._id,
    employee: [
      {
        user: user._id,
        name: user.name,
        email: user.email,
      },
    ],
    salary:600 * 100,
  });
  if (salary) {
    const createdSalary = await salary.save();
    res.status(200).json(createdSalary);
  } else {
    res.status(404).json("Error creating salary");
  }
});

const updateSalary = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);
  const salary = await Salary.findById(req.params.id);
  const userSalary = await User.findById(req.user.id);
  if (salary) {
    salary.salary = attendance.duration * 100;
    userSalary.salary = attendance.duration * 100;
    const updatedSalary = await salary.save();
    await userSalary.save();
    res.status(200).json(updatedSalary);
  } else {
    res.status(404).json("Salary not found");
  }
});

//admin
const getSalary = asyncHandler(async (req, res) => {
  const salary = await Salary.findById(req.params.id);
  if (salary) {
    res.status(200).json(salary);
  } else {
    res.status(404).json("Salary not found");
  }
});

const getSalaries = asyncHandler(async (req, res) => {
  const salaries = await Salary.find({});
  if (salaries) {
    res.status(200).json(salaries);
  } else {
    res.status(404).json("Salary not found");
  }
});

module.exports = {
  createSalary,
  updateSalary,
  getSalary,
  getSalaries,
};
