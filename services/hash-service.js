const crypto = require('crypto');

class HashService {
  hashOtp(data) {
    const hashed = crypto
      .createHmac('sha256', process.env.SECRET_HASH_OTP)
      .digest(data)
      .toString('hex');
    return hashed;
  }
}

module.exports = new HashService();
