const httpErrors = require('http-errors');
const hashService = require('../services/hash-service');
const otpService = require('../services/otp-service');
const tokenService = require('../services/token-service');
const userService = require('../services/user-service');
const UserDto = require('../dtos/user-dto');

class AuthController {
  async sendOTP(req, res, next) {
    try {
      const { phone } = req.body;
      if (!phone) return next(httpErrors.BadRequest('Provide a phone number.'));

      const otp = otpService.generateOtp();
      const ttl = 1000 * 60 * 3; /* 3 Minutes */
      const expires = Date.now() + ttl;
      const data = `${phone}.${otp}.${expires}`; /* Will match with the hash provided by the user */
      const hashedOtp = hashService.hashOtp(data);

      // await otpService.sendBySMS(phone, otp);
      return res.status(200).json({
        ok: true,
        hash: `${hashedOtp}.${expires}`,
        phone,
        otp,
      });
    } catch (error) {
      console.log(error);
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

      /* If otp hasn't expired compute hash with the phone, 
      expires and otp and match against the hash coming from client */
      const data = `${phone}.${otp}.${expires}`;
      const isValid = otpService.verifyOtp(hashedOtp, data);
      if (!isValid) return next(httpErrors.BadRequest("OTP doesn't match."));

      /* Find user the phone number if exist generate tokens, store the 
        refresh token in database  and send the required data,
       if not create one and do the same */
      let user = await userService.findUser({ phone });
      if (!user) user = await userService.createUser({ phone });

      const accessToken = await tokenService.generateAccessToken({
        id: user._id,
        activated: user.activated,
      });

      const refreshToken = await tokenService.generateRefreshToken({
        id: user._id,
      });

      await tokenService.storeRefreshToken(refreshToken, user._id);
      tokenService.setTokenToCookie(res, 'accessToken', {
        token: accessToken,
        age: 1000 * 60 * 60 * 24,
      });
      tokenService.setTokenToCookie(res, 'refreshToken', {
        token: refreshToken,
        age: 1000 * 60 * 60 * 24 * 365,
      });

      return res.status(200).json({
        ok: true,
        authed: true,
        user: new UserDto(user),
      });
    } catch (error) {
      console.log(error);
      return next(httpErrors.InternalServerError('Falied to validate.'));
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken: refreshTokenFromCookie } = req.cookies;
      if (!refreshTokenFromCookie)
        return next(httpErrors.BadRequest('Token is required.'));

      const userData = await tokenService.verifyRefreshToken(
        refreshTokenFromCookie
      );
      if (!userData) return next(httpErrors.Unauthorized('Token expired.'));

      const validToken = await tokenService.findRefreshToken(
        refreshTokenFromCookie,
        userData.id
      );
      if (!validToken) return next(httpErrors.Unauthorized('Token expired.'));

      const user = await userService.findUser({ _id: userData.id });
      if (!user) return next(httpErrors.NotFound('User not found.'));

      const accessToken = await tokenService.generateAccessToken({
        id: user._id,
        activated: user.activated,
      });

      const refreshToken = await tokenService.generateRefreshToken({
        id: user._id,
      });

      await validToken.remove();
      await tokenService.storeRefreshToken(refreshToken, user._id);
      tokenService.setTokenToCookie(res, 'accessToken', {
        token: accessToken,
        age: 1000 * 60 * 60 * 24,
      });
      tokenService.setTokenToCookie(res, 'refreshToken', {
        token: refreshToken,
        age: 1000 * 60 * 60 * 24 * 365,
      });

      return res.status(200).json({
        ok: true,
        authed: true,
        user: new UserDto(user),
      });
    } catch (error) {
      if (error.name) return next(httpErrors.Unauthorized('Session expired.'));
      return next(httpErrors.InternalServerError());
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken)
        return next(httpErrors.Unauthorized('IDK what error msg to send :)'));

      tokenService.clearCookie(res, 'accessToken');
      tokenService.clearCookie(res, 'refreshToken');
      await tokenService.removeToken(refreshToken);
      return res.status(200).json({ user: null });
    } catch (error) {
      tokenService.clearCookie(res, 'accessToken');
      tokenService.clearCookie(res, 'refreshToken');
      return res.status(200).json({
        ok: false,
        message: 'IDK something went wrong :)',
        user: null,
      });
    }
  }
}

module.exports = new AuthController();
