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
}

module.exports = new RoomService();
