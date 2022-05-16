const tokenService = require('../services/token-service');
const userService = require('../services/user-service');
const httpErrors = require('http-errors');

async function authMiddleware(req, res, next) {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) return next(httpErrors.Unauthorized('Session expired.'));

    const userData = await tokenService.verifyAccessToken(accessToken);
    if (!userData) return next(httpErrors.Unauthorized('Token expired.'));

    const user = await userService.findUser({ _id: userData.id });
    if (!user) return next(httpErrors.NotFound('User not found.'));

    req.user = user;
    next();
  } catch (error) {
    return next(httpErrors.Unauthorized('Session expired. Login again.'));
  }
}

module.exports = authMiddleware;
