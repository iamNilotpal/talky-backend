const httpErrors = require('http-errors');
const roomService = require('../services/room-service');
const RoomDto = require('../dtos/room-dto');

class RoomController {
  async createRoom(req, res, next) {
    const { topic, roomType } = req.body;
    if (!topic) return next(httpErrors.BadRequest('Topic must be provided.'));
    if (!roomType)
      return next(httpErrors.BadRequest('Room type must be provided.'));

    try {
      const room = await roomService.create({
        topic,
        roomType,
        ownerId: req.user._id,
      });
      return res.status(200).json({ ok: true, room: new RoomDto(room) });
    } catch (error) {
      return next(
        httpErrors.InternalServerError('Error creating room. Try again.')
      );
    }
  }

  async getAllRooms(req, res, next) {
    try {
      const rooms = await roomService.getAllRooms();
      const allRooms = rooms.map((room) => new RoomDto(room));
      return res.status(200).json({ ok: true, rooms: allRooms });
    } catch (error) {
      return next(httpErrors.InternalServerError('Error fetching rooms.'));
    }
  }
}

module.exports = new RoomController();
