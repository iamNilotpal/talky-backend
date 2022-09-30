const httpErrors = require('http-errors');

const UserDto = require('../dtos/user-dto');
const userService = require('../services/user-service');

class UserController {
  async updatePersonalInfo(req, res, next) {
    try {
      const user = await userService.changeInformation(req.user, req.body);
      return res.status(200).json({
        ok: true,
        user: new UserDto(user),
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async updateAvatar(req, res, next) {
    try {
      const user = await userService.updateAvatar(req.user, req.body.avatar);
      return res.status(200).json({
        ok: true,
        user: new UserDto(user),
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      await userService.deleteAccount(req.user);
      return res.status(200).json({
        ok: true,
        user: null,
      });
    } catch (error) {
      next(httpErrors.InternalServerError());
    }
  }
}

module.exports = new UserController();
