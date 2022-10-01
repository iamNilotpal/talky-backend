class UserDto {
  id;
  phone;
  email;
  createdAt;
  activated;
  name;
  avatar;

  constructor(user) {
    this.id = user._id;
    this.phone = user.phone;
    this.email = user.email;
    this.rooms = user.rooms;
    this.createdAt = user.createdAt;
    this.activated = user.activated;
    this.name = user.name || '';
    this.avatar = user.avatar;
  }
}

module.exports = UserDto;
