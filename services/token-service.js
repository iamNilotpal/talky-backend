const util = require('util');
const JWT = require('jsonwebtoken');

const signToken = util.promisify(JWT.sign);

const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
class TokenService {
  generateAccessToken(payload) {
    return signToken(payload, JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: '1h',
      issuer: process.env.ROOT_DOMAIN,
      audience: String(payload.id),
    });
  }

  generateRefreshToken(payload) {
    return signToken(payload, JWT_REFRESH_TOKEN_SECRET, {
      expiresIn: '1y',
      issuer: process.env.ROOT_DOMAIN,
      audience: String(payload.id),
    });
  }
}

module.exports = new TokenService();
