const httpErrors = require('http-errors');
const hashService = require('../services/hash-service');
const otpService = require('../services/otp-service');
const tokenService = require('../services/token-service');
const userService = require('../services/user-service');

class AuthController {
  async sendOTP(req, res, next) {
    try {
      const { phone } = req.body;
      if (!phone) return next(httpErrors.BadRequest('Provide a phone number.'));

      const otp = otpService.generateOtp();
      const ttl = 1000 * 60 * 3;
      const expires = Date.now() + ttl;
      const data = `${phone}.${otp}.${expires}`;
      const hashedOtp = hashService.hashOtp(data);

      await otpService.sendBySMS(phone, otp);
      return res.status(200).json({
        status: 'success',
        hash: `${hashedOtp}.${expires}`,
        phone,
      });
    } catch (error) {
      console.log(error.message);
      return next(httpErrors.InternalServerError('Falied to send OTP.'));
    }
  }

  async verifyOTP(req, res, next) {
    try {
      const { phone, otp, hash } = req.body;
      if (!phone || !otp || !hash)
        return next(httpErrors.BadRequest('All fields are required.'));

      const [hashedOtp, expires] = hash.split('.');
      if (Date.now() > Number(expires))
        return next(
          httpErrors.BadRequest('OTP has expired. Request for new one.')
        );

      const data = `${phone}.${otp}.${expires}`;
      const isValid = otpService.verifyOtp(hashedOtp, data);

      if (!isValid) return next(httpErrors.BadRequest("OTP doesn't match."));

      let user = await userService.findUser(phone);
      if (!user) user = await userService.createUser({ phone });

      const accessToken = await tokenService.generateAccessToken({
        id: user._id,
        activated: user.activated,
      });
      const refreshToken = await tokenService.generateRefreshToken({
        id: user._id,
        activated: user.activated,
      });

      res.cookie('refreshToken', refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });

      return res.status(200).json({
        status: 'success',
        message: 'OTP verified successfully.',
        accessToken,
      });
    } catch (error) {
      return next(httpErrors.InternalServerError('Falied to validate.'));
    }
  }
}

module.exports = new AuthController();
