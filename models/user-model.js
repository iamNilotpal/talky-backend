const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    phone: { type: String, unique: true, required: true },
    activated: { type: Boolean, required: true, default: false },
    name: {
      type: String,
      required: function () {
        return this.activated === true;
      },
    },
    avatar: {
      type: String,
      required: function () {
        return this.activated === true;
      },
      get: (avatar) => (avatar ? `${process.env.BASE_URL}${avatar}` : avatar),
    },
  },
  { timestamps: true, toJSON: { getters: true } }
);

const User = mongoose.model('User', UserSchema);
module.exports = User;
