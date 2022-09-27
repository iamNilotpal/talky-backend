const Room = require('../models/room-model');

class RoomService {
  async create(data) {
    const { topic, roomType, ownerId } = data;
    const room = await Room.create({
      topic,
      roomType,
      ownerId,
      speakers: [ownerId],
      totalPeople: 1,
    });
    return room;
  }

  async getAllRooms() {
    const rooms = await Room.find({})
      .populate('speakers')
      .populate('ownerId')
      .exec();
    return rooms;
  }

  async getRoom(roomId) {
    return await Room.findOne({
      _id: roomId,
    })
      .populate('speakers')
      .populate('ownerId')
      .exec();
  }
}

module.exports = new RoomService();
