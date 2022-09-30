const fs = require('fs');
const util = require('util');
const path = require('path');
const Jimp = require('jimp');
const { nanoid } = require('nanoid');
const httpErrors = require('http-errors');

const Room = require('../models/room-model');
const User = require('../models/user-model');
const deleteFileFromDisk = util.promisify(fs.unlink);

class UserService {
  async findUser(filter) {
    const user = await User.findOne(filter).populate('rooms').exec();
    return user;
  }

  async createUser(data) {
    const user = new User(data);
    return user.save();
  }

  async changeInformation(user, data) {
    const { email, phone, name } = data;
    if (!email && !phone && !name)
      throw httpErrors.BadRequest('At least one field is required.');

    if (email !== user.email) {
      const existUserWithEmail = await User.findOne({ email });
      if (!existUserWithEmail)
        throw httpErrors.Conflict('Email is already registered.');
    }

    if (phone !== user.phone) {
      const existUserWithPhone = await User.findOne({ phone });
      if (!existUserWithPhone)
        throw httpErrors.Conflict('Phone number already registered.');
    }

    const dataToUpdate = {
      email: email === user.email ? user.email : email,
      phone: phone === user.phone ? user.phone : phone,
      name: name === user.name ? user.name : name,
    };

    await user.update(dataToUpdate);
    await user.save();
    return user;
  }

  async updateAvatar(user, avatar) {
    try {
      if (!avatar)
        return next(httpErrors.BadRequest('All fields are required'));

      const buffer = Buffer.from(
        avatar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''),
        'base64',
      );

      let image;
      try {
        image = await Jimp.read(buffer);
      } catch (error) {
        throw httpErrors.BadRequest('Only PNG and JPEG files are allowed.');
      }

      const imageName = `Avatar-${nanoid()}.${image.getExtension()}`;
      await image
        .resize(150, Jimp.AUTO)
        .writeAsync(path.resolve(__dirname, `../storage/${imageName}`));
      user.avatar = '/storage/' + imageName;

      return user.save();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteAccount(user) {
    const id = user.avatar.split('/')[4];
    const imagePath = path.resolve(__dirname, `../storage/${id}`);

    await Room.deleteMany({ ownerId: user._id }).exec();
    await deleteFileFromDisk(path.join(imagePath));
    await user.remove();
  }
}

module.exports = new UserService();
