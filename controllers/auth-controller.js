const httpErrors = require('http-errors');

const UserDto = require('../dtos/user-dto');
const hashService = require('../services/hash-service');
const otpService = require('../services/otp-service');
const tokenService = require('../services/token-service');
const userService = require('../services/user-service');

class AuthController {
  async sendOTP(req, res, next) {
    try {
      const { phone, email } = req.body;
      if (!phone && !email)
        return next(httpErrors.BadRequest('All fields are required.'));

      if (phone && !userService.isValidPhone(phone))
        return next(httpErrors.BadRequest('Enter a valid phone number.'));

      userService.validateUserInfo(req.body);
      const otp = otpService.generateOtp();
      const ttl = 1000 * 60 * 3; /* 3 Minutes */
      const expires = Date.now() + ttl;
      const data = `${
        phone || email
      }.${otp}.${expires}`; /* Will match with the hash provided by the user */
      const hashedOtp = hashService.hashOtp(data);

      // await otpService.sendBySMS(phone, otp);
      return res.status(200).json({
        ok: true,
        hash: `${hashedOtp}.${expires}`,
        phone,
        email,
        otp,
      });
    } catch (error) {
      if (error.isJoi) {
        error.status = 400;
        return next(error);
      }
      return next(httpErrors.InternalServerError('Failed to send OTP.'));
    }
  }

  async verifyOTP(req, res, next) {
    try {
      const { phone, otp, hash, email } = req.body;
      if ((!phone && !email) || !otp || !hash)
        return next(httpErrors.BadRequest('All fields are required.'));

      const [hashedOtp, expires] = hash.split('.');
      if (Date.now() > Number(expires))
        return next(
          httpErrors.BadRequest('OTP has expired. Request for new one.')
        );

      /* If otp hasn't expired compute hash with the phone,
      expires and otp and match against the hash coming from client */
      const data = `${phone || email}.${otp}.${expires}`;
      const isValid = otpService.verifyOtp(hashedOtp, data);
      if (!isValid) return next(httpErrors.BadRequest("OTP doesn't match."));

      /* Find user the phone number if exist generate tokens, store the
        refresh token in database  and send the required data,
       if not create one and do the same */
      let user;
      if (phone) user = await userService.findUser({ phone });
      else user = await userService.findUser({ email });

      if (!user) {
        if (phone) user = await userService.createUser({ phone });
        else user = await userService.createUser({ email });
      }

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
      return next(httpErrors.InternalServerError('Failed to validate.'));
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
