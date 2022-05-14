const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    email: { type: String, required: false },
    activated: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
module.exports = User;
