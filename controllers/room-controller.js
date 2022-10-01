const httpErrors = require('http-errors');

const RoomDto = require('../dtos/room-dto');
const roomService = require('../services/room-service');

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
        user: req.user,
      });
      return res.status(200).json({ ok: true, room: new RoomDto(room) });
    } catch (error) {
      console.log(error);
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

  async getRoom(req, res, next) {
    try {
      const { id } = req.params;
      const room = await roomService.getRoom(id);

      if (!room) return next(httpErrors.NotFound("Room doesn't exist."));
      return res.status(200).json({ ok: true, room: new RoomDto(room) });
    } catch (error) {
      return next(httpErrors.InternalServerError('Error fetching rooms.'));
    }
  }
}

module.exports = new RoomController();
