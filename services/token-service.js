const util = require('util');

const JWT = require('jsonwebtoken');
const RefreshToken = require('../models/token-model');

const signToken = util.promisify(JWT.sign);
const verifyToken = util.promisify(JWT.verify);

const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
class TokenService {
  generateAccessToken(payload) {
    return signToken(payload, JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: '1h',
      issuer: process.env.BASE_URL,
      audience: String(payload.id),
    });
  }

  generateRefreshToken(payload) {
    return signToken(payload, JWT_REFRESH_TOKEN_SECRET, {
      expiresIn: '1y',
      issuer: process.env.BASE_URL,
      audience: String(payload.id),
    });
  }

  async storeRefreshToken(token, userId) {
    return RefreshToken.create({ token, userId });
  }

  setTokenToCookie(res, key, data) {
    res.cookie(key, data.token, {
      maxAge: data.age,
      httpOnly: true,
      sameSite: 'none',
      path: '/',
      secure: true,
    });
  }

  clearCookie(res, key) {
    res.clearCookie(key);
  }

  verifyAccessToken(token) {
    return verifyToken(token, JWT_ACCESS_TOKEN_SECRET);
  }

  verifyRefreshToken(token) {
    return verifyToken(token, JWT_REFRESH_TOKEN_SECRET);
  }

  async findRefreshToken(token, userId) {
    return RefreshToken.findOne({ token, userId });
  }

  async removeToken(token) {
    return await RefreshToken.deleteOne({ token });
  }
}

module.exports = new TokenService();
