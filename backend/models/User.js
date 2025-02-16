const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  mode: { type: String, required: true, enum: ["student", "educator"] },
  password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);