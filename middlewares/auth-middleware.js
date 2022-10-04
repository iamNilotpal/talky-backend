const httpErrors = require('http-errors');

const tokenService = require('../services/token-service');
const userService = require('../services/user-service');

const clearCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

async function authMiddleware(req, res, next) {
  try {
    const { accessToken, refreshToken } = req.cookies;
    /* Check if both accessToken and refreshToken exists in cookie */
    /* If don't then return Unauthorized error. Because in normal case the tokens will be there
    if no one is fiddling with the system, if not then someone is doing something suspicious activity.
    */
    if (!accessToken && !refreshToken)
      return next(httpErrors.Unauthorized('Login to access this route.'));

    /* Now verify the access token, If it is valid then get the id and find the corresponding user.
      case 1 -> User doesn't exist then return Unauthorized for Not Found error.
      case 2 -> User exist so attach the user in the req object and call next().
      case 3 -> Invalid or expired token will lead to catch block.
    */
    const { id } = await tokenService.verifyAccessToken(accessToken);
    const user = await userService.findUser({ _id: id });

    if (!user) {
      clearCookies(res);
      if (refreshToken) await tokenService.removeToken(refreshToken);
      return next(httpErrors.NotFound("User doesn't exist."));
    }

    req.user = user;
    next();
  } catch (error) {
    /* If the error is something else other than TokenExpiredError return Unauthorized error.
      Which means the client has modified the tokens and also clear the cookies.
    */
    if (error.name === 'JsonWebTokenError') {
      clearCookies(res);
      return next(httpErrors.Unauthorized('Session expired. Login again.'));
    }

    try {
      /* Now verify the refresh token, If it is valid then get the id and find the corresponding user.
      case 1 -> User doesn't exist then return Unauthorized for Not Found error.
      case 2 -> User exist so attach the user in the req object and call next().
      case 3 -> Invalid or expired token will lead to catch block.
    */
      const { refreshToken: token } = req.cookies;
      const userData = await tokenService.verifyRefreshToken(token);
      const user = await userService.findUser({ _id: userData.id });

      if (!user) {
        tokenService.clearCookie(res);
        await tokenService.removeToken(token);
        return next(httpErrors.NotFound("User doesn't exist."));
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

      req.user = user;
      next();
    } catch (error) {
      clearCookies(res);
      next(httpErrors.Unauthorized('Session expired. Login again.'));
    }
  }
}

module.exports = authMiddleware;
