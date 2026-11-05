const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["employee", "admin"], default: "employee" },
    // Pay per hour worked, in KES
    hourlyRate: { type: Number, default: 100, min: 0 },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (entered) {
  if (this.password.startsWith("$2")) return bcrypt.compare(entered, this.password);
  // Accounts from the old version stored plain-text passwords: accept once, then hash
  if (entered !== this.password) return false;
  this.password = entered;
  await this.save();
  return true;
};

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
};

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
