const path = require('path');
const Jimp = require('jimp');
const { nanoid } = require('nanoid');
const httpErrors = require('http-errors');
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
        return next(httpErrors.BadRequest('All fields are required'));

      let image;
      const buffer = Buffer.from(
        avatar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''),
        'base64'
      );

      try {
        image = await Jimp.read(buffer);
      } catch (error) {
        return next(
          httpErrors.BadRequest('Only PNG and JPEG files are allowed.')
        );
      }
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
      return next(httpErrors.InternalServerError());
    }
  }
}

module.exports = new ActivateController();
