class RoomDto {
  id;
  roomType;
  topic;
  speakers;
  ownerId;
  totalPeople;
  createdAt;

  constructor(room) {
    this.id = room._id;
    this.roomType = room.roomType;
    this.ownerId = room.ownerId;
    this.topic = room.topic;
    this.speakers = room.speakers;
    this.totalPeople = room.totalPeople;
    this.createdAt = room.createdAt;
  }
}

module.exports = RoomDto;
