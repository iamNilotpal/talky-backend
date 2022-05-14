const JWT = require('jsonwebtoken');
const httpErrors = require('http-errors');
const JWT_ACCESS_TOKEN = process.env.JWT_ACCESS_TOKEN;
const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN;

class TokenService {
  generateAccessToken(payload) {
    return new Promise((resolve, reject) => {
      return JWT.sign(
        { payload },
        JWT_ACCESS_TOKEN,
        {
          expiresIn: '1h',
          issuer: process.env.ROOT_DOMAIN,
          audience: String(payload.id),
        },
        (error, token) => {
          if (error) return reject(httpErrors.InternalServerError());
          return resolve(token);
        }
      );
    });
  }

  generateRefreshToken(payload) {
    return new Promise((resolve, reject) => {
      return JWT.sign(
        { payload },
        JWT_REFRESH_TOKEN,
        {
          expiresIn: '1y',
          issuer: process.env.ROOT_DOMAIN,
          audience: String(payload.id),
        },
        (error, token) => {
          if (error) return reject(httpErrors.InternalServerError());
          return resolve(token);
        }
      );
    });
  }
}

module.exports = new TokenService();
