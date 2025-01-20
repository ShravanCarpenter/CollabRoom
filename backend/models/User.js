const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mode: { type: String, enum: ['student', 'educator'], required: true },
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
