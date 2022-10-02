const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema(
  {
    roomType: {
      type: String,
      enum: ['open', 'social', 'private'],
      required: true,
      default: 'open',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: { type: String, required: true },
    speakers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      required: false,
      default: [],
    },
    totalPeople: { type: Number, required: false, default: 0 },
  },
  { timestamps: true }
);

const Room = mongoose.model('Room', RoomSchema);
module.exports = Room;
