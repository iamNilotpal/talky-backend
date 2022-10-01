class RoomDto {
  id;
  roomType;
  topic;
  speakers;
  owner;
  totalPeople;
  createdAt;

  constructor(room) {
    this.id = room._id;
    this.roomType = room.roomType;
    this.owner = room.owner;
    this.topic = room.topic;
    this.speakers = room.speakers;
    this.totalPeople = room.totalPeople;
    this.createdAt = room.createdAt;
  }
}

module.exports = RoomDto;
