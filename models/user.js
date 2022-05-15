const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    phone: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: false },
    activated: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
module.exports = User;
