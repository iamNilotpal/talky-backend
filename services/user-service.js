const User = require('../models/user');

class UserService {
  async findUser(filter) {
    const user = await User.findOne({ filter });
    return user;
  }

  async createUser(data) {
    const user = new User(data);
    return user.save();
  }
}

module.exports = new UserService();
