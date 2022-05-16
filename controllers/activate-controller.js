const httpError = require('http-errors');
const Jimp = require('jimp');
const path = require('path');
const { nanoid } = require('nanoid');
const UserDto = require('../dtos/user-dto');

class ActivateController {
  async activateUser(req, res, next) {
    try {
      if (req.user.activated)
        return res.status(200).json({
          ok: true,
          authed: true,
          user: new UserDto(req.user),
        });

      const { name, avatar } = req.body;
      if (!name || !avatar)
        return next(httpError.BadRequest('All fields are required'));

      const buffer = Buffer.from(
        avatar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''),
        'base64'
      );
      const image = await Jimp.read(buffer);
      const imageName = `Avatar-${nanoid()}.${image.getExtension()}`;
      await image
        .resize(150, Jimp.AUTO)
        .writeAsync(path.resolve(__dirname, `../storage/${imageName}`));

      req.user.activated = true;
      req.user.name = name;
      req.user.avatar = '/storage/' + imageName;
      await req.user.save();

      return res.status(200).json({
        ok: true,
        authed: true,
        user: new UserDto(req.user),
      });
    } catch (error) {
      console.log(error);
      return next(httpError.InternalServerError());
    }
  }
}

module.exports = new ActivateController();
