const Room = require('../models/room-model');

class RoomService {
  async create(data) {
    const { topic, roomType, owner } = data;
    const room = await Room.create({
      topic,
      roomType,
      owner: owner,
      speakers: [owner],
      totalPeople: 1,
    });
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
    return await Room.findOne({
      _id: roomId,
    })
      .populate('speakers')
      .populate('owner')
      .exec();
  }
}

module.exports = new RoomService();
