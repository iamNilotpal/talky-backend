const httpErrors = require('http-errors');
const { isValidObjectId } = require('mongoose');
const Room = require('../models/room-model');

class RoomService {
  async create(data) {
    const { topic, roomType, user } = data;
    const room = await Room.create({
      topic,
      roomType,
      owner: user._id,
      speakers: [user._id],
      totalPeople: 1,
    });
    user.rooms.push(room._id);
    await user.save();
    return room.populate('owner');
  }

  async getAllRooms() {
    const rooms = await Room.find({})
      .sort('-createdAt')
      .populate('speakers')
      .populate('owner')
      .exec();
    return rooms;
  }

  async getRoom(roomId) {
    if (!isValidObjectId(roomId))
      throw httpErrors.UnprocessableEntity('Invalid room id');

    return await Room.findOne({
      _id: roomId,
    })
      .populate('speakers')
      .populate('owner')
      .exec();
  }
}

module.exports = new RoomService();
