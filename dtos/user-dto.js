class UserDto {
  id;
  phone;
  createdAt;
  activated;
  name;
  avatar;

  constructor(user) {
    this.id = user._id;
    this.phone = user.phone;
    this.createdAt = user.createdAt;
    this.activated = user.activated;
    this.name = user.name || '';
    this.avatar = user.avatar ? process.env.BASE_URL + user.avatar : null;
  }
}

module.exports = UserDto;
